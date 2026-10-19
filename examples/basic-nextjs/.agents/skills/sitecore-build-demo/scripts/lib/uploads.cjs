'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { BUILD_CONTRACT } = require('./contract.cjs');
const { Recovery, Blocked, atomicJson, fingerprint } = require('./recovery.cjs');
const { xml, verified, unknown } = require('./populate.cjs');

const timeoutValue = (value, fallback) => {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value) || value < 0 || value > 3600000)
    throw new Blocked('timeout', 'verification timeout must be between 0 and 3600000 milliseconds');
  return value;
};

/** One elapsed-time budget for the whole pending set; this function only invokes reads. */
async function pollPending(pending, probe, { timeout, now, sleep }) {
  const deadline = now() + timeout;
  let round = 0;
  while (pending.length) {
    const results = await Promise.allSettled(
      [...pending].map(async (context) => {
        const remaining = deadline - now();
        if (remaining <= 0) return;
        // Only read-only probes overlap. Await all probes before another round or
        // phase: no abandoned background work may mutate the journal later.
        if (
          await probe(context, { signal: AbortSignal.timeout(Math.max(1, Math.ceil(remaining))) })
        ) {
          const index = pending.indexOf(context);
          if (index >= 0) pending.splice(index, 1);
        }
      }),
    );
    const failure = results.find((result) => result.status === 'rejected');
    if (failure) throw failure.reason;
    if (!pending.length || now() >= deadline) return;
    const delay = Math.min(
      [2000, 4000, 8000, 15000, 30000][Math.min(round++, 4)],
      deadline - now(),
    );
    await sleep(delay);
  }
}

