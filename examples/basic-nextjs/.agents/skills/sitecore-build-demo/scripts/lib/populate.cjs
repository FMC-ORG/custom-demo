'use strict';
const path = require('node:path');
const { BUILD_CONTRACT } = require('./contract.cjs');
const { projectResult } = require('./progress.cjs');
const { Recovery, Blocked, atomicJson, fingerprint } = require('./recovery.cjs');
const id = (value) =>
  String(value || '')
    .replace(/[{}-]/g, '')
    .toLowerCase();
const sameId = (a, b) => id(a) === id(b) && !!id(a);
const verified = (value) => ({ state: 'verified', value });
const unknown = () => ({ state: 'unknown' });
const xml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;');
function fieldValue(value) {
  if (value && typeof value === 'object') {
    if (typeof value.href !== 'string')
      throw new Blocked('field', 'unsupported field value; supply verified XML or a link object');
    return `<link text="${xml(value.text)}" anchor="" linktype="external" class="" title="" target="${xml(value.target)}" querystring="" url="${xml(value.href)}" />`;
  }
  if (typeof value !== 'string')
    throw new Blocked('field', 'field values must be strings or link objects');
  return value;
}
function intentOf(plan) {
  return {
    contract: plan.contract,
    targetReview: plan.targetReview,
    approved: plan.approved,
    client: plan.client,
    pageId: plan.pageId,
    sections: plan.sections.map((s) => ({
      key: s.key,
      name: s.name,
      componentName: s.componentName,
      folderPath: s.folderPath,
      templateId: s.templateId,
      fields: s.fields,
      fieldRules: s.fieldRules,
      children: (s.children || []).map((c) => ({
        key: c.key,
        name: c.name,
        templateId: c.templateId,
        fields: c.fields,
        fieldRules: c.fieldRules,
      })),
      renderingId: s.renderingId,
      placeholder: s.placeholder,
      placement: s.placement,
      existingInstanceId: s.existingInstanceId,
      sharedDesign: s.sharedDesign,
      // Optional; omitted from the identity when absent so earlier plans keep their fingerprint.
      ...(s.variant !== undefined ? { variant: s.variant } : {}),
      ...(s.replace !== undefined ? { replace: s.replace } : {}),
    })),
    // Approved removals of leftover page components; omitted when absent (stable fingerprint).
    ...(plan.removeInstances !== undefined ? { removeInstances: plan.removeInstances } : {}),
  };
}
function validatePlan(plan) {
  if (plan?.contract !== BUILD_CONTRACT)
    throw new Blocked(
      'plan',
      'incompatible pipeline contract; use an explicitly approved fresh build scope and workspace',
    );
  if (!['starter', 'fresh', 'existing-client'].includes(plan.targetReview?.classification))
    throw new Blocked(
      'plan',
      'target inspection must classify the existing experience before approval',
    );
  if (
    plan.targetReview.classification === 'existing-client' &&
    plan.targetReview.repurposeApproved !== true
  )
    throw new Blocked(
      'plan',
      'explicit repurpose approval required for an existing client experience',
    );
  if (
    plan.approved !== true ||
    !plan.client ||
    !plan.environment?.dataRoot ||
    !plan.environment?.marker ||
    !Array.isArray(plan.sections) ||
    !plan.sections.length
  )
    throw new Blocked('plan', 'approved normalized plan and environment identity required');
  if (plan.removeInstances !== undefined) {
    const planned = new Set(
      plan.sections.map((x) => String(x.existingInstanceId || '').toLowerCase()),
    );
    if (
      !Array.isArray(plan.removeInstances) ||
      plan.removeInstances.some(
        (x) =>
          !x ||
          typeof x.instanceId !== 'string' ||
          !x.instanceId ||
          typeof x.renderingId !== 'string' ||
          !x.renderingId ||
          planned.has(x.instanceId.toLowerCase()),
      )
    )
      throw new Blocked(
        'plan',
        'removeInstances needs approved instance and rendering IDs not used by a planned section',
      );
  }
  const keys = new Set();
  for (const section of plan.sections) {
    if (
      !section.key ||
      keys.has(section.key) ||
      !section.folderPath?.startsWith(`${plan.environment.dataRoot}/`) ||
      /\/(?:\.|\.\.)(?:\/|$)/.test(section.folderPath)
    )
      throw new Blocked('plan', 'duplicate section or datasource outside data root');
    if (
      section.variant !== undefined &&
      (typeof section.variant !== 'string' || !/^[A-Za-z0-9_-]+$/.test(section.variant))
    )
      throw new Blocked('plan', 'variant must be a Variant Definition item name');
    if (
      section.sharedDesign?.replace !== undefined &&
      typeof section.sharedDesign.replace !== 'boolean'
    )
      throw new Blocked('plan', 'sharedDesign.replace must be an explicit true/false approval');
    if (section.replace !== undefined && typeof section.replace !== 'boolean')
      throw new Blocked('plan', 'replace must be an explicit true/false approval');
    keys.add(section.key);
    const childKeys = new Set();
    for (const node of [section, ...(section.children || [])]) {
      if (
        !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(node.key || '') ||
        !node.name ||
        /[\/\\]/.test(node.name) ||
        !node.templateId ||
        !node.fields ||
        !node.fieldRules
      )
        throw new Blocked('plan', 'item identity and explicit field rules required');
      if (node !== section) {
        if (childKeys.has(node.key)) throw new Blocked('plan', 'duplicate child key');
        childKeys.add(node.key);
      }
      for (const [name, rule] of Object.entries(node.fieldRules)) {
        if (typeof rule.required !== 'boolean' || !rule.type || name.startsWith('__'))
          throw new Blocked('plan', 'invalid field rule');
        if (rule.required && !Object.hasOwn(node.fields, name))
          throw new Blocked('plan', 'required field is unspecified');
      }
      for (const [name, value] of Object.entries(node.fields)) {
        if (
          name.startsWith('__') ||
          !node.fieldRules[name]?.type ||
          typeof node.fieldRules[name].required !== 'boolean'
        )
          throw new Blocked(
            'plan',
            'field type/required intent must be explicit; system fields are managed by the helper',
          );
        fieldValue(value);
        if (
          node.fieldRules[name].required &&
          (typeof value === 'string' ? !value.trim() : !value.href)
        )
          throw new Blocked('plan', 'required field has no content');
      }
    }
  }
}
function openBuild({ directory, plan, initialize, observationSession }) {
  validatePlan(plan);
  return new Recovery({
    file: path.join(directory, 'recovery-content.json'),
    contract: BUILD_CONTRACT,
    initialize,
    observationSession,
    intent: intentOf(plan),
    environment: plan.environment,
  });
}
async function createItem(recovery, api, key, node, parentId) {
  return recovery.operation(`${key}:create`, {
    before: async () => {
      const parent = await api.readItem(parentId);
      if (parent.children.some((x) => x.name === node.name))
        throw new Blocked(key, 'matching item exists without ownership evidence');
      return { parentId, parentPath: parent.path, children: parent.children.map((x) => x.id) };
    },
    write: () => api.createItem({ parentId, templateId: node.templateId, name: node.name }),
    verify: async (result, before, saved, attempt = 0) => {
      // Attempt 0 follows the write, which already invalidated cached reads; later attempts
      // must each observe current remote state rather than the previous attempt's answer.
      const fresh = attempt ? { fresh: `${key}:verify:${attempt}` } : undefined;
      const known = saved?.id || result?.id;
      if (known) {
        // The returned ID is authoritative: the parent's children listing can lag a create.
        if (before.children.some((old) => sameId(old, known))) return { state: 'conflict' };
        const item = await api.readItem(known, fresh); // not yet readable -> retried as unknown
        if (!sameId(item.templateId, node.templateId) || item.name !== node.name)
          return { state: 'conflict' };
        const parentPath = before.parentPath || (await api.readItem(parentId, fresh)).path;
        if (!parentPath || !item.path) return unknown();
        if (item.path.toLowerCase() !== `${parentPath}/${node.name}`.toLowerCase())
          return { state: 'conflict' };
        return verified({ id: item.id, name: item.name });
      }
      // No returned identity (lost response): only a single new, matching child is ours.
      const parent = await api.readItem(parentId, fresh);
      const added = parent.children.filter(
        (x) => !before.children.some((old) => sameId(old, x.id)) && x.name === node.name,
      );
      if (added.length > 1) return { state: 'conflict' };
      if (!added.length) return unknown();
      const item = await api.readItem(added[0].id, fresh);
      if (!sameId(item.templateId, node.templateId)) return { state: 'conflict' };
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
      return Object.entries(fields).every(
        ([name, value]) => name === '__Sortorder' || current.fields[name] === value,
      )
        ? verified({ id: itemId })
        : unknown();
    },
  });
}
async function populateFields(recovery, api, key, itemId, node, sortOrder) {
  const blanks = Object.keys(node.fields).filter((name) => node.fields[name] === '');
  const values = Object.fromEntries(
    Object.entries(node.fields)
      .filter(([, value]) => value !== '')
      .map(([name, value]) => [name, fieldValue(value)]),
  );
  if (sortOrder !== undefined) values.__Sortorder = String(sortOrder);
  if (Object.keys(values).length) await updateItem(recovery, api, `${key}:fields`, itemId, values);
  for (const name of blanks) {
    const rule = node.fieldRules[name];
    const spaceKey = `${key}:blank:${name}:space`;
    const canUseSpace =
      !rule.required && ['Single-Line Text', 'Multi-Line Text'].includes(rule.type);
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
          if (result !== undefined && current === before.value && !saved?.cleared)
            return verified({ cleared: false });
          return unknown();
        },
      });
      if (cleared.cleared) continue;
      if (!canUseSpace)
        throw new Blocked(key, 'clear failed; whitespace is not allowed for this field type');
    }
    if (!canUseSpace) throw new Blocked(key, 'invalid blank fallback');
    await updateItem(recovery, api, spaceKey, itemId, { [name]: ' ' });
    recovery.exception(spaceKey, {
      phase: 'population',
      itemId,
      field: name,
      workaround: 'single space; not genuinely empty',
      followUp: 'Optional display text; visual spacing may remain.',
    });
  }
  await recovery.observe(`${key}:final-fields`, async () => {
    const item = await api.readItem(itemId);
    if (!sameId(item.templateId, node.templateId) || item.name !== node.name)
      throw new Blocked(key, 'item identity/template changed');
    for (const [name, value] of Object.entries(node.fields)) {
      const permittedSpace =
        value === '' &&
        item.fields[name] === ' ' &&
        recovery.state.exceptions.some((x) => sameId(x.itemId, itemId) && x.field === name);
      if (item.fields[name] !== fieldValue(value) && !permittedSpace)
        throw new Blocked(key, 'final field read-back differs from approved intent');
    }
    for (const [name, value] of Object.entries(item.fields)) {
      if (
        !name.startsWith('__') &&
        !Object.hasOwn(node.fields, name) &&
        (value === node.name || value === '$name')
      )
        throw new Blocked(key, `unspecified display field ${name} contains an item-name default`);
    }
  });
}
async function populate({ directory, plan, api, initialize = false, observationSession }) {
  const recovery = openBuild({ directory, plan, initialize, observationSession });
  const datasourceItems = [];
  const issues = [];
  for (const section of plan.sections) {
    try {
      const folder = await recovery.observe(`folder:${section.folderPath}`, async () => ({
        id: (await api.resolvePath(section.folderPath)).id,
      }));
      const parent = await createItem(recovery, api, section.key, section, folder.id);
      await populateFields(recovery, api, section.key, parent.id, section);
      const children = [];
      for (const [index, child] of (section.children || []).entries()) {
        const key = `${section.key}/child/${child.key}`;
        const item = await createItem(recovery, api, key, child, parent.id);
        await populateFields(recovery, api, key, item.id, child, (index + 1) * 100);
        children.push({ key: child.key, itemId: item.id });
      }
      await recovery.observe(`${section.key}:final-order`, async () => {
        // The listing can trail recent creates and sort-order updates: re-read freshly
        // a few times before treating a mismatch as real.
        for (let attempt = 0; ; attempt++) {
          const current = await api.readItem(
            parent.id,
            attempt ? { fresh: `${section.key}:final-order:${attempt}` } : undefined,
          );
          if (
            current.children.length === children.length &&
            current.children.every((x, i) => sameId(x.id, children[i].itemId))
          )
            return;
          if (attempt + 1 >= recovery.attempts)
            throw new Blocked(
              section.key,
              'returned child order/count differs from the approved plan',
            );
        }
      });
      datasourceItems.push({
        key: section.key,
        componentName: section.componentName,
        itemId: parent.id,
        children,
      });
    } catch (error) {
      if (error.code === 'AWAITING_TOOL' || recovery.poisoned || error.operation === 'checkpoint')
        throw error;
      issues.push({
        key: section.key,
        status: error.code === 'REJECTED' ? 'failed' : 'needs-reconciliation',
        reason:
          error.code === 'BLOCKED' ? error.message : 'operation failed; inspect target through MCP',
      });
    }
  }
  const result = {
    ...recovery.summary(),
    planIdentity: fingerprint(intentOf(plan)),
    status: issues.length ? 'partial' : recovery.summary().status,
    datasourceItems,
    issues,
  };
  atomicJson(path.join(directory, 'population-result.json'), result);
  projectResult(directory, 'populate', plan, result);
  return result;
}
module.exports = {
  populate,
  openBuild,
  createItem,
  updateItem,
  validatePlan,
  intentOf,
  sameId,
  fieldValue,
  xml,
  verified,
  unknown,
};
