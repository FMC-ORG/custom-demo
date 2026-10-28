#!/usr/bin/env node
/**
 * Prepare the demo article images for upload to THIS environment's Content Hub (ADR 0013 decision 5).
 *
 * Usage (from examples/basic-nextjs):
 *   node .agents/skills/sitecore-search/scripts/prepare-article-images.mjs [--directory <dir>]
 *   node .agents/skills/sitecore-build-demo/scripts/upload-to-content-hub.mjs --images-dir <dir> --initialize
 *   node .agents/skills/sitecore-search/scripts/search-setup.cjs --phase seed --initialize \
 *        --images-manifest <dir>/image-manifest.json
 *
 * Downloads each article's deterministic image (Lorem Picsum seed from assets/articles.json, 1200x675)
 * into <dir> (default .search-setup/images) and writes image-manifest.json in the format
 * upload-to-content-hub.mjs expects (plus articleName). Existing files are reused, never re-downloaded.
 * Without Content Hub credentials, skip this: seeding falls back to the shared sandbox XML.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]);
  process.exit(0);
}
const i = args.indexOf('--directory');
const directory = resolve(i >= 0 && args[i + 1] ? args[i + 1] : '.search-setup/images');
const here = dirname(fileURLToPath(import.meta.url));
const { articles } = JSON.parse(readFileSync(join(here, '../assets/articles.json'), 'utf8'));

mkdirSync(directory, { recursive: true });
const manifestFile = join(directory, 'image-manifest.json');
if (existsSync(manifestFile)) {
  // The upload journal owns this file once an upload started; never replace it.
  console.error(`image-manifest.json already exists in ${directory}; reusing it (upload journal may depend on it).`);
  process.exit(0);
}

const manifest = [];
for (const article of articles) {
  const file = `${article.image.seed}.jpg`;
  const target = join(directory, file);
  const src = `https://picsum.photos/seed/${article.image.seed}/1200/675.jpg`;
  if (!existsSync(target)) {
    const res = await fetch(src, { redirect: 'follow', signal: AbortSignal.timeout(60000) });
    if (!res.ok) {
      console.error(`FAILED ${article.name}: HTTP ${res.status}`);
      process.exitCode = 2;
      continue;
    }
    const bytes = Buffer.from(await res.arrayBuffer());
    if (!(bytes[0] === 0xff && bytes[1] === 0xd8)) {
      console.error(`FAILED ${article.name}: not a JPEG`);
      process.exitCode = 2;
      continue;
    }
    writeFileSync(target, bytes);
  }
  manifest.push({
    src,
    alt: article.title,
    localFile: file,
    extension: 'jpg',
    type: 'img',
    fileSize: statSync(target).size,
    width: 1200,
    height: 675,
    status: 'downloaded',
    target: 'article',
    targetField: 'ArticleImage',
    articleName: article.name,
  });
}
writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${manifest.length}/${articles.length} images ready in ${directory}. Next: upload-to-content-hub.mjs --images-dir ${directory} --initialize`);
