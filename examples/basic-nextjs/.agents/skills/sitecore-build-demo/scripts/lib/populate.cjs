'use strict';
const path = require('node:path');
const { projectResult } = require('./progress.cjs');
const { Recovery, Blocked, atomicJson, fingerprint } = require('./recovery.cjs');
const id = value => String(value || '').replace(/[{}-]/g, '').toLowerCase();
const sameId = (a, b) => id(a) === id(b) && !!id(a);
const verified = value => ({ state: 'verified', value });
const unknown = () => ({ state: 'unknown' });
const xml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;');
function fieldValue(value) {
  if (value && typeof value === 'object') {
    if (typeof value.href !== 'string') throw new Blocked('field', 'unsupported field value; supply verified XML or a link object');
    return `<link text="${xml(value.text)}" anchor="" linktype="external" class="" title="" target="${xml(value.target)}" querystring="" url="${xml(value.href)}" />`;
  }
  if (typeof value !== 'string') throw new Blocked('field', 'field values must be strings or link objects');
  return value;
}
function intentOf(plan) {
  return { approved: plan.approved, client: plan.client, pageId: plan.pageId, sections: plan.sections.map(s => ({
    key: s.key, name: s.name, componentName: s.componentName, folderPath: s.folderPath, templateId: s.templateId,
    fields: s.fields, fieldRules: s.fieldRules, children: (s.children || []).map(c => ({ key: c.key, name: c.name, templateId: c.templateId, fields: c.fields, fieldRules: c.fieldRules })),
    renderingId: s.renderingId, placeholder: s.placeholder, placement: s.placement, existingInstanceId: s.existingInstanceId,
  })) };
}
function validatePlan(plan) {
  if (plan.approved !== true || !plan.client || !plan.environment?.dataRoot || !plan.environment?.marker || !Array.isArray(plan.sections) || !plan.sections.length) throw new Blocked('plan', 'approved normalized plan and environment identity required');
  const keys = new Set();
  for (const section of plan.sections) {
    if (!section.key || keys.has(section.key) || !section.folderPath?.startsWith(`${plan.environment.dataRoot}/`) || /\/(?:\.|\.\.)(?:\/|$)/.test(section.folderPath)) throw new Blocked('plan', 'duplicate section or datasource outside data root');
    keys.add(section.key);
    const childKeys = new Set();
    for (const node of [section, ...(section.children || [])]) {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(node.key || '') || !node.name || /[\/\\]/.test(node.name) || !node.templateId || !node.fields || !node.fieldRules) throw new Blocked('plan', 'item identity and explicit field rules required');
      if (node !== section) { if (childKeys.has(node.key)) throw new Blocked('plan', 'duplicate child key'); childKeys.add(node.key); }
      for (const [name, rule] of Object.entries(node.fieldRules)) {
        if (typeof rule.required !== 'boolean' || !rule.type || name.startsWith('__')) throw new Blocked('plan', 'invalid field rule');
        if (rule.required && !Object.hasOwn(node.fields, name)) throw new Blocked('plan', 'required field is unspecified');
      }
      for (const [name, value] of Object.entries(node.fields)) {
        if (name.startsWith('__') || !node.fieldRules[name]?.type || typeof node.fieldRules[name].required !== 'boolean') throw new Blocked('plan', 'field type/required intent must be explicit; system fields are managed by the helper');
        fieldValue(value);
        if (node.fieldRules[name].required && (typeof value === 'string' ? !value.trim() : !value.href)) throw new Blocked('plan', 'required field has no content');
      }
    }
  }
}
function openBuild({ directory, plan, initialize, observationSession }) {
  validatePlan(plan);
  return new Recovery({ file: path.join(directory, 'recovery-content.json'), initialize, observationSession, intent: intentOf(plan), environment: plan.environment });
}
async function createItem(recovery, api, key, node, parentId) {
  return recovery.operation(`${key}:create`, {
    before: async () => {
      const parent = await api.readItem(parentId);
      if (parent.children.some(x => x.name === node.name)) throw new Blocked(key, 'matching item exists without ownership evidence');
      return { parentId, children: parent.children.map(x => x.id) };
    },
    write: () => api.createItem({ parentId, templateId: node.templateId, name: node.name }),
    verify: async (result, before, saved) => {
      const parent = await api.readItem(parentId);
      const added = parent.children.filter(x => !before.children.some(old => sameId(old, x.id)) && x.name === node.name);
      if (added.length !== 1) return unknown();
      const item = await api.readItem(added[0].id);
      if (!sameId(item.templateId, node.templateId) || (saved && !sameId(saved.id, item.id)) || (result?.id && !sameId(result.id, item.id))) return { state: 'conflict' };
      return verified({ id: item.id, name: item.name });
    },
  });
}
async function updateItem(recovery, api, key, itemId, fields) {
  return recovery.operation(key, {
    before: async () => (await api.readItem(itemId)).fields,
    write: () => api.updateFields(itemId, fields),
    verify: async () => {
      const current = await api.readItem(itemId);
      return Object.entries(fields).every(([name, value]) => name === '__Sortorder' || current.fields[name] === value) ? verified({ id: itemId }) : unknown();
    },
  });
}
async function populateFields(recovery, api, key, itemId, node, sortOrder) {
  const blanks = Object.keys(node.fields).filter(name => node.fields[name] === '');
  const values = Object.fromEntries(Object.entries(node.fields).filter(([, value]) => value !== '').map(([name, value]) => [name, fieldValue(value)]));
  if (sortOrder !== undefined) values.__Sortorder = String(sortOrder);
  if (Object.keys(values).length) await updateItem(recovery, api, `${key}:fields`, itemId, values);
  for (const name of blanks) {
    const rule = node.fieldRules[name];
    const spaceKey = `${key}:blank:${name}:space`;
    const canUseSpace = !rule.required && ['Single-Line Text', 'Multi-Line Text'].includes(rule.type);
    if (!recovery.state.operations[spaceKey]) {
      const cleared = await recovery.operation(`${key}:blank:${name}:clear`, {
        before: async () => {
          const fields = (await api.readItem(itemId)).fields;
          if (!Object.hasOwn(fields, name)) throw new Blocked(key, 'blank field is not readable');
          return { value: fields[name] };
        },
        write: () => api.updateFields(itemId, { [name]: '' }),
        verify: async (result, before, saved) => {
          const current = (await api.readItem(itemId)).fields[name];
          if (current === '') return verified({ cleared: true });
          // Only a returned response PLUS unchanged read-back proves an ignored empty write.
          // A lost response is ambiguous; it must NOT trigger the whitespace fallback.
          if (result !== undefined && current === before.value && !saved?.cleared) return verified({ cleared: false });
          return unknown();
        },
      });
      if (cleared.cleared) continue;
      if (!canUseSpace) throw new Blocked(key, 'clear failed; whitespace is not allowed for this field type');
    }
    if (!canUseSpace) throw new Blocked(key, 'invalid blank fallback');
    await updateItem(recovery, api, spaceKey, itemId, { [name]: ' ' });
    recovery.exception(spaceKey, { phase: 'population', itemId, field: name, workaround: 'single space; not genuinely empty', followUp: 'Optional display text; visual spacing may remain.' });
  }
  const item = await api.readItem(itemId);
  if (!sameId(item.templateId, node.templateId) || item.name !== node.name) throw new Blocked(key, 'item identity/template changed');
  for (const [name, value] of Object.entries(node.fields)) {
    const permittedSpace = value === '' && item.fields[name] === ' ' && recovery.state.exceptions.some(x => sameId(x.itemId, itemId) && x.field === name);
    if (item.fields[name] !== fieldValue(value) && !permittedSpace) throw new Blocked(key, 'final field read-back differs from approved intent');
  }
  for (const [name, value] of Object.entries(item.fields)) {
    if (!name.startsWith('__') && !Object.hasOwn(node.fields, name) && (value === node.name || value === '$name')) throw new Blocked(key, `unspecified display field ${name} contains an item-name default`);
  }
}
async function populate({ directory, plan, api, initialize = false, observationSession }) {
  const recovery = openBuild({ directory, plan, initialize, observationSession });
  const datasourceItems = []; const issues = [];
  for (const section of plan.sections) {
    try {
      const folder = await api.resolvePath(section.folderPath);
      const parent = await createItem(recovery, api, section.key, section, folder.id);
      await populateFields(recovery, api, section.key, parent.id, section);
      const children = [];
      for (const [index, child] of (section.children || []).entries()) {
        const key = `${section.key}/child/${child.key}`;
        const item = await createItem(recovery, api, key, child, parent.id);
        await populateFields(recovery, api, key, item.id, child, (index + 1) * 100);
        children.push({ key: child.key, itemId: item.id });
      }
      const current = await api.readItem(parent.id);
      if (current.children.length !== children.length || !current.children.every((x, i) => sameId(x.id, children[i].itemId))) throw new Blocked(section.key, 'returned child order/count differs from the approved plan');
      datasourceItems.push({ key: section.key, componentName: section.componentName, itemId: parent.id, children });
    } catch (error) {
      if (error.code === 'AWAITING_TOOL' || recovery.poisoned || error.operation === 'checkpoint') throw error;
      issues.push({ key: section.key, status: error.code === 'REJECTED' ? 'failed' : 'needs-reconciliation', reason: error.code === 'BLOCKED' ? error.message : 'operation failed; inspect target through MCP' });
    }
  }
  const result = { ...recovery.summary(), planIdentity: fingerprint(intentOf(plan)), status: issues.length ? 'partial' : recovery.summary().status, datasourceItems, issues };
  atomicJson(path.join(directory, 'population-result.json'), result);
  projectResult(directory, 'populate', plan, result);
  return result;
}
module.exports = { populate, openBuild, createItem, updateItem, validatePlan, intentOf, sameId, fieldValue, xml, verified, unknown };
