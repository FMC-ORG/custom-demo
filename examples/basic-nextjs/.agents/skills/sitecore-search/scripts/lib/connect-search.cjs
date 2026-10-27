'use strict';
/**
 * Connect an environment's search components to its articles push source, and complete what is
 * missing (ADR 0013, B4). Marketer MCP through the journaled file bridge; every write read back.
 *
 * 1. Targets by TEMPLATE (not a fixed list) in Data/{SearchResults,SearchCollections,
 *    SearchTypeaheads,NavigationHeaders}: SearchIndex + push-source mappings; SortBy / SortOrder /
 *    Facets only where empty. Navigation items only when they already intend header search
 *    (SearchIndex or ResultsPage set).
 * 2. Completes: a "Related Articles" SearchCollection datasource (RelatedToCurrentPage), and the
 *    placements Related -> Article Layout partial design (after ArticleBody), Latest Articles ->
 *    Home (after the hero; optional), SearchResults -> /Articles. Pages are read first, existing
 *    instances are never duplicated, and a failed placement becomes a manualPlacements entry (B6).
 */
const path = require('node:path');
const LIB = path.join(__dirname, '../../../sitecore-build-demo/scripts/lib');
const { Recovery, Blocked, atomicJson } = require(path.join(LIB, 'recovery.cjs'));
const { createItem, updateItem } = require(path.join(LIB, 'populate.cjs'));
const {
  TEMPLATES,
  RENDERINGS,
  DATA_FOLDERS,
  ARTICLE_MAPPINGS,
  ARTICLE_SORT,
  ARTICLE_FACETS,
  sameId,
} = require('./search-ids.cjs');

const CONNECT_CONTRACT = 'search-connect-v1';
const PLACEHOLDER = 'headless-main';
const verified = (value) => ({ state: 'verified', value });
const unknown = () => ({ state: 'unknown' });
const empty = (v) => v === undefined || v === null || v === '';
const checked = (v) => v === '1' || v === true || v === 'true';
const ifEmpty = (fields, name, value) => (empty(fields[name]) ? { [name]: value } : {});

/** Desired field values for one datasource item, or null when it is not a target. */
function desiredFields(templateId, fields, sourceId) {
  if (sameId(templateId, TEMPLATES.searchResults))
    return {
      SearchIndex: sourceId,
      ...ARTICLE_MAPPINGS,
      ...ifEmpty(fields, 'SortBy', ARTICLE_SORT),
      ...ifEmpty(fields, 'Facets', ARTICLE_FACETS),
    };
  if (sameId(templateId, TEMPLATES.searchCollection))
    return {
      SearchIndex: sourceId,
      ...ARTICLE_MAPPINGS,
      ...(checked(fields.RelatedToCurrentPage)
        ? {}
        : { ...ifEmpty(fields, 'SortBy', ARTICLE_SORT), ...ifEmpty(fields, 'SortOrder', 'desc') }),
    };
  if (sameId(templateId, TEMPLATES.searchTypeahead))
    return { SearchIndex: sourceId, TitleMapping: 'title', LinkMapping: 'articleurl' };
  if (sameId(templateId, TEMPLATES.navigationHeaderData)) {
    // Header search is opt-in per navigation: only items that already intend it.
    if (!Object.hasOwn(fields, 'SearchIndex')) return null;
    if (empty(fields.SearchIndex) && empty(fields.ResultsPage)) return null;
    return { SearchIndex: sourceId, TitleMapping: 'title', LinkMapping: 'articleurl' };
  }
  return null;
}

const changed = (desired, current) =>
  Object.fromEntries(Object.entries(desired).filter(([name, value]) => current[name] !== value));

