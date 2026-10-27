'use strict';
// sitecore-start-demo: local Start Check (docs/ai/backlog/demo-setup-skill.md).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  startCheck,
} = require('../../../.agents/skills/sitecore-start-demo/scripts/lib/start-checks.cjs');

const roots = [];
afterEach(() => {
  while (roots.length) fs.rmSync(roots.pop(), { recursive: true, force: true });
});
const git = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = (root, file, text) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text);
};
const identity = ['-c', 'user.email=t@example.com', '-c', 'user.name=Test'];
const commit = (cwd, message) => {
  git(cwd, 'add', '-A');
  git(cwd, ...identity, 'commit', '-q', '-m', message);
};

// A clone of a bare "origin" whose main holds a minimal app.
function repo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'start-demo-'));
  roots.push(root);
  const origin = path.join(root, 'origin.git');
  const app = path.join(root, 'app');
  git(root, 'init', '-q', '--bare', '-b', 'main', origin);
  git(root, 'clone', '-q', origin, app);
  git(app, 'checkout', '-q', '-b', 'main');
  write(app, 'package.json', '{"name":"app","scripts":{}}');
  write(app, 'package-lock.json', '{}');
  write(
    app,
    '.gitignore',
    'node_modules\n.env.local\ndocs/ai/demos/*/\ndocs/ai/config/credentials.local.yaml\n',
  );
  write(app, 'docs/ai/config/project.yaml', 'siteCollection: "main"\nsiteName: "main-website"\n');
  commit(app, 'initial');
  git(app, 'push', '-q', '-u', 'origin', 'main');
  // Installed dependencies newer than the lock file; local env present.
  write(app, 'node_modules/.package-lock.json', '{}');
  const future = new Date(Date.now() + 60000);
  fs.utimesSync(path.join(app, 'node_modules/.package-lock.json'), future, future);
  write(app, '.env.local', 'X=1\n');
  return { root, origin, app };
}
function deps(overrides = {}) {
  const calls = [];
  return {
    calls,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: new Map(),
      text: async () => '<html>ok</html>',
    }),
    run: (cmd, args) => {
      calls.push([cmd, ...args].join(' '));
      return { status: 0, stdout: '' };
    },
    chromiumInstalled: () => true,
    now: () => new Date('2026-10-20T10:00:00Z'),
    ...overrides,
  };
}
const byId = (report, id) => report.checks.find((x) => x.id === id);
const start = (app, options = {}, d = deps()) =>
  startCheck({ app, client: 'acme', url: 'https://acme.example', deps: d, ...options });

test('a fresh start creates the demo branch from the tracked main and records setup.json', async () => {
  const { app } = repo();
  const d = deps();
  const report = await start(app, {}, d);
  expect(report.blockers).toBe(0);
  expect(git(app, 'branch', '--show-current')).toBe('acme-demo');
  expect(report.base).toMatchObject({
    ref: 'origin/main',
    commit: git(app, 'rev-parse', 'origin/main'),
  });
  expect(byId(report, 'demo-branch').status).toBe('fixed');
  expect(byId(report, 'content-hub')).toMatchObject({ status: 'fail', level: 'warning' });
  const setup = JSON.parse(
    fs.readFileSync(path.join(app, 'docs/ai/demos/acme/setup.json'), 'utf8'),
  );
  expect(setup).toMatchObject({ client: 'acme', url: 'https://acme.example', branch: 'acme-demo' });
  expect(setup.base.commit).toBe(report.base.commit);
  expect(git(app, 'status', '--porcelain')).toBe(''); // demo folder is gitignored
});

test('uncommitted changes stop setup without creating a branch or files', async () => {
  const { app } = repo();
  write(app, 'src/theme.css', 'client work');
  const report = await start(app);
  expect(byId(report, 'clean-tree')).toMatchObject({ status: 'fail', level: 'blocker' });
  expect(git(app, 'branch', '--show-current')).toBe('main');
  expect(fs.existsSync(path.join(app, 'docs/ai/demos/acme'))).toBe(false);
});

