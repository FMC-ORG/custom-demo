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

function prepareTypecheck(directory = process.cwd()) {
  const result = { created: [], preserved: [] };
  for (const [relative, value] of Object.entries(FIXTURES)) {
    const file = path.join(directory, relative);
    if (fs.existsSync(file)) {
      result.preserved.push(relative);
      continue; // Never inspect, log or overwrite existing environment data.
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
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
