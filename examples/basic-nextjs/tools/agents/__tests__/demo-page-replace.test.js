'use strict';
// Quick win #1: a demo build may replace page components it would otherwise reuse (so the
// planned variant is applied) and remove leftover starter components, both only with plan
// approval. Same add -> wire -> remove sequence as the shared Header/Footer replacement (ADR 0009).
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
function setup({ variants = ['Default', 'ClientHero', 'ClientNews'] } = {}) {
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
  // Starter page: a hero to reuse, then a starter search strip to remove.
  remote.components.push(
    {
      id: 'starter-hero',
      renderingId: 'cards-rendering',
      componentName: 'Cards',
      placeholder: 'headless-main',
      datasourceId: 'starter-ds',
      parameters: { FieldNames: 'variant-Default' },
    },
    {
      id: 'starter-search',
      renderingId: 'search-rendering',
      componentName: 'Search',
      placeholder: 'headless-main',
      datasourceId: 'search-ds',
      parameters: {},
    },
  );
  const input = plan();
  input.sections[0].children = [];
  Object.assign(input.sections[0], {
    key: 'hero',
    existingInstanceId: 'starter-hero',
    variant: 'ClientHero',
    replace: true,
  });
  input.sections.push({
    ...clone(input.sections[0]),
    key: 'news',
    name: 'Client - News',
    variant: 'ClientNews',
  });
  delete input.sections[1].existingInstanceId;
  delete input.sections[1].replace;
  input.removeInstances = [
    { instanceId: 'starter-search', renderingId: 'search-rendering', reason: 'starter content' },
  ];
  const calls = { add: 0, remove: 0, sortorder: 0 };
  for (const name of ['addComponent', 'removeComponent']) {
    const original = remote.api[name];
    remote.api[name] = async (...args) => {
      calls[name === 'addComponent' ? 'add' : 'remove']++;
      return original(...args);
    };
  }
  const update = remote.api.updateFields;
  remote.api.updateFields = async (id, fields) => {
    if (Object.hasOwn(fields, '__Sortorder')) calls.sortorder++;
    return update(id, fields);
  };
  const order = async () => (await remote.api.readItem('variants')).children.map((x) => x.name);
  return { remote, input, calls, order };
}
const build = async (b, initialize = true) => {
  const population = await populate({
    directory: dir,
    plan: b.input,
    api: b.remote.api,
    initialize: true,
  });
  return {
    population,
    run: (init = initialize) =>
      assemble({ directory: dir, plan: b.input, population, api: b.remote.api, initialize: init }),
  };
};

test('an approved reused instance is replaced in place with the planned variant and the starter strip is removed', async () => {
  const b = setup();
  const before = await b.order();
  const { population, run } = await build(b);
  const result = await run();
  expect(result.status).toBe('complete');
  const [hero, news] = population.datasourceItems;
  // The replacement sits where the starter hero was; news follows; the starter strip is gone.
  expect(b.remote.components.map((x) => [x.datasourceId, x.parameters.FieldNames])).toEqual([
    [hero.itemId, 'variant-ClientHero'],
    [news.itemId, 'variant-ClientNews'],
  ]);
  expect(result.instances[0]).toMatchObject({
    key: 'hero',
    replaced: true,
    previousInstanceId: 'starter-hero',
    variant: { name: 'ClientHero', applied: true },
  });
  expect(result.removed).toEqual([{ instanceId: 'starter-search', reason: 'starter content' }]);
  expect(await b.order()).toEqual(before);
  expect(result.manualTasks.filter((x) => /select variant/i.test(x.action))).toEqual([]);
  // Auto-created placeholder datasources are listed for cleanup (hero replacement + news add).
  expect(result.cleanupDatasources).toHaveLength(2);
});

test('a completed run repeats no add, remove or reorder on rerun', async () => {
  const b = setup();
  const { run } = await build(b);
  await run();
  const after = { ...b.calls };
  const rerun = await run(false);
  expect(rerun.status).toBe('complete');
  expect(b.calls).toEqual(after);
});

test('without replace approval the instance is reused and its variant stays a manual task', async () => {
  const b = setup();
  delete b.input.sections[0].replace;
  const { run } = await build(b);
  const result = await run();
  expect(result.status).toBe('complete');
  expect(b.remote.components[0].id).toBe('starter-hero');
  expect(result.manualTasks.some((x) => x.key === 'hero' && x.action.includes('ClientHero'))).toBe(
    true,
  );
});

test('a missing variant keeps the reused instance instead of replacing it', async () => {
  const b = setup({ variants: ['Default', 'ClientNews'] });
  const { run } = await build(b);
  const result = await run();
  expect(result.status).toBe('complete');
  expect(b.remote.components[0].id).toBe('starter-hero');
  expect(b.calls.remove).toBe(1); // only the approved starter strip
});

test('starter removal waits until the page assembled cleanly', async () => {
  const b = setup();
  const { run } = await build(b);
  b.remote.api.addComponent = async () => {
    throw new Error('unknown');
  };
  const result = await run();
  expect(result.status).toBe('partial');
  expect(b.remote.components.some((x) => x.id === 'starter-search')).toBe(true);
  expect(b.calls.remove).toBe(0);
});

test('an unconfirmed starter removal stays partial and is never repeated', async () => {
  const b = setup();
  const { run } = await build(b);
  const remove = b.remote.api.removeComponent;
  b.remote.api.removeComponent = async (pageId, id) => {
    if (id === 'starter-search') {
      b.calls.remove++;
      throw new Error('unknown outcome');
    }
    return remove(pageId, id);
  };
  expect((await run()).status).toBe('partial');
  expect((await run(false)).status).toBe('partial');
  expect(b.remote.components.some((x) => x.id === 'starter-search')).toBe(true);
  expect(b.calls.remove).toBe(2); // hero replacement once + starter strip once
});

test('an instance to remove must keep its approved rendering, and cannot overlap a planned section', async () => {
  const b = setup();
  b.remote.components[1].renderingId = 'something-else';
  const { run } = await build(b);
  const result = await run();
  expect(result.status).toBe('partial');
  expect(b.remote.components.some((x) => x.id === 'starter-search')).toBe(true);

  const overlap = setup();
  overlap.input.removeInstances = [{ instanceId: 'starter-hero', renderingId: 'cards-rendering' }];
  const other = temporary();
  try {
    await expect(
      populate({
        directory: other,
        plan: overlap.input,
        api: overlap.remote.api,
        initialize: true,
      }),
    ).rejects.toMatchObject({ code: 'BLOCKED' });
  } finally {
    fs.rmSync(other, { recursive: true, force: true });
  }
});
