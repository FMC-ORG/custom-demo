'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const yaml = require('js-yaml');
const { readSkills } = require('./skills');

const EVAL_FILE = 'tools/agents/evals/routing.yaml';
const AGENTS = ['pi', 'claude'];
const TIMEOUT_MS = 180_000;

const question = (prompt) =>
  [
    'You are being evaluated on skill routing. Do not use any tools and do not perform the task.',
    'Reply with exactly one line: the name of the single skill you would load first for the request below,',
    'or `none` if no available skill applies or the matching skill may only be started explicitly by the user.',
    '',
    `Request: ${prompt}`,
  ].join('\n');

/** Command line per agent. Pi project skills need trust, hence --approve (this run only, nothing saved). */
function command(agent, prompt, env) {
  if (agent === 'pi') {
    const args = ['--approve'];
    if (env.PI_PROVIDER) args.push('--provider', env.PI_PROVIDER);
    if (env.PI_MODEL) args.push('--model', env.PI_MODEL);
    return ['pi', [...args, '-p', question(prompt)]];
  }
  return ['claude', ['-p', question(prompt)]];
}

/**
 * Default executor: run the agent headless from the app root.
 * @returns {{ status: 'ok', output: string } | { status: 'missing' } | { status: 'error', output: string }}
 */
function execAgent(agent, prompt, cwd) {
  const [bin, args] = command(agent, prompt, process.env);
  const res = spawnSync(bin, args, { cwd, encoding: 'utf8', timeout: TIMEOUT_MS });
  if (res.error?.code === 'ENOENT') return { status: 'missing' };
  if (res.error || res.status !== 0) {
    // Some CLIs (e.g. claude) print failures to stdout, so include both streams.
    const output = [res.error?.message, res.stderr, res.stdout].filter((s) => s && s.trim()).join('\n').trim();
    return { status: 'error', output: output || `exited with status ${res.status}` };
  }
  return { status: 'ok', output: res.stdout };
}

/** Pull the chosen skill out of a free-form answer (tolerates markdown, numbering, extra lines). */
function parseAnswer(output, skillNames) {
  const lines = String(output).split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.reverse()) {
    const lower = line.toLowerCase();
    // "None. `sitecore-build-demo` is command-only" — a leading none wins over names in the explanation.
    const head = lower.replace(/^[^a-z0-9]*(\d+[.)]\s*)?[^a-z0-9]*/, '');
    if (/^none\b/.test(head)) return 'none';
    const named = [...skillNames].filter((n) => lower.includes(n)).sort((a, b) => b.length - a.length)[0];
    if (named) return named;
    if (/\bnone\b/.test(lower)) return 'none';
  }
  return null;
}

function flag(args, name) {
  const values = [];
  args.forEach((a, i) => a === name && args[i + 1] && values.push(args[i + 1]));
  return values;
}

/**
 * Run routing evals against headless agents.
 * @param {string} cwd App root
 * @param {string[]} args `--agent <pi|claude>` and `--case <id>`, both repeatable
 * @param {(agent: string, prompt: string, cwd: string) => object} [exec] injectable for tests
 */
function evaluate(cwd, args = [], exec = execAgent) {
  const file = path.join(cwd, EVAL_FILE);
  if (!fs.existsSync(file)) {
    return { exitCode: 1, messages: [{ level: 'error', rule: 'eval-missing', file: EVAL_FILE, message: 'routing eval file not found' }] };
  }
  const skillNames = new Set(readSkills(cwd).map((s) => s.frontmatter?.name).filter(Boolean));
  const caseIds = flag(args, '--case');
  const agents = flag(args, '--agent').length ? flag(args, '--agent') : AGENTS;
  const cases = (yaml.load(fs.readFileSync(file, 'utf8'))?.cases ?? []).filter((c) => !caseIds.length || caseIds.includes(c.id));

  const messages = [];
  let failed = 0;
  for (const agent of agents) {
    let passed = 0;
    let ran = 0;
    for (const c of cases) {
      const result = exec(agent, c.prompt, cwd);
      if (result.status === 'missing') {
        messages.push({ level: 'info', rule: 'eval-skipped', file: agent, message: `\`${agent}\` is not installed; skipped` });
        break;
      }
      ran += 1;
      const got = result.status === 'ok' ? parseAnswer(result.output, skillNames) : null;
      if (got === c.expect) {
        passed += 1;
        messages.push({ level: 'info', rule: 'eval-pass', file: `${agent}:${c.id}`, message: got });
      } else {
        failed += 1;
        const detail = result.status === 'ok' ? `got ${got ?? 'no skill name'}` : `agent error: ${result.output.split('\n')[0]}`;
        messages.push({ level: 'error', rule: 'eval-fail', file: `${agent}:${c.id}`, message: `expected ${c.expect}, ${detail}` });
      }
    }
    if (ran) messages.push({ level: 'info', rule: 'eval-summary', file: agent, message: `${passed}/${ran} cases routed as expected` });
  }
  return { exitCode: failed ? 1 : 0, messages };
}

module.exports = { evaluate, parseAnswer, EVAL_FILE };
