'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../../..');

// Tailwind's compiler (>= 4.3.3) registers Node module hooks, which Jest's sandbox refuses.
// Compile in a plain Node child process instead; the assertions are unchanged.
function compileCss(source) {
  const script = `
    const postcss = require('postcss');
    const tailwind = require('@tailwindcss/postcss');
    let input = '';
    process.stdin.on('data', (d) => (input += d)).on('end', async () => {
      const result = await postcss([tailwind()]).process(input, { from: ${JSON.stringify(path.join(root, 'font-test.css'))} });
      process.stdout.write(result.css);
    });`;
  const run = spawnSync(process.execPath, ['-e', script], { cwd: root, input: source, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`Tailwind compile failed: ${run.stderr}`);
  return run.stdout;
}

test('brand font utilities compile to font-family without overriding bold font weights', () => {
  const css = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');
  const themes = css.match(/@theme(?:\s+inline)?\s*\{[^}]*\}/g) || [];
  const compiled = compileCss(
    `@import "tailwindcss" source(none); @source inline("font-heading font-body font-bold");\n${themes.join('\n')}`,
  );
  expect(compiled).toMatch(/\.font-heading\s*\{\s*font-family:\s*var\(--brand-heading-font\)/);
  expect(compiled).toMatch(/\.font-body\s*\{\s*font-family:\s*var\(--brand-body-font\)/);
  expect(compiled).not.toMatch(/font-weight:\s*var\(--brand-(heading|body)-font/);
  expect(compiled).toMatch(/\.font-bold\s*\{[^}]*font-weight:/);
});
