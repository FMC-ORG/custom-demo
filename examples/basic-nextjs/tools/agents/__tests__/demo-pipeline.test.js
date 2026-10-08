'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { temporary, sitecore, plan, clone } = require('./demo-fixture');
const { uploadImages } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/uploads.cjs');
const { populate } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/populate.cjs');
const { assemble } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/assemble.cjs');
const { ConfirmedFailure } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/recovery.cjs');

// One public-entry-point fixture spans all phases with real persisted files.
test('same-workspace pipeline recovery preserves identities, source order and unrelated resources', async () => {
  const directory = temporary(); const images = path.join(directory, 'images'); fs.mkdirSync(images);
  try {
    for (const file of ['hero.png', 'news.png']) fs.writeFileSync(path.join(images, file), `fixture-${file}`);
    const imageManifest = ['hero.png', 'news.png'].map((localFile, i) => ({ localFile, status: 'downloaded', alt: 'A & B', target: { section: i ? 'news' : 'stages', field: 'Image' } }));
    const assets = [{ id: 'unrelated', identifier: 'unrelated', approved: true }];
    const links = [{ id: 'unrelated', assetId: 'unrelated', url: 'https://hub.example/old' }];
    let reject = true;
    const hub = {
      createAsset: async () => { const asset = { id: `asset-${assets.length}`, identifier: `identifier-${assets.length}`, approved: false, width: 100, height: 50 }; assets.push(asset); return clone(asset); },
      readAsset: async id => clone(assets.find(x => x.id === id)),
      approve: async id => { if (reject) { reject = false; throw new ConfirmedFailure(); } assets.find(x => x.id === id).approved = true; return {}; },
      createLink: async assetId => { const link = { id: `link-${links.length}`, assetId, url: `https://hub.example/public/${assetId}` }; links.push(link); return clone(link); },
      readLink: async id => clone(links.find(x => x.id === id)),
      verifyPublic: async () => true,
    };
    const upload = manifest => ({ directory: images, manifest, environment: { host: 'https://hub.example' }, api: hub });
    const first = await uploadImages({ ...upload(imageManifest), initialize: true });
    expect(first.status).toBe('partial');
    expect(first.issues[0].target).toMatchObject({ field: 'Image' });
    expect(imageManifest[1].uploadStatus).toBe('uploaded'); // independent work survives
    const resumedManifest = JSON.parse(fs.readFileSync(path.join(images, 'image-manifest.json'), 'utf8'));
    expect((await uploadImages(upload(resumedManifest))).status).toBe('complete');

    // Resolve generated image XML before freezing the field-ready execution projection.
    const input = plan(); input.sections.push({ ...clone(input.sections[0]), key: 'news', name: 'Client - News' });
    input.sections.forEach((section, i) => {
      section.fields.Image = resumedManifest[i].imageFieldXml;
      section.fieldRules.Image = { type: 'Image', required: false };
    });
    const remote = sitecore();
    const unrelated = { id: 'other-demo', renderingId: 'other-rendering', placeholder: 'headless-main', datasourceId: 'other-datasource', parameters: { FieldNames: 'OtherVariant' } };
    remote.components.push(clone(unrelated));
    const create = remote.api.createItem; let loseCreate = true;
    remote.api.createItem = async data => { const result = await create(data); if (loseCreate) { loseCreate = false; throw new Error('create committed, response lost'); } return result; };
    const add = remote.api.addComponent; let loseAdd = true;
    remote.api.addComponent = async data => { const result = await add(data); if (loseAdd) { loseAdd = false; throw new Error('add committed, response lost'); } return result; };
    const options = { directory, plan: input, api: remote.api };
    const content = await populate({ ...options, initialize: true });
    expect(content.status).toBe('complete');
    expect((await assemble({ ...options, population: content, initialize: true })).status).toBe('complete');
    const identities = { items: [...remote.items.keys()], instances: clone(remote.components), assets: clone(assets), links: clone(links) };

    const completedManifest = JSON.parse(fs.readFileSync(path.join(images, 'image-manifest.json'), 'utf8'));
    expect((await uploadImages(upload(completedManifest))).status).toBe('complete');
    const repeatedContent = await populate(options);
    expect((await assemble({ ...options, population: repeatedContent })).status).toBe('complete');
    expect({ items: [...remote.items.keys()], instances: remote.components, assets, links }).toEqual(identities);
    expect(assets).toHaveLength(3); expect(links).toHaveLength(3);
    expect(remote.items.size).toBe(11); expect(remote.components).toHaveLength(3);
    expect(remote.components[0]).toEqual(unrelated);
    for (const datasource of repeatedContent.datasourceItems) {
      const actual = await remote.api.readItem(datasource.itemId);
      expect(actual.children.map(x => x.fields.Title)).toEqual(['Strategy', 'Engineering', 'Execution', 'Operate']);
    }
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
