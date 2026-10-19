'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const HOOK_MARKER = '# agents-tooling pre-commit';

const git = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

function hookScript(appRel) {
  const prefix = appRel ? `${appRel}/` : '';
  return `#!/bin/sh
${HOOK_MARKER} (installed by \`npm run agents:setup\`; safe to re-run)
APP="${appRel || '.'}"
# Skip on branches that predate the agents tooling (no agents:check script).
if ! grep -q '"agents:check"' "$APP/package.json" 2>/dev/null; then
  exit 0
fi
if git diff --cached --name-only | grep -q "^${prefix}"; then
  npm --prefix "$APP" run --silent agents:check || {
    echo "agents:check failed. Run 'npm run agents:sync' in $APP, fix lint errors, and re-stage." >&2
    exit 1
  }
fi
`;
}

/**
 * Install the pre-commit hook that runs `agents:check` when app files are staged.
 * Never overwrites a hook it did not write.
 * @param {string} cwd App root
 */
function setup(cwd) {
  let top;
  let hooksDir;
  try {
    top = git(cwd, 'rev-parse', '--show-toplevel');
    hooksDir = path.resolve(cwd, git(cwd, 'rev-parse', '--git-path', 'hooks'));
  } catch {
    return { exitCode: 1, messages: [{ level: 'error', rule: 'setup-no-git', file: '', message: 'not inside a git repository' }] };
  }

  const appRel = path.relative(fs.realpathSync(top), fs.realpathSync(cwd)).split(path.sep).join('/');
  const hookPath = path.join(hooksDir, 'pre-commit');
  const existing = fs.existsSync(hookPath) ? fs.readFileSync(hookPath, 'utf8') : null;

  if (existing !== null && !existing.includes(HOOK_MARKER)) {
    return {
      exitCode: 1,
      messages: [{ level: 'error', rule: 'setup-hook-exists', file: hookPath, message: `a pre-commit hook already exists; add this line to it: npm --prefix "${appRel || '.'}" run agents:check` }],
    };
  }

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(hookPath, hookScript(appRel), { mode: 0o755 });
  return { exitCode: 0, messages: [{ level: 'info', rule: 'setup-hook-installed', file: hookPath, message: 'pre-commit hook installed' }] };
}

module.exports = { setup, HOOK_MARKER };
