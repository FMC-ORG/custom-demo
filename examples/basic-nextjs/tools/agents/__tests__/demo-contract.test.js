'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  uploadImages,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/uploads.cjs');
const {
  Recovery,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/recovery.cjs');
const {
  populate,
  intentOf,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const { temporary, sitecore, plan } = require('./demo-fixture');
let directory;
beforeEach(() => {
  directory = temporary();
});
afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

test('older pipeline journals are rejected before any item reads or mutations, even with initialize', async () => {
  const input = plan();
  new Recovery({
    file: path.join(directory, 'recovery-content.json'),
    intent: intentOf(input),
    environment: input.environment,
    initialize: true,
  });
  const api = { resolvePath: jest.fn(), createItem: jest.fn() };
  await expect(populate({ directory, plan: input, api, initialize: true })).rejects.toThrow(
    'fresh build',
  );
  expect(api.resolvePath).not.toHaveBeenCalled();
  expect(api.createItem).not.toHaveBeenCalled();
});

test('repurposing another client requires recorded approval before population', async () => {
  const input = plan();
  input.targetReview = { classification: 'existing-client', repurposeApproved: false };
  const remote = sitecore();
  await expect(
    populate({ directory, plan: input, api: remote.api, initialize: true }),
  ).rejects.toThrow('repurpose');
  expect(remote.items.size).toBe(1);
});

test('upload journals from an older contract cannot authorize authentication or remote writes', async () => {
  fs.writeFileSync(path.join(directory, 'image.png'), 'fixture');
  const manifest = [{ status: 'downloaded', localFile: 'image.png' }];
  fs.writeFileSync(path.join(directory, 'image-manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(
    path.join(directory, 'recovery-uploads.json'),
    JSON.stringify({ version: 1, contract: 'older-contract' }),
  );
  const api = { createAsset: jest.fn() };
  await expect(
    uploadImages({ directory, manifest, environment: {}, api, initialize: true }),
  ).rejects.toThrow('fresh build');
  expect(api.createAsset).not.toHaveBeenCalled();
  const cli = path.resolve(
    __dirname,
    '../../../.agents/skills/sitecore-build-demo/scripts/upload-to-content-hub.mjs',
  );
  const run = spawnSync(
    process.execPath,
    [
      cli,
      '--images-dir',
      directory,
      '--project-root',
      directory,
      '--host',
      'https://hub.example',
      '--initialize',
    ],
    { encoding: 'utf8' },
  );
  expect(run.status).toBe(2);
  expect(run.stderr).toContain('incompatible pipeline contract');
});

test('fresh upload initialization cannot adopt resource markers from another build without its journal', async () => {
  fs.writeFileSync(path.join(directory, 'image.png'), 'fixture');
  const manifest = [
    {
      status: 'downloaded',
      localFile: 'image.png',
      assetId: 'other-build-asset',
      publicLinkId: 'other-build-link',
    },
  ];
  const api = { readAsset: jest.fn(), createAsset: jest.fn() };
  await expect(
    uploadImages({ directory, manifest, environment: {}, api, initialize: true }),
  ).rejects.toThrow('fresh build');
  expect(api.readAsset).not.toHaveBeenCalled();
  expect(api.createAsset).not.toHaveBeenCalled();
});

test('the CLI refuses an old content journal before allowing a prepared mutation claim', () => {
  const input = plan();
  fs.writeFileSync(path.join(directory, 'execution-plan.json'), JSON.stringify(input));
  new Recovery({
    file: path.join(directory, 'recovery-content.json'),
    intent: intentOf(input),
    environment: input.environment,
    initialize: true,
  });
  fs.writeFileSync(path.join(directory, 'mcp-populate.json'), '{}');
  const cli = path.resolve(
    __dirname,
    '../../../.agents/skills/sitecore-build-demo/scripts/demo-recovery.cjs',
  );
  const run = spawnSync(
    process.execPath,
    [
      cli,
      '--plan',
      path.join(directory, 'execution-plan.json'),
      '--directory',
      directory,
      '--phase',
      'populate',
      '--claim',
      'pending-write',
    ],
    { encoding: 'utf8' },
  );
  expect(run.status).toBe(2);
  expect(run.stderr).toContain('incompatible pipeline contract');
});
