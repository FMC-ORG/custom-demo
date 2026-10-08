'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Blocked, ConfirmedFailure } = require('./recovery.cjs');
const { getImageDimensions } = require('./image-dimensions.cjs');

function contentHub({ host, token, directory, uploadConfig, fetchImpl = fetch }) {
  const parsedHost = new URL(host);
  if (parsedHost.protocol !== 'https:' || parsedHost.username || parsedHost.password || parsedHost.pathname !== '/' || parsedHost.search || parsedHost.hash) throw new Blocked('Content Hub', 'credential-free HTTPS origin required');
  const origin = parsedHost.origin;
  function absolute(url) {
    const resolved = new URL(url, `${origin}/`);
    if (resolved.origin !== origin || resolved.username || resolved.password) throw new Blocked('Content Hub', 'refusing to send credentials outside configured origin');
    return resolved.href;
  }
  async function request(method, url, body, authenticated = true) {
    const headers = authenticated ? (token.startsWith('Bearer ') ? { Authorization: token } : { 'X-Auth-Token': token }) : {};
    const isForm = body instanceof FormData;
    if (body && !isForm) headers['Content-Type'] = 'application/json';
    let response;
    try { response = await fetchImpl(absolute(url), { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined, redirect: 'error', signal: AbortSignal.timeout(120000) }); }
    catch { throw new Error('Content Hub transport outcome unknown'); }
    if (!response.ok) {
      // Conflict/server errors can follow a partial effect. Never classify them as safely retryable.
      if (method !== 'GET' && [400, 401, 403, 404, 415, 422].includes(response.status)) throw new ConfirmedFailure(`HTTP_${response.status}`);
      throw new Error('Content Hub response not verified');
    }
    let data = null;
    try { data = await response.json(); } catch { /* e.g. empty approval response */ }
    return { data, location: response.headers.get('location') };
  }
  const entityId = value => {
    const match = String(value || '').match(/\/entities\/([^/?#]+)\/?(?:[?#].*)?$/);
    return match?.[1];
  };
  // Content Hub returns relations in several shapes: inline single-parent `{ parent: { href } }`
  // (e.g. FinalLifeCycleStatusToAsset), inline `{ parents: [{ href }] }`, or an unexpanded
  // `{ href }` pointing at the relation resource, which itself returns parent/parents.
  // Anything else stays unreadable so the caller blocks instead of guessing.
  const inlineParentHref = relation => {
    if (relation?.parent?.href) return relation.parent.href;
    if (Array.isArray(relation?.parents)) return relation.parents.length === 1 ? relation.parents[0]?.href : undefined;
    return undefined;
  };
  async function relationParentHref(relation) {
    const inline = inlineParentHref(relation);
    if (inline) return inline;
    if (!relation?.href || relation.parent || relation.parents) return undefined;
    return inlineParentHref((await request('GET', relation.href)).data);
  }
  return {
    async createAsset(image) {
      const file = path.join(directory, image.localFile);
      const start = await request('POST', '/api/v2.0/upload', { file_name: image.localFile, file_size: fs.statSync(file).size, upload_configuration: { name: uploadConfig }, action: { name: 'NewAsset' } });
      if (!start.location || !start.data?.upload_identifier || !start.data?.file_identifier) throw new Error('Upload session outcome unknown');
      try {
        const form = new FormData(); form.append('file', new Blob([fs.readFileSync(file)]), path.basename(image.localFile));
        await request('POST', start.location, form);
        const finish = await request('POST', '/api/v2.0/upload/finalize', { upload_identifier: start.data.upload_identifier, file_identifier: start.data.file_identifier });
        if (!finish.data?.asset_id || !finish.data?.asset_identifier) throw new Error('Asset creation outcome unknown');
        return { id: finish.data.asset_id, identifier: finish.data.asset_identifier, ...getImageDimensions(file) };
      } catch {
        // Rejection of a later HTTP step is NOT proof that the whole multi-call creation had no effect.
        throw new Error('Upload session started; asset creation requires reconciliation');
      }
    },
    async readAsset(id) {
      const { data } = await request('GET', `/api/entities/${encodeURIComponent(id)}`);
      if (!data?.id || !data.identifier) throw new Error('Unrecognized asset response');
      const statusHref = await relationParentHref(data.relations?.FinalLifeCycleStatusToAsset);
      if (!statusHref) throw new Error('Asset lifecycle relationship not readable');
      const status = (await request('GET', statusHref)).data;
      if (!status?.identifier) throw new Error('Asset lifecycle status not readable');
      const approved = status.identifier === 'M.Final.LifeCycle.Status.Approved';
      return { id: data.id, identifier: data.identifier, approved };
    },
    approve: async id => { await request('POST', `/api/entities/${encodeURIComponent(id)}/lifecycle/approve`, {}); return {}; },
    async createLink(assetId, image) {
      const cleanName = path.basename(image.localFile).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
      const result = await request('POST', '/api/entities', {
        entitydefinition: { href: `${origin}/api/entitydefinitions/M.PublicLink` },
        properties: { Resource: 'downloadOriginal', RelativeUrl: `${assetId}-${cleanName}` },
        relations: { AssetToPublicLink: { parents: [{ href: `${origin}/api/entities/${assetId}` }] } },
      });
      const id = result.data?.id || entityId(result.location);
      if (!id) throw new Error('Public link creation outcome unknown');
      return { id };
    },
    async readLink(id) {
      const { data } = await request('GET', `/api/entities/${encodeURIComponent(id)}`);
      const assetId = entityId(await relationParentHref(data?.relations?.AssetToPublicLink));
      const relative = data?.properties?.RelativeUrl;
      const version = data?.properties?.VersionHash;
      if (!assetId || !relative) throw new Error('Public link relationship not readable');
      return { id: data.id, assetId, url: `${origin}/api/public/content/${relative}${version ? `?v=${encodeURIComponent(version)}` : ''}` };
    },
    async verifyPublic(url) {
      // No credentials: this checks anonymous accessibility, not just authenticated DAM access.
      const response = await fetchImpl(absolute(url), { method: 'GET', headers: { Range: 'bytes=0-0' }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
      await response.body?.cancel();
      return response.ok && /^(image|video)\//i.test(response.headers.get('content-type') || '');
    },
  };
}
module.exports = { contentHub };
