'use strict';
const path = require('node:path');
const { BUILD_CONTRACT } = require('./contract.cjs');
const { projectResult } = require('./progress.cjs');
const { Recovery, Blocked, atomicJson, fingerprint } = require('./recovery.cjs');
const {
  validatePlan,
  openBuild,
  intentOf,
  sameId,
  fieldValue,
  verified,
  unknown,
} = require('./populate.cjs');

async function verifyDatasource(api, section, datasource, exceptions) {
  const parent = await api.readItem(datasource.itemId);
  const nodes = [{ spec: section, item: parent }];
  if (
    parent.children.length !== datasource.children.length ||
    !parent.children.every((x, i) => sameId(x.id, datasource.children[i].itemId))
  )
    throw new Blocked(section.key, 'datasource order/count changed');
  for (const [index, child] of (section.children || []).entries())
    nodes.push({ spec: child, item: await api.readItem(datasource.children[index].itemId) });
  for (const { spec, item } of nodes) {
    for (const [name, value] of Object.entries(spec.fields)) {
      const current = item.fields[name];
      const permittedSpace =
        value === '' &&
        current === ' ' &&
        exceptions.some((x) => sameId(x.itemId, item.id) && x.field === name);
      if (current !== fieldValue(value) && !permittedSpace)
        throw new Blocked(section.key, 'verified datasource fields changed');
    }
  }
}
// Live behaviour (probe 2026-10-19): add_component_on_page gives a new instance the FIRST
// Variant Definition of Presentation/Headless Variants/<Component>, ordered by __Sortorder then
// name. The MCP cannot change an instance's variant afterwards, so the planned variant is moved
// first just before the add and the order is restored straight after. Never blocks assembly.
const VARIANT_FIRST = '-100000';
const consumable = (error, recovery) =>
  error.code !== 'AWAITING_TOOL' && !recovery.poisoned && error.operation !== 'checkpoint';
function variantFolderPath(plan, section) {
  const { siteCollection, siteName } = plan.environment;
  if (!siteCollection || !siteName) throw new Blocked(section.key, 'site identity missing');
  return `/sitecore/content/${siteCollection}/${siteName}/Presentation/Headless Variants/${section.componentName}`;
}
const sameOrder = (children, order) =>
  children.length === order.length && children.every((x, i) => sameId(x.id, order[i]));
