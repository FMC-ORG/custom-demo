'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Recovery, Blocked, atomicJson, fingerprint } = require('./recovery.cjs');
const { xml, verified, unknown } = require('./populate.cjs');

async function uploadImages({ directory, manifest, environment, api, initialize = false }) {
  const selected = manifest.filter(x => x.localFile && x.status !== 'skipped-unmapped');
  const intent = selected.map(image => {
    const file = path.resolve(directory, image.localFile);
    if (!file.startsWith(`${path.resolve(directory)}${path.sep}`)) throw new Blocked('images', 'local file escapes image directory');
    let hash = null;
    try { hash = fingerprint(fs.readFileSync(file).toString('base64')); } catch { /* report as a confirmed local failure below */ }
    return { file: image.localFile, src: image.src, alt: image.alt, target: image.target, sectionPosition: image.sectionPosition, targetField: image.targetField, hash };
  });
  if (new Set(intent.map(x => x.file)).size !== intent.length) throw new Blocked('images', 'duplicate local file identities');
  const recovery = new Recovery({ file: path.join(directory, 'recovery-uploads.json'), intent, environment, initialize });
  const issues = [];
  const persist = () => atomicJson(path.join(directory, 'image-manifest.json'), manifest);
  for (const [index, image] of selected.entries()) {
    const key = `image:${image.localFile}`;
    try {
      if (!intent[index].hash) throw new Blocked(key, 'local file missing; restore the approved input');
      const asset = await recovery.operation(`${key}:asset`, {
        before: async () => {
          if (image.uploadStatus === 'uploaded' && !image.assetId) throw new Blocked(key, 'legacy uploaded marker has no asset identity');
          return { legacyId: image.assetId || null, legacyIdentifier: image.assetIdentifier || null };
        },
        write: before => before.legacyId ? { id: before.legacyId, identifier: before.legacyIdentifier } : api.createAsset(image),
        verify: async (result, _before, saved) => {
          const identity = saved || result;
          if (!identity?.id) return unknown(); // No supported lookup proving a lost asset creation: stop, never re-upload.
          const current = await api.readAsset(identity.id);
          if (!current || String(current.id) !== String(identity.id) || (identity.identifier && current.identifier !== identity.identifier)) return unknown();
          return verified({ id: current.id, identifier: current.identifier, width: identity.width ?? image.width ?? null, height: identity.height ?? image.height ?? null });
        },
      });
      image.assetId = asset.id; image.assetIdentifier = asset.identifier;
      image.uploadStatus = 'asset-created'; persist();
      await recovery.operation(`${key}:approval`, {
        before: async () => ({ approved: !!(await api.readAsset(asset.id)).approved }),
        write: before => before.approved ? {} : api.approve(asset.id),
        verify: async () => (await api.readAsset(asset.id))?.approved ? verified({ approved: true }) : unknown(),
      });
      image.approved = true; image.uploadStatus = 'approved'; persist();
      const link = await recovery.operation(`${key}:link`, {
        before: async () => {
          if (image.publicUrl && !image.publicLinkId) throw new Blocked(key, 'legacy public URL lacks link identity; reconcile it rather than create a duplicate');
          return { legacyId: image.publicLinkId || null };
        },
        write: before => before.legacyId ? { id: before.legacyId } : api.createLink(asset.id, image),
        verify: async (result, _before, saved) => {
          const identity = saved || result;
          if (!identity?.id) return unknown();
          const current = await api.readLink(identity.id);
          if (saved?.url && current?.url !== saved.url) return { state: 'conflict' };
          return current && String(current.id) === String(identity.id) && String(current.assetId) === String(asset.id) && current.url && await api.verifyPublic(current.url) ? verified({ id: current.id, url: current.url }) : unknown();
        },
      });
      Object.assign(image, { status: 'uploaded', uploadStatus: 'uploaded', publicLinkId: link.id, publicUrl: link.url, width: asset.width, height: asset.height,
        thumbnailUrl: `${environment.host}/api/gateway/${asset.id}/thumbnail` });
      image.imageFieldXml = `<Image src="${xml(image.publicUrl)}" dam-id="${xml(asset.identifier)}"${asset.width && asset.height ? ` width="${asset.width}" height="${asset.height}"` : ''} alt="${xml(image.alt || image.localFile)}" dam-content-type="Image" thumbnailsrc="${xml(image.thumbnailUrl)}" />`;
      delete image.uploadError;
      persist();
    } catch (error) {
      if (recovery.poisoned || error.code === 'AWAITING_TOOL' || (!error.code && ['EACCES', 'ENOSPC', 'EROFS'].includes(error.errno))) throw error;
      // Filesystem errors cannot be treated as a remotely rejected optional image.
      if (error.code && /^E[A-Z]+$/.test(error.code)) throw error;
      image.uploadStatus = error.code === 'REJECTED' ? 'failed' : 'needs-reconciliation';
      image.uploadError = error.code === 'BLOCKED' ? error.message : 'remote outcome not verified';
      issues.push({ key, status: image.uploadStatus, target: image.target || { sectionPosition: image.sectionPosition, src: image.src }, reason: image.uploadError });
      persist();
    }
  }
  const result = { ...recovery.summary(), status: issues.length ? 'partial' : recovery.summary().status, issues };
  atomicJson(path.join(directory, 'upload-result.json'), result);
  return result;
}
module.exports = { uploadImages };
