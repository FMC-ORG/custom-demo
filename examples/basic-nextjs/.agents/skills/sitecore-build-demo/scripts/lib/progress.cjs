'use strict';
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { atomicText } = require('./recovery.cjs');

/** Derived handoff views only. Recovery journals remain authoritative; never resume from these flags. */
function projectResult(directory, phase, plan, result) {
  const progressPath = path.join(directory, 'demo-progress.yaml');
  const progress = fs.existsSync(progressPath) ? yaml.load(fs.readFileSync(progressPath, 'utf8')) : {};
  progress.client ||= { name: plan.client };
  progress.client.lastUpdatedAt = new Date().toISOString();
  progress.phases ||= {};
  progress.sections ||= [];
  progress.exceptions ||= [];
  const phaseKey = phase === 'populate' ? 'phase3_content' : 'phase6_assembly';
  const counts = phase === 'populate' ? { completedSections: result.datasourceItems.length, totalSections: plan.sections.length } : { componentsAdded: result.instances.filter(x => !plan.sections.find(s => s.key === x.key).existingInstanceId).length, datasourcesWired: result.instances.length, totalComponents: plan.sections.filter(x => x.placement !== 'partial-design').length };
  progress.phases[phaseKey] = { ...progress.phases[phaseKey], ...counts, status: result.status, verification: 'automated read-back; visual QA and presentation readiness are separate' };
  for (const [position, section] of plan.sections.entries()) {
    let entry = progress.sections.find(x => x.key === section.key || (x.position === position + 1 && x.componentName === section.componentName));
    if (!entry) { entry = { key: section.key, position: position + 1, componentName: section.componentName }; progress.sections.push(entry); }
    entry.key = section.key;
    const data = phase === 'populate' ? result.datasourceItems.find(x => x.key === section.key) : result.instances.find(x => x.key === section.key);
    const detail = phase === 'populate' ? { fieldsPopulated: true, populatedFieldCount: Object.keys(section.fields).length + (section.children || []).reduce((total, child) => total + Object.keys(child.fields).length, 0), childrenCreated: data?.children.length || 0, childrenExpected: section.children?.length || 0 } : { datasourceWired: true };
    entry[phase === 'populate' ? 'phase3' : 'phase6'] = data ? { ...data, ...detail, status: phase === 'populate' ? 'populated' : 'wired', verified: true } : { status: section.placement === 'partial-design' && phase === 'assemble' ? 'skipped' : 'partial', verified: false };
  }
  for (const exception of result.exceptions || []) if (!progress.exceptions.some(x => x.key === exception.key)) progress.exceptions.push(exception);
  progress.recovery = { ...progress.recovery, [phase]: { status: result.status, issues: result.issues, manualTasks: result.manualTasks || [] } };
  atomicText(progressPath, yaml.dump(progress, { lineWidth: -1, noRefs: true }));
  if (phase === 'populate') {
    const contentPath = path.join(directory, 'content-map.yaml');
    if (fs.existsSync(contentPath)) {
      const content = yaml.load(fs.readFileSync(contentPath, 'utf8'));
      content.datasourceItems = result.datasourceItems.map(item => ({ ...item, itemName: plan.sections.find(x => x.key === item.key).name }));
      atomicText(contentPath, yaml.dump(content, { lineWidth: -1, noRefs: true }));
    }
  }
}
module.exports = { projectResult };
