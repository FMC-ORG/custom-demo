'use strict';
const fs = require('node:fs');
const path = require('node:path');
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
function setup() {
  const input = plan();
  input.sections[0].children = [];
  input.sections[0].key = 'header';
  input.sections[0].placement = 'partial-design';
  input.sections[0].sharedDesign = {
    approved: true,
    pageId: 'header-design',
    existingInstanceId: 'header-instance',
    currentDatasource: 'starter-ds',
  };
  input.sections.push({
    ...clone(input.sections[0]),
    key: 'footer',
    name: 'Client Footer',
    sharedDesign: {
      approved: true,
      pageId: 'footer-design',
      existingInstanceId: 'footer-instance',
      currentDatasource: 'starter-footer',
    },
  });
  const remote = sitecore();
  const pages = {
    'header-design': [
      {
        id: 'header-instance',
        renderingId: 'cards-rendering',
        placeholder: 'headless-header',
        datasourceId: 'starter-ds',
        parameters: { FieldNames: 'HeaderVariant' },
      },
    ],
    'footer-design': [
      {
        id: 'footer-instance',
        renderingId: 'cards-rendering',
        placeholder: 'headless-footer',
        datasourceId: 'starter-footer',
        parameters: { FieldNames: 'FooterVariant' },
      },
    ],
  };
  let writes = 0;
  remote.api.readPage = async (id) => clone(pages[id] || []);
  remote.api.setDatasource = async (pageId, id, datasourceId) => {
    writes++;
    pages[pageId].find((x) => x.id === id).datasourceId = datasourceId;
    return {};
  };
  return { input, remote, pages, writes: () => writes };
}

test('complete-build approval wires both shared designs, records previous datasources and reruns without writes', async () => {
  const build = setup();
  const population = await populate({
    directory,
    plan: build.input,
    api: build.remote.api,
    initialize: true,
  });
  const first = await assemble({
    directory,
    plan: build.input,
    population,
    api: build.remote.api,
    initialize: true,
  });
  expect(first.status).toBe('complete');
  expect(first.instances).toHaveLength(2);
  expect(first.instances[0]).toMatchObject({
    pageId: 'header-design',
    previousDatasourceId: 'starter-ds',
    parameters: { FieldNames: 'HeaderVariant' },
  });
  expect(first.instances[1]).toMatchObject({
    pageId: 'footer-design',
    previousDatasourceId: 'starter-footer',
  });
  expect(build.pages['header-design'][0].datasourceId).toBe(population.datasourceItems[0].itemId);
  expect(
    (await assemble({ directory, plan: build.input, population, api: build.remote.api })).status,
  ).toBe('complete');
  expect(build.writes()).toBe(2);
});

test.each(['missing', 'wrong-rendering', 'unapproved', 'changed-datasource'])(
  'shared target %s blocks wiring without structural repair',
  async (scenario) => {
    const build = setup();
    if (scenario === 'unapproved') build.input.sections[0].sharedDesign.approved = false;
    const population = await populate({
      directory,
      plan: build.input,
      api: build.remote.api,
      initialize: true,
    });
    if (scenario === 'missing') build.pages['header-design'] = [];
    if (scenario === 'wrong-rendering') build.pages['header-design'][0].renderingId = 'other';
    if (scenario === 'changed-datasource')
      build.pages['header-design'][0].datasourceId = 'human-edit';
    const result = await assemble({
      directory,
      plan: build.input,
      population,
      api: build.remote.api,
      initialize: true,
    });
    expect(result.status).toBe('partial');
    expect(result.issues.some((x) => x.key === 'header')).toBe(true);
    expect(build.pages['header-design']?.[0]?.datasourceId).not.toBe(
      population.datasourceItems[0].itemId,
    );
    expect(build.writes()).toBeLessThanOrEqual(1); // safe independent footer may continue
  },
);

test('a lost shared wiring response is reconciled without another write', async () => {
  const build = setup();
  const wire = build.remote.api.setDatasource;
  build.remote.api.setDatasource = async (...args) => {
    await wire(...args);
    throw new Error('lost response');
  };
  const population = await populate({
    directory,
    plan: build.input,
    api: build.remote.api,
    initialize: true,
  });
  expect(
    (
      await assemble({
        directory,
        plan: build.input,
        population,
        api: build.remote.api,
        initialize: true,
      })
    ).status,
  ).toBe('complete');
  expect(
    (await assemble({ directory, plan: build.input, population, api: build.remote.api })).status,
  ).toBe('complete');
  expect(build.writes()).toBe(2);
});
