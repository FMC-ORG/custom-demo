'use strict';
// Heineken build (2026-10-20): set_component_datasource answered 422 "Datasource template
// mismatch" for a datasource on a template derived from the rendering's Datasource Template.
// The helper recorded it as an unknown outcome, the reason was pruned, the Footer replacement
// was left half-done and the build looped on reconciliation. These tests pin the fixes.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { temporary, plan, sitecore, clone } = require('./demo-fixture');
const { Recovery, ConfirmedFailure } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/recovery.cjs');
const { marketer, readJson, classifyError, sanitize } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/marketer.cjs');
const { populate } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const { assemble } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/assemble.cjs');

const LIVE_422 = {
  isError: true,
  content: [{
    type: 'text',
    text: "ERROR: Agent API request failed: Datasource template mismatch: the provided item uses template '43ddc70d-fbad-472a-abfb-87e1100d57ca' but component '4e7e77ef-529c-4c28-a5d8-94c5aca065ff' expects '98b34bff-0d74-4798-b2d8-cb52c19f7c92'. Ensure the datasource item was created from the correct template. (422)",
  }],
};

const dirs = [];
afterEach(() => { while (dirs.length) fs.rmSync(dirs.pop(), { recursive: true, force: true }); });
function workspace() { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-reject-')); dirs.push(dir); return dir; }

describe('MCP error classification', () => {
  test('a live 422 validation error becomes a permanent, explained rejection', () => {
    const reply = classifyError(LIVE_422);
    expect(reply).toMatchObject({ isError: true, status: 422, rejected: true });
    expect(reply.detail).toContain('Datasource template mismatch');
    let thrown;
    try { readJson(reply); } catch (error) { thrown = error; }
    expect(thrown).toMatchObject({ code: 'REJECTED', permanent: true });
    expect(thrown.detail).toContain('43ddc70d-fbad-472a-abfb-87e1100d57ca');
  });

  test.each([
    ['server error', 'Agent API request failed: upstream (500)'],
    ['throttling', 'Too many requests (429)'],
    ['delayed visibility', 'Item not found (404)'],
    ['transport', 'fetch failed'],
  ])('%s stays outcome-unknown, with its reason kept', (_label, text) => {
    const reply = classifyError({ isError: true, content: [{ type: 'text', text }] });
    expect(reply.rejected).toBeUndefined();
    let thrown;
    try { readJson(reply); } catch (error) { thrown = error; }
    expect(thrown.code).toBeUndefined();
    expect(thrown.detail).toBe(text);
  });

  test('stored reasons never keep credentials', () => {
    const text = sanitize('failed: Authorization: Bearer abc.def.ghi token=s3cr3t eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig ' + 'x'.repeat(60));
    expect(text).not.toMatch(/abc\.def|s3cr3t|eyJhbGci|x{40}/);
  });
});

test('a permanent rejection is recorded with its reason and never re-sent', async () => {
  const file = path.join(workspace(), 'recovery.json');
  const open = (initialize = false) => new Recovery({ file, initialize, intent: { client: 'X' }, environment: { site: 'test' } });
  let writes = 0;
  const operation = {
    before: async () => ({ datasourceId: 'placeholder' }),
    write: async () => { writes++; throw new ConfirmedFailure('HTTP_422', { permanent: true, detail: 'Datasource template mismatch (422)' }); },
    verify: async () => ({ state: 'unknown' }),
  };
  await expect(open(true).operation('footer:wire', operation)).rejects.toMatchObject({ code: 'REJECTED' });
  const entry = JSON.parse(fs.readFileSync(file, 'utf8')).operations['footer:wire'];
  expect(entry).toMatchObject({ status: 'failed', permanent: true, detail: 'Datasource template mismatch (422)' });
  for (let run = 0; run < 3; run++)
    await expect(open().operation('footer:wire', operation)).rejects.toMatchObject({
      code: 'BLOCKED',
      message: expect.stringContaining('Datasource template mismatch'),
    });
  expect(writes).toBe(1);
});

test('the rejection reason survives the CLI reply step and lands in the journal', async () => {
  const file = path.join(workspace(), 'recovery.json');
  const recovery = new Recovery({ file, initialize: true, intent: { client: 'X' }, environment: { site: 'test' } });
  const api = marketer(async () => classifyError(LIVE_422)); // what `--reply` now stores
  await expect(recovery.operation('footer:wire', {
    before: async () => ({}),
    write: () => api.setDatasource('page', 'instance', 'client-ds'),
    verify: async () => ({ state: 'unknown' }),
  })).rejects.toMatchObject({ code: 'REJECTED' });
  const entry = JSON.parse(fs.readFileSync(file, 'utf8')).operations['footer:wire'];
  expect(entry.status).toBe('failed');
  expect(entry.detail).toContain('expects \'98b34bff');
});

describe('datasource template preflight', () => {
  let directory;
  beforeEach(() => { directory = temporary(); });
  afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

  function setup(datasourceTemplate) {
    const input = plan();
    input.sections[0].children = [];
    input.sections[0].key = 'footer';
    input.sections[0].placement = 'partial-design';
    input.sections[0].variant = 'ClientFooter';
    input.sections[0].sharedDesign = {
      approved: true, replace: true, pageId: 'footer-design',
      existingInstanceId: 'footer-instance', currentDatasource: 'starter-footer',
    };
    const remote = sitecore();
    remote.items.set('cards-rendering', {
      id: 'cards-rendering', name: 'Cards', templateId: 'rendering',
      path: '/sitecore/layout/Renderings/Cards', fields: { 'Datasource Template': datasourceTemplate },
    });
    remote.items.set('base-template', { id: 'base-template', name: 'CardsData', templateId: 'template', path: '/sitecore/templates/CardsData', fields: {} });
    const page = [{ id: 'footer-instance', renderingId: 'cards-rendering', placeholder: 'headless-footer', datasourceId: 'starter-footer', parameters: { FieldNames: 'variant-Default' } }];
    const writes = [];
    remote.api.readPage = async () => clone(page);
    for (const name of ['addComponent', 'setDatasource', 'removeComponent'])
      remote.api[name] = async () => { writes.push(name); return {}; };
    const update = remote.api.updateFields;
    remote.api.updateFields = async (id, fields) => {
      if (Object.hasOwn(fields, '__Sortorder')) writes.push('sortorder');
      return update(id, fields);
    };
    return { input, remote, writes };
  }

  test.each([
    ['a template path', '/sitecore/templates/CardsData'],
    ['a template ID', '{AABBCCDD-1122-3344-5566-778899AABBCC}'],
  ])('a different (e.g. base) datasource template named by %s blocks the section before any write', async (_label, datasourceTemplate) => {
    const build = setup(datasourceTemplate);
    // The plan's datasource uses template "cards", which may inherit from but is not the required one.
    const population = await populate({ directory, plan: build.input, api: build.remote.api, initialize: true });
    const result = await assemble({ directory, plan: build.input, population, api: build.remote.api, initialize: true });
    expect(result.status).toBe('partial');
    expect(result.issues[0].reason).toMatch(/not the rendering's Datasource Template.*422/);
    expect(build.writes).toEqual([]);
  });

  test('an exact template match passes the preflight', async () => {
    const build = setup('');
    const population = await populate({ directory, plan: build.input, api: build.remote.api, initialize: true });
    build.remote.items.get('cards-rendering').fields['Datasource Template'] = '/sitecore/templates/Cards';
    build.remote.items.set('cards', { id: 'cards', name: 'Cards', templateId: 'template', path: '/sitecore/templates/Cards', fields: {} });
    const result = await assemble({ directory, plan: build.input, population, api: build.remote.api, initialize: true });
    expect(result.issues.map((x) => x.reason).join(' ')).not.toMatch(/Datasource Template/);
    expect(build.writes.length).toBeGreaterThan(0);
  });
});

// Heineken Footer, option (c): the wire had an unknown outcome (the 422 predates the fix), the user
// binds the client datasource manually in Content Editor, and a resume must finish by reading,
// without re-sending the wire, despite the derived-template preflight.
describe('resume after an approved manual binding', () => {
  let directory;
  beforeEach(() => { directory = temporary(); });
  afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));
  const FOLDER = '/sitecore/content/test/test/Presentation/Headless Variants/Cards';

  async function halfDoneFooter() {
    const input = plan();
    input.sections[0].children = [];
    input.sections[0].key = 'footer';
    input.sections[0].placement = 'partial-design';
    input.sections[0].variant = 'ClientFooter';
    input.sections[0].sharedDesign = {
      approved: true, replace: true, pageId: 'footer-design',
      existingInstanceId: 'footer-instance', currentDatasource: 'starter-footer',
    };
    const remote = sitecore();
    remote.items.set('cards-rendering', { id: 'cards-rendering', name: 'Cards', templateId: 'rendering', path: '/r', fields: {} });
    remote.items.set('variants', { id: 'variants', name: 'Cards', path: FOLDER, templateId: 'variants', fields: {} });
    for (const name of ['Default', 'ClientFooter'])
      remote.items.set(`variant-${name}`, { id: `variant-${name}`, name, parentId: 'variants', path: `${FOLDER}/${name}`, templateId: 'variant-definition', fields: {} });
    const page = [{ id: 'footer-instance', renderingId: 'cards-rendering', placeholder: 'headless-footer', datasourceId: 'starter-footer', parameters: { FieldNames: 'variant-Default' } }];
    const calls = { wire: 0, remove: 0, add: 0 };
    remote.api.readPage = async () => clone(page);
    remote.api.addComponent = async (data) => {
      calls.add++;
      const first = (await remote.api.readItem('variants')).children[0].id;
      page.splice(1, 0, { id: 'footer-new', renderingId: data.componentRenderingId, placeholder: data.placeholderPath, datasourceId: 'auto-ds', parameters: { FieldNames: first } });
      return {};
    };
    remote.api.setDatasource = async () => { calls.wire++; throw new Error('Marketer MCP reported an error; outcome unverified'); };
    remote.api.removeComponent = async (_page, id) => { calls.remove++; page.splice(page.findIndex((x) => x.id === id), 1); return {}; };
    const population = await populate({ directory, plan: input, api: remote.api, initialize: true });
    const first = await assemble({ directory, plan: input, population, api: remote.api, initialize: true });
    expect(first.status).toBe('partial');
    const journal = JSON.parse(fs.readFileSync(path.join(directory, 'recovery-assembly.json'), 'utf8'));
    expect(journal.operations['footer:shared-new-wire'].status).toBe('needs-reconciliation');
    // Since then the rendering's Datasource Template is known to differ from the datasource's.
    remote.items.get('cards-rendering').fields['Datasource Template'] = '{AABBCCDD-1122-3344-5566-778899AABBCC}';
    return { input, remote, page, calls, population };
  }

  test('a manual binding is verified by read, the old Footer removed, and the wire never re-sent', async () => {
    const build = await halfDoneFooter();
    const client = build.population.datasourceItems[0].itemId;
    build.page.find((x) => x.id === 'footer-new').datasourceId = `{${client.toUpperCase()}}`; // Content Editor format
    const result = await assemble({ directory, plan: build.input, population: build.population, api: build.remote.api, observationSession: 'resume' });
    expect(result.status).toBe('complete');
    expect(build.page.map((x) => x.id)).toEqual(['footer-new']);
    expect(build.calls).toEqual({ add: 1, wire: 1, remove: 1 });
  });

  test('without the manual binding the resume stays partial, keeps the old Footer and sends nothing', async () => {
    const build = await halfDoneFooter();
    const result = await assemble({ directory, plan: build.input, population: build.population, api: build.remote.api, observationSession: 'resume' });
    expect(result.status).toBe('partial');
    expect(build.page.map((x) => x.id)).toEqual(['footer-instance', 'footer-new']);
    expect(build.calls).toEqual({ add: 1, wire: 1, remove: 0 });
  });
});
