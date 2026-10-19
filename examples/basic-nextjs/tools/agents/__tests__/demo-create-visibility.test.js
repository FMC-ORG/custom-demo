'use strict';
// Live run (2026-10): create_content_item returned {"itemId": ...}, but the parent's
// children listing showed the new child only later. Verification must use the returned
// identity, and retries must observe fresh remote state instead of a cached read.
const fs = require('node:fs');
const path = require('node:path');
const {
  populate,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const {
  marketer,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/marketer.cjs');
const {
  FileBridge,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/file-bridge.cjs');
const { temporary, sitecore, plan } = require('./demo-fixture');

let dir;
beforeEach(() => {
  dir = temporary();
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

const text = (value) => ({ content: [{ type: 'text', text: JSON.stringify(value) }] });

// Children stay out of their parent's listing for `lag` listing reads after creation.
function laggingListing(remote, lag) {
  const hidden = new Map();
  const create = remote.api.createItem;
  const read = remote.api.readItem;
  const calls = { create: 0 };
  remote.api.createItem = async (data) => {
    calls.create++;
    const result = await create(data);
    hidden.set(result.id, lag);
    return result;
  };
  remote.api.readItem = async (id, options) => {
    const item = await read(id, options);
    item.children = item.children.filter((child) => {
      const remaining = hidden.get(child.id) || 0;
      if (remaining > 0) hidden.set(child.id, remaining - 1);
      return remaining === 0;
    });
    return item;
  };
  return calls;
}

test('the marketer adapter keeps the item ID returned by create_content_item', async () => {
  const calls = [];
  const api = marketer(async (tool, args, mutation, options) => {
    calls.push({ tool, mutation, options });
    return text({ itemId: '3f26a5ad-7c20-49a1-b73e-0e31d6d78fc1', name: 'Child' });
  });
  await expect(api.createItem({ parentId: 'p', templateId: 't', name: 'Child' })).resolves.toEqual({
    id: '3f26a5ad-7c20-49a1-b73e-0e31d6d78fc1',
  });
  expect(calls[0]).toMatchObject({ tool: 'create_content_item', mutation: true });
});

test('a create response without an identity stays unverified rather than inventing one', async () => {
  const api = marketer(async () => text({ success: true }));
  await expect(api.createItem({ parentId: 'p', templateId: 't', name: 'Child' })).resolves.toEqual(
    {},
  );
});

test('read options reach the transport so a retry can request a fresh observation', async () => {
  const calls = [];
  const api = marketer(async (tool, args, mutation, options) => {
    calls.push(options);
    return text({ itemId: 'a', name: 'A', template: { templateId: 't' }, children: [] });
  });
  await api.readItem('a', { fresh: 'verify:1' });
  expect(calls).toEqual([{ fresh: 'verify:1' }]);
});

test('the file bridge serves a cached read only for the same fresh tag', async () => {
  const bridge = new FileBridge({
    file: path.join(dir, 'mcp-populate.json'),
    identity: 'identity',
    initialize: true,
  });
  const args = { itemId: 'parent', language: 'en' };
  const answer = async (fresh, response) => {
    const pending = await bridge
      .call('get_content_item_by_id', args, false, { fresh })
      .catch((e) => e);
    expect(pending.code).toBe('AWAITING_TOOL');
    bridge.claim(pending.request.id);
    bridge.reply(pending.request.id, response);
  };
  await answer(undefined, { children: 'stale' });
  await expect(bridge.call('get_content_item_by_id', args, false)).resolves.toEqual({
    children: 'stale',
  });
  // A new fresh tag must be asked of the agent again, never answered from the cache.
  await answer('verify:1', { children: 'current' });
  await expect(
    bridge.call('get_content_item_by_id', args, false, { fresh: 'verify:1' }),
  ).resolves.toEqual({ children: 'current' });
  await expect(bridge.call('get_content_item_by_id', args, false)).resolves.toEqual({
    children: 'stale',
  });
});

test('a lagging children listing does not stall population when the create returned an ID', async () => {
  const remote = sitecore();
  const calls = laggingListing(remote, 3);
  const result = await populate({
    directory: dir,
    plan: plan(),
    api: remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  expect(result.issues).toEqual([]);
  expect(result.datasourceItems[0].children).toHaveLength(4);
  expect(calls.create).toBe(5); // parent + 4 children, each issued exactly once
  expect(remote.items.size).toBe(6);
});

test('a returned ID under a different parent is a conflict, never adopted', async () => {
  const remote = sitecore();
  const input = plan();
  input.sections[0].children = [];
  remote.items.set('other', {
    id: 'other',
    name: 'Other',
    path: '/sitecore/content/test/Data/Other',
    templateId: 'folder',
    fields: {},
  });
  const decoy = await remote.api.createItem({
    parentId: 'other',
    templateId: 'cards',
    name: input.sections[0].name,
  });
  const calls = laggingListing(remote, Infinity);
  const create = remote.api.createItem;
  remote.api.createItem = async (data) => {
    await create(data);
    return { id: decoy.id };
  };
  const result = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(result.status).toBe('partial');
  expect(result.issues[0]).toMatchObject({ key: 'stages', status: 'needs-reconciliation' });
  expect(calls.create).toBe(1);
});

test('a lost create response with no visible child still stops that section without a repeat', async () => {
  const remote = sitecore();
  const input = plan();
  input.sections[0].children = [];
  const calls = laggingListing(remote, Infinity);
  const create = remote.api.createItem;
  remote.api.createItem = async (data) => {
    await create(data);
    throw new Error('lost response');
  };
  const first = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(first.status).toBe('partial');
  const second = await populate({ directory: dir, plan: input, api: remote.api });
  expect(second.status).toBe('partial');
  expect(calls.create).toBe(1);
});
