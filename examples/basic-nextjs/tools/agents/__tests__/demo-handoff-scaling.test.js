'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {
  FileBridge,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/file-bridge.cjs');
const {
  marketer,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/marketer.cjs');
const {
  populate,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const {
  assemble,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/assemble.cjs');
const { temporary, sitecore, plan, clone } = require('./demo-fixture');

const directories = [];
afterEach(() => {
  while (directories.length) fs.rmSync(directories.pop(), { recursive: true, force: true });
});
function fixture(sectionCount, childCount = 2) {
  const directory = temporary();
  directories.push(directory);
  const input = plan();
  const section = input.sections[0];
  input.sections = Array.from({ length: sectionCount }, (_, index) => ({
    ...clone(section),
    key: `section-${index}`,
    name: `Client Section ${index}`,
    children: clone(section.children.slice(0, childCount)),
  }));
  const remote = sitecore();
  const tools = {
    get_content_item_by_path: (args) => remote.api.resolvePath(args.itemPath),
    get_content_item_by_id: (args) => remote.api.readItem(args.itemId),
    create_content_item: (args) => remote.api.createItem(args),
    update_fields_on_item: (args) =>
      remote.api.updateFields(
        args.itemId,
        Object.fromEntries(args.fields.map((field) => [field.name, field.value])),
      ),
    get_components_on_page: (args) => remote.api.readPage(args.pageId),
    add_component_on_page: (args) => remote.api.addComponent(args),
    set_component_datasource: (args) =>
      remote.api.setDatasource(args.pageId, args.componentId, args.datasourceId),
  };
  return { directory, input, remote, tools };
}

// Like the CLI, every step starts a fresh bridge and execution instance from real
// files. Only the remote service boundary is simulated; no recovery logic is mocked.
async function execute(
  build,
  { phase = 'populate', initialize = false, begin = false, onRequest, budget = 5000 } = {},
) {
  const requests = [];
  const file = path.join(build.directory, `mcp-${phase}.json`);
  for (let step = 0; step <= budget; step++) {
    const bridge = new FileBridge({
      file,
      identity: 'fixture',
      initialize: initialize && step === 0,
    });
    if (begin && step === 0) bridge.begin();
    const options = {
      directory: build.directory,
      plan: build.input,
      api: marketer(bridge.call.bind(bridge)),
      observationSession: bridge.state.session,
      initialize: initialize && step === 0,
    };
    let request;
    try {
      const result =
        phase === 'populate'
          ? await populate(options)
          : await assemble({ ...options, population: build.population });
      bridge.finish();
      return {
        result,
        requests,
        reads: requests.filter((x) => !x.mutation).length,
        writes: requests.filter((x) => x.mutation).length,
      };
    } catch (error) {
      if (error.code !== 'AWAITING_TOOL') throw error;
      request = bridge.claim(error.request.id);
    }
    requests.push(request);
    if (onRequest && (await onRequest(request, requests)) === 'pause') return { requests };
    const response = await build.tools[request.tool](request.args);
    bridge.reply(request.id, { content: [{ type: 'text', text: JSON.stringify(response) }] });
  }
  throw new Error(`Handoff budget exceeded (${budget}); repeated reads prevented completion`);
}

test('population handoffs scale with authored items rather than replaying earlier sections after each write', async () => {
  const small = fixture(2);
  const large = fixture(6);
  const a = await execute(small, { initialize: true });
  const b = await execute(large, { initialize: true });
  expect(a.result.status).toBe('complete');
  expect(b.result.status).toBe('complete');
  expect(b.writes).toBe(36); // 18 items, one create and one field write each
  expect(b.reads).toBeLessThanOrEqual(a.reads * 3 + 12);
  const full = await execute(fixture(12), { initialize: true });
  expect(full.result.status).toBe('complete');
  expect(full.writes).toBe(72);
  // Allow extra safety reads, but reject the original 1,429-read regression.
  expect(full.reads).toBeLessThanOrEqual(180);
}, 30000);

test('a completed population rerun rechecks fields and performs no additional writes', async () => {
  const build = fixture(2);
  const first = await execute(build, { initialize: true });
  const repeated = await execute(build);
  expect(repeated.result.status).toBe('complete');
  expect(repeated.result.datasourceItems).toEqual(first.result.datasourceItems);
  expect(repeated.writes).toBe(0);
  expect(repeated.reads).toBeGreaterThan(0);
  const id = first.result.datasourceItems[0].itemId;
  await build.remote.api.updateFields(id, { Title: 'Human edit' });
  const changed = await execute(build);
  expect(changed.result.status).toBe('partial');
  expect(changed.writes).toBe(0);
  expect((await build.remote.api.readItem(id)).fields.Title).toBe('Human edit');
});

test('begin invalidates earlier order observations when an interrupted execution resumes', async () => {
  const build = fixture(2);
  await execute(build, {
    initialize: true,
    onRequest: async (request) => {
      if (request.mutation && request.args.name === 'Client Section 1') {
        await build.tools[request.tool](request.args); // write succeeded but the response was lost
        return 'pause';
      }
    },
  });
  const created = await build.remote.api.resolvePath(
    `${build.input.sections[0].folderPath}/${build.input.sections[0].name}`,
  );
  await build.remote.api.updateFields(created.children[0].id, { __Sortorder: '900' });
  const resumed = await execute(build, { begin: true });
  expect(resumed.result.status).toBe('partial');
  expect(resumed.result.issues.some((issue) => issue.reason.includes('order/count'))).toBe(true);
  expect(
    resumed.requests.filter(
      (request) =>
        request.tool === 'create_content_item' && request.args.name === 'Client Section 1',
    ),
  ).toHaveLength(0);
  expect((await build.remote.api.readItem(created.id)).children[0].fields.Title).toBe(
    'Engineering',
  );
});

test('assembly handoffs do not reread every earlier datasource after each rendering write', async () => {
  const small = fixture(2);
  const large = fixture(6);
  small.population = (await execute(small, { initialize: true })).result;
  large.population = (await execute(large, { initialize: true })).result;
  const a = await execute(small, { phase: 'assemble', initialize: true });
  const b = await execute(large, { phase: 'assemble', initialize: true });
  expect(a.result.status).toBe('complete');
  expect(b.result.status).toBe('complete');
  expect(b.writes).toBe(12); // one add and one datasource assignment per section
  expect(b.reads).toBeLessThanOrEqual(a.reads * 3 + 12);
}, 30000);

test('a new assembly session rereads datasources before accepting completed placements', async () => {
  const build = fixture(2);
  build.population = (await execute(build, { initialize: true })).result;
  const first = await execute(build, { phase: 'assemble', initialize: true });
  const repeated = await execute(build, { phase: 'assemble' });
  expect(first.result.status).toBe('complete');
  expect(repeated.result.status).toBe('complete');
  expect(repeated.writes).toBe(0);
  const id = build.population.datasourceItems[0].children[0].itemId;
  await build.remote.api.updateFields(id, { Title: 'Changed child' });
  const changed = await execute(build, { phase: 'assemble' });
  expect(changed.result.status).toBe('partial');
  expect(changed.result.issues[0].reason).toContain('datasource fields changed');
  expect(changed.writes).toBe(0);
});

test('failed read-back checks are not reused as successes later in the same session', async () => {
  const build = fixture(2, 0);
  build.remote.defaults.cards = { Unmapped: 'Client Section 0' };
  // The first section has an unintended item-name default. Its failure must be
  // checked again as the second section progresses, not memoized as verified.
  const run = await execute(build, { initialize: true });
  expect(run.result.status).toBe('partial');
  expect(run.result.datasourceItems.map((x) => x.key)).toEqual(['section-1']);
  expect(run.result.issues[0].reason).toContain('unspecified display field');
});
