'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { generate, LEDGER_FILE } = require('./generate');

/** @returns {string[]} files recorded by the previous sync */
function readLedger(cwd) {
  try {
    return JSON.parse(fs.readFileSync(path.join(cwd, LEDGER_FILE), 'utf8')).files ?? [];
  } catch {
    return [];
  }
}

const readOrNull = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);

/** Remove now-empty parent folders up to (not including) the app root. */
function pruneEmptyDirs(cwd, relFile) {
  let dir = path.dirname(path.join(cwd, relFile));
  while (dir !== cwd && dir.startsWith(cwd) && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
    dir = path.dirname(dir);
  }
}

/**
 * Bring generated files in line with the canonical sources.
 * @param {string} cwd App root
 * @param {{ check?: boolean }} options `check` reports drift without writing
 * @returns {{ exitCode: number, messages: object[], filesWritten: string[] }}
 */
function sync(cwd, { check = false } = {}) {
  const desired = generate(cwd);
  const stale = readLedger(cwd).filter((f) => !desired.has(f) && fs.existsSync(path.join(cwd, f)));
  const messages = [];
  const filesWritten = [];

  for (const [rel, content] of desired) {
    const current = readOrNull(path.join(cwd, rel));
    if (current === content) continue;
    if (check) {
      messages.push({
        level: 'error',
        rule: current === null ? 'generated-missing' : 'generated-drift',
        file: rel,
        message: current === null ? 'generated file is missing' : 'generated file differs from its source',
      });
      continue;
    }
    fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
    fs.writeFileSync(path.join(cwd, rel), content);
    filesWritten.push(rel);
  }

  for (const rel of stale) {
    if (check) {
      messages.push({ level: 'error', rule: 'generated-stale', file: rel, message: 'source no longer exists; file should be removed' });
      continue;
    }
    fs.rmSync(path.join(cwd, rel));
    pruneEmptyDirs(cwd, rel);
    messages.push({ level: 'info', rule: 'generated-removed', file: rel, message: 'removed stale generated file' });
  }

  if (check && messages.length) {
    messages.push({ level: 'error', rule: 'sync-required', file: '', message: 'run `npm run agents:sync` and commit the result' });
  }
  for (const rel of filesWritten) messages.push({ level: 'info', rule: 'generated-written', file: rel, message: 'written' });

  return { exitCode: check && messages.length ? 1 : 0, messages, filesWritten };
}

module.exports = { sync };
