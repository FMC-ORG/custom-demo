'use strict';
const path = require('node:path');
const { projectResult } = require('./progress.cjs');
const { Recovery, Blocked, atomicJson, fingerprint } = require('./recovery.cjs');
const { validatePlan, openBuild, intentOf, sameId, fieldValue, verified, unknown } = require('./populate.cjs');

async function verifyDatasource(api, section, datasource, exceptions) {
  const parent = await api.readItem(datasource.itemId);
  const nodes = [{ spec: section, item: parent }];
  if (parent.children.length !== datasource.children.length || !parent.children.every((x, i) => sameId(x.id, datasource.children[i].itemId))) throw new Blocked(section.key, 'datasource order/count changed');
  for (const [index, child] of (section.children || []).entries()) nodes.push({ spec: child, item: await api.readItem(datasource.children[index].itemId) });
  for (const { spec, item } of nodes) {
    for (const [name, value] of Object.entries(spec.fields)) {
      const current = item.fields[name];
      const permittedSpace = value === '' && current === ' ' && exceptions.some(x => sameId(x.itemId, item.id) && x.field === name);
      if (current !== fieldValue(value) && !permittedSpace) throw new Blocked(section.key, 'verified datasource fields changed');
    }
  }
}
async function assemble({ directory, plan, population, api, initialize = false, observationSession }) {
  validatePlan(plan);
  if (!plan.pageId || population.planIdentity !== fingerprint(intentOf(plan))) throw new Blocked('assembly', 'missing page or population from different approved inputs');
  // A derived result file is not ownership evidence if the authoritative journal is lost.
  const contentRecovery = openBuild({ directory, plan });
  if (population.buildId !== contentRecovery.state.buildId) throw new Blocked('assembly', 'population result does not belong to this recovery record');
  const selected = plan.sections.map(x => x.existingInstanceId).filter(Boolean);
  if (selected.some((id, i) => selected.slice(0, i).some(other => sameId(id, other)))) throw new Blocked('assembly', 'one existing instance cannot represent two planned sections');
  const recovery = new Recovery({ file: path.join(directory, 'recovery-assembly.json'), initialize, observationSession, intent: intentOf(plan), environment: plan.environment });
  const instances = []; const issues = []; const previousByPlaceholder = new Map();
  for (const section of plan.sections) {
    if (section.placement === 'partial-design') continue; // Explicit manual handoff, never switch shared designs.
    try {
      const datasource = population.datasourceItems.find(x => x.key === section.key);
      if (!datasource || !section.renderingId || !section.placeholder) throw new Blocked(section.key, 'section dependencies or placement are not verified');
      const owned = contentRecovery.state.operations[`${section.key}:create`];
      const operations = Object.entries(contentRecovery.state.operations).filter(([key]) => key.startsWith(`${section.key}:`) || key.startsWith(`${section.key}/child/`));
      if (!sameId(owned?.value?.id, datasource.itemId) || operations.some(([, operation]) => operation.status !== 'verified') || datasource.children.some(child => !sameId(contentRecovery.state.operations[`${section.key}/child/${child.key}:create`]?.value?.id, child.itemId))) throw new Blocked(section.key, 'datasource ownership or operations are not verified');
      await verifyDatasource(api, section, datasource, contentRecovery.state.exceptions);
      const previous = previousByPlaceholder.get(section.placeholder);
      const component = await recovery.operation(`${section.key}:add`, {
        before: async () => {
          const page = await api.readPage(plan.pageId);
          if (section.existingInstanceId) {
            const selected = page.find(x => sameId(x.id, section.existingInstanceId));
            if (!selected || !sameId(selected.renderingId, section.renderingId) || selected.placeholder !== section.placeholder) throw new Blocked(section.key, 'explicitly selected instance does not match');
          } else if (page.some(x => sameId(x.renderingId, section.renderingId) && sameId(x.datasourceId, datasource.itemId))) {
            throw new Blocked(section.key, 'matching remote instance without operation evidence');
          }
          return { page, datasourceId: datasource.itemId };
        },
        write: () => section.existingInstanceId ? { id: section.existingInstanceId } : api.addComponent({
          pageId: plan.pageId, componentRenderingId: section.renderingId, placeholderPath: section.placeholder,
          componentItemName: `${plan.client} ${section.componentName} ${section.key}`,
          ...(previous ? { insertAfterComponentId: previous } : {}),
        }),
        verify: async (result, before, saved) => {
          const page = await api.readPage(plan.pageId);
          if (!sameId(before.datasourceId, datasource.itemId)) return { state: 'conflict' };
          const added = section.existingInstanceId ? page.filter(x => sameId(x.id, section.existingInstanceId)) : page.filter(x => !before.page.some(old => sameId(x.id, old.id)));
          // On later sections, earlier snapshots also see subsequent build additions: use the saved instance ID.
          const candidates = saved ? page.filter(x => sameId(x.id, saved.id)) : added;
          if (candidates.length !== 1) return unknown();
          const candidate = candidates[0];
          if (!sameId(candidate.renderingId, section.renderingId) || candidate.placeholder !== section.placeholder ||
              (result?.id && !sameId(result.id, candidate.id)) ||
              (saved && fingerprint(saved.parameters) !== fingerprint(candidate.parameters || {}))) return { state: 'conflict' };
          // Do not accept unrelated baseline modifications as our timed-out add.
          if (!saved && before.page.some(old => !page.some(x => sameId(x.id, old.id) && fingerprint(x) === fingerprint(old)))) return { state: 'conflict' };
          return verified({ id: candidate.id, parameters: candidate.parameters || {} });
        },
      });
      await recovery.operation(`${section.key}:wire`, {
        before: async () => {
          const page = await api.readPage(plan.pageId);
          const current = page.find(x => sameId(x.id, component.id));
          if (!current) throw new Blocked(section.key, 'instance disappeared');
          return { page, datasourceId: current.datasourceId, target: datasource.itemId };
        },
        write: before => sameId(before.datasourceId, datasource.itemId) ? {} : api.setDatasource(plan.pageId, component.id, datasource.itemId),
        verify: async (_result, before) => {
          const page = await api.readPage(plan.pageId);
          const current = page.find(x => sameId(x.id, component.id));
          if (!current || !sameId(current.renderingId, section.renderingId) || current.placeholder !== section.placeholder || fingerprint(current.parameters || {}) !== fingerprint(component.parameters)) return { state: 'conflict' };
          if (before.page.some(old => !sameId(old.id, component.id) && !page.some(x => sameId(x.id, old.id) && fingerprint(x) === fingerprint(old)))) return { state: 'conflict' };
          return sameId(before.target, datasource.itemId) && sameId(current.datasourceId, datasource.itemId) ? verified({ id: component.id, datasourceId: datasource.itemId }) : unknown();
        },
      });
      instances.push({ key: section.key, componentInstanceId: component.id, datasourceId: datasource.itemId, placeholder: section.placeholder, parameters: component.parameters });
      previousByPlaceholder.set(section.placeholder, component.id);
    } catch (error) {
      if (error.code === 'AWAITING_TOOL' || recovery.poisoned || error.operation === 'checkpoint') throw error;
      issues.push({ key: section.key, status: 'needs-reconciliation', reason: error.code === 'BLOCKED' ? error.message : 'assembly outcome not verified' });
      break; // Unknown placement blocks the order-dependent chain.
    }
  }
  if (!issues.length) {
    const page = await api.readPage(plan.pageId);
    for (const placeholder of previousByPlaceholder.keys()) {
      const expected = instances.filter(x => x.placeholder === placeholder);
      const actual = page.filter(x => x.placeholder === placeholder && expected.some(e => sameId(e.componentInstanceId, x.id)));
      if (actual.length !== expected.length || actual.some((x, i) => !sameId(x.id, expected[i].componentInstanceId) || !sameId(x.datasourceId, expected[i].datasourceId) || fingerprint(x.parameters || {}) !== fingerprint(expected[i].parameters))) issues.push({ key: placeholder, status: 'needs-reconciliation', reason: 'final order or datasource verification failed' });
    }
  }
  const result = { ...recovery.summary(), status: issues.length || population.status !== 'complete' || contentRecovery.summary().status !== 'complete' ? 'partial' : recovery.summary().status, instances, issues,
    manualTasks: plan.sections.filter(x => x.placement === 'partial-design').map(x => ({ key: x.key, action: 'Assign datasource and variant in shared partial design only after approval.' })) };
  atomicJson(path.join(directory, 'assembly-result.json'), result);
  projectResult(directory, 'assemble', plan, result);
  return result;
}
module.exports = { assemble };
