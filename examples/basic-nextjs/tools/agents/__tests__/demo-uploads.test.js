'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { uploadImages } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/uploads.cjs');
const { temporary } = require('./demo-fixture');
const { ConfirmedFailure } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/recovery.cjs');
let dir;
beforeEach(() => { dir = temporary(); fs.writeFileSync(path.join(dir, 'hero.png'), 'image fixture'); });
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));
function remote() {
  const assets = []; const links = []; let failApproval = true;
  return { assets, links, api: {
    createAsset: async () => { assets.push({ id: 'a1', identifier: 'asset1', approved: false }); return { id: 'a1', identifier: 'asset1' }; },
    readAsset: async id => assets.find(x => x.id === id),
    approve: async id => { if (failApproval) { failApproval = false; throw new ConfirmedFailure(); } assets.find(x => x.id === id).approved = true; return {}; },
    createLink: async id => { links.push({ id: 'l1', assetId: id, url: 'https://public.example/hero' }); return { id: 'l1' }; },
    readLink: async id => links.find(x => x.id === id),
    verifyPublic: async () => true,
  } };
}

test('approval resumes against the existing asset; repeated runs create neither assets nor public links', async () => {
  const service = remote();
  const manifest = [{ status: 'downloaded', localFile: 'hero.png', src: 'https://source.example/hero', alt: 'A & B' }];
  const options = { directory: dir, manifest, environment: { host: 'https://hub.example' }, api: service.api };
  expect((await uploadImages({ ...options, initialize: true })).status).toBe('partial');
  const second = await uploadImages(options);
  expect(second.status).toBe('complete');
  expect((await uploadImages(options)).status).toBe('complete');
  expect(service.assets).toHaveLength(1);
  expect(service.links).toHaveLength(1);
  expect(manifest[0].imageFieldXml).toContain('alt="A &amp; B"');
});

test('an asset created without a received ID blocks recovery rather than uploading again', async () => {
  const service = remote(); const create = service.api.createAsset;
  service.api.createAsset = async image => { await create(image); throw new Error('timeout after creation'); };
  const options = { directory: dir, manifest: [{ status: 'downloaded', localFile: 'hero.png' }], environment: { host: 'https://hub.example' }, api: service.api };
  expect((await uploadImages({ ...options, initialize: true })).status).toBe('partial');
  expect((await uploadImages(options)).status).toBe('partial');
  expect(service.assets).toHaveLength(1);
});

test('a lost public-link response does not produce a second link or a fallback URL', async () => {
  const service = remote(); const create = service.api.createLink;
  service.api.createLink = async id => { await create(id); throw new Error('lost link response'); };
  const manifest = [{ status: 'downloaded', localFile: 'hero.png' }];
  const options = { directory: dir, manifest, environment: { host: 'https://hub.example' }, api: service.api };
  await uploadImages({ ...options, initialize: true }); // confirmed approval rejection
  expect((await uploadImages(options)).status).toBe('partial');
  expect((await uploadImages(options)).status).toBe('partial');
  expect(service.assets).toHaveLength(1);
  expect(service.links).toHaveLength(1);
  expect(manifest[0].publicUrl).toBeUndefined();
});

test('a changed file or host is rejected before any new creation', async () => {
  const service = remote(); const options = { directory: dir, manifest: [{ status: 'downloaded', localFile: 'hero.png' }], environment: { host: 'https://hub.example' }, api: service.api };
  await uploadImages({ ...options, initialize: true });
  await expect(uploadImages({ ...options, environment: { host: 'https://other.example' } })).rejects.toMatchObject({ code: 'BLOCKED' });
  fs.writeFileSync(path.join(dir, 'hero.png'), 'changed image');
  await expect(uploadImages(options)).rejects.toMatchObject({ code: 'BLOCKED' });
  expect(service.assets).toHaveLength(1);
});

test('legacy uploaded markers reuse verified asset identities but never invent missing link evidence', async () => {
  const service = remote(); service.assets.push({ id: 'a1', identifier: 'asset1', approved: true });
  const result = await uploadImages({ directory: dir, manifest: [{ status: 'downloaded', uploadStatus: 'uploaded', localFile: 'hero.png', assetId: 'a1', assetIdentifier: 'asset1', publicUrl: 'https://public.example/old' }], environment: { host: 'https://hub.example' }, api: service.api, initialize: true });
  expect(result.status).toBe('partial');
  expect(service.assets).toHaveLength(1);
  expect(service.links).toHaveLength(0);
});
