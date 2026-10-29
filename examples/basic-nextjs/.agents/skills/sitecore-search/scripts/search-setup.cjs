#!/usr/bin/env node
'use strict';
/**
 * Seed the demo articles and connect search for one environment (ADR 0013). Same journaled
 * file-in/file-out MCP hand-off as build-demo (demo-recovery.cjs): this script never calls
 * Sitecore; the agent claims each request, runs the marketer MCP tool, and replies.
 */
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const LIB = path.join(__dirname, '../../sitecore-build-demo/scripts/lib');
const { FileBridge } = require(path.join(LIB, 'file-bridge.cjs'));
const { marketer } = require(path.join(LIB, 'marketer.cjs'));
const { Blocked, fingerprint } = require(path.join(LIB, 'recovery.cjs'));
const { seedArticles } = require('./lib/seed-articles.cjs');
const { connectSearch } = require('./lib/connect-search.cjs');
const { readSearchSource } = require('./lib/search-config.cjs');

const args = process.argv.slice(2);
const arg = (key) => {
  const i = args.indexOf(`--${key}`);
  return i < 0 ? undefined : args[i + 1];
};
const USAGE = `Usage: node .agents/skills/sitecore-search/scripts/search-setup.cjs --phase seed|connect
  [--directory <dir>]          working records (default .search-setup/; demos: docs/ai/demos/<client>/search-setup)
  [--initialize] [--begin]     first run of a phase / resuming after a session break
  --claim <request-id>         before running the MCP tool
  --reply <request-id> --result <MCP-result.json>
seed:    [--overwrite] [--images-manifest <image-manifest.json>]   (environment images from upload-to-content-hub.mjs)
connect: [--source <id>] [--home-placement after-hero|none]        (source default: project.yaml searchSources.articles)

Claim BEFORE calling a tool; reply BEFORE stepping. Never repeat a claimed mutation after a crash.`;

function loadEnvironment(app) {
  const project = yaml.load(fs.readFileSync(path.join(app, 'docs/ai/config/project.yaml'), 'utf8')) || {};
  return {
    siteCollection: project.siteCollection,
    siteName: project.siteName,
    marker: project.environmentMarker || null,
  };
}

function environmentImages(file) {
  if (!file) return {};
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(manifest)) throw new Blocked('images', 'image manifest must be an array');
  return Object.fromEntries(
    manifest
      .filter((x) => x.articleName && x.imageFieldXml && x.uploadStatus === 'uploaded' && x.approved)
      .map((x) => [x.articleName, x.imageFieldXml]),
  );
}

async function main() {
  if (!args.length || args.includes('--help')) return console.log(USAGE);
  const phase = arg('phase');
  if (!['seed', 'connect'].includes(phase)) throw new Blocked('arguments', 'phase must be seed or connect');
  const app = process.cwd();
  const directory = path.resolve(arg('directory') || '.search-setup');
  fs.mkdirSync(directory, { recursive: true });
  const environment = loadEnvironment(app);
  const articles = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../assets/articles.json'), 'utf8'),
  ).articles;
  const imageXml = phase === 'seed' ? environmentImages(arg('images-manifest')) : {};
  const sourceId = phase === 'connect' ? arg('source') || readSearchSource(app) : undefined;
  const intent =
    phase === 'seed'
      ? { phase, articles: fingerprint(articles), overwrite: args.includes('--overwrite'), imageXml: fingerprint(imageXml) }
      : { phase, sourceId: String(sourceId || '').toLowerCase(), homePlacement: arg('home-placement') || 'after-hero' };

  const bridge = new FileBridge({
    file: path.join(directory, `mcp-${phase}.json`),
    identity: fingerprint({ intent, environment }),
    initialize: args.includes('--initialize'),
  });
  if (arg('claim')) return console.log(JSON.stringify(bridge.claim(arg('claim')), null, 2));
  if (arg('reply')) {
    if (!arg('result')) throw new Blocked('reply', 'result file required');
    let response = JSON.parse(fs.readFileSync(arg('result'), 'utf8'));
    if (response?.isError || response?.error || response?.errors?.length)
      response = { isError: true, content: [{ type: 'text', text: 'MCP operation failed; outcome unverified.' }] };
    bridge.reply(arg('reply'), response);
    return console.log('Response recorded. Run the phase again without --initialize.');
  }
  if (args.includes('--begin')) bridge.begin();
  const options = {
    directory,
    environment,
    api: marketer(bridge.call.bind(bridge)),
    observationSession: bridge.state.session,
    initialize: args.includes('--initialize'),
  };
  try {
    const result =
      phase === 'seed'
        ? await seedArticles({ ...options, articles, imageXml, overwrite: args.includes('--overwrite') })
        : await connectSearch({ ...options, sourceId, homePlacement: arg('home-placement') || 'after-hero' });
    bridge.finish();
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.status === 'complete' ? 0 : 2;
  } catch (error) {
    if (error.code !== 'AWAITING_TOOL') throw error;
    console.log(JSON.stringify({ status: 'awaiting-tool', request: error.request }, null, 2));
  }
}

main().catch((error) => {
  console.error(
    error.code === 'BLOCKED'
      ? error.message
      : 'Execution stopped: inspect local inputs/recovery state; no automatic reset performed.',
  );
  process.exitCode = 2;
});