test('an existing demo branch or used demo folder asks to continue or rename', async () => {
  const { app } = repo();
  git(app, 'branch', 'acme-demo');
  let report = await start(app);
  expect(byId(report, 'demo-branch')).toMatchObject({ status: 'fail', level: 'blocker' });
  expect(git(app, 'branch', '--show-current')).toBe('main');
  report = await start(app, { continueDemo: true });
  expect(report.blockers).toBe(0);
  expect(git(app, 'branch', '--show-current')).toBe('acme-demo');

  write(app, 'docs/ai/demos/acme/recovery-content.json', '{}');
  report = await start(app);
  expect(byId(report, 'demo-folder')).toMatchObject({ status: 'fail', level: 'blocker' });
  expect((await start(app, { continueDemo: true })).blockers).toBe(0);
});

test('local main is fast-forwarded when behind, and stops setup when it has its own commits', async () => {
  const { root, origin, app } = repo();
  const other = path.join(root, 'other');
  git(root, 'clone', '-q', origin, other);
  write(other, 'new.txt', 'framework update');
  commit(other, 'framework update');
  git(other, 'push', '-q', 'origin', 'main');
  let report = await start(app);
  expect(byId(report, 'main-up-to-date').status).toBe('fixed');
  expect(git(app, 'rev-parse', 'main')).toBe(git(app, 'rev-parse', 'origin/main'));
  expect(git(app, 'merge-base', '--is-ancestor', 'origin/main', 'acme-demo') === '').toBe(true);

  const { app: diverged } = repo();
  write(diverged, 'local.txt', 'local only');
  commit(diverged, 'local commit on main');
  report = await start(diverged);
  expect(byId(report, 'main-up-to-date')).toMatchObject({ status: 'fail', level: 'blocker' });
  expect(git(diverged, 'branch', '--show-current')).toBe('main');
});

test('a framework remote ahead of the tracked main is a warning, never changed', async () => {
  const { root, app } = repo();
  const framework = path.join(root, 'FMC-ORG', 'custom-demo.git');
  fs.mkdirSync(path.dirname(framework), { recursive: true });
  git(root, 'clone', '-q', '--bare', path.join(root, 'origin.git'), framework);
  const other = path.join(root, 'framework-work');
  git(root, 'clone', '-q', framework, other);
  write(other, 'fix.txt', 'framework fix');
  commit(other, 'framework fix');
  git(other, 'push', '-q', 'origin', 'main');
  git(app, 'remote', 'add', 'framework', framework);
  const report = await start(app);
  expect(byId(report, 'framework-ahead')).toMatchObject({ status: 'fail', level: 'warning' });
  expect(byId(report, 'framework-ahead').message).toContain('1 commit');
  expect(report.base.ref).toBe('origin/main');
});

test('the client URL must load and not be blocked by bot protection', async () => {
  const { app } = repo();
  const blocked = deps({
    fetchImpl: async () => ({
      ok: false,
      status: 403,
      headers: new Map([['cf-ray', 'abc']]),
      text: async () => '<title>Just a moment...</title>',
    }),
  });
  let report = await start(app, {}, blocked);
  expect(byId(report, 'url')).toMatchObject({ status: 'fail', level: 'blocker' });
  expect(byId(report, 'url').message).toMatch(/bot protection/i);
  const offline = deps({
    fetchImpl: async () => {
      throw new Error('ENOTFOUND');
    },
  });
  report = await start(app, {}, offline);
  expect(byId(report, 'url')).toMatchObject({ status: 'fail', level: 'blocker' });
});

test('Content Hub credentials are verified when present; a failure is only a warning', async () => {
  const { app } = repo();
  write(
    app,
    'docs/ai/config/credentials.local.yaml',
    'contentHub:\n  host: "https://hub.example/"\n  user: "u"\n  password: "secret-value"\n',
  );
  const answers = { ok: true };
  const d = deps({
    fetchImpl: async (url) =>
      String(url).includes('/api/authenticate')
        ? { ok: answers.ok, status: answers.ok ? 200 : 401, json: async () => ({ token: 't' }) }
        : { ok: true, status: 200, headers: new Map(), text: async () => 'ok' },
  });
  expect(byId(await start(app, {}, d), 'content-hub').status).toBe('pass');
  answers.ok = false;
  const report = await start(app, { continueDemo: true }, d);
  expect(byId(report, 'content-hub')).toMatchObject({ status: 'fail', level: 'warning' });
  expect(JSON.stringify(report)).not.toContain('secret-value');
});

