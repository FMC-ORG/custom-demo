'use strict';

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

/** App-root-relative locations of the canonical sources. */
const SKILLS_DIR = '.agents/skills';
const MCP_FILE = '.agents/mcp.json';
const AGENTS_MD = 'AGENTS.md';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Split a markdown file into parsed YAML frontmatter and body.
 * @param {string} text
 * @returns {{ frontmatter: object | null, body: string, error?: string }}
 */
function parseFrontmatter(text) {
  const match = FRONTMATTER_RE.exec(text);
  if (!match) return { frontmatter: null, body: text };
  try {
    const parsed = yaml.load(match[1]);
    const frontmatter = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    return { frontmatter, body: text.slice(match[0].length) };
  } catch (err) {
    return { frontmatter: null, body: text.slice(match[0].length), error: err.message };
  }
}

/**
 * A canonical skill as read from `.agents/skills/<folder>/SKILL.md`.
 * @typedef {object} Skill
 * @property {string} folder        Folder name under `.agents/skills/`
 * @property {string} file          App-root-relative path to SKILL.md
 * @property {string} dir           App-root-relative path to the skill folder
 * @property {object|null} frontmatter
 * @property {string} body
 * @property {string} [parseError]
 */

/**
 * Discover canonical skills (one level deep, folders containing SKILL.md).
 * @param {string} cwd App root
 * @returns {Skill[]}
 */
function readSkills(cwd) {
  const root = path.join(cwd, SKILLS_DIR);
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort()
    .map((folder) => {
      const dir = `${SKILLS_DIR}/${folder}`;
      const file = `${dir}/SKILL.md`;
      const { frontmatter, body, error } = parseFrontmatter(fs.readFileSync(path.join(cwd, file), 'utf8'));
      return { folder, file, dir, frontmatter, body, ...(error && { parseError: error }) };
    });
}

/** @param {Skill} skill */
const isCommandOnly = (skill) => skill.frontmatter?.['disable-model-invocation'] === true;

/** @param {Skill} skill */
const metadata = (skill) => skill.frontmatter?.metadata ?? {};

/** @param {Skill} skill */
const isSubagent = (skill) => metadata(skill).subagent === 'true';

/** @param {Skill} skill — hidden skills are only invoked by other skills, never listed in the router. */
const isHidden = (skill) => metadata(skill).hidden === 'true';

module.exports = {
  SKILLS_DIR,
  MCP_FILE,
  AGENTS_MD,
  parseFrontmatter,
  readSkills,
  isCommandOnly,
  isSubagent,
  isHidden,
  metadata,
};