/** Add a rendering instance and point it at a shared datasource; journaled add + wire. */
async function place(recovery, api, { key, pageId, renderingId, placeholder, datasourceId, after, itemName }) {
  const component = await recovery.operation(`${key}:add`, {
    before: async () => ({ ids: (await api.readPage(pageId)).map((x) => x.id) }),
    write: () =>
      api.addComponent({
        pageId,
        componentRenderingId: renderingId,
        placeholderPath: placeholder,
        componentItemName: itemName,
        ...(after ? { insertAfterComponentId: after } : {}),
      }),
    verify: async (_result, before, saved, attempt = 0) => {
      const page = await api.readPage(pageId, attempt ? { fresh: `${key}:add:${attempt}` } : undefined);
      const added = saved
        ? page.filter((x) => sameId(x.id, saved.id))
        : page.filter(
            (x) =>
              !before.ids.some((id) => sameId(id, x.id)) &&
              sameId(x.renderingId, renderingId) &&
              x.placeholder === placeholder,
          );
      if (added.length > 1) return { state: 'conflict' };
      return added.length ? verified({ id: added[0].id, localDatasourceId: added[0].datasourceId || null }) : unknown();
    },
  });
  await recovery.operation(`${key}:wire`, {
    before: async () => {
      const current = (await api.readPage(pageId)).find((x) => sameId(x.id, component.id));
      if (!current) throw new Blocked(key, 'instance disappeared');
      return { datasourceId: current.datasourceId };
    },
    write: (before) =>
      sameId(before.datasourceId, datasourceId) ? {} : api.setDatasource(pageId, component.id, datasourceId),
    verify: async (_result, _before, _saved, attempt = 0) => {
      const current = (await api.readPage(pageId, attempt ? { fresh: `${key}:wire:${attempt}` } : undefined)).find(
        (x) => sameId(x.id, component.id),
      );
      return current && sameId(current.datasourceId, datasourceId)
        ? verified({ id: component.id, datasourceId })
        : unknown();
    },
  });
  return component;
}