async function uploadImages({
  directory,
  manifest,
  environment,
  api,
  initialize = false,
  publicLinkTimeoutMs,
  approvalTimeoutMs,
  now = () => performance.now(),
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}) {
  const publicTimeout = timeoutValue(publicLinkTimeoutMs, 90000);
  const approvalTimeout = timeoutValue(approvalTimeoutMs, 60000);
  const selected = manifest.filter((x) => x.localFile && x.status !== 'skipped-unmapped');
  const intent = selected.map((image) => {
    const file = path.resolve(directory, image.localFile);
    if (!file.startsWith(`${path.resolve(directory)}${path.sep}`))
      throw new Blocked('images', 'local file escapes image directory');
    let hash = null;
    try {
      hash = fingerprint(fs.readFileSync(file).toString('base64'));
    } catch {
      /* reported below */
    }
    return {
      file: image.localFile,
      src: image.src,
      alt: image.alt,
      target: image.target,
      sectionPosition: image.sectionPosition,
      targetField: image.targetField,
      hash,
    };
  });
  if (new Set(intent.map((x) => x.file)).size !== intent.length)
    throw new Blocked('images', 'duplicate local file identities');
  const journalFile = path.join(directory, 'recovery-uploads.json');
  if (
    !fs.existsSync(journalFile) &&
    selected.some(
      (image) =>
        image.assetId || image.publicLinkId || image.publicUrl || image.uploadStatus === 'uploaded',
    )
  ) {
    throw new Blocked(
      'images',
      'fresh build cannot adopt existing asset/link markers without its authoritative journal; preserve the prior build and obtain fresh approved scope',
    );
  }
  const recovery = new Recovery({
    file: journalFile,
    contract: BUILD_CONTRACT,
    intent,
    environment,
    initialize,
    attempts: 1,
  });
  const contexts = [];
  const approvalPending = [];
  const publicPending = [];
  const issues = new Map();
  const persist = () => atomicJson(path.join(directory, 'image-manifest.json'), manifest);
  const failed = (context, error) => {
    if (
      recovery.poisoned ||
      error.code === 'AWAITING_TOOL' ||
      error.operation === 'checkpoint' ||
      (error.code && /^E[A-Z]+$/.test(error.code))
    )
      throw error;
    const { image, key } = context;
    image.uploadStatus = error.code === 'REJECTED' ? 'failed' : 'needs-reconciliation';
    image.uploadError = error.code === 'BLOCKED' ? error.message : 'remote outcome not verified';
    // Previously generated XML must never be mistaken for a currently verified upload.
    delete image.imageFieldXml;
    issues.set(key, {
      key,
      status: image.uploadStatus,
      target: image.target || { sectionPosition: image.sectionPosition, src: image.src },
      reason: image.uploadError,
    });
    persist();
  };
  const pending = (context, reason) => failed(context, new Blocked(context.key, reason));

  async function approval(context, options) {
    let waiting = false;
    const { key, asset, image } = context;
    try {
      await recovery.operation(`${key}:approval`, {
        before: async () => ({ approved: !!(await api.readAsset(asset.id)).approved }),
        write: (before) => (before.approved ? {} : api.approve(asset.id)),
        verify: async () => {
          const current = await api.readAsset(asset.id, options);
          if (
            String(current?.id) !== String(asset.id) ||
            current?.identifier !== asset.identifier ||
            typeof current.approved !== 'boolean'
          )
            return { state: 'conflict' };
          waiting = !current.approved;
          return current.approved ? verified({ approved: true }) : unknown();
        },
      });
      image.approved = true;
      image.uploadStatus = 'approved';
      issues.delete(key);
      delete image.uploadError;
      persist();
      return 'ready';
    } catch (error) {
      failed(context, error);
      return waiting ? 'pending' : 'blocked';
    }
  }

  async function link(context) {
    const { key, asset, image } = context;
    try {
      const value = await recovery.operation(`${key}:link`, {
        before: async () => {
          if (image.publicUrl && !image.publicLinkId)
            throw new Blocked(
              key,
              'legacy public URL lacks link identity; reconcile rather than duplicate',
            );
          return { legacyId: image.publicLinkId || null };
        },
        write: (before) =>
          before.legacyId ? { id: before.legacyId } : api.createLink(asset.id, image),
        verify: async (result, _before, saved) => {
          const identity = saved || result;
          if (!identity?.id) return unknown();
          const current = await api.readLink(identity.id);
          if (
            String(current?.id) !== String(identity.id) ||
            String(current?.assetId) !== String(asset.id) ||
            !current.url ||
            (saved?.url && current.url !== saved.url)
          )
            return { state: 'conflict' };
          return verified({ id: current.id, url: current.url });
        },
      });
      context.link = value;
      image.publicLinkId = value.id;
      image.publicUrl = value.url;
      image.uploadStatus = 'link-created';
      persist();
      publicPending.push(context);
    } catch (error) {
      failed(context, error);
    }
  }

  async function publicAccess(context, options) {
    const { key, image, asset } = context;
    try {
      await recovery.operation(`${key}:public`, {
        before: async () => ({ linkId: context.link.id, url: context.link.url }),
        write: () => ({}), // Local stage only, never a remote mutation.
        verify: async (_result, before) =>
          before.linkId === context.link.id &&
          before.url === context.link.url &&
          (await api.verifyPublic(context.link.url, options))
            ? verified(context.link)
            : unknown(),
      });
      Object.assign(image, {
        status: 'uploaded',
        uploadStatus: 'uploaded',
        width: asset.width,
        height: asset.height,
        thumbnailUrl: `${environment.host}/api/gateway/${asset.id}/thumbnail`,
      });
      image.imageFieldXml = `<Image src="${xml(image.publicUrl)}" dam-id="${xml(asset.identifier)}"${asset.width && asset.height ? ` width="${asset.width}" height="${asset.height}"` : ''} alt="${xml(image.alt || image.localFile)}" dam-content-type="Image" thumbnailsrc="${xml(image.thumbnailUrl)}" />`;
      delete image.uploadError;
      issues.delete(key);
      persist();
      return true;
    } catch (error) {
      failed(context, error);
      return false;
    }
  }

  for (const [index, image] of selected.entries()) {
    const context = { key: `image:${image.localFile}`, image };
    contexts.push(context);
    try {
      if (!intent[index].hash)
        throw new Blocked(context.key, 'local file missing; restore the approved input');
      context.asset = await recovery.operation(`${context.key}:asset`, {
        before: async () => {
          if (image.uploadStatus === 'uploaded' && !image.assetId)
            throw new Blocked(context.key, 'legacy uploaded marker has no asset identity');
          return {
            legacyId: image.assetId || null,
            legacyIdentifier: image.assetIdentifier || null,
          };
        },
        write: (before) =>
          before.legacyId
            ? { id: before.legacyId, identifier: before.legacyIdentifier }
            : api.createAsset(image),
        verify: async (result, _before, saved) => {
          const identity = saved || result;
          if (!identity?.id) return unknown();
          const current = await api.readAsset(identity.id);
          if (
            String(current?.id) !== String(identity.id) ||
            !current?.identifier ||
            (identity.identifier && current.identifier !== identity.identifier)
          )
            return unknown();
          return verified({
            id: current.id,
            identifier: current.identifier,
            width: identity.width ?? image.width ?? null,
            height: identity.height ?? image.height ?? null,
          });
        },
      });
      image.assetId = context.asset.id;
      image.assetIdentifier = context.asset.identifier;
      image.uploadStatus = 'asset-created';
      delete image.imageFieldXml;
      persist();
      const state = await approval(context);
      if (state === 'ready') await link(context);
      else if (state === 'pending') approvalPending.push(context);
    } catch (error) {
      failed(context, error);
    }
  }
  await pollPending(
    approvalPending,
    async (context, options) => {
      const state = await approval(context, options);
      if (state === 'ready') return true;
      return state === 'blocked';
    },
    { timeout: approvalTimeout, now, sleep },
  );
  // Link mutations are outside the approval read-only budget.
  for (const context of contexts) {
    if (context.asset && !context.link && !issues.has(context.key) && context.image.approved)
      await link(context);
  }
  for (const context of approvalPending)
    pending(
      context,
      `asset ${context.asset.id} approval is not visible yet; resume without --initialize`,
    );
  await pollPending(publicPending, publicAccess, { timeout: publicTimeout, now, sleep });
  for (const context of publicPending)
    pending(
      context,
      `public link exists (${context.link.id}) but is not served yet; rerun without --initialize in a minute`,
    );
  const result = {
    ...recovery.summary(),
    status: issues.size ? 'partial' : recovery.summary().status,
    issues: [...issues.values()],
  };
  atomicJson(path.join(directory, 'upload-result.json'), result);
  return result;
}
module.exports = { uploadImages };
