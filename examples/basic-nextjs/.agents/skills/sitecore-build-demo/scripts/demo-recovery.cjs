#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { FileBridge } = require('./lib/file-bridge.cjs');
const { marketer } = require('./lib/marketer.cjs');
const { populate, validatePlan, intentOf } = require('./lib/populate.cjs');
const { assemble } = require('./lib/assemble.cjs');
const { Recovery, fingerprint, Blocked } = require('./lib/recovery.cjs');

const args = process.argv.slice(2);
const arg = key => { const index = args.indexOf(`--${key}`); return index < 0 ? undefined : args[index + 1]; };
async function main() {
  if (args.includes('--help') || !args.length) {
    console.log(`Usage: node demo-recovery.cjs --plan <execution-plan.json> --directory <demo-dir>
  --phase populate|assemble [--initialize] [--begin]
  --claim <request-id>
  --reply <request-id> --result <MCP-result.json>

The same plan, directory and phase are required on every invocation.
--initialize is only for an explicitly approved NEW build, never a reset.
--begin discards cached observations when resuming after a session break.
No Sitecore connection is opened: awaiting-tool output must be handled by the
agent's authenticated marketer MCP. Claim BEFORE calling; reply BEFORE stepping.
Never repeat a claimed mutation after a crash. See references/recovery.md.
`);
    return;
  }
  if (!arg('plan') || !arg('directory') || !['populate', 'assemble'].includes(arg('phase'))) throw new Blocked('arguments', 'plan, directory and populate/assemble phase are required');
  const directory = path.resolve(arg('directory'));
  const plan = JSON.parse(fs.readFileSync(arg('plan'), 'utf8'));
  validatePlan(plan);
  const phase = arg('phase');
  const bridgeFile = path.join(directory, `mcp-${phase}.json`);
  const journalFile = path.join(directory, phase === 'populate' ? 'recovery-content.json' : 'recovery-assembly.json');
  if (fs.existsSync(bridgeFile) !== fs.existsSync(journalFile)) throw new Blocked('recovery', 'missing companion record; initialization cannot replace lost state');
  if (fs.existsSync(journalFile)) new Recovery({ file: journalFile, intent: intentOf(plan), environment: plan.environment });
  const bridge = new FileBridge({ file: bridgeFile, identity: fingerprint({ intent: intentOf(plan), environment: plan.environment }), initialize: args.includes('--initialize') });
  if (arg('claim')) { console.log(JSON.stringify(bridge.claim(arg('claim')), null, 2)); return; }
  if (arg('reply')) {
    if (!arg('result')) throw new Blocked('reply', 'result file required');
    let response = JSON.parse(fs.readFileSync(arg('result'), 'utf8'));
    if (response?.isError || response?.error || response?.errors?.length) response = { isError: true, content: [{ type: 'text', text: 'MCP operation failed; outcome unverified.' }] };
    bridge.reply(arg('reply'), response);
    console.log('Response recorded. Run the phase again without --initialize.'); return;
  }
  if (args.includes('--begin')) bridge.begin();
  const options = { directory, plan, api: marketer(bridge.call.bind(bridge)), observationSession: bridge.state.session, initialize: args.includes('--initialize') };
  try {
    const result = phase === 'populate' ? await populate(options) : await assemble({ ...options, population: JSON.parse(fs.readFileSync(path.join(directory, 'population-result.json'), 'utf8')) });
    bridge.finish();
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.status === 'complete' ? 0 : 2;
  } catch (error) {
    if (error.code !== 'AWAITING_TOOL') throw error;
    console.log(JSON.stringify({ status: 'awaiting-tool', request: error.request }, null, 2));
    // Awaiting-tool is a handoff, not failure and not verified completion.
  }
}
main().catch(error => {
  console.error(error.code === 'BLOCKED' ? error.message : 'Execution stopped: inspect local inputs/recovery state; no automatic reset performed.');
  process.exitCode = 2;
});
