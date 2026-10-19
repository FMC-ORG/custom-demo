'use strict';
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const root = path.resolve(__dirname, '../../..');

test('brand font utilities compile to font-family without overriding bold font weights', async () => {
  const css = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');
  const themes = css.match(/@theme(?:\s+inline)?\s*\{[^}]*\}/g) || [];
  const compiled = (
    await postcss([tailwind()]).process(
      `@import "tailwindcss" source(none); @source inline("font-heading font-body font-bold");\n${themes.join('\n')}`,
      { from: path.join(root, 'font-test.css') },
    )
  ).css;
  expect(compiled).toMatch(/\.font-heading\s*\{\s*font-family:\s*var\(--brand-heading-font\)/);
  expect(compiled).toMatch(/\.font-body\s*\{\s*font-family:\s*var\(--brand-body-font\)/);
  expect(compiled).not.toMatch(/font-weight:\s*var\(--brand-(heading|body)-font/);
  expect(compiled).toMatch(/\.font-bold\s*\{[^}]*font-weight:/);
});