test('failing agent checks are fixed by agents:sync; missing tools are installed', async () => {
  const { app } = repo();
  fs.rmSync(path.join(app, 'node_modules'), { recursive: true });
  let synced = false;
  let browsers = false;
  const d = deps({
    run: (cmd, args) => {
      const line = [cmd, ...args].join(' ');
      d.calls.push(line);
      if (line.includes('cli.js sync')) synced = true;
      if (line.includes('playwright install')) browsers = true;
      if (line.includes('npm ci')) write(app, 'node_modules/.package-lock.json', '{}');
      return { status: line.includes('cli.js check') && !synced ? 1 : 0, stdout: '' };
    },
    chromiumInstalled: () => browsers,
  });
  const report = await start(app, {}, d);
  expect(report.blockers).toBe(0);
  for (const id of ['dependencies', 'chromium', 'agents-check'])
    expect(byId(report, id).status).toBe('fixed');
});

test('check mode fixes and writes nothing, and requires a started demo on its branch', async () => {
  const { app } = repo();
  const d = deps({ run: () => ({ status: 1, stdout: '' }) });
  let report = await start(app, { check: true }, d);
  expect(report.mode).toBe('check');
  expect(byId(report, 'demo-branch')).toMatchObject({ status: 'fail', level: 'blocker' });
  expect(byId(report, 'demo-folder').message).toContain('sitecore-start-demo');
  expect(byId(report, 'agents-check').status).toBe('fail');
  expect(git(app, 'branch', '--show-current')).toBe('main');
  expect(fs.existsSync(path.join(app, 'docs/ai/demos/acme'))).toBe(false);

  await start(app); // run the real start, then the build's check
  report = await start(app, { check: true, url: undefined });
  expect(report.blockers).toBe(0);
  expect(report.url).toBe('https://acme.example'); // reused from setup.json
});

test('the build may reuse a manifest check only from the same day and the same main', async () => {
  const { app } = repo();
  await start(app);
  const file = path.join(app, 'docs/ai/demos/acme/setup.json');
  const setup = JSON.parse(fs.readFileSync(file, 'utf8'));
  setup.sitecore = {
    siteItemId: 'site-1',
    manifest: { result: 'pass', checkedAt: '2026-10-20T09:00:00Z' },
  };
  fs.writeFileSync(file, JSON.stringify(setup));
  let report = await start(app, { check: true });
  expect(report.manifestReuse).toEqual({ reusable: true, siteItemId: 'site-1' });
  report = await start(app, { check: true }, deps({ now: () => new Date('2026-10-21T10:00:00Z') }));
  expect(report.manifestReuse.reusable).toBe(false);
});

test('an invalid client name is rejected before anything runs', async () => {
  const { app } = repo();
  const report = await startCheck({
    app,
    client: 'Acme Corp',
    url: 'https://acme.example',
    deps: deps(),
  });
  expect(byId(report, 'client-name')).toMatchObject({ status: 'fail', level: 'blocker' });
  expect(git(app, 'branch', '--show-current')).toBe('main');
});

test('dependencies are judged by installed versions, not by file dates', async () => {
  const { app } = repo();
  const lock = {
    packages: {
      '': {},
      'node_modules/a': { version: '1.0.0' },
      'node_modules/b': { version: '2.0.0', optional: true },
    },
  };
  write(app, 'package-lock.json', JSON.stringify(lock));
  commit(app, 'lock');
  git(app, 'push', '-q', 'origin', 'main');
  write(
    app,
    'node_modules/.package-lock.json',
    JSON.stringify({ packages: { 'node_modules/a': { version: '1.0.0' } } }),
  );
  const stale = new Date(Date.now() - 3600000);
  fs.utimesSync(path.join(app, 'node_modules/.package-lock.json'), stale, stale); // older file, same versions
  expect(byId(await start(app, { check: true }), 'dependencies').status).toBe('pass');
  write(
    app,
    'node_modules/.package-lock.json',
    JSON.stringify({ packages: { 'node_modules/a': { version: '0.9.0' } } }),
  );
  expect(byId(await start(app, { check: true }), 'dependencies')).toMatchObject({
    status: 'fail',
    level: 'blocker',
  });
});

