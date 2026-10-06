'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { run } = require('../index');
const { makeApp, writeFiles, read, exists, skillMd, rules } = require('./fixture');

const MCP = {
  mcpServers: {
    sitecore_marketer: { type: 'http', url: 'https://example.test/marketer' },
    local_tool: { command: 'npx', args: ['tool'] },
  },
};

describe('agents sync', () => {
  it('generates Claude Code and Cursor skill wrappers that point at the canonical skill', () => {
    const cwd = makeApp({ '.agents/skills/sitecore-demo/SKILL.md': skillMd({ name: 'sitecore-demo' }) });

    const result = run(['sync'], { cwd });

    expect(result.exitCode).toBe(0);
    for (const dir of ['.claude/skills', '.cursor/skills']) {
      const wrapper = read(cwd, `${dir}/sitecore-demo/SKILL.md`);
      expect(wrapper).toMatch(/^---\nname: sitecore-demo\ndescription: Does sitecore-demo\. Use when testing sitecore-demo\.\n---/);
      expect(wrapper).toContain('`.agents/skills/sitecore-demo/SKILL.md`');
      expect(wrapper).toContain('GENERATED');
      expect(wrapper).not.toContain('disable-model-invocation');
    }
  });

  it('marks command-only skills as such for every tool', () => {
    const cwd = makeApp({
      '.agents/skills/sitecore-big/SKILL.md': skillMd({ name: 'sitecore-big', extra: 'disable-model-invocation: true\n' }),
    });

    run(['sync'], { cwd });

    expect(read(cwd, '.claude/skills/sitecore-big/SKILL.md')).toContain('disable-model-invocation: true');
    expect(read(cwd, '.cursor/skills/sitecore-big/SKILL.md')).toContain('disable-model-invocation: true');
  });

  it('creates a Claude Code subagent only for skills flagged as subagents', () => {
    const cwd = makeApp({
      '.agents/skills/sitecore-analyze/SKILL.md': skillMd({ name: 'sitecore-analyze', extra: 'metadata:\n  subagent: "true"\n' }),
      '.agents/skills/sitecore-plain/SKILL.md': skillMd({ name: 'sitecore-plain' }),
    });

    run(['sync'], { cwd });

    const agent = read(cwd, '.claude/agents/sitecore-analyze.md');
    expect(agent).toMatch(/^---\nname: sitecore-analyze\n/);
    expect(agent).toContain('`.agents/skills/sitecore-analyze/SKILL.md`');
    expect(exists(cwd, '.claude/agents/sitecore-plain.md')).toBe(false);
  });

  it('fans the canonical MCP servers out to Claude Code, Cursor, and Pi', () => {
    const cwd = makeApp({ '.agents/mcp.json': MCP });

    run(['sync'], { cwd });

    const claude = JSON.parse(read(cwd, '.mcp.json'));
    const pi = JSON.parse(read(cwd, '.pi/mcp.json'));
    const cursor = JSON.parse(read(cwd, '.cursor/mcp.json'));
    expect(claude).toEqual(MCP);
    expect(pi).toEqual(MCP);
    expect(Object.keys(cursor.mcpServers)).toEqual(['sitecore_marketer', 'local_tool']);
    expect(cursor.mcpServers.sitecore_marketer).toEqual({ url: 'https://example.test/marketer' });
    expect(cursor.mcpServers.local_tool).toEqual({ command: 'npx', args: ['tool'] });
  });

  it('generates Cursor rules: an always-apply pointer to AGENTS.md and glob-scoped skill rules', () => {
    const cwd = makeApp({
      'AGENTS.md': '# Agents\n',
      '.agents/skills/sitecore-standards/SKILL.md': skillMd({
        name: 'sitecore-standards',
        extra: 'metadata:\n  cursorGlobs: "src/components/uiim/**"\n',
      }),
    });

    run(['sync'], { cwd });

    const always = read(cwd, '.cursor/rules/agents.mdc');
    expect(always).toContain('alwaysApply: true');
    expect(always).toContain('`AGENTS.md`');
    const scoped = read(cwd, '.cursor/rules/sitecore-standards.mdc');
    expect(scoped).toContain('globs: src/components/uiim/**');
    expect(scoped).toContain('alwaysApply: false');
  });

  it('does not generate the always-apply Cursor rule when there is no AGENTS.md', () => {
    const cwd = makeApp({ '.agents/mcp.json': MCP });
    run(['sync'], { cwd });
    expect(exists(cwd, '.cursor/rules/agents.mdc')).toBe(false);
  });

  it('removes generated files whose canonical skill was deleted, but never touches hand-written files', () => {
    const cwd = makeApp({
      '.agents/skills/sitecore-old/SKILL.md': skillMd({ name: 'sitecore-old', extra: 'metadata:\n  subagent: "true"\n' }),
      '.cursor/rules/hand-written.mdc': 'mine\n',
    });
    run(['sync'], { cwd });

    fs.rmSync(path.join(cwd, '.agents/skills/sitecore-old'), { recursive: true });
    run(['sync'], { cwd });

    expect(exists(cwd, '.claude/skills/sitecore-old')).toBe(false);
    expect(exists(cwd, '.cursor/skills/sitecore-old')).toBe(false);
    expect(exists(cwd, '.claude/agents/sitecore-old.md')).toBe(false);
    expect(read(cwd, '.cursor/rules/hand-written.mdc')).toBe('mine\n');
  });

  it('is idempotent', () => {
    const cwd = makeApp({ '.agents/skills/sitecore-demo/SKILL.md': skillMd({ name: 'sitecore-demo' }), '.agents/mcp.json': MCP });
    run(['sync'], { cwd });

    const second = run(['sync'], { cwd });

    expect(second.filesWritten).toEqual([]);
    expect(rules(second)).toEqual([]);
  });

  it('skips skills with unusable frontmatter instead of generating broken wrappers', () => {
    const cwd = makeApp({ '.agents/skills/broken/SKILL.md': '# no frontmatter\n' });
    const result = run(['sync'], { cwd });
    expect(result.exitCode).toBe(0);
    expect(exists(cwd, '.claude/skills/broken')).toBe(false);
  });
});

