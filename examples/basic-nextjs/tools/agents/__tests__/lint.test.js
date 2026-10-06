'use strict';

const { execFileSync } = require('node:child_process');
const { run } = require('../index');
const { makeApp, skillMd, rules } = require('./fixture');


const lintRules = (files) => rules(run(['lint'], { cwd: makeApp(files) }));
const oneSkill = (opts, extraFiles = {}) => ({
  '.agents/skills/sitecore-demo/SKILL.md': skillMd({ name: 'sitecore-demo', ...opts }),
  ...extraFiles,
});
const ROUTER = (names) => `# Agents\n\n<!-- agents:router:start -->\n${names.map((n) => `- \`${n}\``).join('\n')}\n<!-- agents:router:end -->\n`;

describe('agents lint — frontmatter', () => {
  it('passes a well-formed skill', () => {
    expect(lintRules(oneSkill({}))).toEqual([]);
  });

  it('rejects missing or invalid frontmatter', () => {
    expect(lintRules({ '.agents/skills/sitecore-demo/SKILL.md': '# none\n' })).toEqual(['frontmatter-missing']);
    expect(lintRules({ '.agents/skills/sitecore-demo/SKILL.md': '---\nname: [oops\n---\n' })).toEqual(['frontmatter-invalid']);
  });

  it('enforces the name format and that the name matches the folder', () => {
    expect(lintRules({ '.agents/skills/Bad_Name/SKILL.md': skillMd({ name: 'Bad_Name' }) })).toEqual(['name-format']);
    expect(lintRules({ '.agents/skills/sitecore-demo/SKILL.md': skillMd({ name: 'sitecore-other' }) })).toEqual(['name-folder-mismatch']);
    const long = 'a'.repeat(65);
    expect(lintRules({ [`.agents/skills/${long}/SKILL.md`]: skillMd({ name: long }) })).toEqual(['name-format']);
  });

  it('requires a description that says when to use the skill, within the length limit', () => {
    expect(lintRules(oneSkill({ description: 'Creates components.' }))).toEqual(['description-use-when']);
    expect(lintRules(oneSkill({ description: `Use when x. ${'y'.repeat(1020)}` }))).toEqual(['description-length']);
    expect(lintRules({ '.agents/skills/sitecore-demo/SKILL.md': '---\nname: sitecore-demo\n---\n' })).toEqual(['description-missing']);
  });

  it('validates the command-only flag and metadata value types', () => {
    expect(lintRules(oneSkill({ extra: 'disable-model-invocation: "yes"\n' }))).toEqual(['disable-model-invocation-type']);
    expect(lintRules(oneSkill({ extra: 'metadata:\n  subagent: true\n' }))).toEqual(['metadata-type']);
  });
});

describe('agents lint — content', () => {
  it('flags skill-relative and app-relative paths that do not exist', () => {
    const body = 'Run `node scripts/missing.mjs --url <URL>` and read [the ref](references/gone.md) and `docs/ai/nope.yaml`.\n';
    expect(lintRules(oneSkill({ body }))).toEqual(['path-missing', 'path-missing', 'path-missing']);
  });

  it('accepts paths that exist and ignores placeholders and URLs', () => {
    const body = [
      'Run `node scripts/run.mjs`, read `references/a.md` and `docs/ai/config/project.yaml`.',
      'Write `docs/ai/demos/<client>/plan.yaml`, see https://example.test/docs/x.',
      '```bash\nnode scripts/run.mjs --out docs/ai/demos/<client>\n```',
    ].join('\n');
    const files = oneSkill({ body }, {
      '.agents/skills/sitecore-demo/scripts/run.mjs': '',
      '.agents/skills/sitecore-demo/references/a.md': '',
      'docs/ai/config/project.yaml': '',
    });
    expect(lintRules(files)).toEqual([]);
  });

  it('accepts missing paths that git ignores (runtime outputs, local secrets)', () => {
    const cwd = makeApp({
      ...oneSkill({ body: 'Read `docs/ai/config/credentials.local.yaml`, `docs/ai/demos/acme`, not `docs/ai/config/missing.yaml`.\n' }),
      '.gitignore': 'docs/ai/config/credentials.local.yaml\ndocs/ai/demos/*/\n',
    });
    execFileSync('git', ['init', '-q'], { cwd });
    expect(rules(run(['lint'], { cwd }))).toEqual(['path-missing']);
  });

  it('checks paths inside fenced code blocks', () => {
    expect(lintRules(oneSkill({ body: '```bash\nnode scripts/missing.mjs\n```\n' }))).toEqual(['path-missing']);
  });

  it('flags npm scripts that are not defined', () => {
    const files = oneSkill({ body: 'Run `npm run agents:sync` then `npm run agents:nope`.\n' }, {
      'package.json': { scripts: { 'agents:sync': 'x' } },
    });
    expect(lintRules(files)).toEqual(['npm-script-missing']);
  });

  it('rejects tool-specific MCP tool ids', () => {
    expect(lintRules(oneSkill({ body: 'Call mcp__sitecore-marketer__get_item first.\n' }))).toEqual(['mcp-tool-id']);
  });

  it('rejects references to removed legacy locations', () => {
    expect(lintRules(oneSkill({ body: 'See docs/ai/skills/old.md and docs/ai/scripts/x.mjs.\n' }))).toEqual(['legacy-path', 'legacy-path']);
  });

  it('reports the line number in the source file', () => {
    const result = run(['lint'], { cwd: makeApp(oneSkill({ body: 'line one\nmcp__x__y\n' })) });
    expect(result.messages[0].file).toBe('.agents/skills/sitecore-demo/SKILL.md:7');
  });
});

describe('agents lint — AGENTS.md', () => {
  it('passes when the router lists exactly the non-hidden skills', () => {
    const files = {
      'AGENTS.md': ROUTER(['sitecore-a']),
      '.agents/skills/sitecore-a/SKILL.md': skillMd({ name: 'sitecore-a' }),
      '.agents/skills/sitecore-sub/SKILL.md': skillMd({ name: 'sitecore-sub', extra: 'metadata:\n  hidden: "true"\n' }),
    };
    expect(lintRules(files)).toEqual([]);
  });

  it('flags router entries without a skill and skills missing from the router', () => {
    const files = {
      'AGENTS.md': ROUTER(['sitecore-ghost']),
      '.agents/skills/sitecore-a/SKILL.md': skillMd({ name: 'sitecore-a' }),
    };
    expect(lintRules(files)).toEqual(['router-unknown-skill', 'router-missing-skill']);
  });

  it('requires router markers', () => {
    expect(lintRules({ 'AGENTS.md': '# Agents\n' })).toEqual(['router-markers-missing']);
  });

  it('rejects @ imports, which not every agent expands', () => {
    expect(lintRules({ 'AGENTS.md': `@docs/rules.md\n${ROUTER([])}` })).toEqual(['agents-md-import']);
  });

  it('applies the content rules to AGENTS.md too', () => {
    expect(lintRules({ 'AGENTS.md': `See \`docs/missing.md\` and mcp__a__b.\n${ROUTER([])}` })).toEqual(['mcp-tool-id', 'path-missing']);
  });
});

describe('agents check', () => {
  it('combines sync --check and lint', () => {
    const result = run(['check'], { cwd: makeApp(oneSkill({ description: 'No guidance.' })) });
    expect(result.exitCode).toBe(1);
    expect(rules(result)).toEqual(expect.arrayContaining(['generated-missing', 'description-use-when']));
  });
});
