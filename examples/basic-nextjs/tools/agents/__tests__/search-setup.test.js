'use strict';
// sitecore-search: seed articles + connect search (ADR 0013, backlog B3/B4).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const SKILL = '../../../.agents/skills/sitecore-search/scripts/lib';
const { seedArticles, fieldsToWrite } = require(`${SKILL}/seed-articles.cjs`);
const { connectSearch, desiredFields } = require(`${SKILL}/connect-search.cjs`);
const { readSearchSource } = require(`${SKILL}/search-config.cjs`);
const { TEMPLATES, RENDERINGS } = require(`${SKILL}/search-ids.cjs`);

const clone = (x) => JSON.parse(JSON.stringify(x));
const ROOT = '/sitecore/content/main/main-website';
const environment = { siteCollection: 'main', siteName: 'main-website', marker: null };
const SOURCE = 'd09b2998-b210-4f62-b788-51cac4e3caa0';

const dirs = [];
const workdir = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'search-setup-'));
  dirs.push(d);
  return d;
};
afterEach(() => {
  while (dirs.length) fs.rmSync(dirs.pop(), { recursive: true, force: true });
});

/** In-memory site: items by id (path, templateId, fields, parentId) and pages (components). */
function site() {
  const items = new Map();
  const pages = new Map();
  let counter = 0;
  const add = (id, p, templateId = 'folder', fields = {}) => {
    const parent = [...items.values()].find((x) => x.path === p.slice(0, p.lastIndexOf('/')));
    items.set(id, { id, name: p.slice(p.lastIndexOf('/') + 1), path: p, templateId, fields, parentId: parent?.id });
    return id;
  };
  add('site', ROOT);
  add('home', `${ROOT}/Home`);
  add('articles', `${ROOT}/Home/Articles`);
  add('data', `${ROOT}/Data`);
  add('people', `${ROOT}/Data/People`);
  add('jane', `${ROOT}/Data/People/Jane Smith`, 'person');
  add('marcus', `${ROOT}/Data/People/Marcus Webb`, 'person');
  add('presentation', `${ROOT}/Presentation`);
  add('partials', `${ROOT}/Presentation/Partial Designs`);
  add('article-layout', `${ROOT}/Presentation/Partial Designs/Article Layout`);
  for (const f of ['SearchResults', 'SearchCollections', 'SearchTypeaheads', 'NavigationHeaders'])
    add(`f-${f}`, `${ROOT}/Data/${f}`);
  add('ds-results', `${ROOT}/Data/SearchResults/Articles Search Results`, TEMPLATES.searchResults, {
    SearchIndex: '', TitleMapping: 'Title', SortBy: 'Custom', Facets: '',
  });
  add('ds-latest', `${ROOT}/Data/SearchCollections/Latest Articles`, TEMPLATES.searchCollection, {
    SearchIndex: '', SortBy: '', SortOrder: '', RelatedToCurrentPage: '',
  });
  add('ds-typeahead', `${ROOT}/Data/SearchTypeaheads/Articles Typeahead`, TEMPLATES.searchTypeahead, { SearchIndex: '' });
  add('nav-main', `${ROOT}/Data/NavigationHeaders/Main Navigation`, TEMPLATES.navigationHeaderData, {
    SearchIndex: '', ResultsPage: '<link id="{D8B01498}" />',
  });
  add('nav-plain', `${ROOT}/Data/NavigationHeaders/Plain Navigation`, TEMPLATES.navigationHeaderData, {
    SearchIndex: '', ResultsPage: '',
  });
  pages.set('article-layout', [
    { id: 'i-hero', renderingId: 'article-hero', placeholder: 'headless-main', componentName: 'ArticleHero', datasourceId: '' },
    { id: 'i-body', renderingId: 'article-body', placeholder: 'headless-main', componentName: 'ArticleBody', datasourceId: '' },
  ]);
  pages.set('home', [
    { id: 'i-home-hero', renderingId: 'hero', placeholder: 'headless-main', componentName: 'HeroBanner', datasourceId: 'x' },
    { id: 'i-cta', renderingId: 'cta', placeholder: 'headless-main', componentName: 'CTABanner', datasourceId: 'y' },
  ]);
  pages.set('articles', [
    { id: 'i-results', renderingId: RENDERINGS.searchResults, placeholder: 'headless-main', componentName: 'SearchResults', datasourceId: 'ds-results' },
  ]);
  const calls = { addComponent: 0 };
  const api = {
    resolvePath: async (p) => {
      const item = [...items.values()].find((x) => x.path === p);
      if (!item) throw new Error('not found');
      return api.readItem(item.id);
    },
    readItem: async (id) => {
      const item = items.get(id);
      if (!item) throw new Error('missing');
      return {
        ...clone(item),
        children: [...items.values()]
          .filter((x) => x.parentId === id)
          .map((x) => ({ id: x.id, name: x.name, templateId: x.templateId })),
      };
    },
    createItem: async (data) => {
      const id = `item-${++counter}`;
      const parent = items.get(data.parentId);
      items.set(id, { id, name: data.name, templateId: data.templateId, path: `${parent.path}/${data.name}`, parentId: parent.id, fields: {} });
      return { id };
    },
    updateFields: async (id, fields) => {
      Object.assign(items.get(id).fields, fields);
      return {};
    },
    readPage: async (pageId) => clone(pages.get(pageId) || []),
    addComponent: async (data) => {
      calls.addComponent++;
      const list = pages.get(data.pageId);
      const component = {
        id: `instance-${++counter}`,
        renderingId: data.componentRenderingId,
        placeholder: data.placeholderPath,
        componentName: data.componentRenderingId === RENDERINGS.searchCollection ? 'SearchCollection' : 'SearchResults',
        datasourceId: `local-${counter}`,
      };
      const at = data.insertAfterComponentId
        ? list.findIndex((x) => x.id === data.insertAfterComponentId) + 1
        : list.length;
      list.splice(at, 0, component);
      return {};
    },
    setDatasource: async (pageId, id, datasourceId) => {
      pages.get(pageId).find((x) => x.id === id).datasourceId = datasourceId;
      return {};
    },
  };
  return { api, items, pages, add, calls };
}

