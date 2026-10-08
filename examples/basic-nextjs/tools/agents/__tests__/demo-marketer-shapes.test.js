'use strict';
const { item, page } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/marketer.cjs');

// Response shapes captured from the live marketer MCP (2026-10-08), trimmed to the keys the
// normaliser reads. Text content is wrapped the way the MCP returns it.
const wrap = value => ({ content: [{ type: 'text', text: JSON.stringify(value) }] });

test('item read accepts template.templateId on the item and its children', () => {
  const result = item(wrap({
    itemId: 'bab76c01-9a6e-49d5-9f44-22d7edbe13fe', name: 'FeatureCardsGrids', path: '/sitecore/content/main/main-website/Data/FeatureCardsGrids',
    template: { templateId: 'd78f8fc7-d951-4771-a3e7-f2709984d4ed', name: 'FeatureCardsGrid Folder' }, fields: { Title: 'x' },
    children: { nodes: [{ itemId: 'bc7314d7', name: 'Feature Cards Grid', template: { templateId: 'e94d3c21', name: 'FeatureCardsGrid' }, fields: {} }] },
  }));
  expect(result).toMatchObject({ templateId: 'd78f8fc7-d951-4771-a3e7-f2709984d4ed', children: [{ id: 'bc7314d7', templateId: 'e94d3c21' }] });
});

test('page read maps the live shape: id = instance, componentId = rendering, parameters JSON string', () => {
  const [component] = page(wrap({
    pageId: 'home', components: [{
      id: '8fee3408-26ff-4a9d-b87d-cf4b7484cc07', componentId: 'a41a47a5-d305-4adc-bfc8-ccb0f301ddcf', componentName: 'HeroBanner',
      dataSource: '8df02a79-10ac-4650-a995-fcaae45743f4', dataSourceItem: { itemId: '8df02a79-10ac-4650-a995-fcaae45743f4' }, placeholder: 'headless-main',
      parameters: '{"FieldNames":"{948210B2-B8AF-47C1-A04F-E220071C0A63}","DynamicPlaceholderId":"4"}',
    }],
  }));
  expect(component).toEqual({
    id: '8fee3408-26ff-4a9d-b87d-cf4b7484cc07', renderingId: 'a41a47a5-d305-4adc-bfc8-ccb0f301ddcf', placeholder: 'headless-main', componentName: 'HeroBanner',
    datasourceId: '8df02a79-10ac-4650-a995-fcaae45743f4', parameters: { FieldNames: '{948210B2-B8AF-47C1-A04F-E220071C0A63}', DynamicPlaceholderId: '4' },
  });
});

test('page read keeps the original interpretation when an explicit rendering id is present', () => {
  const [component] = page(wrap({ components: [{ componentId: 'instance', componentRenderingId: 'rendering', placeholder: 'main', parameters: {} }] }));
  expect(component).toMatchObject({ id: 'instance', renderingId: 'rendering' });
});

test('page read still refuses components without a recognisable rendering id or with unparseable parameters', () => {
  expect(() => page(wrap({ components: [{ id: 'instance', placeholder: 'main' }] }))).toThrow('unrecognized rendering instance shape');
  expect(() => page(wrap({ components: [{ id: 'i', componentId: 'r', placeholder: 'main', parameters: '{not json' }] }))).toThrow('parameters shape');
});
