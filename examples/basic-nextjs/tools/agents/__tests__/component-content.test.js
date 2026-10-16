'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { diagnostics } = require('../lib/component-content.cjs');
const header = `import { Text, RichText, NextImage, Link } from '@sitecore-content-sdk/nextjs';`;

test('component guards reject untyped brand-family classes and confirmed text truthiness', () => {
  const messages = diagnostics(`${header}
    const view = <>{(fields.Title?.value || isEditing) && <Text field={fields.Title} className="font-[var(--brand-heading-font,inherit)]" />}
    {(fields.Body?.value || isEditing) && <RichText field={fields.Body} />}</>;`);
  expect(messages.filter((x) => x.level === 'error')).toHaveLength(3);
});

test('valid family/weight utilities, meaningful-content predicates and image/link checks pass', () => {
  const messages = diagnostics(`${header}
    const view = <>{(hasText(fields.Title?.value) || isEditing) && <Text field={fields.Title} className="font-heading font-[700] font-[weight:var(--weight)] font-[family-name:var(--family)]" />}
    {(hasRichText(fields.Body?.value) || isEditing) && <RichText field={fields.Body} />}
    {(fields.Image?.value?.src || isEditing) && <NextImage field={fields.Image} />}
    {(fields.Link?.value?.href || isEditing) && <Link field={fields.Link} />}</>;`);
  expect(messages).toEqual([]);
});

test('Rich Text visibility cannot substitute a plain-text whitespace check', () => {
  const messages = diagnostics(
    `${header} const view = <>{(hasText(fields.Body?.value) || isEditing) && <RichText field={fields.Body} />}</>;`,
  );
  expect(messages.some((x) => x.level === 'error' && x.message.includes('hasRichText'))).toBe(true);
});

test('the component validator exits unsuccessfully for clear regressions and passes after correction', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'component-validator-'));
  try {
    fs.mkdirSync(path.join(root, 'tools/agents/lib'), { recursive: true });
    fs.mkdirSync(path.join(root, '.sitecore'), { recursive: true });
    fs.mkdirSync(path.join(root, 'src/components/uiim/test'), { recursive: true });
    fs.symlinkSync(
      path.resolve(__dirname, '../../../node_modules'),
      path.join(root, 'node_modules'),
      'dir',
    );
    const cli = path.join(root, 'tools/agents/validate-components.mjs');
    fs.copyFileSync(path.resolve(__dirname, '../validate-components.mjs'), cli);
    fs.copyFileSync(
      path.resolve(__dirname, '../lib/component-content.cjs'),
      path.join(root, 'tools/agents/lib/component-content.cjs'),
    );
    fs.writeFileSync(
      path.join(root, '.sitecore/component-map.ts'),
      "import * as Example from 'src/components/uiim/test/Example';\nconst map = [['Example', { ...Example }]];",
    );
    const component = path.join(root, 'src/components/uiim/test/Example.tsx');
    fs.writeFileSync(
      component,
      `${header} export const Default = () => <Text field={fields.Title} className="font-[var(--brand-heading-font)]" />;`,
    );
    expect(spawnSync(process.execPath, [cli], { encoding: 'utf8' }).status).toBe(1);
    fs.writeFileSync(
      component,
      `${header} export const Default = () => <>{(hasText(fields.Title?.value) || isEditing) && <Text field={fields.Title} className="font-heading font-bold" />}</>;`,
    );
    expect(spawnSync(process.execPath, [cli], { encoding: 'utf8' }).status).toBe(0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('unknown field types and untyped non-brand variables receive actionable review warnings', () => {
  const messages = diagnostics(
    `const view = <div className="font-[var(--custom)]">{(unknown?.value || isEditing) && <Something field={unknown} />}</div>;`,
  );
  expect(messages).toHaveLength(2);
  expect(messages.every((x) => x.level === 'warning' && x.line && x.column)).toBe(true);
});
