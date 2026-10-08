'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Recovery } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/recovery.cjs');
const { FileBridge } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/file-bridge.cjs');

const dirs = [];
afterEach(() => { while (dirs.length) fs.rmSync(dirs.pop(), { recursive: true, force: true }); });
function workspace() { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-recovery-')); dirs.push(dir); return dir; }
function open(file, initialize = false, intent = { client: 'Example' }) {
  return new Recovery({ file, initialize, intent, environment: { site: 'test' } });
}

test('a lost creation response is reconciled and a fresh execution does not create a second asset', async () => {
  const file = path.join(workspace(), 'recovery.json');
  const assets = [];
  const operation = {
    before: async () => assets.map(x => x.id),
    write: async () => { assets.push({ id: 'asset-1' }); throw new Error('socket closed after commit'); },
    verify: async (_result, before) => {
      const added = assets.filter(x => !before.includes(x.id));
      return added.length === 1 ? { state: 'verified', value: added[0] } : { state: 'unknown' };
    },
  };
  expect(await open(file, true).operation('hero:create', operation)).toEqual({ id: 'asset-1' });
  expect(await open(file).operation('hero:create', operation)).toEqual({ id: 'asset-1' });
  expect(assets).toEqual([{ id: 'asset-1' }]);
});

test('ambiguous writes remain blocked across restarts rather than being retried', async () => {
  const file = path.join(workspace(), 'recovery.json');
  let writes = 0;
  const operation = { before: async () => [], write: async () => { writes++; throw new Error('timeout'); }, verify: async () => ({ state: 'unknown' }) };
  await expect(open(file, true).operation('add', operation)).rejects.toMatchObject({ code: 'BLOCKED' });
  await expect(open(file).operation('add', operation)).rejects.toMatchObject({ code: 'BLOCKED' });
  expect(writes).toBe(1);
  expect(open(file).summary().status).toBe('partial');
});

test('changed inputs, missing records and structurally corrupt records are rejected before execution', () => {
  const file = path.join(workspace(), 'recovery.json');
  expect(() => open(file)).toThrow('missing recovery');
  open(file, true);
  expect(() => open(file, false, { client: 'Different' })).toThrow('changed approved');
  const state = JSON.parse(fs.readFileSync(file)); state.operations = [];
  fs.writeFileSync(file, JSON.stringify(state));
  expect(() => open(file)).toThrow('incompatible');
});

test('a checkpoint failure prevents any subsequent remote writes', async () => {
  const dir = workspace(); const file = path.join(dir, 'recovery.json');
  const recovery = open(file, true);
  fs.rmSync(dir, { recursive: true }); fs.writeFileSync(dir, 'not a directory');
  const write = jest.fn();
  const operation = { before: async () => [], write, verify: async () => ({ state: 'verified', value: 'ok' }) };
  await expect(recovery.operation('one', operation)).rejects.toMatchObject({ code: 'BLOCKED' });
  await expect(recovery.operation('two', operation)).rejects.toMatchObject({ code: 'BLOCKED' });
  expect(write).not.toHaveBeenCalled();
});

test('a handoff session reuses observations, but a fresh session revalidates them', async () => {
  const file = path.join(workspace(), 'recovery.json');
  const options = { file, intent: {}, environment: {}, observationSession: 'session-1' };
  let current = 'original'; let probes = 0;
  const operation = { before: async () => [], write: async () => ({}), verify: async () => { probes++; return current === 'original' ? { state: 'verified', value: current } : { state: 'conflict' }; } };
  await new Recovery({ ...options, initialize: true }).operation('one', operation);
  await new Recovery(options).operation('one', operation);
  expect(probes).toBe(1);
  current = 'edited';
  await expect(new Recovery({ ...options, observationSession: 'session-2' }).operation('one', operation)).rejects.toMatchObject({ code: 'BLOCKED' });
});

test('records copied to another workspace cannot authorise resumed mutations', () => {
  const file = path.join(workspace(), 'recovery.json'); open(file, true);
  const moved = path.join(workspace(), 'recovery.json'); fs.copyFileSync(file, moved);
  expect(() => open(moved)).toThrow('changed approved');
});

test('a prepared but unissued MCP write rechecks preconditions after a session break', async () => {
  const dir = workspace(); const file = path.join(dir, 'recovery.json');
  const bridge = new FileBridge({ file: path.join(dir, 'bridge.json'), identity: 'test', initialize: true });
  let current = 'before'; let request;
  const operation = { before: async () => ({ value: current }), write: () => bridge.call('update_fields_on_item', { itemId: 'item', fields: [{ name: 'Title', value: 'planned' }] }, true), verify: async () => ({ state: 'unknown' }) };
  try { await open(file, true).operation('update', operation); } catch (error) { expect(error.code).toBe('AWAITING_TOOL'); request = error.request; }
  current = 'human edit'; bridge.begin();
  await expect(open(file).operation('update', operation)).rejects.toThrow('pre-write state changed');
  expect(() => bridge.claim(request.id)).toThrow('not claimable');
});
