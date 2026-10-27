#!/usr/bin/env node
/**
 * Local Start Check for a new demo. See ../SKILL.md.
 * Prints a readable summary to stderr and the JSON report to stdout.
 * Exit codes: 0 = no blockers, 2 = blockers found, 1 = unexpected error.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { startCheck } = require('./lib/start-checks.cjs');

const args = process.argv.slice(2);
const arg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--')
    ? args[index + 1]
    : undefined;
};

if (!args.length || args.includes('--help')) {
  console.log(`Usage: node .agents/skills/sitecore-start-demo/scripts/start-demo.mjs --client <name> [--url <url>] [--showcase-url <url>] [--editing-host-url <url>] [--check] [--continue]

  --client    Client name, lowercase kebab-case (branch <name>-demo, folder docs/ai/demos/<name>/)
  --url       Client homepage URL (required on first start; later read from setup.json)
  --showcase-url      Deployed demo URL (public production URL), optional; kept in setup.json
  --editing-host-url  Pages editing host URL, optional; kept in setup.json (never include bypass tokens)
  --check     Check only: fix nothing and write nothing (used by sitecore-build-demo)
  --continue  Continue an existing demo branch/folder instead of stopping

Run from examples/basic-nextjs. Never changes Sitecore, Content Hub or git remotes.`);
  process.exit(0);
}

const icon = { pass: 'PASS ', fixed: 'FIXED', skipped: 'SKIP ', fail: '' };
try {
  const report = await startCheck({
    app: resolve(process.cwd()),
    client: arg('client'),
    url: arg('url'),
    showcaseUrl: arg('showcase-url'),
    editingHostUrl: arg('editing-host-url'),
    check: args.includes('--check'),
    continueDemo: args.includes('--continue'),
  });
  for (const c of report.checks) {
    const label =
      c.status === 'fail'
        ? c.level === 'blocker'
          ? 'BLOCK'
          : c.level === 'warning'
            ? 'WARN '
            : 'INFO '
        : icon[c.status];
    console.error(`${label}  ${c.id.padEnd(16)} ${c.message}`);
  }
  console.error(
    `\n${report.ok ? 'Ready' : 'Not ready'}: ${report.blockers} blocker(s), ${report.warnings} warning(s).`,
  );
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.ok ? 0 : 2;
} catch (error) {
  console.error(`Start check stopped: ${error.message}`);
  process.exitCode = 1;
}
