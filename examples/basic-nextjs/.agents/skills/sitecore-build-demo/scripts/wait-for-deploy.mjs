#!/usr/bin/env node
/**
 * Wait until a deployed demo serves an exact commit (X-Build-Sha header, next.config.ts).
 *
 * Usage (from examples/basic-nextjs):
 *   node .agents/skills/sitecore-build-demo/scripts/wait-for-deploy.mjs [url] [--client <name>]
 *        [--sha <commit>] [--timeout <seconds>] [--interval <seconds>]
 *
 * url defaults to showcaseUrl in docs/ai/demos/<client>/setup.json; sha defaults to HEAD.
 * Exit codes: 0 = deployed, 2 = timed out / not deployed, 1 = usage or setup error.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { shaMatches } = require('./lib/verify-demo.cjs');

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));

if (args.includes('--help')) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0]);
  process.exit(0);
}

const fail = (message, code = 1) => {
  console.error(message);
  process.exit(code);
};

let url = positional[0];
const client = opt('client');
if (!url && client) {
  try {
    url = JSON.parse(readFileSync(join('docs/ai/demos', client, 'setup.json'), 'utf8')).showcaseUrl;
  } catch {
    // reported below
  }
}
if (!url) fail('No URL. Pass one, or --client <name> with showcaseUrl in setup.json (sitecore-start-demo --showcase-url).');

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
let sha = opt('sha');
if (!sha) {
  sha = git('rev-parse', 'HEAD');
  try {
    const upstream = git('rev-parse', '@{u}');
    if (upstream !== sha) console.error(`WARN  HEAD ${sha.slice(0, 8)} is not pushed (upstream at ${upstream.slice(0, 8)}); waiting for HEAD anyway.`);
  } catch {
    console.error('WARN  current branch has no upstream; waiting for local HEAD.');
  }
}

const timeout = Number(opt('timeout') || 900) * 1000;
const interval = Number(opt('interval') || 20) * 1000;
const started = Date.now();
let last = '';
while (Date.now() - started < timeout) {
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/?deploy-check=${Date.now()}`, {
      cache: 'no-store',
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    const deployed = res.headers.get('x-build-sha') || '';
    if (shaMatches(deployed, sha)) {
      console.log(`Deployed: ${url} serves ${deployed.slice(0, 8)} (HTTP ${res.status}) after ${Math.round((Date.now() - started) / 1000)}s.`);
      process.exit(0);
    }
    const state = `HTTP ${res.status}, X-Build-Sha ${deployed ? deployed.slice(0, 8) : '(missing: deploy predates the header?)'}`;
    if (state !== last) console.error(`${new Date().toISOString().slice(11, 19)}  waiting for ${sha.slice(0, 8)} — ${state}`);
    last = state;
  } catch (error) {
    const state = `unreachable (${error.name})`;
    if (state !== last) console.error(`${new Date().toISOString().slice(11, 19)}  waiting for ${sha.slice(0, 8)} — ${state}`);
    last = state;
  }
  await new Promise((r) => setTimeout(r, interval));
}
fail(`Timed out after ${timeout / 1000}s: ${url} does not serve ${sha.slice(0, 8)} (last: ${last}).`, 2);
