'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Create a throwaway app folder from a `{ relativePath: content }` map.
 * Objects are written as JSON.
 */
function makeApp(files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-fixture-'));
  writeFiles(dir, { 'package.json': { name: 'fixture', scripts: {} }, ...files });
  return dir;
}

function writeFiles(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(dir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`);
  }
}

const read = (dir, rel) => fs.readFileSync(path.join(dir, rel), 'utf8');
const exists = (dir, rel) => fs.existsSync(path.join(dir, rel));

/** Build a SKILL.md with frontmatter lines and a body. */
function skillMd({ name, description = `Does ${name}. Use when testing ${name}.`, extra = '', body = '# Skill\n' }) {
  return `---\nname: ${name}\ndescription: ${description}\n${extra}---\n\n${body}`;
}

const rules = (result) => result.messages.filter((m) => m.level === 'error').map((m) => m.rule);

module.exports = { makeApp, writeFiles, read, exists, skillMd, rules };