const article = (name, overrides = {}) => ({
  name,
  title: `${name}!`,
  topic: 'AI',
  author: 'Jane Smith',
  date: '20260806T090000Z',
  readTime: '5 min read',
  content: `<p>${name} body</p>`,
  takeaways: '<ul><li>x</li></ul>',
  image: { seed: name.toLowerCase().replace(/ /g, '-'), sharedSandboxXml: `<Image src="https://shared/${name}" />` },
  ...overrides,
});
const byName = (s, name) => [...s.items.values()].find((x) => x.name === name);

describe('seed articles', () => {
  test('creates missing articles with every field, resolving authors and URLs', async () => {
    const s = site();
    const dir = workdir();
    const result = await seedArticles({
      directory: dir, environment, api: s.api, initialize: true,
      articles: [article('Agentic AI In Practice'), article('Edge Rendering', { author: 'Marcus Webb', topic: 'Engineering' })],
    });
    expect(result.status).toBe('complete');
    expect(result.created).toEqual(['Agentic AI In Practice', 'Edge Rendering']);
    const edge = byName(s, 'Edge Rendering');
    expect(edge.templateId).toBe(TEMPLATES.article);
    expect(edge.fields).toMatchObject({
      Title: 'Edge Rendering!', ArticleTopic: 'Engineering', ArticleAuthor: 'marcus',
      ArticleUrl: '/Articles/Edge-Rendering', ArticleImage: '<Image src="https://shared/Edge Rendering" />',
      NavigationTitle: 'Edge Rendering', ShowInNavigation: '1',
    });
    expect(result.sharedSandboxImages).toEqual(['Agentic AI In Practice', 'Edge Rendering']);
    expect(JSON.parse(fs.readFileSync(path.join(dir, 'seed-result.json'), 'utf8')).created).toHaveLength(2);
  });

  test('a re-run changes nothing', async () => {
    const s = site();
    const dir = workdir();
    const articles = [article('Agentic AI In Practice')];
    await seedArticles({ directory: dir, environment, api: s.api, initialize: true, articles });
    const before = clone([...s.items.values()]);
    const again = await seedArticles({ directory: dir, environment, api: s.api, articles });
    expect(again.status).toBe('complete');
    expect([...s.items.values()]).toEqual(before);
    expect(again.created).toEqual(['Agentic AI In Practice']); // journaled create, not a new item
    const fresh = await seedArticles({ directory: workdir(), environment, api: s.api, initialize: true, articles });
    expect(fresh.unchanged).toEqual(['Agentic AI In Practice']);
    expect([...s.items.values()]).toEqual(before);
  });

  test('existing articles keep their values; only empty fields are filled', async () => {
    const s = site();
    s.add('old', `${ROOT}/Home/Articles/Canary Releases`, TEMPLATES.article, {
      Title: 'My edited title', ArticleTopic: '', ArticleImage: '', ArticleContent: '<p>edited</p>',
    });
    const result = await seedArticles({
      directory: workdir(), environment, api: s.api, initialize: true,
      articles: [article('Canary Releases', { topic: 'Engineering' })],
    });
    expect(result.filled).toEqual([
      expect.objectContaining({ name: 'Canary Releases', fields: expect.arrayContaining(['ArticleTopic', 'ArticleImage']) }),
    ]);
    expect(s.items.get('old').fields).toMatchObject({
      Title: 'My edited title', ArticleContent: '<p>edited</p>', ArticleTopic: 'Engineering',
    });
    expect(result.sharedSandboxImages).toEqual(['Canary Releases']);
  });

  test('--overwrite resets fields to the seed values', async () => {
    const s = site();
    s.add('old', `${ROOT}/Home/Articles/Canary Releases`, TEMPLATES.article, { Title: 'My edited title' });
    await seedArticles({
      directory: workdir(), environment, api: s.api, initialize: true, overwrite: true,
      articles: [article('Canary Releases')],
    });
    expect(s.items.get('old').fields.Title).toBe('Canary Releases!');
  });

  test('environment images replace the shared sandbox fallback', async () => {
    const s = site();
    const result = await seedArticles({
      directory: workdir(), environment, api: s.api, initialize: true,
      articles: [article('Canary Releases'), article('Edge Rendering')],
      imageXml: { 'Canary Releases': '<Image src="https://env-hub/canary" />' },
    });
    expect(byName(s, 'Canary Releases').fields.ArticleImage).toBe('<Image src="https://env-hub/canary" />');
    expect(result.sharedSandboxImages).toEqual(['Edge Rendering']);
  });

  test('invalid or duplicate article names are rejected before any write', async () => {
    const s = site();
    await expect(
      seedArticles({ directory: workdir(), environment, api: s.api, initialize: true, articles: [article('Bad: name')] }),
    ).rejects.toThrow(/invalid article name/);
    await expect(
      seedArticles({ directory: workdir(), environment, api: s.api, initialize: true, articles: [article('A'), article('A')] }),
    ).rejects.toThrow(/duplicate/);
  });

  test('fieldsToWrite fills gaps by default and diffs with overwrite', () => {
    expect(fieldsToWrite({ A: '1', B: '2', C: '' }, { A: 'x', B: '' }, false)).toEqual({ B: '2' });
    expect(fieldsToWrite({ A: '1', B: '2' }, { A: 'x', B: '2' }, true)).toEqual({ A: '1' });
  });
});

