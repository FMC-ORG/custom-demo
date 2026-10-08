'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const clone = x => JSON.parse(JSON.stringify(x));
function temporary() { return fs.mkdtempSync(path.join(os.tmpdir(), 'demo-execution-')); }
function sitecore() {
  const items = new Map([['folder', { id: 'folder', name: 'Cards', path: '/sitecore/content/test/Data/Cards', templateId: 'folder', fields: {} }]]);
  const components = [];
  let counter = 0;
  const defaults = {};
  const api = {
    resolvePath: async p => { const item = [...items.values()].find(x => x.path === p); if (!item) throw new Error('not found'); return api.readItem(item.id); },
    readItem: async id => {
      const item = items.get(id); if (!item) throw new Error('missing');
      return { ...clone(item), children: [...items.values()].filter(x => x.parentId === id).sort((a,b) => Number(a.fields.__Sortorder || 0) - Number(b.fields.__Sortorder || 0) || a.name.localeCompare(b.name)).map(clone) };
    },
    createItem: async data => { const id = `item-${++counter}`; items.set(id, { id, ...clone(data), path: `${items.get(data.parentId).path}/${data.name}`, fields: { ...defaults[data.templateId] } }); return { id }; },
    updateFields: async (id, fields) => { Object.assign(items.get(id).fields, fields); return { id }; },
    readPage: async () => clone(components),
    addComponent: async data => {
      const item = { id: `instance-${++counter}`, renderingId: data.componentRenderingId, componentName: 'Cards', placeholder: data.placeholderPath, datasourceId: `local-${counter}`, parameters: { FieldNames: 'existing-variant' } };
      const at = data.insertAfterComponentId ? components.findIndex(x => x.id === data.insertAfterComponentId) + 1 : components.length;
      components.splice(at, 0, item); return { id: item.id };
    },
    setDatasource: async (pageId, id, datasourceId) => { components.find(x => x.id === id).datasourceId = datasourceId; return {}; },
  };
  return { api, items, components, defaults };
}
function plan() {
  return {
    approved: true, client: 'Client', environment: { siteName: 'test', siteCollection: 'test', dataRoot: '/sitecore/content/test/Data', marker: 'environment-id' },
    pageId: 'home', sections: [{
      key: 'stages', componentName: 'Cards', folderPath: '/sitecore/content/test/Data/Cards', templateId: 'cards', name: 'Client - Stages',
      fields: { Title: 'Stages' }, fieldRules: { Title: { type: 'Single-Line Text', required: true } },
      children: ['Strategy', 'Engineering', 'Execution', 'Operate'].map(name => ({ key: name, name: `Client - ${name}`, templateId: 'card', fields: { Title: name }, fieldRules: { Title: { type: 'Single-Line Text', required: true } } })),
      renderingId: 'cards-rendering', placeholder: 'headless-main',
    }],
  };
}
module.exports = { temporary, sitecore, plan, clone };
