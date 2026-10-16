'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const yaml = require('js-yaml');
const { makeApp, read } = require('./fixture');
const directories = [];
afterEach(() => {
  while (directories.length) fs.rmSync(directories.pop(), { recursive: true, force: true });
});

function app(files = {}) {
  const root = makeApp(files);
  directories.push(root);
  return root;
}

test('the DMZ gate validates only basic-nextjs, without live credentials or server/build steps', () => {
  const workflowFile = path.resolve(
    __dirname,
    '../../../../../.github/workflows/dmz-validation.yml',
  );
  const source = fs.readFileSync(workflowFile, 'utf8');
  const workflow = yaml.load(source);
  expect(Object.keys(workflow.jobs)).toEqual(['validate-dmz']);
  expect(workflow.on.push.branches).toEqual(['dmz']);
  expect(Object.hasOwn(workflow.on, 'workflow_dispatch')).toBe(true);
  expect(workflow.permissions).toEqual({ contents: 'read' });
  const job = workflow.jobs['validate-dmz'];
  expect(job.name).toBe('Validate DMZ Branch'); // preserve the existing check name
  expect(job['timeout-minutes']).toBeGreaterThan(0);
  expect(job.defaults.run['working-directory']).toBe('examples/basic-nextjs');
  const commands = job.steps
    .map((step) => step.run)
    .filter(Boolean)
    .join('\n');
  for (const command of [
    'npm ci',
    'node tools/ci/prepare-typecheck.cjs',
    'npm run agents:check',
    'npm run agents:validate',
    'npm test -- --runInBand',
    'npm run type-check',
  ]) {
    expect(commands.includes(command)).toBe(true);
  }
  expect(
    /secrets\.|SITECORE_EDGE_CONTEXT_ID|SITECORE_EDITING_SECRET|kit-nextjs-|npm run build|npm run start|test:geo|agents:eval/.test(
      source,
    ),
  ).toBe(false);
  const setup = job.steps.find((step) => step.uses?.startsWith('actions/setup-node@'));
  expect(setup.with['cache-dependency-path']).toBe('examples/basic-nextjs/package-lock.json');
  expect(job.steps.filter((step) => step['continue-on-error'] === true)).toEqual([]);
  expect(job.steps[job.steps.length - 1].if).toBe('always()');
  expect(job.steps[job.steps.length - 1].run).toContain('No live integration build');
});

test('offline fixtures are generated for missing files only and do not change component registrations or environment config', () => {
  const { prepareTypecheck } = require('../../ci/prepare-typecheck.cjs');
  const root = app({
    '.sitecore/component-map.ts': 'keep registered components',
    'next-env.d.ts': 'keep generated declarations',
  });
  const result = prepareTypecheck(root);
  expect(result.created).toEqual(['.sitecore/sites.json', '.sitecore/metadata.json']);
  expect(JSON.parse(read(root, '.sitecore/sites.json'))).toEqual([
    { name: 'ci-offline', hostName: '*', language: 'en' },
  ]);
  expect(read(root, '.sitecore/component-map.ts')).toBe('keep registered components');
  expect(read(root, 'next-env.d.ts')).toBe('keep generated declarations');
  expect(prepareTypecheck(root).created).toEqual([]);
});

test('existing Sitecore fixtures are preserved byte-for-byte without reading their values', () => {
  const { prepareTypecheck } = require('../../ci/prepare-typecheck.cjs');
  const root = app({
    '.sitecore/sites.json': 'existing site config',
    '.sitecore/metadata.json': 'existing metadata',
  });
  const result = prepareTypecheck(root);
  expect(result.created).toEqual([]);
  expect(read(root, '.sitecore/sites.json')).toBe('existing site config');
  expect(read(root, '.sitecore/metadata.json')).toBe('existing metadata');
});

test('the preparation CLI runs without credentials and writes only labelled offline fixtures', () => {
  const root = app();
  const cli = path.resolve(__dirname, '../../ci/prepare-typecheck.cjs');
  const run = spawnSync(process.execPath, [cli], { cwd: root, encoding: 'utf8' });
  expect(run.status).toBe(0);
  expect(run.stdout).toContain('Offline type-check fixtures');
  expect(fs.readdirSync(path.join(root, '.sitecore')).sort()).toEqual([
    'metadata.json',
    'sites.json',
  ]);
});
