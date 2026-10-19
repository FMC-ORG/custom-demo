'use strict';
const fs = require('node:fs');
const { populate } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const { temporary, sitecore, plan } = require('./demo-fixture');
let dir;
beforeEach(() => { dir = temporary(); });
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

test('population preserves non-alphabetic source order and a fresh rerun creates no extra items', async () => {
  const remote = sitecore(); const input = plan();
  const first = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(first.status).toBe('complete');
  const parent = await remote.api.readItem(first.datasourceItems[0].itemId);
  expect(parent.children.map(x => x.fields.Title)).toEqual(['Strategy', 'Engineering', 'Execution', 'Operate']);
  const second = await populate({ directory: dir, plan: input, api: remote.api });
  expect(second.datasourceItems).toEqual(first.datasourceItems);
  expect(remote.items.size).toBe(6);
});

test('explicit optional blanks use a verified, recorded fallback when empty writes are ignored', async () => {
  const remote = sitecore(); const input = plan();
  input.sections[0].children = [{ key: 'quote', name: 'Client - Quote', templateId: 'quote', fields: { AuthorName: '' }, fieldRules: { AuthorName: { type: 'Single-Line Text', required: false } } }];
  remote.defaults.quote = { AuthorName: 'Client - Quote' };
  const update = remote.api.updateFields;
  remote.api.updateFields = async (id, fields) => update(id, Object.fromEntries(Object.entries(fields).filter(([,v]) => v !== '')));
  const first = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(first.status).toBe('complete');
  expect((await remote.api.readItem(first.datasourceItems[0].children[0].itemId)).fields.AuthorName).toBe(' ');
  expect(first.exceptions).toEqual([expect.objectContaining({ field: 'AuthorName', workaround: 'single space; not genuinely empty' })]);
  expect((await populate({ directory: dir, plan: input, api: remote.api })).exceptions).toHaveLength(1);
});

test('unspecified item-name defaults are flagged without blanking them', async () => {
  const remote = sitecore(); const input = plan();
  input.sections[0].children = [{ key: 'quote', name: 'Client - Quote', templateId: 'quote', fields: {}, fieldRules: { AuthorName: { type: 'Single-Line Text', required: false } } }];
  remote.defaults.quote = { AuthorName: 'Client - Quote' };
  const result = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(result.status).toBe('partial');
  expect(result.issues[0].reason).toContain('unspecified');
  expect([...remote.items.values()].find(x => x.templateId === 'quote').fields.AuthorName).toBe('Client - Quote');
});

test('lost parent creation response is reconciled, and external edits are not overwritten on resume', async () => {
  const remote = sitecore(); const input = plan();
  const create = remote.api.createItem;
  remote.api.createItem = async data => { await create(data); throw new Error('lost response'); };
  const first = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(first.status).toBe('complete');
  remote.items.get(first.datasourceItems[0].itemId).fields.Title = 'Human edit';
  const second = await populate({ directory: dir, plan: input, api: remote.api });
  expect(second.status).toBe('partial');
  expect(remote.items.get(first.datasourceItems[0].itemId).fields.Title).toBe('Human edit');
  expect(remote.items.size).toBe(6);
});

test('silently ignored ordering does not pass final sequence verification', async () => {
  const remote = sitecore(); const input = plan(); const update = remote.api.updateFields;
  remote.api.updateFields = async (id, fields) => update(id, Object.fromEntries(Object.entries(fields).filter(([name]) => name !== '__Sortorder')));
  const result = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(result.status).toBe('partial');
  expect(result.issues[0].reason).toContain('order/count');
});

test('legitimate item-name text is preserved and true clearing needs no exception', async () => {
  const remote = sitecore(); const input = plan();
  input.sections[0].fields.Title = input.sections[0].name;
  input.sections[0].fields.Description = '';
  input.sections[0].fieldRules.Description = { type: 'Multi-Line Text', required: false };
  remote.defaults.cards = { Description: 'default copy' };
  const result = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(result.status).toBe('complete');
  expect(result.exceptions).toEqual([]);
  const item = await remote.api.readItem(result.datasourceItems[0].itemId);
  expect(item.fields).toMatchObject({ Title: 'Client - Stages', Description: '' });
});

test('ignored image clears cannot use the whitespace workaround', async () => {
  const remote = sitecore(); const input = plan();
  input.sections[0].fields.Picture = '';
  input.sections[0].fieldRules.Picture = { type: 'Image', required: false };
  remote.defaults.cards = { Picture: '<Image src="old" />' };
  const update = remote.api.updateFields;
  remote.api.updateFields = async (id, fields) => update(id, Object.fromEntries(Object.entries(fields).filter(([,v]) => v !== '')));
  const result = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(result.status).toBe('partial');
  expect(result.exceptions).toEqual([]);
  expect([...remote.items.values()].find(x => x.templateId === 'cards').fields.Picture).toBe('<Image src="old" />');
});

test('a fresh record cannot adopt matching content from a previous build', async () => {
  const remote = sitecore(); const input = plan();
  await remote.api.createItem({ name: input.sections[0].name, parentId: 'folder', templateId: 'cards' });
  const result = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  expect(result.status).toBe('partial');
  expect(remote.items.size).toBe(2);
});
