'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { contentHub } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/content-hub.cjs');
const { temporary, sitecore, plan, clone } = require('./demo-fixture');
const scripts = path.resolve(__dirname, '../../../.agents/skills/sitecore-build-demo/scripts');
let dir;
beforeEach(() => { dir = temporary(); });
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

const response = (data, options = {}) => ({ ok: options.ok ?? true, status: options.status ?? 200, json: async () => data, headers: { get: name => options[name] || null }, body: { cancel: async () => {} } });

test('HTTP adapter verifies lifecycle/link ownership and checks public access without credentials', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/entities/1')) return response({ id: 1, identifier: 'asset', relations: { FinalLifeCycleStatusToAsset: { parents: [{ href: '/api/entities/status' }] } } });
    if (url.endsWith('/entities/status')) return response({ identifier: 'M.Final.LifeCycle.Status.Approved' });
    if (url.endsWith('/entities/2')) return response({ id: 2, properties: { RelativeUrl: 'media', VersionHash: 'v1' }, relations: { AssetToPublicLink: { parents: [{ href: '/api/entities/1' }] } } });
    if (url.includes('/public/content/')) return response(null, { 'content-type': 'image/png' });
    throw new Error('unexpected request');
  };
  const api = contentHub({ host: 'https://hub.example', token: 'test-only-token', directory: dir, fetchImpl });
  expect(await api.readAsset(1)).toMatchObject({ id: 1, approved: true });
  const link = await api.readLink(2);
  expect(link).toMatchObject({ id: 2, assetId: '1' });
  expect(await api.verifyPublic(link.url)).toBe(true);
  expect(calls[0].options.headers).toHaveProperty('X-Auth-Token');
  expect(calls[calls.length - 1].options.headers).toEqual({ Range: 'bytes=0-0' });
});

test('an upload-session rejection cannot make the entire multi-call creation safely retryable', async () => {
  fs.writeFileSync(path.join(dir, 'image.png'), 'test image');
  let calls = 0;
  const api = contentHub({ host: 'https://hub.example', token: 'test-only-token', directory: dir, uploadConfig: 'AssetUploadConfiguration', fetchImpl: async () => {
    calls++;
    return calls === 1 ? response({ upload_identifier: 'session', file_identifier: 'file' }, { location: 'https://hub.example/upload/session' }) : response(null, { ok: false, status: 400 });
  } });
  await expect(api.createAsset({ localFile: 'image.png' })).rejects.toThrow('requires reconciliation');
  expect(calls).toBe(2);
});

test('authenticated upload requests never follow an off-origin upload location', async () => {
  fs.writeFileSync(path.join(dir, 'image.png'), 'test image');
  const fetchImpl = jest.fn(async () => response({ upload_identifier: 'session', file_identifier: 'file' }, { location: 'https://other.example/upload/session' }));
  const api = contentHub({ host: 'https://hub.example', token: 'test-only-token', directory: dir, uploadConfig: 'AssetUploadConfiguration', fetchImpl });
  await expect(api.createAsset({ localFile: 'image.png' })).rejects.toThrow('requires reconciliation');
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});

test('the upload CLI dry-run creates no recovery records and needs no credentials', () => {
  fs.writeFileSync(path.join(dir, 'image-manifest.json'), JSON.stringify([{ localFile: 'image.png', status: 'downloaded' }]));
  const run = spawnSync(process.execPath, [path.join(scripts, 'upload-to-content-hub.mjs'), '--images-dir', dir, '--project-root', dir, '--host', 'https://hub.example', '--dry-run'], { encoding: 'utf8' });
  expect(run.status).toBe(0);
  expect(JSON.parse(run.stdout).mode).toBe('dry-run');
  expect(fs.readdirSync(dir)).toEqual(['image-manifest.json']);
});

test('the CLI refuses to initialize replacement transport state for an existing journal', () => {
  const planFile = path.join(dir, 'plan.json'); fs.writeFileSync(planFile, JSON.stringify(plan()));
  fs.writeFileSync(path.join(dir, 'recovery-content.json'), '{}');
  const run = spawnSync(process.execPath, [path.join(scripts, 'demo-recovery.cjs'), '--plan', planFile, '--directory', dir, '--phase', 'populate', '--initialize'], { encoding: 'utf8' });
  expect(run.status).toBe(2);
  expect(run.stderr).toContain('missing companion record');
  expect(fs.existsSync(path.join(dir, 'mcp-populate.json'))).toBe(false);
});

test('actual CLI handoffs recover lost create/add replies and rerun repeated renderings without new instances', async () => {
  const remote = sitecore(); const input = plan(); input.sections[0].children = [];
  input.sections.push({ ...clone(input.sections[0]), key: 'news', name: 'Client - News' });
  const planFile = path.join(dir, 'execution-plan.json'); const resultFile = path.join(dir, 'reply.json');
  fs.writeFileSync(planFile, JSON.stringify(input));
  function command(phase, extra = []) {
    const run = spawnSync(process.execPath, [path.join(scripts, 'demo-recovery.cjs'), '--plan', planFile, '--directory', dir, '--phase', phase, ...extra], { encoding: 'utf8' });
    if (run.status !== 0) throw new Error(`CLI status ${run.status}: ${run.stderr || run.stdout}`);
    return run.stdout;
  }
  async function dispatch({ tool, args: a }) {
    switch (tool) {
      case 'get_content_item_by_path': return remote.api.resolvePath(a.itemPath);
      case 'get_content_item_by_id': return remote.api.readItem(a.itemId);
      case 'create_content_item': return remote.api.createItem(a);
      case 'update_fields_on_item': return remote.api.updateFields(a.itemId, Object.fromEntries(a.fields.map(x => [x.name, x.value])));
      case 'get_components_on_page': return remote.api.readPage(a.pageId);
      case 'add_component_on_page': return remote.api.addComponent(a);
      case 'set_component_datasource': return remote.api.setDatasource(a.pageId, a.componentId, a.datasourceId);
      default: throw new Error(`Unexpected tool ${tool}`);
    }
  }
  const repliesToLose = new Set(['create_content_item', 'add_component_on_page']);
  async function run(phase, initialize) {
    for (let i = 0; i < 100; i++) {
      const output = JSON.parse(command(phase, initialize ? ['--initialize'] : []));
      initialize = false;
      if (output.status !== 'awaiting-tool') return output;
      const request = JSON.parse(command(phase, ['--claim', output.request.id]));
      const result = await dispatch(request);
      // Remote effect committed, but the carrier dies before recording the result.
      // The next Node process must reconcile from intent instead of claiming again.
      if (repliesToLose.delete(request.tool)) continue;
      fs.writeFileSync(resultFile, JSON.stringify({ content: [{ type: 'text', text: JSON.stringify(result) }] }));
      command(phase, ['--reply', request.id, '--result', resultFile]);
    }
    throw new Error('CLI handoff budget exceeded');
  }
  expect((await run('populate', true)).status).toBe('complete');
  expect((await run('assemble', true)).status).toBe('complete');
  expect((await run('populate', false)).status).toBe('complete');
  expect((await run('assemble', false)).status).toBe('complete');
  expect(remote.items.size).toBe(3);
  expect(remote.components).toHaveLength(2);
  expect(new Set(remote.components.map(x => x.datasourceId)).size).toBe(2);
}, 60000);
