'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const yaml = require('js-yaml');
const { AGENTS_MD, readSkills, isHidden, isCommandOnly } = require('./skills');

const EVAL_FILE = 'tools/agents/evals/routing.yaml';

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
const USE_WHEN_RE = /\buse (this skill )?when\b/i;

/** Path prefixes resolved against the skill folder. */
const SKILL_RELATIVE = ['scripts/', 'references/', 'assets/'];
/** Path prefixes resolved against the app root. */
const APP_RELATIVE = ['docs/', 'src/', 'tools/', '.agents/', '.sitecore/'];
/** Locations removed by the restructure; canonical text must not point at them. */
const LEGACY_PATHS = ['docs/ai/skills/', 'docs/ai/scripts/', 'docs/ai/agents/', 'docs/ai/rules/'];

const MCP_TOOL_ID_RE = /\bmcp__[A-Za-z0-9_-]+__/g;
/** `npm run <script>`; wildcard or placeholder names (`agents:*`, `<script>`) are not checked. */
const NPM_RUN_RE = /\bnpm run ([A-Za-z0-9:._-]+)(?![A-Za-z0-9:._*<{-])/g;
const ROUTER_RE = /<!--\s*agents:router:start\s*-->([\s\S]*?)<!--\s*agents:router:end\s*-->/;
const PLACEHOLDER_RE = /[<>*{}$…|]/;

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/**
 * Paths that git ignores are runtime outputs or local secrets (demo folders,
 * credentials.local.yaml): legitimately absent from a clean clone.
 * @returns {Set<string>} the subset of `paths` that git ignores (empty outside git)
 */
function gitIgnored(cwd, paths) {
  if (!paths.length) return new Set();
  // Also ask with a trailing slash: missing paths are not known to be directories,
  // so directory-only patterns (e.g. `docs/ai/demos/*/`) would not match otherwise.
  const input = paths.flatMap((p) => [p, `${p}/`]).join('\n');
  const opts = { cwd, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] };
  let out;
  try {
    out = execFileSync('git', ['check-ignore', '--no-index', '--stdin'], opts);
  } catch (err) {
    // exit 1 = none ignored; other failures (no git) = treat as none ignored
    out = err.stdout ?? '';
  }
  return new Set(out.split('\n').filter(Boolean).map((p) => p.replace(/\/$/, '')));
}

/** Candidate path tokens from inline code, fenced code, and link targets. */
function pathCandidates(text) {
  const out = [];
  const push = (raw, index) => {
    for (const token of raw.split(/\s+/)) {
      const clean = token.replace(/^\.\//, '').replace(/[`'",;:.)\]]+$/, '').replace(/#.*$/, '');
      if (!clean || PLACEHOLDER_RE.test(clean) || /^[a-z]+:\/\//i.test(clean)) continue;
      out.push({ value: clean, line: lineOf(text, index) });
    }
  };
  for (const m of text.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) push(m[1], m.index);
  const withoutFences = text.replace(/```[\s\S]*?```/g, (block) => ' '.repeat(block.length));
  for (const m of withoutFences.matchAll(/`([^`\n]+)`/g)) push(m[1], m.index);
  for (const m of withoutFences.matchAll(/\]\(([^)\s]+)\)/g)) push(m[1], m.index);
  return out;
}

function checkFrontmatter(skill, report) {
  if (skill.parseError) return report('frontmatter-invalid', 1, `frontmatter is not valid YAML: ${skill.parseError}`);
  if (!skill.frontmatter) return report('frontmatter-missing', 1, 'SKILL.md must start with YAML frontmatter');
  const { name, description, metadata } = skill.frontmatter;
  const dmi = skill.frontmatter['disable-model-invocation'];

  if (typeof name !== 'string' || !name) report('name-missing', 1, '`name` is required');
  else {
    if (!NAME_RE.test(name) || name.length > MAX_NAME)
      report('name-format', 1, `\`name\` must be lowercase kebab-case, at most ${MAX_NAME} chars`);
    if (name !== skill.folder) report('name-folder-mismatch', 1, `\`name\` "${name}" must equal folder "${skill.folder}"`);
  }

  if (typeof description !== 'string' || !description.trim()) report('description-missing', 1, '`description` is required');
  else {
    if (description.length > MAX_DESCRIPTION)
      report('description-length', 1, `\`description\` is ${description.length} chars; max ${MAX_DESCRIPTION}`);
    if (!USE_WHEN_RE.test(description)) report('description-use-when', 1, '`description` must say when to use the skill ("Use when …")');
  }

  if (dmi !== undefined && typeof dmi !== 'boolean')
    report('disable-model-invocation-type', 1, '`disable-model-invocation` must be true or false');

  if (metadata !== undefined) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata))
      report('metadata-type', 1, '`metadata` must be a key-value map');
    else
      for (const [key, value] of Object.entries(metadata))
        if (typeof value !== 'string') report('metadata-type', 1, `\`metadata.${key}\` must be a string (quote it)`);
  }
}