describe('connect search', () => {
  test('configures targets by template; keeps custom sort; leaves navigation without search intent alone', async () => {
    const s = site();
    const result = await connectSearch({ directory: workdir(), environment, api: s.api, sourceId: SOURCE, initialize: true });
    expect(s.items.get('ds-results').fields).toMatchObject({
      SearchIndex: SOURCE, TitleMapping: 'title', DescriptionMapping: 'articlecontent', ImageMapping: 'articleimage',
      LinkMapping: 'articleurl', DateMapping: 'articlepublicationdate', SortBy: 'Custom', Facets: 'ArticleTopic',
    });
    expect(s.items.get('ds-latest').fields).toMatchObject({ SearchIndex: SOURCE, SortBy: 'articlepublicationdate', SortOrder: 'desc' });
    expect(s.items.get('ds-typeahead').fields).toMatchObject({ SearchIndex: SOURCE, TitleMapping: 'title', LinkMapping: 'articleurl' });
    expect(s.items.get('nav-main').fields.SearchIndex).toBe(SOURCE);
    expect(s.items.get('nav-plain').fields.SearchIndex).toBe('');
    expect(result.status).toBe('complete');
  });

  test('completes the Related datasource and placements without touching what is present', async () => {
    const s = site();
    const result = await connectSearch({ directory: workdir(), environment, api: s.api, sourceId: SOURCE, initialize: true });
    const related = byName(s, 'Related Articles');
    expect(related.fields).toMatchObject({ RelatedToCurrentPage: '1', Heading: 'Related articles', MaxItems: '3', SearchIndex: SOURCE });
    expect(s.pages.get('article-layout').map((x) => x.componentName)).toEqual(['ArticleHero', 'ArticleBody', 'SearchCollection']);
    expect(s.pages.get('article-layout')[2].datasourceId).toBe(related.id);
    expect(s.pages.get('home').map((x) => x.componentName)).toEqual(['HeroBanner', 'SearchCollection', 'CTABanner']);
    expect(s.pages.get('home')[1].datasourceId).toBe('ds-latest');
    expect(result.placements.find((x) => x.key === 'connect:place:results').status).toBe('present');
    expect(result.created).toEqual(['Related Articles']);
    expect(result.cleanupDatasources).toHaveLength(2); // auto-created local datasources of the 2 adds
  });

  test('a second run in a new workspace duplicates nothing', async () => {
    const s = site();
    await connectSearch({ directory: workdir(), environment, api: s.api, sourceId: SOURCE, initialize: true });
    const adds = s.calls.addComponent;
    const items = s.items.size;
    const again = await connectSearch({ directory: workdir(), environment, api: s.api, sourceId: SOURCE, initialize: true });
    expect(s.calls.addComponent).toBe(adds);
    expect(s.items.size).toBe(items);
    expect(again.placements.every((x) => x.status === 'present')).toBe(true);
    expect(again.updated).toEqual([]);
  });

  test('home placement can be switched off', async () => {
    const s = site();
    await connectSearch({ directory: workdir(), environment, api: s.api, sourceId: SOURCE, homePlacement: 'none', initialize: true });
    expect(s.pages.get('home').map((x) => x.componentName)).toEqual(['HeroBanner', 'CTABanner']);
  });

  test('a failed placement becomes a manual placement; configuration still completes', async () => {
    const s = site();
    s.api.addComponent = async () => {
      throw new Error("Error fetching component: GraphQL errors: The field `renderings` does not exist on the type `Query`.");
    };
    const result = await connectSearch({ directory: workdir(), environment, api: s.api, sourceId: SOURCE, initialize: true });
    expect(result.status).toBe('partial');
    expect(result.manualPlacements.map((x) => x.key)).toEqual(['connect:place:related', 'connect:place:latest']);
    expect(result.manualPlacements[0]).toMatchObject({ page: `${ROOT}/Presentation/Partial Designs/Article Layout`, renderingId: RENDERINGS.searchCollection });
    expect(s.items.get('ds-results').fields.SearchIndex).toBe(SOURCE);
  });

  test('a missing or malformed source ID is rejected', async () => {
    const s = site();
    await expect(connectSearch({ directory: workdir(), environment, api: s.api, sourceId: '', initialize: true })).rejects.toThrow(/source ID/);
    await expect(connectSearch({ directory: workdir(), environment, api: s.api, sourceId: 'abc', initialize: true })).rejects.toThrow(/source ID/);
  });

  test('desiredFields ignores templates that are not search targets', () => {
    expect(desiredFields('some-other-template', {}, SOURCE)).toBeNull();
  });
});

describe('search source configuration', () => {
  test('project.yaml searchSources.articles wins over .env.local', () => {
    const app = workdir();
    fs.mkdirSync(path.join(app, 'docs/ai/config'), { recursive: true });
    fs.writeFileSync(path.join(app, '.env.local'), 'SITECORE_SEARCH_PUSH_SOURCE_ID=from-env\n');
    expect(readSearchSource(app, {})).toBe('from-env');
    fs.writeFileSync(path.join(app, 'docs/ai/config/project.yaml'), 'searchSources:\n  articles: "from-project"\n');
    expect(readSearchSource(app, {})).toBe('from-project');
  });
});