async function connectSearch({
  directory,
  environment,
  sourceId,
  api,
  homePlacement = 'after-hero',
  initialize = false,
  observationSession,
}) {
  if (!sourceId || !/^[0-9a-f-]{36}$/i.test(sourceId))
    throw new Blocked('connect', 'a search source ID (GUID) is required (project.yaml searchSources.articles)');
  if (!['after-hero', 'none'].includes(homePlacement))
    throw new Blocked('connect', 'homePlacement must be after-hero or none');
  if (!environment?.siteCollection || !environment?.siteName)
    throw new Blocked('connect', 'site identity missing (project.yaml siteCollection/siteName)');
  const recovery = new Recovery({
    file: path.join(directory, 'recovery-connect.json'),
    contract: CONNECT_CONTRACT,
    initialize,
    observationSession,
    intent: { phase: 'connect', sourceId: sourceId.toLowerCase(), homePlacement },
    environment,
  });
  const root = `/sitecore/content/${environment.siteCollection}/${environment.siteName}`;
  const result = {
    updated: [],
    unchanged: [],
    created: [],
    placements: [],
    manualPlacements: [],
    cleanupDatasources: [],
    issues: [],
  };
  const consumable = (error) =>
    !(error.code === 'AWAITING_TOOL' || recovery.poisoned || error.operation === 'checkpoint');
  const issue = (key, error) =>
    result.issues.push({
      key,
      status: 'needs-reconciliation',
      reason: error.code === 'BLOCKED' ? error.message : 'outcome not verified',
    });

  // 1. Configure every existing target.
  const data = await api.resolvePath(`${root}/Data`);
  const folders = {};
  for (const name of DATA_FOLDERS) {
    const folder = data.children.find((x) => x.name === name);
    if (folder) folders[name] = await api.readItem(folder.id);
  }
  const collections = [];
  for (const folder of Object.values(folders)) {
    for (const child of folder.children) {
      const item = await api.readItem(child.id);
      if (sameId(item.templateId, TEMPLATES.searchCollection)) collections.push(item);
      const desired = desiredFields(item.templateId, item.fields, sourceId);
      if (!desired) continue;
      const delta = changed(desired, item.fields);
      if (!Object.keys(delta).length) {
        result.unchanged.push(item.name);
        continue;
      }
      try {
        await updateItem(recovery, api, `connect:${item.id}`, item.id, delta);
        result.updated.push({ name: item.name, fields: Object.keys(delta) });
      } catch (error) {
        if (!consumable(error)) throw error;
        issue(`connect:${item.id}`, error);
      }
    }
  }

  // 2a. Datasources the placements need.
  const ensureCollection = async (key, name, match, extra) => {
    const found = collections.find(match);
    if (found) return found.id;
    if (!folders.SearchCollections) throw new Blocked(key, 'Data/SearchCollections folder missing');
    const created = await createItem(
      recovery,
      api,
      key,
      { name, templateId: TEMPLATES.searchCollection },
      folders.SearchCollections.id,
    );
    await updateItem(recovery, api, `${key}:fields`, created.id, {
      SearchIndex: sourceId,
      ...ARTICLE_MAPPINGS,
      MaxItems: '3',
      ...extra,
    });
    result.created.push(name);
    return created.id;
  };

  // 2b. Placements: read first, add only what is missing, fall back to a manual list.
  // `present` decides whether the page already has what we want (e.g. any SearchResults
  // instance counts on /Articles; Related needs our Related datasource).
  const ensurePlacement = async ({ key, label, pagePath, renderingId, datasourceId, present: isPresent, after, itemName }) => {
    try {
      const pageItem = await api.resolvePath(pagePath);
      const page = await api.readPage(pageItem.id);
      const present = page.find(
        (x) =>
          sameId(x.renderingId, renderingId) &&
          (isPresent ? isPresent(x) : !datasourceId || sameId(x.datasourceId, datasourceId)),
      );
      if (present) {
        result.placements.push({ key, label, status: 'present', instanceId: present.id });
        return;
      }
      if (!datasourceId) throw new Blocked(key, 'no datasource to assign');
      const anchor = after ? page.find(after) : null;
      const component = await place(recovery, api, {
        key,
        pageId: pageItem.id,
        renderingId,
        placeholder: PLACEHOLDER,
        datasourceId,
        after: anchor?.id,
        itemName,
      });
      if (component.localDatasourceId && !sameId(component.localDatasourceId, datasourceId))
        result.cleanupDatasources.push(component.localDatasourceId);
      result.placements.push({ key, label, status: 'added', instanceId: component.id });
    } catch (error) {
      if (!consumable(error)) throw error;
      result.manualPlacements.push({
        key,
        label,
        page: pagePath,
        placeholder: PLACEHOLDER,
        renderingId,
        datasourceId: datasourceId || null,
        reason: error.code === 'BLOCKED' ? error.message : 'automatic placement not verified',
        note: 'Place it in Pages and assign the datasource; check first that it was not added already.',
      });
    }
  };

  let relatedId = null;
  let latestId = null;
  try {
    relatedId = await ensureCollection(
      'connect:related',
      'Related Articles',
      (x) => checked(x.fields.RelatedToCurrentPage),
      { Heading: 'Related articles', RelatedToCurrentPage: '1' },
    );
  } catch (error) {
    if (!consumable(error)) throw error;
    issue('connect:related', error);
  }
  if (homePlacement !== 'none') {
    try {
      latestId = await ensureCollection(
        'connect:latest',
        'Latest Articles',
        (x) => !checked(x.fields.RelatedToCurrentPage),
        { Heading: 'Latest Articles', SortBy: ARTICLE_SORT, SortOrder: 'desc' },
      );
    } catch (error) {
      if (!consumable(error)) throw error;
      issue('connect:latest', error);
    }
  }
  const resultsDatasource = folders.SearchResults?.children.find(Boolean)?.id || null;

  await ensurePlacement({
    key: 'connect:place:related',
    label: 'Related articles in the Article Layout partial design (after ArticleBody)',
    pagePath: `${root}/Presentation/Partial Designs/Article Layout`,
    renderingId: RENDERINGS.searchCollection,
    datasourceId: relatedId,
    after: (x) => x.componentName === 'ArticleBody',
    itemName: 'Related Articles',
  });
  if (homePlacement !== 'none')
    await ensurePlacement({
      key: 'connect:place:latest',
      label: 'Latest Articles on Home (after the hero)',
      pagePath: `${root}/Home`,
      renderingId: RENDERINGS.searchCollection,
      datasourceId: latestId,
      after: (x) => /hero/i.test(x.componentName || '') && x.placeholder === PLACEHOLDER,
      itemName: 'Latest Articles',
    });
  await ensurePlacement({
    key: 'connect:place:results',
    label: 'SearchResults on /Articles',
    pagePath: `${root}/Home/Articles`,
    renderingId: RENDERINGS.searchResults,
    datasourceId: resultsDatasource,
    present: () => true, // any SearchResults instance on /Articles counts
    itemName: 'Articles Search Results',
  });

  const summary = recovery.summary();
  const output = {
    ...summary,
    status:
      result.issues.length || result.manualPlacements.length || summary.status !== 'complete'
        ? 'partial'
        : 'complete',
    sourceId,
    ...result,
  };
  atomicJson(path.join(directory, 'connect-result.json'), output);
  return output;
}

module.exports = { connectSearch, desiredFields, CONNECT_CONTRACT };
