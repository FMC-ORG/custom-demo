'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { run } = require('../index');
const { makeApp, writeFiles } = require('./fixture');

/** A git repo whose app lives in a subfolder, like this monorepo. */
function repoWithApp() {
  const top = makeApp({});
  execFileSync('git', ['init', '-q'], { cwd: top });
  const app = path.join(top, 'examples', 'app');
  writeFiles(app, { 'package.json': { scripts: {} } });
  return { top, app, hook: path.join(top, '.git', 'hooks', 'pre-commit') };
}

describe('agents setup', () => {
  it('installs an executable pre-commit hook scoped to the app folder', () => {
    const { app, hook } = repoWithApp();

    const result = run(['setup'], { cwd: app });

    expect(result.exitCode).toBe(0);
    const script = fs.readFileSync(hook, 'utf8');
    expect(script).toContain('grep -q "^examples/app/"');
    expect(script).toContain('npm --prefix "$APP" run --silent agents:check');
    expect(fs.statSync(hook).mode & 0o111).not.toBe(0);
  });

  it('lets commits through on branches whose app has no agents:check script', () => {
    const { top, app, hook } = repoWithApp();
    run(['setup'], { cwd: app });
    writeFiles(app, { 'src/x.ts': 'x\n' });
    execFileSync('git', ['add', '.'], { cwd: top });

    // package.json in repoWithApp() has no scripts, like a branch without the tooling
    expect(() => execFileSync('sh', [hook], { cwd: top, stdio: 'pipe' })).not.toThrow();
  });

  it('can be re-run safely', () => {
    const { app } = repoWithApp();
    run(['setup'], { cwd: app });
    expect(run(['setup'], { cwd: app }).exitCode).toBe(0);
  });

  it('refuses to overwrite a hook it did not write', () => {
    const { app, hook } = repoWithApp();
    fs.writeFileSync(hook, '#!/bin/sh\necho mine\n');

    const result = run(['setup'], { cwd: app });

    expect(result.exitCode).toBe(1);
    expect(result.messages[0].rule).toBe('setup-hook-exists');
    expect(fs.readFileSync(hook, 'utf8')).toBe('#!/bin/sh\necho mine\n');
  });

  it('reports a clear error outside a git repository', () => {
    expect(run(['setup'], { cwd: makeApp({}) }).messages[0].rule).toBe('setup-no-git');
  });
});

describe('agents (no or unknown command)', () => {
  it('prints usage and fails on an unknown command', () => {
    const result = run(['nope'], { cwd: makeApp({}) });
    expect(result.exitCode).toBe(1);
    expect(result.messages[0].message).toContain('Usage: agents');
  });
});
