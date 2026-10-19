'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {
  uploadImages,
} = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/uploads.cjs');
const { temporary } = require('./demo-fixture');
let directory;
beforeEach(() => {
  directory = temporary();
});
afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));
function fixture(count = 3) {
  let time = 0;
  const sleeps = [];
  const assets = [];
  const links = [];
  const calls = { approve: 0, createAsset: 0, createLink: 0, public: 0 };
  const manifest = Array.from({ length: count }, (_, index) => ({
    localFile: `${index}.png`,
    status: 'downloaded',
    alt: 'A & B',
  }));
  for (const image of manifest) fs.writeFileSync(path.join(directory, image.localFile), 'test');
  const api = {
    createAsset: async () => {
      calls.createAsset++;
      const asset = {
        id: `asset-${assets.length}`,
        identifier: `id-${assets.length}`,
        approved: false,
      };
      assets.push(asset);
      return { ...asset };
    },
    readAsset: async (id) => ({ ...assets.find((x) => x.id === id) }),
    approve: async (id) => {
      calls.approve++;
      assets.find((x) => x.id === id).approved = true;
      return {};
    },
    createLink: async (assetId) => {
      calls.createLink++;
      const link = { id: `link-${links.length}`, assetId, url: `https://hub.example/${assetId}` };
      links.push(link);
      return { id: link.id };
    },
    readLink: async (id) => ({ ...links.find((x) => x.id === id) }),
    verifyPublic: async () => {
      calls.public++;
      return time >= 6000;
    },
  };
  const options = {
    directory,
    manifest,
    environment: { host: 'https://hub.example' },
    api,
    now: () => time,
    sleep: async (ms) => {
      sleeps.push(ms);
      time += ms;
    },
    publicLinkTimeoutMs: 10000,
    approvalTimeoutMs: 10000,
  };
  return {
    options,
    api,
    assets,
    links,
    calls,
    sleeps,
    time: () => time,
    advance: (ms) => {
      time += ms;
    },
  };
}

test('delayed public links share one window and finish with one asset/link creation per image', async () => {
  const f = fixture();
  const result = await uploadImages({ ...f.options, initialize: true });
  expect(result.status).toBe('complete');
  expect(f.sleeps.length).toBeGreaterThan(0);
  expect(f.time()).toBeLessThanOrEqual(10000);
  expect(f.calls.createAsset).toBe(3);
  expect(f.calls.createLink).toBe(3);
  expect(f.options.manifest.every((x) => x.uploadStatus === 'uploaded')).toBe(true);
});

test('unavailable links preserve identities at one shared deadline and resume without creating duplicates', async () => {
  const f = fixture();
  f.api.verifyPublic = async () => {
    f.advance(1000);
    return false;
  };
  const result = await uploadImages({ ...f.options, publicLinkTimeoutMs: 5000, initialize: true });
  expect(result.status).toBe('partial');
  expect(f.time()).toBeLessThanOrEqual(5000); // requests and sleeps share one exact batch deadline
  expect(f.options.manifest.every((x) => x.publicLinkId && !x.imageFieldXml)).toBe(true);
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'image-manifest.json'), 'utf8'));
  f.api.verifyPublic = async () => true;
  expect((await uploadImages({ ...f.options, manifest })).status).toBe('complete');
  expect(f.calls.createAsset).toBe(3);
  expect(f.calls.createLink).toBe(3);
});

test('a ready image finishes while another public link reaches the shared deadline', async () => {
  const f = fixture(2);
  f.api.verifyPublic = async (url) => url.endsWith('asset-1');
  const result = await uploadImages({ ...f.options, publicLinkTimeoutMs: 5000, initialize: true });
  expect(result.status).toBe('partial');
  expect(f.time()).toBe(5000);
  expect(f.options.manifest[1].uploadStatus).toBe('uploaded');
  expect(f.options.manifest[0].uploadStatus).toBe('needs-reconciliation');
  expect(f.calls.createLink).toBe(2);
});

test('a slow public URL does not starve a ready image in the shared verification window', async () => {
  jest.useFakeTimers();
  try {
    const f = fixture(2);
    f.api.verifyPublic = async (url) => {
      if (url.endsWith('asset-1')) return true;
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return false;
    };
    const run = uploadImages({
      ...f.options,
      publicLinkTimeoutMs: 5000,
      now: () => Date.now(),
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      initialize: true,
    });
    await jest.advanceTimersByTimeAsync(1);
    expect(f.options.manifest[1].uploadStatus).toBe('uploaded');
    await jest.advanceTimersByTimeAsync(5000);
    expect((await run).status).toBe('partial');
    expect(f.calls.createLink).toBe(2);
  } finally {
    jest.useRealTimers();
  }
});

test('approval lag is read-only, batch-wide, and prevents link creation until verified', async () => {
  const f = fixture();
  f.api.approve = async () => {
    f.calls.approve++;
    throw new Error('acknowledgement lost');
  };
  f.api.readAsset = async (id) => ({
    ...f.assets.find((x) => x.id === id),
    approved: f.time() >= 6000,
  });
  const createLink = f.api.createLink;
  f.api.createLink = async (...args) => {
    expect(f.time()).toBeGreaterThanOrEqual(6000);
    return createLink(...args);
  };
  expect((await uploadImages({ ...f.options, initialize: true })).status).toBe('complete');
  expect(f.calls.approve).toBe(3);
  expect(f.time()).toBeLessThanOrEqual(10000);
  expect((await uploadImages(f.options)).status).toBe('complete');
  expect(f.calls.approve).toBe(3);
});

test('approval deadline preserves pending assets and independent approved images', async () => {
  const f = fixture(2);
  f.api.readAsset = async (id) => ({
    ...f.assets.find((x) => x.id === id),
    approved: id === 'asset-1',
  });
  f.api.verifyPublic = async () => true;
  expect(
    (await uploadImages({ ...f.options, approvalTimeoutMs: 5000, initialize: true })).status,
  ).toBe('partial');
  expect(f.time()).toBe(5000);
  expect(f.calls.createLink).toBe(1);
  expect(f.options.manifest[1].uploadStatus).toBe('uploaded');
  expect(f.options.manifest[0].assetId).toBe('asset-0');
  f.api.readAsset = async (id) => ({ ...f.assets.find((x) => x.id === id), approved: true });
  expect((await uploadImages(f.options)).status).toBe('complete');
  expect(f.calls.approve).toBe(1); // already-approved asset never needed a write
  expect(f.calls.createAsset).toBe(2);
  expect(f.calls.createLink).toBe(2);
});