async function preferVariant(recovery, api, plan, section) {
  const folderPath = variantFolderPath(plan, section);
  return recovery.operation(`${section.key}:variant-first`, {
    before: async () => {
      const folder = await api.resolvePath(folderPath);
      const target = folder.children.filter((x) => x.name === section.variant);
      if (target.length !== 1)
        throw new Blocked(section.key, `variant ${section.variant} not found`);
      return {
        folderPath,
        order: folder.children.map((x) => x.id),
        variantId: target[0].id,
        alreadyFirst: sameId(folder.children[0].id, target[0].id),
      };
    },
    write: (before) =>
      before.alreadyFirst ? {} : api.updateFields(before.variantId, { __Sortorder: VARIANT_FIRST }),
    verify: async (_result, before, _saved, attempt = 0) => {
      const folder = await api.resolvePath(
        before.folderPath,
        attempt ? { fresh: `${section.key}:variant-first:${attempt}` } : undefined,
      );
      const first = sameId(folder.children[0]?.id, before.variantId);
      // An unconfirmed reorder only costs a manual variant click; the restore still runs.
      if (!first && attempt + 1 < recovery.attempts) return unknown();
      return verified({
        variantId: before.variantId,
        folderPath: before.folderPath,
        originalOrder: before.order,
        changed: !before.alreadyFirst,
        first,
      });
    },
  });
}
async function restoreVariant(recovery, api, section, prepared) {
  return recovery.operation(`${section.key}:variant-restore`, {
    before: async () => ({ variantId: prepared.variantId }),
    write: () => api.updateFields(prepared.variantId, { __Sortorder: '' }),
    verify: async (_result, _before, _saved, attempt = 0) => {
      const folder = await api.resolvePath(
        prepared.folderPath,
        attempt ? { fresh: `${section.key}:variant-restore:${attempt}` } : undefined,
      );
      if (sameOrder(folder.children, prepared.originalOrder)) return verified({ restored: true });
      // __Sortorder is not readable: report a differing order instead of guessing a value.
      return attempt + 1 < recovery.attempts ? unknown() : verified({ restored: false });
    },
  });
}
async function wireShared(recovery, api, section, datasource) {
  const target = section.sharedDesign;
  if (
    target?.approved !== true ||
    !target.pageId ||
    !target.existingInstanceId ||
    !Object.hasOwn(target, 'currentDatasource')
  )
    throw new Blocked(
      section.key,
      'shared-design target is missing or unapproved; obtain a repair decision',
    );
  const value = await recovery.operation(`${section.key}:shared-wire`, {
    before: async () => {
      const page = await api.readPage(target.pageId);
      const candidates = page.filter((x) => sameId(x.id, target.existingInstanceId));
      if (candidates.length !== 1 || !sameId(candidates[0].renderingId, section.renderingId))
        throw new Blocked(
          section.key,
          'shared rendering missing, incompatible or ambiguous; no structural repair authorised',
        );
      const current = candidates[0];
      if (String(current.datasourceId || '') !== String(target.currentDatasource || ''))
        throw new Blocked(section.key, 'shared datasource changed after target approval');
      return {
        page,
        previousDatasourceId: current.datasourceId || '',
        parameters: current.parameters || {},
        placeholder: current.placeholder,
        targetDatasourceId: datasource.itemId,
      };
    },
    write: (before) =>
      sameId(before.previousDatasourceId, datasource.itemId)
        ? {}
        : api.setDatasource(target.pageId, target.existingInstanceId, datasource.itemId),
    verify: async (_result, before, _saved, attempt = 0) => {
      const page = await api.readPage(
        target.pageId,
        attempt ? { fresh: `${section.key}:shared:verify:${attempt}` } : undefined,
      );
      const candidates = page.filter((x) => sameId(x.id, target.existingInstanceId));
      if (candidates.length !== 1) return unknown();
      const current = candidates[0];
      if (
        !sameId(current.renderingId, section.renderingId) ||
        current.placeholder !== before.placeholder ||
        fingerprint(current.parameters || {}) !== fingerprint(before.parameters)
      )
        return { state: 'conflict' };
      const untouched = before.page.filter((x) => !sameId(x.id, current.id));
      if (
        page.length !== before.page.length ||
        untouched.some(
          (old) => !page.some((x) => sameId(x.id, old.id) && fingerprint(x) === fingerprint(old)),
        )
      )
        return { state: 'conflict' };
      if (
        !sameId(before.targetDatasourceId, datasource.itemId) ||
        !sameId(current.datasourceId, datasource.itemId)
      )
        return unknown();
      return verified({
        key: section.key,
        pageId: target.pageId,
        placement: 'partial-design',
        componentInstanceId: current.id,
        datasourceId: datasource.itemId,
        previousDatasourceId: before.previousDatasourceId,
        placeholder: current.placeholder,
        parameters: before.parameters,
      });
    },
  });
  return value;
}

