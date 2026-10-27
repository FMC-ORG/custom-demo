#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');

// These public fixtures satisfy JSON imports during offline type checking only.
// They are not credentials, generated platform metadata, or a usable live site.
const FIXTURES = {
  '.sitecore/sites.json': [{ name: 'ci-offline', hostName: '*', language: 'en' }],
  '.sitecore/metadata.json': {
    packages: {
      '@sitecore-content-sdk/core': '2.2.0',
      '@sitecore-content-sdk/nextjs': '2.2.0',
    },
  },
};

// next-env.d.ts is gitignored (Next.js regenerates it, and rewrites it in dev mode).
// Type checking still needs its image/global declarations, so a fresh checkout gets
// the standard production form. An existing file is never touched.
const TEXT_FIXTURES = {
  'next-env.d.ts': [
    '/// <reference types="next" />',
    '/// <reference types="next/image-types/global" />',
    'import "./.next/types/routes.d.ts";',
    '',
    '// NOTE: This file should not be edited',
    '// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.',
    '',
  ].join('\n'),
};

function prepareTypecheck(directory = process.cwd()) {
  const result = { created: [], preserved: [] };
  const entries = [
    ...Object.entries(FIXTURES).map(([relative, value]) => [
      relative,
      `${JSON.stringify(value, null, 2)}\n`,
    ]),
    ...Object.entries(TEXT_FIXTURES),
  ];
  for (const [relative, content] of entries) {
    const file = path.join(directory, relative);
    if (fs.existsSync(file)) {
      result.preserved.push(relative);
      continue; // Never inspect, log or overwrite existing environment data.
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, { flag: 'wx' });
    result.created.push(relative);
  }
  return result;
}

if (require.main === module) {
  const result = prepareTypecheck();
  console.log(
    `Offline type-check fixtures: ${result.created.length} created, ${result.preserved.length} preserved. No live Sitecore validation performed.`,
  );
}

module.exports = { prepareTypecheck };
