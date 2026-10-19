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

const workflowDirectory = path.resolve(__dirname, '../../../../../.github/workflows');
function loadWorkflow(name) {
  const source = fs.readFileSync(path.join(workflowDirectory, name), 'utf8');
  return { source, workflow: yaml.load(source) };
}

// Both gates share the same offline, credential-free contract for basic-nextjs.
function expectOfflineBasicNextjsJob(source, job, checkName) {
  expect(job.name).toBe(checkName); // preserve the existing check name
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
    /secrets\.|SITECORE_EDGE_CONTEXT_ID|SITECORE_EDITING_SECRET|kit-nextjs-|npm run build|npm run start|test:geo|agents:eval|pull_request_target/.test(
      source,
    ),
  ).toBe(false);
  const setup = job.steps.find((step) => step.uses?.startsWith('actions/setup-node@'));
  expect(setup.with['cache-dependency-path']).toBe('examples/basic-nextjs/package-lock.json');
  expect(job.steps.filter((step) => step['continue-on-error'] === true)).toEqual([]);
  expect(job.steps[job.steps.length - 1].if).toBe('always()');
  expect(job.steps[job.steps.length - 1].run).toContain('No live integration build');
}

test('the DMZ gate validates only basic-nextjs, without live credentials or server/build steps', () => {
  const { source, workflow } = loadWorkflow('dmz-validation.yml');
  expect(Object.keys(workflow.jobs)).toEqual(['validate-dmz']);
  expect(workflow.on.push.branches).toEqual(['dmz']);
  expect(Object.hasOwn(workflow.on, 'workflow_dispatch')).toBe(true);
  expect(workflow.permissions).toEqual({ contents: 'read' });
  expectOfflineBasicNextjsJob(source, workflow.jobs['validate-dmz'], 'Validate DMZ Branch');
});

test('the PR gate runs the same offline checks and keeps the latest-main base check, read-only', () => {
  const { source, workflow } = loadWorkflow('pr-validation.yml');
  expect(Object.keys(workflow.jobs)).toEqual(['pr-validation']);
  expect(workflow.on).toEqual({ pull_request: { branches: ['dmz'] } });
  expect(workflow.permissions).toEqual({ contents: 'read' });
  const job = workflow.jobs['pr-validation'];
  expect(job.permissions).toBeUndefined(); // no PR-comment or issue write access
  expectOfflineBasicNextjsJob(source, job, 'Validate Pull Request');
  const checkout = job.steps.find((step) => step.uses?.startsWith('actions/checkout@'));
  expect(checkout.with['fetch-depth']).toBe(0);
  expect(checkout.with['persist-credentials']).toBe(false);
  const base = job.steps.find((step) => step.name === 'Check PR branch is based on latest main');
  expect(base.env.PR_HEAD_SHA).toBe('${{ github.event.pull_request.head.sha }}');
  expect(base.run).toContain('git merge-base "$PR_HEAD_SHA" origin/main');
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