// Approved structural change (ADR 0009; probes 2026-10-19 on a page and the Footer partial
// design): the MCP cannot change an existing instance's variant, so an existing instance is
// replaced by a new one that takes the planned variant at add time. Sequence, each journaled
// and verified: variant first -> add after old -> restore order -> wire client datasource ->
// remove old. Returns null (caller keeps the old instance) when the variant cannot be applied
// before anything structural happened. `prefix` names the journal steps.
async function replaceInstance(recovery, api, plan, section, datasource, target, prefix) {
  const key = section.key;
  const ops = recovery.state.operations;
  const fresh = (step, attempt) => (attempt ? { fresh: `${key}:${step}:${attempt}` } : undefined);
  let prepared = null;
  let restored = null;
  const restore = async () => {
    if (!prepared?.changed || restored) return;
    restored =
      ops[`${key}:variant-restore`]?.status === 'verified'
        ? ops[`${key}:variant-restore`].value
        : await restoreVariant(recovery, api, section, prepared);
  };
  try {
    if (ops[`${key}:${prefix}-add`]) {
      // The add was issued with the earlier order: never reorder again.
      prepared =
        ops[`${key}:variant-first`]?.status === 'verified'
          ? ops[`${key}:variant-first`].value
          : null;
    } else {
      try {
        prepared = await preferVariant(recovery, api, plan, section);
      } catch (error) {
        if (!consumable(error, recovery)) throw error;
        return null; // Variant unavailable: no structural change.
      }
      if (!prepared.first) {
        await restore();
        return null; // Reorder unconfirmed: a new instance would not get the client variant.
      }
    }
    const added = await recovery.operation(`${key}:${prefix}-add`, {
      before: async () => {
        const page = await api.readPage(target.pageId);
        const candidates = page.filter((x) => sameId(x.id, target.existingInstanceId));
        if (candidates.length !== 1 || !sameId(candidates[0].renderingId, section.renderingId))
          throw new Blocked(key, 'instance to replace is missing, incompatible or ambiguous');
        const old = candidates[0];
        if (target.placeholder && old.placeholder !== target.placeholder)
          throw new Blocked(key, 'instance to replace is in a different placeholder');
        if (
          Object.hasOwn(target, 'currentDatasource') &&
          String(old.datasourceId || '') !== String(target.currentDatasource || '')
        )
          throw new Blocked(key, 'datasource of the instance changed after approval');
        return {
          page,
          oldId: old.id,
          placeholder: old.placeholder,
          previousDatasourceId: old.datasourceId || '',
        };
      },
      write: (before) =>
        api.addComponent({
          pageId: target.pageId,
          componentRenderingId: section.renderingId,
          placeholderPath: before.placeholder,
          componentItemName: `${plan.client} ${section.componentName} ${key}`,
          insertAfterComponentId: before.oldId,
        }),
      verify: async (_result, before, saved, attempt = 0) => {
        const page = await api.readPage(target.pageId, fresh(`${prefix}-add`, attempt));
        const candidates = saved
          ? page.filter((x) => sameId(x.id, saved.id))
          : page.filter((x) => !before.page.some((old) => sameId(old.id, x.id)));
        if (candidates.length !== 1) return unknown();
        const candidate = candidates[0];
        if (
          !sameId(candidate.renderingId, section.renderingId) ||
          candidate.placeholder !== before.placeholder ||
          (saved && fingerprint(saved.parameters) !== fingerprint(candidate.parameters || {}))
        )
          return { state: 'conflict' };
        if (
          !saved &&
          before.page.some(
            (old) => !page.some((x) => sameId(x.id, old.id) && fingerprint(x) === fingerprint(old)),
          )
        )
          return { state: 'conflict' };
        return verified({
          id: candidate.id,
          parameters: candidate.parameters || {},
          localDatasourceId: saved?.localDatasourceId ?? (candidate.datasourceId || ''),
          oldId: before.oldId,
          previousDatasourceId: before.previousDatasourceId,
        });
      },
    });
    await restore();
    await recovery.operation(`${key}:${prefix}-new-wire`, {
      before: async () => {
        const current = (await api.readPage(target.pageId)).find((x) => sameId(x.id, added.id));
        if (!current) throw new Blocked(key, 'replacement instance disappeared');
        return { datasourceId: current.datasourceId || '' };
      },
      write: (before) =>
        sameId(before.datasourceId, datasource.itemId)
          ? {}
          : api.setDatasource(target.pageId, added.id, datasource.itemId),
      verify: async (_result, _before, _saved, attempt = 0) => {
        const page = await api.readPage(target.pageId, fresh(`${prefix}-new-wire`, attempt));
        const current = page.find((x) => sameId(x.id, added.id));
        if (
          !current ||
          !sameId(current.renderingId, section.renderingId) ||
          fingerprint(current.parameters || {}) !== fingerprint(added.parameters)
        )
          return { state: 'conflict' };
        return sameId(current.datasourceId, datasource.itemId)
          ? verified({ id: added.id, datasourceId: datasource.itemId })
          : unknown();
      },
    });
    await recovery.operation(`${key}:${prefix}-remove-old`, {
      before: async () => {
        const page = await api.readPage(target.pageId);
        const replacement = page.find((x) => sameId(x.id, added.id));
        if (!replacement || !sameId(replacement.datasourceId, datasource.itemId))
          throw new Blocked(key, 'replacement is not wired; the old instance is kept');
        return { oldPresent: page.some((x) => sameId(x.id, added.oldId)) };
      },
      write: (before) => (before.oldPresent ? api.removeComponent(target.pageId, added.oldId) : {}),
      verify: async (_result, _before, _saved, attempt = 0) => {
        const page = await api.readPage(target.pageId, fresh(`${prefix}-remove-old`, attempt));
        const replacement = page.find((x) => sameId(x.id, added.id));
        if (!replacement || !sameId(replacement.datasourceId, datasource.itemId))
          return { state: 'conflict' };
        return page.some((x) => sameId(x.id, added.oldId))
          ? unknown()
          : verified({ removed: added.oldId });
      },
    });
    const applied = !!prepared && sameId(added.parameters?.FieldNames, prepared.variantId);
    return {
      key,
      replaced: true,
      componentInstanceId: added.id,
      previousInstanceId: added.oldId,
      datasourceId: datasource.itemId,
      previousDatasourceId: added.previousDatasourceId,
      localDatasourceId: added.localDatasourceId,
      parameters: added.parameters,
      variant: applied
        ? { name: section.variant, id: prepared.variantId, applied }
        : { name: section.variant, applied },
    };
  } catch (error) {
    // A reordered variant folder is shared site state: undo it even when a later step failed.
    if (consumable(error, recovery))
      try {
        await restore();
      } catch (restoreError) {
        if (!consumable(restoreError, recovery)) throw restoreError;
      }
    throw error;
  }
}
// Shared Header/Footer: requires the approved, inspected target; keeps the original step names.
async function replaceShared(recovery, api, plan, section, datasource) {
  const target = section.sharedDesign;
  if (
    target?.approved !== true ||
    !target.pageId ||
    !target.existingInstanceId ||
    !Object.hasOwn(target, 'currentDatasource')
  )
    throw new Blocked(
      section.key,
      'shared-design target is missing or unapproved; obtain a repair decision',
    );
  const replaced = await replaceInstance(
    recovery,
    api,
    plan,
    section,
    datasource,
    target,
    'shared',
  );
  return replaced && { ...replaced, pageId: target.pageId, placement: 'partial-design' };
}
async function assemble({
  directory,
  plan,
  population,
  api,
  initialize = false,
  observationSession,
}) {
  validatePlan(plan);
  if (!plan.pageId || population.planIdentity !== fingerprint(intentOf(plan)))
    throw new Blocked('assembly', 'missing page or population from different approved inputs');
  // A derived result file is not ownership evidence if the authoritative journal is lost.
  const contentRecovery = openBuild({ directory, plan });
  if (population.buildId !== contentRecovery.state.buildId)
    throw new Blocked('assembly', 'population result does not belong to this recovery record');
  const sharedTargets = plan.sections
    .filter((x) => x.placement === 'partial-design' && x.sharedDesign)
    .map((x) => x.sharedDesign);
  if (
    sharedTargets.some((target, i) =>
      sharedTargets
        .slice(0, i)
        .some(
          (other) =>
            sameId(target.pageId, other.pageId) &&
            sameId(target.existingInstanceId, other.existingInstanceId),
        ),
    )
  )
    throw new Blocked('assembly', 'one shared instance cannot represent two planned sections');
  const selected = plan.sections.map((x) => x.existingInstanceId).filter(Boolean);
  if (selected.some((id, i) => selected.slice(0, i).some((other) => sameId(id, other))))
    throw new Blocked('assembly', 'one existing instance cannot represent two planned sections');
  const recovery = new Recovery({
    file: path.join(directory, 'recovery-assembly.json'),
    contract: BUILD_CONTRACT,
    initialize,
    observationSession,
    intent: intentOf(plan),
    environment: plan.environment,
  });
  const instances = [];
  const issues = [];
  const variantTasks = [];
  // Instances this build is approved to remove; later checks must not treat their absence as drift.
  const plannedRemoval = new Set([
    ...(plan.removeInstances || []).map((x) => x.instanceId.toLowerCase()),
    ...plan.sections
      .filter((x) => x.replace === true && x.existingInstanceId)
      .map((x) => x.existingInstanceId.toLowerCase()),
  ]);
  const cleanupDatasources = [];
  const removed = [];
  const previousByPlaceholder = new Map();
  for (const section of plan.sections) {
    let prepared = null;
    let restored = null;
    const ops = recovery.state.operations;
    const restore = async () => {
      if (!prepared?.changed || restored) return;
      restored =
        ops[`${section.key}:variant-restore`]?.status === 'verified'
          ? ops[`${section.key}:variant-restore`].value
          : await restoreVariant(recovery, api, section, prepared);
      if (!restored.restored)
        variantTasks.push({
          key: section.key,
          action: `Check the variant order under ${prepared.folderPath}: ${section.variant} may no longer sort as before.`,
        });
    };
    try {
      const datasource = population.datasourceItems.find((x) => x.key === section.key);
      if (
        !datasource ||
        !section.renderingId ||
        (section.placement !== 'partial-design' && !section.placeholder)
      )
        throw new Blocked(section.key, 'section dependencies or placement are not verified');
      const owned = contentRecovery.state.operations[`${section.key}:create`];
      const operations = Object.entries(contentRecovery.state.operations).filter(
        ([key]) => key.startsWith(`${section.key}:`) || key.startsWith(`${section.key}/child/`),
      );
      if (
        !sameId(owned?.value?.id, datasource.itemId) ||
        operations.some(([, operation]) => operation.status !== 'verified') ||
        datasource.children.some(
          (child) =>
            !sameId(
              contentRecovery.state.operations[`${section.key}/child/${child.key}:create`]?.value
                ?.id,
              child.itemId,
            ),
        )
      )
        throw new Blocked(section.key, 'datasource ownership or operations are not verified');
      await recovery.observe(`${section.key}:datasource`, () =>
        verifyDatasource(api, section, datasource, contentRecovery.state.exceptions),
      );
      if (section.placement === 'partial-design') {
        const replaced =
          section.variant && section.sharedDesign?.replace === true
            ? await replaceShared(recovery, api, plan, section, datasource)
            : null;
        if (replaced) {
          instances.push(replaced);
          if (replaced.localDatasourceId) cleanupDatasources.push(replaced.localDatasourceId);
          if (!replaced.variant.applied)
            variantTasks.push({
              key: section.key,
              action: `Select variant ${section.variant} manually in Pages (not applied at add time).`,
            });
          continue;
        }
        instances.push(await wireShared(recovery, api, section, datasource));
        if (section.variant)
          variantTasks.push({
            key: section.key,
            action: `Shared rendering: select variant ${section.variant} manually in Pages.`,
          });
        continue;
      }
      if (section.existingInstanceId && section.variant && section.replace === true) {
        // Approved: replace the reused instance so the planned variant is applied in place.
        const replaced = await replaceInstance(
          recovery,
          api,
          plan,
          section,
          datasource,
          {
            pageId: plan.pageId,
            existingInstanceId: section.existingInstanceId,
            placeholder: section.placeholder,
          },
          'replace',
        );
        if (replaced) {
          if (replaced.localDatasourceId) cleanupDatasources.push(replaced.localDatasourceId);
          if (!replaced.variant.applied)
            variantTasks.push({
              key: section.key,
              action: `Select variant ${section.variant} manually in Pages (not applied at add time).`,
            });
          instances.push({
            ...replaced,
            datasourceId: datasource.itemId,
            placeholder: section.placeholder,
          });
          previousByPlaceholder.set(section.placeholder, replaced.componentInstanceId);
          continue;
        }
      }
      if (section.variant && section.existingInstanceId) {
        variantTasks.push({
          key: section.key,
          action: `Reused instance: select variant ${section.variant} manually in Pages.`,
        });
      } else if (section.variant) {
        const first = ops[`${section.key}:variant-first`];
        // Once an add was issued (verified or not) it used the earlier order: never reorder again.
        if (ops[`${section.key}:add`]) prepared = first?.status === 'verified' ? first.value : null;
        else
          try {
            prepared = await preferVariant(recovery, api, plan, section);
          } catch (error) {
            if (!consumable(error, recovery)) throw error;
            prepared = null; // Missing/unreadable variant: add with the default, task below.
          }
      }
      const previous = previousByPlaceholder.get(section.placeholder);
      const component = await recovery.operation(`${section.key}:add`, {
        before: async () => {
          const page = await api.readPage(plan.pageId);
          if (section.existingInstanceId) {
            const selected = page.find((x) => sameId(x.id, section.existingInstanceId));
            if (
              !selected ||
              !sameId(selected.renderingId, section.renderingId) ||
              selected.placeholder !== section.placeholder
            )
              throw new Blocked(section.key, 'explicitly selected instance does not match');
          } else if (
            page.some(
              (x) =>
                sameId(x.renderingId, section.renderingId) &&
                sameId(x.datasourceId, datasource.itemId),
            )
          ) {
            throw new Blocked(section.key, 'matching remote instance without operation evidence');
          }
          return { page, datasourceId: datasource.itemId };
        },
        write: () =>
          section.existingInstanceId
            ? { id: section.existingInstanceId }
            : api.addComponent({
                pageId: plan.pageId,
                componentRenderingId: section.renderingId,
                placeholderPath: section.placeholder,
                componentItemName: `${plan.client} ${section.componentName} ${section.key}`,
                ...(previous ? { insertAfterComponentId: previous } : {}),
              }),
        verify: async (result, before, saved, attempt = 0) => {
          const page = await api.readPage(
            plan.pageId,
            attempt ? { fresh: `${section.key}:add:verify:${attempt}` } : undefined,
          );
          if (!sameId(before.datasourceId, datasource.itemId)) return { state: 'conflict' };
          const added = section.existingInstanceId
            ? page.filter((x) => sameId(x.id, section.existingInstanceId))
            : page.filter((x) => !before.page.some((old) => sameId(x.id, old.id)));
          // On later sections, earlier snapshots also see subsequent build additions: use the saved instance ID.
          const candidates = saved ? page.filter((x) => sameId(x.id, saved.id)) : added;
          if (candidates.length !== 1) return unknown();
          const candidate = candidates[0];
          if (
            !sameId(candidate.renderingId, section.renderingId) ||
            candidate.placeholder !== section.placeholder ||
            (result?.id && !sameId(result.id, candidate.id)) ||
            (saved && fingerprint(saved.parameters) !== fingerprint(candidate.parameters || {}))
          )
            return { state: 'conflict' };
          // Do not accept unrelated baseline modifications as our timed-out add.
          if (
            !saved &&
            before.page.some(
              (old) =>
                !page.some((x) => sameId(x.id, old.id) && fingerprint(x) === fingerprint(old)),
            )
          )
            return { state: 'conflict' };
          return verified({ id: candidate.id, parameters: candidate.parameters || {} });
        },
      });
      // The instance stores its variant at add time; restore the folder order immediately.
      await restore();
      let variant;
      if (section.variant) {
        const applied = !!prepared && sameId(component.parameters?.FieldNames, prepared.variantId);
        variant = applied
          ? { name: section.variant, id: prepared.variantId, applied }
          : { name: section.variant, applied };
        if (!applied && !section.existingInstanceId)
          variantTasks.push({
            key: section.key,
            action: `Select variant ${section.variant} manually in Pages (not applied at add time).`,
          });
      }
      await recovery.operation(`${section.key}:wire`, {
        before: async () => {
          const page = await api.readPage(plan.pageId);
          const current = page.find((x) => sameId(x.id, component.id));
          if (!current) throw new Blocked(section.key, 'instance disappeared');
          return { page, datasourceId: current.datasourceId, target: datasource.itemId };
        },
        write: (before) =>
          sameId(before.datasourceId, datasource.itemId)
            ? {}
            : api.setDatasource(plan.pageId, component.id, datasource.itemId),
        verify: async (_result, before, _saved, attempt = 0) => {
          const page = await api.readPage(
            plan.pageId,
            attempt ? { fresh: `${section.key}:wire:verify:${attempt}` } : undefined,
          );
          const current = page.find((x) => sameId(x.id, component.id));
          if (
            !current ||
            !sameId(current.renderingId, section.renderingId) ||
            current.placeholder !== section.placeholder ||
            fingerprint(current.parameters || {}) !== fingerprint(component.parameters)
          )
            return { state: 'conflict' };
          if (
            before.page.some(
              (old) =>
                !sameId(old.id, component.id) &&
                !plannedRemoval.has(String(old.id).toLowerCase()) &&
                !page.some((x) => sameId(x.id, old.id) && fingerprint(x) === fingerprint(old)),
            )
          )
            return { state: 'conflict' };
          return sameId(before.target, datasource.itemId) &&
            sameId(current.datasourceId, datasource.itemId)
            ? verified({ id: component.id, datasourceId: datasource.itemId })
            : unknown();
        },
      });
      // add_component_on_page creates a placeholder datasource; list it for manual cleanup.
      const local = ops[`${section.key}:wire`]?.before?.datasourceId;
      if (!section.existingInstanceId && local && !sameId(local, datasource.itemId))
        cleanupDatasources.push(local);
      instances.push({
        key: section.key,
        componentInstanceId: component.id,
        datasourceId: datasource.itemId,
        placeholder: section.placeholder,
        parameters: component.parameters,
        ...(variant ? { variant } : {}),
      });
      previousByPlaceholder.set(section.placeholder, component.id);
    } catch (error) {
      if (!consumable(error, recovery)) throw error;
      // A reordered variant folder is shared site state: restore it even when the add failed.
      try {
        await restore();
      } catch (restoreError) {
        if (!consumable(restoreError, recovery)) throw restoreError;
        variantTasks.push({
          key: section.key,
          action: `Check the variant order under ${prepared.folderPath}: restoring ${section.variant} was not verified.`,
        });
      }
      issues.push({
        key: section.key,
        status: 'needs-reconciliation',
        reason: error.code === 'BLOCKED' ? error.message : 'assembly outcome not verified',
      });
      if (section.placement !== 'partial-design') break; // Unknown page placement blocks its order-dependent chain.
    }
  }
  if (!issues.length) {
    const page = await api.readPage(plan.pageId);
    for (const placeholder of previousByPlaceholder.keys()) {
      const expected = instances.filter(
        (x) => x.placement !== 'partial-design' && x.placeholder === placeholder,
      );
      const actual = page.filter(
        (x) =>
          x.placeholder === placeholder &&
          expected.some((e) => sameId(e.componentInstanceId, x.id)),
      );
      if (
        actual.length !== expected.length ||
        actual.some(
          (x, i) =>
            !sameId(x.id, expected[i].componentInstanceId) ||
            !sameId(x.datasourceId, expected[i].datasourceId) ||
            fingerprint(x.parameters || {}) !== fingerprint(expected[i].parameters),
        )
      )
        issues.push({
          key: placeholder,
          status: 'needs-reconciliation',
          reason: 'final order or datasource verification failed',
        });
    }
  }
  // Approved removal of leftover starter components (plan.removeInstances), only once the page
  // assembled cleanly. Same rules as every write: verified by read-back, never repeated.
  if (!issues.length)
    for (const target of plan.removeInstances || []) {
      const step = `remove:${target.instanceId}`;
      try {
        await recovery.operation(step, {
          before: async () => {
            const current = (await api.readPage(plan.pageId)).find((x) =>
              sameId(x.id, target.instanceId),
            );
            if (current && !sameId(current.renderingId, target.renderingId))
              throw new Blocked(step, 'instance to remove no longer has its approved rendering');
            return { present: !!current };
          },
          write: (before) =>
            before.present ? api.removeComponent(plan.pageId, target.instanceId) : {},
          verify: async (_result, _before, _saved, attempt = 0) => {
            const page = await api.readPage(
              plan.pageId,
              attempt ? { fresh: `${step}:${attempt}` } : undefined,
            );
            return page.some((x) => sameId(x.id, target.instanceId))
              ? unknown()
              : verified({ removed: target.instanceId });
          },
        });
        removed.push({
          instanceId: target.instanceId,
          ...(target.reason ? { reason: target.reason } : {}),
        });
      } catch (error) {
        if (!consumable(error, recovery)) throw error;
        issues.push({
          key: step,
          status: 'needs-reconciliation',
          reason: error.code === 'BLOCKED' ? error.message : 'removal outcome not verified',
        });
      }
    }
  const result = {
    ...recovery.summary(),
    status:
      issues.length ||
      population.status !== 'complete' ||
      contentRecovery.summary().status !== 'complete'
        ? 'partial'
        : recovery.summary().status,
    instances,
    issues,
    removed,
    // Placeholder datasources created by add_component_on_page; delete them in Content Editor.
    cleanupDatasources,
    manualTasks: [
      ...instances
        .filter((x) => x.placement === 'partial-design')
        .map((x) =>
          x.replaced
            ? {
                key: x.key,
                action: `Shared instance replaced (previous ${x.previousInstanceId}). Delete the auto-created datasource ${x.localDatasourceId} in Content Editor.`,
                previousInstanceId: x.previousInstanceId,
                previousDatasourceId: x.previousDatasourceId,
              }
            : {
                key: x.key,
                action: 'Datasource switched and verified; variant selection remains manual.',
                previousDatasourceId: x.previousDatasourceId,
              },
        ),
      ...variantTasks,
    ],
  };
  atomicJson(path.join(directory, 'assembly-result.json'), result);
  projectResult(directory, 'assemble', plan, result);
  return result;
}
module.exports = { assemble };
