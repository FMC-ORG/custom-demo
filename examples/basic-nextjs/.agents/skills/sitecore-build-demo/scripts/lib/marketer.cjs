'use strict';
const { Blocked } = require('./recovery.cjs');
function readJson(response) {
  if (response?.isError) throw new Error('Marketer MCP reported an error; outcome unverified');
  let value = response?.structuredContent;
  if (!value && response?.content) {
    const text = response.content.filter(x => x.type === 'text').map(x => x.text).join('\n');
    try { value = JSON.parse(text); } catch { throw new Error('Marketer response is not structured JSON'); }
  }
  if (!value) value = response;
  if (typeof value === 'string') { try { value = JSON.parse(value); } catch { throw new Error('Unrecognized marketer response'); } }
  if (!value || value.error || value.errors?.length || value.success === false) throw new Error('Marketer outcome unverified');
  return value;
}
function list(raw, label) {
  if (Array.isArray(raw)) return raw;
  const nodes = raw?.nodes || raw?.results || raw?.items;
  if (!Array.isArray(nodes) || raw.pageInfo?.hasNextPage || (raw.totalCount !== undefined && raw.totalCount > nodes.length)) throw new Blocked(label, 'missing or paginated list; full read-back required');
  return nodes;
}
function item(response) {
  const value = readJson(response);
  const raw = value.item || value.data?.item || value.data?.contentItem || value.contentItem || value;
  const id = raw.itemId || raw.id;
  // Live marketer MCP (2026-10) returns template: { templateId, name }.
  const templateId = raw.templateId || raw.template?.id || raw.template?.itemId || raw.template?.templateId;
  if (!id || !raw.name || !templateId) throw new Blocked('item read', 'unrecognized identity/template shape');
  const fields = {};
  const source = raw.fields || raw.fieldValues;
  const addField = field => {
    if (field.name) fields[field.name] = field.value ?? field.rawValue;
  };
  if (Array.isArray(source)) source.forEach(addField);
  else if (source && typeof source === 'object') for (const [name, value] of Object.entries(source)) fields[name] = value && typeof value === 'object' ? (value.value ?? value.rawValue) : value;
  for (const section of raw.sections || []) for (const field of section.fields || []) addField(field);
  // An omitted children property is not proof of an empty list.
  const children = list(raw.children, 'item children').map(child => ({ id: child.itemId || child.id, name: child.name, templateId: child.templateId || child.template?.id || child.template?.templateId }));
  if (children.some(x => !x.id || !x.name)) throw new Blocked('item children', 'unrecognized child identity');
  return { id, name: raw.name, templateId, path: raw.path || raw.itemPath, fields, children };
}
function page(response) {
  const value = readJson(response);
  const raw = Array.isArray(value) ? value : value.components || value.data?.components;
  return list(raw, 'page components').map(component => {
    // Live get_components_on_page (2026-10): `id` is the rendering INSTANCE id and `componentId`
    // is the RENDERING definition id; no other rendering-id key is present. Recognise that shape
    // only when unambiguous, otherwise keep the original interpretation.
    const explicitRendering = component.componentRenderingId || component.renderingId || component.rendering?.id;
    const liveShape = !explicitRendering && !component.instanceId && !component.uid && component.id && component.componentId;
    const id = liveShape ? component.id : (component.componentId || component.instanceId || component.uid || component.id);
    const renderingId = liveShape ? component.componentId : explicitRendering;
    const placeholder = component.placeholderPath || component.placeholder;
    if (!id || !renderingId || !placeholder) throw new Blocked('page read', 'unrecognized rendering instance shape');
    let parameters = component.parameters || {};
    if (typeof parameters === 'string') { try { parameters = JSON.parse(parameters); } catch { throw new Blocked('page read', 'unrecognized rendering parameters shape'); } }
    return { id, renderingId, placeholder, componentName: component.componentName,
      datasourceId: component.dataSourceItem?.itemId || component.datasourceId || component.dataSource || '', parameters };
  });
}
function marketer(call, language = 'en') {
  const read = async (name, args, normalize) => normalize(await call(name, args, false));
  const write = async (name, args) => { readJson(await call(name, args, true)); return {}; };
  return {
    resolvePath: itemPath => read('get_content_item_by_path', { itemPath, language }, item),
    readItem: itemId => read('get_content_item_by_id', { itemId, language }, item),
    createItem: args => write('create_content_item', { ...args, language }),
    updateFields: (itemId, fields) => write('update_fields_on_item', { itemId, fields: Object.entries(fields).map(([name, value]) => ({ name, value })) }),
    readPage: pageId => read('get_components_on_page', { pageId, language }, page),
    addComponent: args => write('add_component_on_page', { ...args, language }),
    setDatasource: (pageId, componentId, datasourceId) => write('set_component_datasource', { pageId, componentId, datasourceId, language }),
  };
}
module.exports = { marketer, readJson, item, page };
