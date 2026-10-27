'use strict';
/**
 * Local part of the Start Check (docs/ai/backlog/demo-setup-skill.md). Checks — and, unless
 * `check` is set, fixes — the local setup for a new demo. It never changes Sitecore, Content Hub
 * or git remotes; the marketer MCP checks are done by the agent (see ../../SKILL.md).
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const CLIENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SETUP_FILES = new Set(['setup.json', 'setup-report.md']);
const FRAMEWORK_REMOTE_RE = /FMC-ORG[/:]custom-demo(\.git)?$/i;
const HOOK_MARKER = '# agents-tooling pre-commit';
const BLOCKED_RE =
  /captcha|just a moment|attention required|access denied|verify you are (a )?human/i;

function defaultDeps() {
  return {
    fetchImpl: fetch,
    run: (cmd, args, options) => {
      const result = spawnSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', ...options });
      return { status: result.status ?? 1, stdout: result.stdout || '' };
    },
    chromiumInstalled: (app) => {
      try {
        const { chromium } = require(require.resolve('playwright', { paths: [app] }));
        return fs.existsSync(chromium.executablePath());
      } catch {
        return false;
      }
    },
    now: () => new Date(),
  };
}

// Deployed demo URLs (showcase = public production URL, editingHost = Pages editing host).
// Only clean HTTPS origins/paths are stored: no credentials, no query string — a Vercel
// protection-bypass token in a URL would leak into setup.json and handoff notes.
function cleanDeployUrl(value) {
  if (!value) return { value: null };
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return { error: `"${value}" is not a URL.` };
  }
  if (parsed.protocol !== 'https:') return { error: `${parsed.origin} must use https.` };
  if (parsed.username || parsed.password) return { error: 'URL must not contain credentials.' };
  if (parsed.search || parsed.hash)
    return { error: `${parsed.origin}: remove the query string/fragment (never store bypass tokens).` };
  return { value: `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}` };
}

async function startCheck({
  app,
  client,
  url,
  showcaseUrl,
  editingHostUrl,
  check = false,
  continueDemo = false,
  deps = {},
}) {
  const d = { ...defaultDeps(), ...deps };
  const checks = [];
  const add = (id, status, level, message) => checks.push({ id, status, level, message });
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: app,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  const tryGit = (...args) => {
    try {
      return git(...args);
    } catch {
      return null;
    }
  };
  const report = (extra = {}) => {
    const blockers = checks.filter((x) => x.status === 'fail' && x.level === 'blocker').length;
    const warnings = checks.filter((x) => x.status === 'fail' && x.level === 'warning').length;
    return {
      client,
      url,
      mode: check ? 'check' : 'fix',
      branch: `${client}-demo`,
      demoDir: `docs/ai/demos/${client}`,
      ...extra,
      checks,
      fixed: checks.filter((x) => x.status === 'fixed').map((x) => x.id),
      blockers,
      warnings,
      ok: blockers === 0,
    };
  };

  if (typeof client !== 'string' || !CLIENT_RE.test(client)) {
    add(
      'client-name',
      'fail',
      'blocker',
      'Client name must be lowercase kebab-case, e.g. "acme" or "acme-2".',
    );
    return report();
  }
  const branch = `${client}-demo`;
  const demoDir = path.join(app, 'docs/ai/demos', client);
  const setupFile = path.join(demoDir, 'setup.json');
  const previous = fs.existsSync(setupFile) ? JSON.parse(fs.readFileSync(setupFile, 'utf8')) : null;
  url = url || previous?.url;
  showcaseUrl = showcaseUrl || previous?.showcaseUrl;
  editingHostUrl = editingHostUrl || previous?.editingHostUrl;

  // --- git --------------------------------------------------------------------------------
  let base = null;
  if (!tryGit('rev-parse', '--show-toplevel')) {
    add('git-repo', 'fail', 'blocker', 'Not inside a git repository.');
  } else {
    const dirty = git('status', '--porcelain');
    const clean = !dirty;
    if (clean) add('clean-tree', 'pass', 'blocker', 'No uncommitted changes.');
    else
      add(
        'clean-tree',
        'fail',
        'blocker',
        `Uncommitted changes (${dirty.split('\n').length} files). Commit them on their demo branch or discard them; setup never stashes.`,
      );

    // "Latest main" = what local main tracks, else origin/main (decision 11).
    const tracked = tryGit('rev-parse', '--abbrev-ref', 'main@{upstream}') || 'origin/main';
    const [remote] = tracked.split('/');
    tryGit('fetch', '--quiet', remote, 'main');
    const baseCommit = tryGit('rev-parse', '--verify', `${tracked}^{commit}`);
    const current = tryGit('branch', '--show-current');
    if (!baseCommit) {
      add('main-up-to-date', 'fail', 'blocker', `Cannot read ${tracked}; check the git remote.`);
    } else {
      base = { ref: tracked, commit: baseCommit };
      const localMain = tryGit('rev-parse', '--verify', 'main^{commit}');
      const own = localMain ? Number(git('rev-list', '--count', `${tracked}..main`)) : 0;
      const behind = localMain ? Number(git('rev-list', '--count', `main..${tracked}`)) : 0;
      if (own > 0)
        add(
          'main-up-to-date',
          'fail',
          'blocker',
          `Local main has ${own} commit(s) not in ${tracked}; move them to a branch first.`,
        );
      else if (behind === 0 || check)
        add(
          'main-up-to-date',
          'pass',
          'blocker',
          `Base is ${tracked} (${baseCommit.slice(0, 8)}).`,
        );
      else if (current === 'main' && !clean)
        add(
          'main-up-to-date',
          'skipped',
          'blocker',
          'Local main is behind; not updated while the tree has changes.',
        );
      else {
        if (current === 'main') git('merge', '--ff-only', '--quiet', tracked);
        else git('branch', '-f', 'main', tracked);
        add(
          'main-up-to-date',
          'fixed',
          'blocker',
          `Fast-forwarded local main to ${tracked} (${behind} commit(s)).`,
        );
      }

      // A framework remote ahead of the tracked main: warn only, never change remotes.
      for (const line of git('remote', '-v').split('\n')) {
        const [name, remoteUrl, kind] = line.split(/\s+/);
        if (kind !== '(fetch)' || name === remote || !FRAMEWORK_REMOTE_RE.test(remoteUrl)) continue;
        tryGit('fetch', '--quiet', name, 'main');
        const ahead = Number(tryGit('rev-list', '--count', `${tracked}..${name}/main`) || 0);
        add(
          'framework-ahead',
          ahead ? 'fail' : 'pass',
          'warning',
          ahead
            ? `Your main is behind the framework (${name}/main) by ${ahead} commit${ahead === 1 ? '' : 's'}; sync your fork to get the latest fixes.`
            : `Up to date with the framework (${name}/main).`,
        );
      }
    }

    // Demo branch (decision 5).
    const exists = !!tryGit('rev-parse', '--verify', `refs/heads/${branch}`);
    const expectedBase = check && previous?.base?.commit ? previous.base.commit : baseCommit;
    const contains = () =>
      !!expectedBase && tryGit('merge-base', '--is-ancestor', expectedBase, 'HEAD') !== null;
    if (tryGit('branch', '--show-current') === branch) {
      if (contains()) add('demo-branch', 'pass', 'blocker', `On ${branch}.`);
      else if (continueDemo || check)
        add(
          'demo-branch',
          'fail',
          'warning',
          `${branch} does not contain the latest main; merge it in when convenient.`,
        );
      else
        add(
          'demo-branch',
          'fail',
          'blocker',
          `${branch} does not contain the latest main; merge main into it first.`,
        );
    } else if (check) {
      add(
        'demo-branch',
        'fail',
        'blocker',
        `Not on ${branch}. Run /skill:sitecore-start-demo ${client} <url> first.`,
      );
    } else if (
      !clean ||
      !baseCommit ||
      checks.some((x) => x.id === 'main-up-to-date' && x.status === 'fail')
    ) {
      add(
        'demo-branch',
        'skipped',
        'blocker',
        `${branch} not prepared until the blockers above are fixed.`,
      );
    } else if (exists && !continueDemo) {
      add(
        'demo-branch',
        'fail',
        'blocker',
        `${branch} already exists. Continue that demo, or choose a new name (e.g. ${client}-2).`,
      );
    } else if (exists) {
      git('switch', '--quiet', branch);
      add('demo-branch', 'fixed', 'blocker', `Switched to the existing ${branch}.`);
    } else {
      git('switch', '--quiet', '--no-track', '-c', branch, tracked);
      add('demo-branch', 'fixed', 'blocker', `Created ${branch} from ${tracked}.`);
    }
  }

  // --- demo folder ------------------------------------------------------------------------
  const used = fs.existsSync(demoDir)
    ? fs.readdirSync(demoDir).filter((name) => !SETUP_FILES.has(name))
    : [];
  if (check && !previous)
    add(
      'demo-folder',
      'fail',
      'blocker',
      `No setup.json for ${client}. Run /skill:sitecore-start-demo ${client} <url> first.`,
    );
  else if (!check && used.length && !continueDemo)
    add(
      'demo-folder',
      'fail',
      'blocker',
      `docs/ai/demos/${client}/ already holds a demo (${used.length} files, may include recovery records). Continue it, or choose a new name.`,
    );
  else add('demo-folder', 'pass', 'blocker', `docs/ai/demos/${client}/`);

  // --- deployed demo URLs (optional) ------------------------------------------------------
  const deployUrls = {};
  for (const [id, key, raw] of [
    ['showcase-url', 'showcaseUrl', showcaseUrl],
    ['editing-host-url', 'editingHostUrl', editingHostUrl],
  ]) {
    const cleaned = cleanDeployUrl(raw);
    if (cleaned.error) {
      add(id, 'fail', 'warning', `${cleaned.error} Not recorded.`);
      continue;
    }
    if (!cleaned.value) {
      if (id === 'showcase-url')
        add(
          id,
          'fail',
          'info',
          'Not set. Once the demo is deployed, re-run with --showcase-url <https://…> so deployment checks and the handoff know where it lives.',
        );
      continue;
    }
    deployUrls[key] = cleaned.value;
    try {
      const response = await d.fetchImpl(cleaned.value, {
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
      });
      if (response.ok) add(id, 'pass', 'warning', `${cleaned.value} loads (HTTP ${response.status}).`);
      else
        add(
          id,
          'fail',
          'warning',
          `${cleaned.value} returned HTTP ${response.status} (not deployed yet, or protected). Recorded anyway.`,
        );
    } catch {
      add(id, 'fail', 'warning', `${cleaned.value} could not be reached. Recorded anyway.`);
    }
  }

  // --- client URL -------------------------------------------------------------------------
  if (!url) add('url', 'fail', 'blocker', 'Client URL is required.');
  else {
    try {
      const response = await d.fetchImpl(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36',
        },
      });
      const body = (await response.text?.().catch(() => '')) || '';
      const header = (name) => response.headers?.get?.(name) || '';
      const challenge =
        BLOCKED_RE.test(body.slice(0, 20000)) ||
        (/cloudflare/i.test(header('server')) && !response.ok) ||
        (!!header('cf-ray') && [403, 429, 503].includes(response.status));
      if (response.ok && !challenge)
        add(
          'url',
          'pass',
          'blocker',
          `${url} loads (HTTP ${response.status}). Cookie banners are handled by the scraper during the build.`,
        );
      else if (challenge)
        add(
          'url',
          'fail',
          'blocker',
          `${url} is blocked by bot protection (HTTP ${response.status}); capture a screenshot manually and expect limited content extraction.`,
        );
      else add('url', 'fail', 'blocker', `${url} returned HTTP ${response.status}.`);
    } catch {
      add('url', 'fail', 'blocker', `${url} could not be reached.`);
    }
  }

  // --- tools -------------------------------------------------------------------------------
  const lock = path.join(app, 'package-lock.json');
  const installed = path.join(app, 'node_modules/.package-lock.json');
  // Compare what npm installed (node_modules/.package-lock.json) with the lock file by content:
  // file dates change on every git checkout and are not evidence of an install.
  const depsCurrent = () => {
    if (!fs.existsSync(installed)) return false;
    if (!fs.existsSync(lock)) return true;
    try {
      const want = JSON.parse(fs.readFileSync(lock, 'utf8')).packages || {};
      const have = JSON.parse(fs.readFileSync(installed, 'utf8')).packages || {};
      return Object.entries(want).every(
        ([name, entry]) =>
          !name ||
          entry.optional ||
          entry.link ||
          (have[name] && (!entry.version || have[name].version === entry.version)),
      );
    } catch {
      return false;
    }
  };
  if (depsCurrent()) add('dependencies', 'pass', 'blocker', 'Dependencies installed.');
  else if (check)
    add('dependencies', 'fail', 'blocker', 'Dependencies missing or outdated; run npm ci.');
  else {
    d.run('npm', ['ci', '--no-audit', '--no-fund'], { cwd: app });
    add(
      'dependencies',
      depsCurrent() ? 'fixed' : 'fail',
      'blocker',
      depsCurrent() ? 'Installed dependencies (npm ci).' : 'npm ci failed.',
    );
  }

  if (d.chromiumInstalled(app)) add('chromium', 'pass', 'blocker', 'Chromium installed.');
  else if (check)
    add('chromium', 'fail', 'blocker', 'Chromium missing; run npm run agents:browsers.');
  else {
    d.run('npx', ['playwright', 'install', 'chromium'], { cwd: app });
    const ok = d.chromiumInstalled(app);
    add(
      'chromium',
      ok ? 'fixed' : 'fail',
      'blocker',
      ok ? 'Installed Chromium.' : 'Chromium install failed.',
    );
  }

  const hooksDir = tryGit('rev-parse', '--git-path', 'hooks');
  const hook = hooksDir ? path.resolve(app, hooksDir, 'pre-commit') : null;
  const hookOk = () =>
    !!hook && fs.existsSync(hook) && fs.readFileSync(hook, 'utf8').includes(HOOK_MARKER);
  if (hookOk()) add('git-hook', 'pass', 'warning', 'Pre-commit hook installed.');
  else if (check || !hook)
    add('git-hook', 'fail', 'warning', 'Pre-commit hook missing; run npm run agents:setup.');
  else {
    // The hook installer ships with this app (tools/agents/lib/setup.js); it never overwrites a
    // hook it did not write.
    const { setup } = require(path.join(__dirname, '../../../../../tools/agents/lib/setup.js'));
    const result = setup(app);
    add(
      'git-hook',
      result.exitCode === 0 ? 'fixed' : 'fail',
      'warning',
      result.exitCode === 0
        ? 'Installed the pre-commit hook.'
        : 'Could not install the pre-commit hook.',
    );
  }

  const agentsCheck = () =>
    d.run('node', ['tools/agents/cli.js', 'check'], { cwd: app }).status === 0;
  if (agentsCheck()) add('agents-check', 'pass', 'blocker', 'Agent files are current.');
  else if (check)
    add('agents-check', 'fail', 'blocker', 'agents:check fails; run npm run agents:sync.');
  else {
    d.run('node', ['tools/agents/cli.js', 'sync'], { cwd: app });
    const ok = agentsCheck();
    add(
      'agents-check',
      ok ? 'fixed' : 'fail',
      'blocker',
      ok ? 'Regenerated agent files (agents:sync).' : 'agents:check still fails after agents:sync.',
    );
  }

  // --- configuration -----------------------------------------------------------------------
  const yaml = require(require.resolve('js-yaml', { paths: [app, __dirname] }));
  let project = null;
  try {
    project = yaml.load(fs.readFileSync(path.join(app, 'docs/ai/config/project.yaml'), 'utf8'));
  } catch {
    project = null;
  }
  // Environment Marker: which SitecoreAI environment this branch may write to (CONTEXT.md).
  // Absent means "an environment without a marker"; the agent verifies it through MCP.
  const environmentMarker = project?.environmentMarker ?? null;
  const markerValid =
    environmentMarker === null ||
    (typeof environmentMarker === 'string' && CLIENT_RE.test(environmentMarker));
  if (project?.siteCollection && project?.siteName && markerValid)
    add(
      'project-config',
      'pass',
      'blocker',
      `project.yaml: ${project.siteCollection}/${project.siteName}; environment marker: ${environmentMarker ?? 'none expected'}.`,
    );
  else if (!markerValid)
    add(
      'project-config',
      'fail',
      'blocker',
      'project.yaml environmentMarker must be lowercase kebab-case (the marker item name).',
    );
  else
    add(
      'project-config',
      'fail',
      'blocker',
      'docs/ai/config/project.yaml is missing siteCollection/siteName.',
    );

  // --- search source (read-only; ADR 0013) -------------------------------------------------
  // searchSources.articles in project.yaml (fallback SITECORE_SEARCH_PUSH_SOURCE_ID). One empty
  // search proves it answers for this environment's context ID. Never a blocker.
  {
    const { readSearchSource, readEnvVar } = require(
      path.join(__dirname, '../../../sitecore-search/scripts/lib/search-config.cjs'),
    );
    const sourceId = readSearchSource(app, d.env ?? process.env);
    const contextId =
      readEnvVar(app, 'NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID', d.env ?? process.env) ||
      readEnvVar(app, 'SITECORE_EDGE_CONTEXT_ID', d.env ?? process.env);
    if (!sourceId)
      add(
        'search-source',
        'fail',
        'info',
        'No search source configured (project.yaml searchSources.articles). Search needs one: see the sitecore-search skill (push source setup).',
      );
    else if (!contextId)
      add('search-source', 'fail', 'info', `Search source ${sourceId} configured; no Edge context ID in .env.local to probe it.`);
    else {
      try {
        const response = await d.fetchImpl('https://edge-platform.sitecorecloud.io/v1/search', {
          method: 'POST',
          signal: AbortSignal.timeout(20000),
          headers: { 'content-type': 'application/json', 'x-sitecore-contextid': contextId },
          body: JSON.stringify({ config: { id: sourceId }, limit: 1, offset: 0, query: { keyphrase: '' }, sessionId: '', sort: { fields: [] } }),
        });
        const body = response.ok ? await response.json().catch(() => ({})) : {};
        if (response.ok)
          add('search-source', 'pass', 'warning', `Search source ${sourceId} answers (${body.total ?? 0} documents).`);
        else
          add(
            'search-source',
            'fail',
            'warning',
            `Search source ${sourceId} returned HTTP ${response.status}${response.status === 404 ? ' (not in this environment? wrong context ID or source ID)' : ''}.`,
          );
      } catch {
        add('search-source', 'fail', 'warning', `Search source ${sourceId} could not be reached.`);
      }
    }
  }

  if (fs.existsSync(path.join(app, '.env.local')))
    add('env-local', 'pass', 'warning', '.env.local present.');
  else
    add(
      'env-local',
      'fail',
      'warning',
      '.env.local missing; only needed to view the demo locally (copy .env.remote.example).',
    );

  let hub = null;
  try {
    hub = yaml.load(
      fs.readFileSync(path.join(app, 'docs/ai/config/credentials.local.yaml'), 'utf8'),
    )?.contentHub;
  } catch {
    hub = null;
  }
  if (!hub?.host)
    add(
      'content-hub',
      'fail',
      'warning',
      'No Content Hub credentials; images fall back to manual upload.',
    );
  else {
    try {
      const { authenticate } = require('../../../sitecore-build-demo/scripts/lib/content-hub.cjs');
      if (!hub.token)
        await authenticate(
          {
            host: new URL(hub.host).origin,
            user: hub.user,
            password: hub.password,
            clientId: hub.clientId,
            clientSecret: hub.clientSecret,
          },
          { fetchImpl: d.fetchImpl },
        );
      add(
        'content-hub',
        'pass',
        'warning',
        `Content Hub credentials verified for ${new URL(hub.host).origin}.`,
      );
    } catch {
      add(
        'content-hub',
        'fail',
        'warning',
        `Content Hub login failed for ${hub.host}; update credentials or images fall back to manual upload.`,
      );
    }
  }

  // --- manifest reuse (decision 10): same day + same main; the agent compares the environment.
  let manifestReuse;
  if (check) {
    const manifest = previous?.sitecore?.manifest;
    const sameDay =
      !!manifest?.checkedAt &&
      new Date(manifest.checkedAt).toISOString().slice(0, 10) ===
        d.now().toISOString().slice(0, 10);
    const sameMain = !!base && previous?.base?.commit === base.commit;
    manifestReuse = {
      reusable: manifest?.result === 'pass' && sameDay && sameMain,
      siteItemId: previous?.sitecore?.siteItemId || null,
    };
  }

  const result = report({
    url,
    ...deployUrls,
    base,
    environmentMarker: markerValid ? environmentMarker : null,
    ...(manifestReuse ? { manifestReuse } : {}),
  });
  if (!check && result.ok) {
    fs.mkdirSync(demoDir, { recursive: true });
    const setup = {
      ...(previous || {}),
      client,
      url,
      ...deployUrls,
      branch,
      base,
      startedAt: previous?.startedAt || d.now().toISOString(),
      checkedAt: d.now().toISOString(),
      local: { warnings: result.warnings, fixed: result.fixed },
    };
    fs.writeFileSync(setupFile, `${JSON.stringify(setup, null, 2)}\n`);
  }
  return result;
}

module.exports = { startCheck, CLIENT_RE };