describe('agents sync --check', () => {
  const synced = () => {
    const cwd = makeApp({ '.agents/skills/sitecore-demo/SKILL.md': skillMd({ name: 'sitecore-demo' }), '.agents/mcp.json': MCP });
    run(['sync'], { cwd });
    return cwd;
  };

  it('passes when generated files match their sources', () => {
    expect(run(['sync', '--check'], { cwd: synced() }).exitCode).toBe(0);
  });

  it('fails and names the file when a generated wrapper was hand-edited', () => {
    const cwd = synced();
    writeFiles(cwd, { '.claude/skills/sitecore-demo/SKILL.md': 'edited by hand\n' });

    const result = run(['sync', '--check'], { cwd });

    expect(result.exitCode).toBe(1);
    expect(result.messages).toContainEqual(expect.objectContaining({ rule: 'generated-drift', file: '.claude/skills/sitecore-demo/SKILL.md' }));
  });

  it('fails when a generated file is missing or a canonical source changed', () => {
    const cwd = synced();
    fs.rmSync(path.join(cwd, '.pi/mcp.json'));
    writeFiles(cwd, { '.agents/skills/sitecore-new/SKILL.md': skillMd({ name: 'sitecore-new' }) });

    const result = run(['sync', '--check'], { cwd });

    expect(result.exitCode).toBe(1);
    expect(result.messages).toContainEqual(expect.objectContaining({ rule: 'generated-missing', file: '.pi/mcp.json' }));
    expect(result.messages).toContainEqual(expect.objectContaining({ rule: 'generated-missing', file: '.cursor/skills/sitecore-new/SKILL.md' }));
  });

  it('fails when a generated file should have been removed', () => {
    const cwd = synced();
    fs.rmSync(path.join(cwd, '.agents/skills/sitecore-demo'), { recursive: true });

    const result = run(['sync', '--check'], { cwd });

    expect(result.messages).toContainEqual(expect.objectContaining({ rule: 'generated-stale', file: '.claude/skills/sitecore-demo/SKILL.md' }));
  });

  it('writes nothing', () => {
    const cwd = makeApp({ '.agents/skills/sitecore-demo/SKILL.md': skillMd({ name: 'sitecore-demo' }) });
    const result = run(['sync', '--check'], { cwd });
    expect(result.exitCode).toBe(1);
    expect(exists(cwd, '.claude')).toBe(false);
  });
});
