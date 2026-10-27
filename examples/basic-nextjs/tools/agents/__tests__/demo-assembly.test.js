'use strict';
const fs = require('node:fs');
const { assemble } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/assemble.cjs');
const { populate } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const { temporary, sitecore, plan, clone } = require('./demo-fixture');
let dir;
beforeEach(() => { dir = temporary(); });
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

test('two occurrences survive timed-out adds and rerun without duplicating or changing variants', async () => {
  const remote = sitecore(); const input = plan();
  input.sections.push({ ...clone(input.sections[0]), key: 'news', name: 'Client - News' });
  const population = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  const add = remote.api.addComponent;
  remote.api.addComponent = async args => { await add(args); throw new Error('timeout after commit'); };
  const first = await assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true });
  expect(first.status).toBe('complete');
  const second = await assemble({ directory: dir, plan: input, population, api: remote.api });
  expect(second.status).toBe('complete');
  expect(remote.components).toHaveLength(2);
  expect(remote.components.map(x => x.datasourceId)).toEqual(population.datasourceItems.map(x => x.itemId));
  expect(remote.components.map(x => x.parameters.FieldNames)).toEqual(['existing-variant', 'existing-variant']);
});

test('a timed-out add with no visible effect blocks the chain and is never blindly repeated', async () => {
  const remote = sitecore(); const input = plan();
  input.sections.push({ ...clone(input.sections[0]), key: 'news', name: 'Client - News' });
  const population = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  let attempts = 0;
  remote.api.addComponent = async () => { attempts++; throw new Error('unknown'); };
  expect((await assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true })).status).toBe('partial');
  expect((await assemble({ directory: dir, plan: input, population, api: remote.api })).status).toBe('partial');
  expect(attempts).toBe(1);
  expect(remote.components).toHaveLength(0);
});

test('a derived population result cannot replace a missing ownership journal', async () => {
  const remote = sitecore(); const input = plan();
  const population = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  fs.unlinkSync(require('node:path').join(dir, 'recovery-content.json'));
  await expect(assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true })).rejects.toMatchObject({ code: 'BLOCKED' });
  expect(remote.components).toHaveLength(0);
});

test('a lost wiring response is reconciled; external variant changes are preserved and block resume', async () => {
  const remote = sitecore(); const input = plan();
  const population = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  const wire = remote.api.setDatasource;
  remote.api.setDatasource = async (...args) => { await wire(...args); throw new Error('lost response'); };
  expect((await assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true })).status).toBe('complete');
  remote.components[0].parameters.FieldNames = 'human-variant';
  expect((await assemble({ directory: dir, plan: input, population, api: remote.api })).status).toBe('partial');
  expect(remote.components[0].parameters.FieldNames).toBe('human-variant');
  expect(remote.components).toHaveLength(1);
});

test('multiple plausible additions are not adopted and no datasource is overwritten', async () => {
  const remote = sitecore(); const input = plan();
  const population = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  const add = remote.api.addComponent;
  remote.api.addComponent = async args => { await add(args); await add(args); throw new Error('ambiguous'); };
  const result = await assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true });
  expect(result.status).toBe('partial');
  expect(result.instances).toEqual([]);
  expect(remote.components.every(x => x.datasourceId.startsWith('local-'))).toBe(true);
});

test('datasource writes that change variant parameters cannot be reported complete', async () => {
  const remote = sitecore(); const input = plan();
  const population = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  const wire = remote.api.setDatasource;
  remote.api.setDatasource = async (...args) => { const result = await wire(...args); remote.components[0].parameters.FieldNames = 'reset-by-service'; return result; };
  const result = await assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true });
  expect(result.status).toBe('partial');
  expect(result.instances).toEqual([]);
});

test('one explicit existing instance cannot satisfy two occurrences', async () => {
  const remote = sitecore(); const input = plan();
  input.sections[0].existingInstanceId = 'selected';
  input.sections.push({ ...clone(input.sections[0]), key: 'news', name: 'Client - News' });
  const population = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  await expect(assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true })).rejects.toMatchObject({ code: 'BLOCKED' });
  expect(remote.components).toHaveLength(0);
});

test('a failed page placement yields an ordered manual-placement list instead of a dead end', async () => {
  const remote = sitecore(); const input = plan();
  input.sections.push({ ...clone(input.sections[0]), key: 'news', name: 'Client - News' });
  input.sections.push({ ...clone(input.sections[0]), key: 'events', name: 'Client - Events', variant: 'ClientEvents' });
  const population = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  const add = remote.api.addComponent;
  let calls = 0;
  // First add works; the Agent API then fails (as in the 2026-10-27 outage).
  remote.api.addComponent = async (args) => {
    calls++;
    if (calls === 1) return add(args);
    throw new Error("Error fetching component: GraphQL errors: The field `renderings` does not exist on the type `Query`.");
  };
  const result = await assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true });
  expect(result.status).toBe('partial');
  expect(remote.components).toHaveLength(1);
  const [first] = result.instances;
  expect(result.manualPlacements.map((x) => x.key)).toEqual(['news', 'events']);
  const [news, events] = result.manualPlacements;
  expect(news).toMatchObject({
    pageId: input.pageId,
    placeholder: input.sections[0].placeholder,
    datasourceId: population.datasourceItems.find((x) => x.key === 'news').itemId,
    after: { key: input.sections[0].key, instanceId: first.componentInstanceId },
  });
  expect(news.note).toMatch(/check Pages first/);
  expect(events).toMatchObject({ variant: 'ClientEvents', after: { key: 'news', instanceId: null } });
  expect(events.note).toBeUndefined();
  expect(result.manualTasks.find((x) => x.key === 'manual-placements').action).toMatch(/Place 2 section/);
});

test('a complete assembly has no manual placements', async () => {
  const remote = sitecore(); const input = plan();
  const population = await populate({ directory: dir, plan: input, api: remote.api, initialize: true });
  const result = await assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true });
  expect(result.status).toBe('complete');
  expect(result.manualPlacements).toEqual([]);
  expect(result.manualTasks.some((x) => x.key === 'manual-placements')).toBe(false);
});
