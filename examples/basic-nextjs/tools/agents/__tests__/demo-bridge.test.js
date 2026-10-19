'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { FileBridge } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/file-bridge.cjs');
const { marketer } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/marketer.cjs');
const { populate } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const { temporary, sitecore, plan } = require('./demo-fixture');
let dir;
beforeEach(() => { dir = temporary(); });
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

test('the file-in/file-out workflow runs real population through the marketer adapter and resumes without duplicates', async () => {
  const remote = sitecore(); const input = plan(); input.sections[0].children = [];
  const bridgeFile = path.join(dir, 'mcp.json');
  const dispatch = async request => {
    const a = request.args;
    switch (request.tool) {
      case 'get_content_item_by_path': return remote.api.resolvePath(a.itemPath);
      case 'get_content_item_by_id': return remote.api.readItem(a.itemId);
      case 'create_content_item': return remote.api.createItem(a);
      case 'update_fields_on_item': return remote.api.updateFields(a.itemId, Object.fromEntries(a.fields.map(x => [x.name, x.value])));
      default: throw new Error('unexpected tool');
    }
  };
  async function run(initialize) {
    for (let n = 0; n < 60; n++) {
      const bridge = new FileBridge({ file: bridgeFile, identity: 'test', initialize });
      try {
        const result = await populate({ directory: dir, plan: input, initialize, api: marketer(bridge.call.bind(bridge)) });
        bridge.finish(); return result;
      } catch (error) {
        if (error.code !== 'AWAITING_TOOL') throw error;
        const claimed = bridge.claim(error.request.id);
        const response = await dispatch(claimed);
        bridge.reply(claimed.id, { content: [{ type: 'text', text: JSON.stringify(response) }] });
      }
    }
    throw new Error('handoff failed to converge');
  }
  expect((await run(true)).status).toBe('complete');
  expect((await run(false)).status).toBe('complete');
  expect(remote.items.size).toBe(2);
});

test('a claimed mutation without a response cannot be claimed or dispatched again', async () => {
  const file = path.join(dir, 'transport.json');
  const first = new FileBridge({ file, identity: 'test', initialize: true });
  let request;
  try { await first.call('create_content_item', { name: 'Example' }, true); } catch (error) { request = error.request; error.confirmReady(); }
  first.claim(request.id);
  const restarted = new FileBridge({ file, identity: 'test' });
  expect(() => restarted.claim(request.id)).toThrow('already issued');
  await expect(restarted.call('create_content_item', { name: 'Example' }, true)).rejects.toThrow('no recorded response');
});

test('unknown tools cannot bypass the allowlist by omitting the mutation flag', async () => {
  const bridge = new FileBridge({ file: path.join(dir, 'transport.json'), identity: 'test', initialize: true });
  await expect(bridge.call('delete_item', {})).rejects.toMatchObject({ code: 'BLOCKED' });
  expect(Object.keys(bridge.state.requests)).toHaveLength(0);
});

test('begin discards old observations instead of replaying a prior read response', async () => {
  const bridge = new FileBridge({ file: path.join(dir, 'transport.json'), identity: 'test', initialize: true });
  let request;
  try { await bridge.call('get_content_item_by_id', { itemId: 'a' }, false); } catch (error) { request = error.request; }
  bridge.claim(request.id); bridge.reply(request.id, { id: 'a', value: 'old' });
  expect(await bridge.call('get_content_item_by_id', { itemId: 'a' }, false)).toEqual({ id: 'a', value: 'old' });
  bridge.begin();
  await expect(bridge.call('get_content_item_by_id', { itemId: 'a' }, false)).rejects.toMatchObject({ code: 'AWAITING_TOOL' });
});
