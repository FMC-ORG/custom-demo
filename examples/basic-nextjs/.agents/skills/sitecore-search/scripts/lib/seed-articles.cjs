'use strict';
/**
 * Seed the demo article set into an environment through the marketer MCP (ADR 0013, B3).
 *
 * - Articles are matched by item name under <site>/Home/Articles.
 * - Missing articles are created and filled; existing ones keep every value they have and only
 *   EMPTY fields get the seed value. `overwrite` resets fields to the seed values instead.
 * - Every write is journaled (recovery-seed.json) and verified by read-back, using the same
 *   Recovery / createItem / updateItem as build-demo population. Item IDs differ per environment.
 */
const path = require('node:path');
const LIB = path.join(__dirname, '../../../sitecore-build-demo/scripts/lib');
const { Recovery, Blocked, fingerprint, atomicJson } = require(path.join(LIB, 'recovery.cjs'));
const { createItem, updateItem } = require(path.join(LIB, 'populate.cjs'));
const { TEMPLATES } = require('./search-ids.cjs');

const SEED_CONTRACT = 'search-seed-v1';

const articleUrl = (name) => `/Articles/${name.replace(/ /g, '-')}`;
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Seed field values for one article. `imageXml` maps article name -> environment DAM XML. */
function articleFields(article, personIds, imageXml = {}) {
  const environmentImage = imageXml[article.name];
  return {
    fields: {
      Title: article.title,
      NavigationTitle: article.name,
      ShowInNavigation: '1',
      ArticleContent: article.content,
      ArticleKeyTakeaways: article.takeaways,
      ArticleReadTime: article.readTime,
      ArticlePublicationDate: article.date,
      ArticleAuthor: personIds[article.author],
      ArticleTopic: article.topic,
      ArticleUrl: articleUrl(article.name),
      ArticleImage: environmentImage || article.image?.sharedSandboxXml || '',
    },
    sharedSandboxImage: !environmentImage && !!article.image?.sharedSandboxXml,
  };
}

/** Fields to write: only empty ones (default), or every differing one with `overwrite`. */
function fieldsToWrite(desired, current, overwrite) {
  return Object.fromEntries(
    Object.entries(desired).filter(([name, value]) => {
      if (value === undefined || value === '') return false;
      const now = current?.[name];
      return overwrite ? now !== value : now === undefined || now === null || now === '';
    }),
  );
}

function validateArticles(articles) {
  if (!Array.isArray(articles) || !articles.length) throw new Blocked('seed', 'no articles to seed');
  const names = new Set();
  for (const a of articles) {
    if (!a?.name || !/^[A-Za-z0-9 ]+$/.test(a.name))
      throw new Blocked('seed', `invalid article name "${a?.name}" (letters, digits, spaces only)`);
    if (names.has(a.name)) throw new Blocked('seed', `duplicate article name "${a.name}"`);
    names.add(a.name);
    for (const key of ['title', 'topic', 'author', 'date', 'content'])
      if (!a[key]) throw new Blocked('seed', `article "${a.name}" is missing ${key}`);
  }
}

async function seedArticles({
  directory,
  articles,
  environment,
  api,
  overwrite = false,
  imageXml = {},
  initialize = false,
  observationSession,
}) {
  validateArticles(articles);
  if (!environment?.siteCollection || !environment?.siteName)
    throw new Blocked('seed', 'site identity missing (project.yaml siteCollection/siteName)');
  const recovery = new Recovery({
    file: path.join(directory, 'recovery-seed.json'),
    contract: SEED_CONTRACT,
    initialize,
    observationSession,
    intent: { phase: 'seed', articles: fingerprint(articles), overwrite, imageXml: fingerprint(imageXml) },
    environment,
  });
  const root = `/sitecore/content/${environment.siteCollection}/${environment.siteName}`;
  const parent = await api.resolvePath(`${root}/Home/Articles`);
  const personIds = {};
  for (const name of new Set(articles.map((a) => a.author)))
    personIds[name] = (await api.resolvePath(`${root}/Data/People/${name}`)).id;

  const result = { created: [], filled: [], unchanged: [], sharedSandboxImages: [], issues: [] };
  for (const article of articles) {
    const key = `article:${slug(article.name)}`;
    const { fields, sharedSandboxImage } = articleFields(article, personIds, imageXml);
    try {
      const ops = recovery.state.operations;
      const existing = parent.children.find((child) => child.name === article.name);
      if (existing && !ops[`${key}:create`]) {
        // Fill from the journaled pre-write snapshot when resuming, so a re-run after the write
        // computes the same field set instead of "nothing left to fill".
        const baseline = ops[`${key}:fill`]?.before ?? (await api.readItem(existing.id)).fields;
        const toWrite = fieldsToWrite(fields, baseline, overwrite);
        if (!Object.keys(toWrite).length) {
          result.unchanged.push(article.name);
          continue;
        }
        await updateItem(recovery, api, `${key}:fill`, existing.id, toWrite);
        result.filled.push({ name: article.name, fields: Object.keys(toWrite) });
        if (sharedSandboxImage && toWrite.ArticleImage) result.sharedSandboxImages.push(article.name);
      } else {
        const created = await createItem(
          recovery,
          api,
          key,
          { name: article.name, templateId: TEMPLATES.article },
          parent.id,
        );
        await updateItem(
          recovery,
          api,
          `${key}:fields`,
          created.id,
          fieldsToWrite(fields, {}, false),
        );
        result.created.push(article.name);
        if (sharedSandboxImage) result.sharedSandboxImages.push(article.name);
      }
    } catch (error) {
      if (error.code === 'AWAITING_TOOL' || recovery.poisoned || error.operation === 'checkpoint')
        throw error;
      result.issues.push({
        key,
        status: 'needs-reconciliation',
        reason: error.code === 'BLOCKED' ? error.message : 'outcome not verified',
      });
    }
  }
  const summary = recovery.summary();
  const output = {
    ...summary,
    status: result.issues.length || summary.status !== 'complete' ? 'partial' : 'complete',
    ...result,
  };
  atomicJson(path.join(directory, 'seed-result.json'), output);
  return output;
}

module.exports = { seedArticles, articleFields, fieldsToWrite, articleUrl, slug, SEED_CONTRACT };