function checkText({ text, bodyOffset, skillDir, cwd, scripts, report, missingPaths }) {
  const at = (index) => lineOf(text, index) + bodyOffset;

  for (const m of text.matchAll(MCP_TOOL_ID_RE))
    report('mcp-tool-id', at(m.index), `use the plain MCP tool name, not the tool-specific id "${m[0]}…"`);

  for (const legacy of LEGACY_PATHS) {
    let i = text.indexOf(legacy);
    while (i !== -1) {
      report('legacy-path', at(i), `"${legacy}" was removed; reference the skill or tools/agents instead`);
      i = text.indexOf(legacy, i + 1);
    }
  }

  for (const m of text.matchAll(NPM_RUN_RE))
    if (!scripts.has(m[1])) report('npm-script-missing', at(m.index), `\`npm run ${m[1]}\` is not defined in package.json`);

  for (const { value, line } of pathCandidates(text)) {
    let target = null;
    if (skillDir && SKILL_RELATIVE.some((p) => value.startsWith(p))) target = path.join(skillDir, value);
    else if (APP_RELATIVE.some((p) => value.startsWith(p))) target = value;
    if (target && !LEGACY_PATHS.some((p) => value.startsWith(p)) && !fs.existsSync(path.join(cwd, target)))
      missingPaths.push({ target, value, line: line + bodyOffset, report });
  }
}

function checkRouter(agentsText, skills, report) {
  const match = ROUTER_RE.exec(agentsText);
  if (!match) return report('router-markers-missing', 1, 'AGENTS.md needs a router block between <!-- agents:router:start --> and <!-- agents:router:end -->');
  const line = lineOf(agentsText, match.index);
  const known = new Set(skills.map((s) => s.frontmatter?.name).filter(Boolean));
  const listed = new Set([...match[1].matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`/g)].map((m) => m[1]));

  for (const name of listed) if (!known.has(name)) report('router-unknown-skill', line, `router lists "${name}", which is not a skill`);
  for (const skill of skills)
    if (skill.frontmatter?.name && !isHidden(skill) && !listed.has(skill.frontmatter.name))
      report('router-missing-skill', line, `skill "${skill.frontmatter.name}" is not listed in the router`);
}

/** Routing eval expectations must name real, auto-invocable skills (or `none`). */
function checkEvals(text, skills, report) {
  let cases;
  try {
    cases = yaml.load(text)?.cases ?? [];
  } catch (err) {
    return report('eval-invalid', 1, `routing evals are not valid YAML: ${err.message}`);
  }
  const byName = new Map(skills.map((s) => [s.frontmatter?.name, s]));
  for (const c of cases) {
    const line = lineOf(text, Math.max(0, text.indexOf(`id: ${c.id}`)));
    if (!c.id || !c.prompt || !c.expect) report('eval-invalid', line, 'each case needs id, prompt, and expect');
    else if (c.expect === 'none') continue;
    else if (!byName.has(c.expect)) report('eval-unknown-skill', line, `case "${c.id}" expects "${c.expect}", which is not a skill`);
    else if (isCommandOnly(byName.get(c.expect)))
      report('eval-command-only', line, `case "${c.id}" expects command-only skill "${c.expect}"; the model never auto-loads it — expect none`);
  }
}

/**
 * Lint canonical skills and AGENTS.md.
 * @param {string} cwd App root
 * @returns {{ exitCode: number, messages: object[] }}
 */
function lint(cwd) {
  const messages = [];
  const reporter = (file) => (rule, line, message) => messages.push({ level: 'error', rule, file: `${file}:${line}`, message });

  const pkgPath = path.join(cwd, 'package.json');
  const scripts = new Set(Object.keys(fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')).scripts ?? {} : {}));
  const skills = readSkills(cwd);
  const missingPaths = [];

  for (const skill of skills) {
    const report = reporter(skill.file);
    checkFrontmatter(skill, report);
    const full = fs.readFileSync(path.join(cwd, skill.file), 'utf8');
    const bodyOffset = full.split('\n').length - skill.body.split('\n').length;
    checkText({ text: skill.body, bodyOffset, skillDir: skill.dir, cwd, scripts, report, missingPaths });
  }

  const agentsPath = path.join(cwd, AGENTS_MD);
  if (fs.existsSync(agentsPath)) {
    const text = fs.readFileSync(agentsPath, 'utf8');
    const report = reporter(AGENTS_MD);
    for (const m of text.matchAll(/^@\S+/gm))
      report('agents-md-import', lineOf(text, m.index), '`@` imports are not expanded by every agent; inline the content or link to it');
    checkText({ text, bodyOffset: 0, skillDir: null, cwd, scripts, report, missingPaths });
    checkRouter(text, skills, report);
  }

  const evalPath = path.join(cwd, EVAL_FILE);
  if (fs.existsSync(evalPath)) checkEvals(fs.readFileSync(evalPath, 'utf8'), skills, reporter(EVAL_FILE));

  const ignored = gitIgnored(cwd, [...new Set(missingPaths.map((m) => m.target))]);
  for (const { target, value, line, report } of missingPaths)
    if (!ignored.has(target)) report('path-missing', line, `referenced path "${value}" does not exist`);

  return { exitCode: messages.length ? 1 : 0, messages };
}

module.exports = { lint };
