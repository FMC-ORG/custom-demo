'use strict';

const { sync } = require('./lib/sync');
const { lint } = require('./lib/lint');
const { setup } = require('./lib/setup');
const { evaluate } = require('./lib/eval');

const USAGE = `Usage: agents <command>

Commands:
  sync           Generate Claude Code / Cursor / Pi files from .agents/
  sync --check   Report generated files that are missing, stale, or out of date (writes nothing)
  lint           Validate canonical skills and AGENTS.md
  check          sync --check + lint (used by the pre-commit hook)
  setup          Install the git pre-commit hook
  eval           Run routing evals against headless agents (--agent pi|claude, --case <id>)`;

/**
 * Single entry point for the agents tooling. npm scripts and tests both call this.
 * @param {string[]} args
 * @param {{ cwd: string, exec?: Function }} options cwd = app root; exec = injectable agent runner (eval only)
 * @returns {{ exitCode: number, messages: { level: string, rule: string, file: string, message: string }[], filesWritten: string[] }}
 */
function run(args, { cwd, exec }) {
  const [command, ...rest] = args;
  const done = (result) => ({ filesWritten: [], ...result });

  switch (command) {
    case 'sync':
      return done(sync(cwd, { check: rest.includes('--check') }));
    case 'lint':
      return done(lint(cwd));
    case 'check': {
      const drift = sync(cwd, { check: true });
      const linted = lint(cwd);
      return done({ exitCode: drift.exitCode || linted.exitCode, messages: [...drift.messages, ...linted.messages] });
    }
    case 'setup':
      return done(setup(cwd));
    case 'eval':
      return done(evaluate(cwd, rest, exec));
    default:
      return done({ exitCode: command ? 1 : 0, messages: [{ level: command ? 'error' : 'info', rule: 'usage', file: '', message: USAGE }] });
  }
}

module.exports = { run };
