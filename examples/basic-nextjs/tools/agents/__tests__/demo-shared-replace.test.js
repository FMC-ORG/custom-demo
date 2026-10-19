'use strict';
// Live probe (2026-10-19, Footer partial design): add_component_on_page works on a partial
// design, the new instance takes the first Variant Definition, set_component_datasource wires
// it, and remove_component_on_page removes the old instance. An approved complete demo build
// therefore replaces shared Header/Footer instances to apply the planned client variant.
const fs = require('node:fs');
const { temporary, plan, sitecore, clone } = require('./demo-fixture');
const {
  populate,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const {
  assemble,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/assemble.cjs');

let directory;
beforeEach(() => {
  directory = temporary();
});
afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

const FOLDER = '/sitecore/content/test/test/Presentation/Headless Variants/Cards';
function setup({ variants = ['Default', 'ClientFooter', 'ClientHeader'], replace = true } = {}) {
  const input = plan();
  input.sections[0].children = [];
  input.sections[0].key = 'header';
  input.sections[0].placement = 'partial-design';
  input.sections[0].variant = 'ClientHeader';
  input.sections[0].sharedDesign = {
    approved: true,
    replace,
    pageId: 'header-design',
    existingInstanceId: 'header-instance',
    currentDatasource: 'starter-ds',
  };
  input.sections.push({
    ...clone(input.sections[0]),
    key: 'footer',
    name: 'Client Footer',
    variant: 'ClientFooter',
    sharedDesign: {
      approved: true,
      replace,
      pageId: 'footer-design',
      existingInstanceId: 'footer-instance',
      currentDatasource: 'starter-footer',
    },
  });
  const remote = sitecore();
  remote.items.set('variants', {
    id: 'variants',
    name: 'Cards',
    path: FOLDER,
    templateId: 'variants',
    fields: {},
  });
  for (const name of variants)
    remote.items.set(`variant-${name}`, {
      id: `variant-${name}`,
      name,
      parentId: 'variants',
      path: `${FOLDER}/${name}`,
      templateId: 'variant-definition',
      fields: {},
    });
  const pages = {
    'header-design': [
      {
        id: 'header-instance',
        renderingId: 'cards-rendering',
        placeholder: 'headless-header',
        datasourceId: 'starter-ds',
        parameters: { FieldNames: 'variant-Default' },
      },
    ],
    'footer-design': [
      {
        id: 'footer-instance',
        renderingId: 'cards-rendering',
        placeholder: 'headless-footer',
        datasourceId: 'starter-footer',
        parameters: { FieldNames: 'variant-Default' },
      },
    ],
  };
  const calls = { add: 0, remove: 0, wire: 0, sortorder: 0 };
  let counter = 0;
  remote.api.readPage = async (id) => clone(pages[id] || []);
  remote.api.addComponent = async (data) => {
    calls.add++;
    const first = (await remote.api.readItem('variants')).children[0].id;
    const list = pages[data.pageId];
    const at = list.findIndex((x) => x.id === data.insertAfterComponentId) + 1;
    list.splice(at, 0, {
      id: `${data.pageId}-new-${++counter}`,
      renderingId: data.componentRenderingId,
      placeholder: data.placeholderPath,
      datasourceId: `auto-${counter}`,
      parameters: { FieldNames: first },
    });
    return {};
  };
  remote.api.setDatasource = async (pageId, id, datasourceId) => {
    calls.wire++;
    pages[pageId].find((x) => x.id === id).datasourceId = datasourceId;
    return {};
  };
  remote.api.removeComponent = async (pageId, id) => {
    calls.remove++;
    pages[pageId] = pages[pageId].filter((x) => x.id !== id);
    return {};
  };
  const update = remote.api.updateFields;
  remote.api.updateFields = async (id, fields) => {
    if (Object.hasOwn(fields, '__Sortorder')) calls.sortorder++;
    return update(id, fields);
  };
  const order = async () => (await remote.api.readItem('variants')).children.map((x) => x.name);
  return { input, remote, pages, calls, order };
}
const run = (build) =>
  populate({ directory, plan: build.input, api: build.remote.api, initialize: true });

test('approved replacement swaps both shared instances to the client variant and datasource', async () => {
  const build = setup();
  const before = await build.order();
  const population = await run(build);
  const result = await assemble({
    directory,
    plan: build.input,
    population,
    api: build.remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  for (const [page, variant, key] of [
    ['header-design', 'variant-ClientHeader', 'header'],
    ['footer-design', 'variant-ClientFooter', 'footer'],
  ]) {
    expect(build.pages[page]).toHaveLength(1);
    const datasource = population.datasourceItems.find((x) => x.key === key).itemId;
    expect(build.pages[page][0]).toMatchObject({
      parameters: { FieldNames: variant },
      datasourceId: datasource,
    });
    expect(build.pages[page][0].id).not.toMatch(/-instance$/);
  }
  expect(
    result.instances.map((x) => [
      x.key,
      x.replaced,
      x.previousInstanceId,
      x.previousDatasourceId,
      x.variant.applied,
    ]),
  ).toEqual([
    ['header', true, 'header-instance', 'starter-ds', true],
    ['footer', true, 'footer-instance', 'starter-footer', true],
  ]);
  expect(await build.order()).toEqual(before);
  // Only the add's auto-created datasources are left for manual cleanup.
  expect(result.manualTasks.map((x) => x.key)).toEqual(['header', 'footer']);
  expect(result.manualTasks[0].action).toContain('auto-');
});

test('a completed replacement reruns without any further writes', async () => {
  const build = setup();
  const population = await run(build);
  await assemble({
    directory,
    plan: build.input,
    population,
    api: build.remote.api,
    initialize: true,
  });
  const after = { ...build.calls };
  const rerun = await assemble({ directory, plan: build.input, population, api: build.remote.api });
  expect(rerun.status).toBe('complete');
  expect(build.calls).toEqual(after);
});

test('without approval to replace, the shared datasource is switched and the variant stays manual', async () => {
  const build = setup({ replace: false });
  const population = await run(build);
  const result = await assemble({
    directory,
    plan: build.input,
    population,
    api: build.remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  expect(build.calls).toMatchObject({ add: 0, remove: 0, sortorder: 0 });
  expect(build.pages['header-design'][0].id).toBe('header-instance');
  expect(
    result.manualTasks.some((x) => x.key === 'header' && x.action.includes('ClientHeader')),
  ).toBe(true);
});

test('a missing client variant falls back to the datasource switch without structural change', async () => {
  const build = setup({ variants: ['Default'] });
  const population = await run(build);
  const result = await assemble({
    directory,
    plan: build.input,
    population,
    api: build.remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  expect(build.calls).toMatchObject({ add: 0, remove: 0 });
  expect(build.pages['footer-design'].map((x) => x.id)).toEqual(['footer-instance']);
  expect(
    result.manualTasks.some((x) => x.key === 'footer' && x.action.includes('ClientFooter')),
  ).toBe(true);
});

test('a lost removal response is reconciled from the page and the removal is never repeated', async () => {
  const build = setup();
  const population = await run(build);
  const remove = build.remote.api.removeComponent;
  build.remote.api.removeComponent = async (...args) => {
    await remove(...args);
    throw new Error('lost response');
  };
  const result = await assemble({
    directory,
    plan: build.input,
    population,
    api: build.remote.api,
    initialize: true,
  });
  expect(result.status).toBe('complete');
  expect(build.calls.remove).toBe(2); // once per shared design
  expect(build.pages['header-design']).toHaveLength(1);
});

test('an unconfirmed removal keeps the build partial and is never retried or re-added', async () => {
  const build = setup();
  const population = await run(build);
  build.remote.api.removeComponent = async () => {
    build.calls.remove++;
    throw new Error('unknown outcome');
  };
  const first = await assemble({
    directory,
    plan: build.input,
    population,
    api: build.remote.api,
    initialize: true,
  });
  expect(first.status).toBe('partial');
  const second = await assemble({
    directory,
    plan: build.input,
    population,
    api: build.remote.api,
  });
  expect(second.status).toBe('partial');
  expect(build.calls.remove).toBe(2); // one attempt per shared design, never repeated
  expect(build.calls.add).toBe(2);
  expect(build.pages['header-design']).toHaveLength(2); // both visible until a human resolves it
});

test('a shared datasource changed since approval blocks replacement before any write', async () => {
  const build = setup();
  const before = await build.order();
  build.pages['header-design'][0].datasourceId = 'someone-else';
  const population = await run(build);
  const result = await assemble({
    directory,
    plan: build.input,
    population,
    api: build.remote.api,
    initialize: true,
  });
  expect(result.status).toBe('partial');
  expect(build.pages['header-design'].map((x) => x.id)).toEqual(['header-instance']);
  expect(build.calls.remove).toBeLessThanOrEqual(1); // the footer may still be replaced
  expect(await build.order()).toEqual(before); // a reorder made for the header is undone
});
