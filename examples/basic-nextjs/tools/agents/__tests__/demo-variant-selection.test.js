'use strict';
// Live probe (2026-10-19): add_component_on_page sets the new instance's FieldNames to the
// FIRST Variant Definition in Presentation/Headless Variants/<Component>, ordered by
// __Sortorder then name. Clearing __Sortorder restores the order; the instance keeps its variant.
const fs = require('node:fs');
const {
  assemble,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/assemble.cjs');
const {
  populate,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const { temporary, sitecore, plan, clone } = require('./demo-fixture');

let dir;
beforeEach(() => {
  dir = temporary();
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

const FOLDER = '/sitecore/content/test/test/Presentation/Headless Variants/Cards';
function withVariants(remote, names = ['Carousel', 'Default', 'ClientNews', 'ClientProjects']) {
  remote.items.set('variants', {
    id: 'variants',
    name: 'Cards',
    path: FOLDER,
    templateId: 'variants',
    fields: {},
  });
  for (const name of names)
    remote.items.set(`variant-${name}`, {
      id: `variant-${name}`,
      name,
      parentId: 'variants',
      path: `${FOLDER}/${name}`,
      templateId: 'variant-definition',
      fields: {},
    });
  return async () => (await remote.api.readItem('variants')).children.map((x) => x.name);
}
function twoSections() {
  const input = plan();
  input.sections[0].variant = 'ClientProjects';
  input.sections.push({
    ...clone(input.sections[0]),
    key: 'news',
    name: 'Client - News',
    variant: 'ClientNews',
  });
  return input;
}
function countWrites(remote) {
  const writes = [];
  const update = remote.api.updateFields;
  remote.api.updateFields = async (id, fields) => {
    writes.push({ id, fields });
    return update(id, fields);
  };
  return writes;
}

test('each added instance gets its planned variant and the folder order is restored', async () => {
  const remote = sitecore();
  const order = withVariants(remote);
  const before = await order();
  const input = twoSections();
  const population = await populate({
    directory: dir,
    plan: input,
    api: remote.api,
    initialize: true,
  });
  const result = await assemble({
    directory: dir,
    plan: input,
    population,
    api: remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  // Same component, two different client variants on the same page.
  expect(remote.components.map((x) => x.parameters.FieldNames)).toEqual([
    'variant-ClientProjects',
    'variant-ClientNews',
  ]);
  expect(result.instances.map((x) => x.variant)).toEqual([
    { name: 'ClientProjects', id: 'variant-ClientProjects', applied: true },
    { name: 'ClientNews', id: 'variant-ClientNews', applied: true },
  ]);
  expect(await order()).toEqual(before);
  expect(result.manualTasks).toEqual([]);
});

test('a completed rerun repeats no sort-order or component writes', async () => {
  const remote = sitecore();
  withVariants(remote);
  const input = twoSections();
  const population = await populate({
    directory: dir,
    plan: input,
    api: remote.api,
    initialize: true,
  });
  await assemble({ directory: dir, plan: input, population, api: remote.api, initialize: true });
  const writes = countWrites(remote);
  const rerun = await assemble({ directory: dir, plan: input, population, api: remote.api });
  expect(rerun.status).toBe('complete');
  expect(writes).toEqual([]);
  expect(remote.components).toHaveLength(2);
});

test('a variant that is already first needs no sort-order write', async () => {
  const remote = sitecore();
  withVariants(remote, ['ClientProjects', 'Default']);
  const input = plan();
  input.sections[0].variant = 'ClientProjects';
  const population = await populate({
    directory: dir,
    plan: input,
    api: remote.api,
    initialize: true,
  });
  const writes = countWrites(remote);
  const result = await assemble({
    directory: dir,
    plan: input,
    population,
    api: remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  expect(writes.filter((x) => Object.hasOwn(x.fields, '__Sortorder'))).toEqual([]);
  expect(remote.components[0].parameters.FieldNames).toBe('variant-ClientProjects');
});

test('a missing variant does not block assembly and becomes a manual task', async () => {
  const remote = sitecore();
  withVariants(remote, ['Default']);
  const input = plan();
  input.sections[0].variant = 'ClientProjects';
  const population = await populate({
    directory: dir,
    plan: input,
    api: remote.api,
    initialize: true,
  });
  const result = await assemble({
    directory: dir,
    plan: input,
    population,
    api: remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  expect(remote.components).toHaveLength(1);
  expect(result.instances[0].variant).toEqual({ name: 'ClientProjects', applied: false });
  expect(result.manualTasks).toEqual([
    expect.objectContaining({ key: 'stages', action: expect.stringContaining('ClientProjects') }),
  ]);
});

test('reused instances are not reordered and get a manual variant task', async () => {
  const remote = sitecore();
  withVariants(remote);
  const input = plan();
  input.sections[0].variant = 'ClientProjects';
  input.sections[0].existingInstanceId = 'existing';
  remote.components.push({
    id: 'existing',
    renderingId: 'cards-rendering',
    componentName: 'Cards',
    placeholder: 'headless-main',
    datasourceId: 'starter',
    parameters: { FieldNames: 'variant-Default' },
  });
  const population = await populate({
    directory: dir,
    plan: input,
    api: remote.api,
    initialize: true,
  });
  const writes = countWrites(remote);
  const result = await assemble({
    directory: dir,
    plan: input,
    population,
    api: remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  expect(writes.filter((x) => Object.hasOwn(x.fields, '__Sortorder'))).toEqual([]);
  expect(remote.components[0].parameters.FieldNames).toBe('variant-Default');
  expect(result.manualTasks).toEqual([
    expect.objectContaining({ key: 'stages', action: expect.stringContaining('ClientProjects') }),
  ]);
});

test('a lost sort-order response is reconciled from the folder order, never written twice', async () => {
  const remote = sitecore();
  withVariants(remote);
  const input = plan();
  input.sections[0].variant = 'ClientProjects';
  const population = await populate({
    directory: dir,
    plan: input,
    api: remote.api,
    initialize: true,
  });
  const update = remote.api.updateFields;
  let lost = 0;
  remote.api.updateFields = async (id, fields) => {
    await update(id, fields);
    if (fields.__Sortorder && !lost++) throw new Error('lost response');
    return {};
  };
  const result = await assemble({
    directory: dir,
    plan: input,
    population,
    api: remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  expect(lost).toBe(1);
  expect(remote.components[0].parameters.FieldNames).toBe('variant-ClientProjects');
});

test('when the add fails the folder order is still restored', async () => {
  const remote = sitecore();
  const order = withVariants(remote);
  const before = await order();
  const input = plan();
  input.sections[0].variant = 'ClientProjects';
  const population = await populate({
    directory: dir,
    plan: input,
    api: remote.api,
    initialize: true,
  });
  remote.api.addComponent = async () => {
    throw new Error('unknown');
  };
  const result = await assemble({
    directory: dir,
    plan: input,
    population,
    api: remote.api,
    initialize: true,
  });
  expect(result.status).toBe('partial');
  expect(await order()).toEqual(before);
});

test('an add confirmed only on a later run keeps its variant and is never reordered again', async () => {
  const remote = sitecore();
  const order = withVariants(remote);
  const before = await order();
  const input = plan();
  input.sections[0].variant = 'ClientProjects';
  const population = await populate({
    directory: dir,
    plan: input,
    api: remote.api,
    initialize: true,
  });
  const writes = countWrites(remote);
  let visible = false;
  const read = remote.api.readPage;
  remote.api.readPage = async (...args) => (visible ? read(...args) : []);
  const first = await assemble({
    directory: dir,
    plan: input,
    population,
    api: remote.api,
    initialize: true,
  });
  expect(first.status).toBe('partial');
  visible = true;
  const second = await assemble({ directory: dir, plan: input, population, api: remote.api });
  expect(second.status).toBe('complete');
  expect(second.instances[0].variant).toEqual({
    name: 'ClientProjects',
    id: 'variant-ClientProjects',
    applied: true,
  });
  expect(writes.filter((x) => Object.hasOwn(x.fields, '__Sortorder'))).toHaveLength(2); // reorder + restore, once
  expect(remote.components).toHaveLength(1);
  expect(await order()).toEqual(before);
});