test('the shared Content Hub login supports simple and OAuth credentials', async () => {
  const {
    authenticate,
  } = require('../../../.agents/skills/sitecore-build-demo/scripts/lib/content-hub.cjs');
  const seen = [];
  const fetchImpl = async (url, options) => {
    seen.push([String(url), String(options.body)]);
    return {
      ok: true,
      json: async () =>
        String(url).endsWith('/oauth/token') ? { access_token: 'a' } : { token: 't' },
    };
  };
  await expect(
    authenticate({ host: 'https://hub', user: 'u', password: 'p' }, { fetchImpl }),
  ).resolves.toBe('t');
  await expect(
    authenticate(
      { host: 'https://hub', user: 'u', password: 'p', clientId: 'c', clientSecret: 's' },
      { fetchImpl },
    ),
  ).resolves.toBe('Bearer a');
  expect(seen.map(([url]) => url)).toEqual([
    'https://hub/api/authenticate',
    'https://hub/oauth/token',
  ]);
  await expect(authenticate({ host: 'https://hub' }, { fetchImpl })).rejects.toThrow(
    /not configured/,
  );
});

test('the expected environment marker is reported from project.yaml (none by default)', async () => {
  const { app } = repo();
  let report = await start(app, { check: false });
  expect(report.environmentMarker).toBeNull();
  write(
    app,
    'docs/ai/config/project.yaml',
    'siteCollection: "main"\nsiteName: "main-website"\nenvironmentMarker: "sitecore-demo"\n',
  );
  commit(app, 'marker');
  report = await start(app, { continueDemo: true });
  expect(report.environmentMarker).toBe('sitecore-demo');
  expect(byId(report, 'project-config').message).toContain('sitecore-demo');
  write(
    app,
    'docs/ai/config/project.yaml',
    'siteCollection: "main"\nsiteName: "main-website"\nenvironmentMarker: "Not Valid!"\n',
  );
  commit(app, 'bad marker');
  report = await start(app, { continueDemo: true });
  expect(byId(report, 'project-config')).toMatchObject({ status: 'fail', level: 'blocker' });
});

test('deployed demo URLs are optional, recorded in setup.json, and kept on later runs', async () => {
  const { app } = repo();
  const first = await start(app);
  expect(byId(first, 'showcase-url')).toMatchObject({ status: 'fail', level: 'info' });
  expect(first.blockers).toBe(0);

  const second = await start(app, {
    continueDemo: true,
    showcaseUrl: 'https://acme-demo.vercel.app/',
    editingHostUrl: 'https://acme-demo-editing-host.vercel.app',
  });
  expect(byId(second, 'showcase-url').status).toBe('pass');
  const setup = () =>
    JSON.parse(fs.readFileSync(path.join(app, 'docs/ai/demos/acme/setup.json'), 'utf8'));
  expect(setup()).toMatchObject({
    showcaseUrl: 'https://acme-demo.vercel.app',
    editingHostUrl: 'https://acme-demo-editing-host.vercel.app',
  });

  await start(app, { continueDemo: true });
  expect(setup().showcaseUrl).toBe('https://acme-demo.vercel.app');
});

test('deployed demo URLs never store bypass tokens or credentials', async () => {
  const { app } = repo();
  const report = await start(app, {
    showcaseUrl: 'https://acme-demo.vercel.app/?x-vercel-protection-bypass=secret',
    editingHostUrl: 'http://acme-demo-editing-host.vercel.app',
  });
  expect(byId(report, 'showcase-url')).toMatchObject({ status: 'fail', level: 'warning' });
  expect(byId(report, 'editing-host-url')).toMatchObject({ status: 'fail', level: 'warning' });
  expect(report.blockers).toBe(0);
  const setup = fs.readFileSync(path.join(app, 'docs/ai/demos/acme/setup.json'), 'utf8');
  expect(setup).not.toContain('secret');
  expect(JSON.parse(setup).showcaseUrl).toBeUndefined();
});
