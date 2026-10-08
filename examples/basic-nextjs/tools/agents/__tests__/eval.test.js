'use strict';

const { run } = require('../index');
const { makeApp, skillMd, rules } = require('./fixture');

const EVALS = `cases:
  - id: hero
    prompt: "Create a hero"
    expect: sitecore-create-simple
  - id: demo
    prompt: "Build a demo"
    expect: none
`;

const app = (evals = EVALS) =>
  makeApp({
    '.agents/skills/sitecore-create-simple/SKILL.md': skillMd({ name: 'sitecore-create-simple' }),
    '.agents/skills/sitecore-create-list/SKILL.md': skillMd({ name: 'sitecore-create-list' }),
    '.agents/skills/sitecore-build-demo/SKILL.md': skillMd({ name: 'sitecore-build-demo', extra: 'disable-model-invocation: true\n' }),
    'tools/agents/evals/routing.yaml': evals,
  });

/** Fake agent answering from a { prompt: answer } table. */
const agentAnswering = (answers, seen = []) => (agent, prompt) => {
  seen.push({ agent, prompt });
  return { status: 'ok', output: answers[prompt] ?? '' };
};

describe('agents eval', () => {
  it('passes when every agent routes every case as expected', () => {
    const exec = agentAnswering({ 'Create a hero': 'sitecore-create-simple', 'Build a demo': 'none' });

    const result = run(['eval'], { cwd: app(), exec });

    expect(result.exitCode).toBe(0);
    expect(result.messages.filter((m) => m.rule === 'eval-summary').map((m) => m.message)).toEqual([
      '2/2 cases routed as expected',
      '2/2 cases routed as expected',
    ]);
  });

  it('fails and reports expected versus actual for misrouted cases', () => {
    const exec = agentAnswering({ 'Create a hero': 'sitecore-create-list', 'Build a demo': 'sitecore-build-demo' });

    const result = run(['eval', '--agent', 'pi'], { cwd: app(), exec });

    expect(result.exitCode).toBe(1);
    expect(result.messages).toContainEqual(
      expect.objectContaining({ rule: 'eval-fail', file: 'pi:hero', message: 'expected sitecore-create-simple, got sitecore-create-list' })
    );
    expect(result.messages).toContainEqual(expect.objectContaining({ rule: 'eval-fail', file: 'pi:demo' }));
  });

  it('extracts the skill name from chatty or formatted answers', () => {
    const exec = agentAnswering({
      'Create a hero': 'Thinking...\n\n**`sitecore-create-simple`**',
      'Build a demo': '4. None. `sitecore-build-demo` only runs when you start it yourself.',
    });
    expect(run(['eval', '--agent', 'claude'], { cwd: app(), exec }).exitCode).toBe(0);
  });

  it('runs only the selected agents and cases', () => {
    const seen = [];
    run(['eval', '--agent', 'claude', '--case', 'hero'], { cwd: app(), exec: agentAnswering({}, seen) });
    expect(seen).toHaveLength(1);
    expect(seen[0].agent).toBe('claude');
    expect(seen[0].prompt).toContain('Create a hero');
  });

  it('skips an agent that is not installed without failing', () => {
    const exec = (agent) => (agent === 'claude' ? { status: 'missing' } : { status: 'ok', output: 'none' });

    const result = run(['eval', '--case', 'demo'], { cwd: app(), exec });

    expect(result.exitCode).toBe(0);
    expect(result.messages).toContainEqual(expect.objectContaining({ rule: 'eval-skipped', file: 'claude' }));
  });

  it('counts an agent error as a failure', () => {
    const exec = () => ({ status: 'error', output: 'Access denied (401)\nmore' });
    const result = run(['eval', '--agent', 'pi', '--case', 'hero'], { cwd: app(), exec });
    expect(result.messages).toContainEqual(expect.objectContaining({ rule: 'eval-fail', message: expect.stringContaining('agent error: Access denied (401)') }));
  });

  it('reports a missing eval file', () => {
    expect(rules(run(['eval'], { cwd: makeApp({}), exec: () => ({}) }))).toEqual(['eval-missing']);
  });
});

describe('agents lint — routing evals', () => {
  it('accepts expectations that name auto-invocable skills or none', () => {
    expect(rules(run(['lint'], { cwd: app() }))).toEqual([]);
  });

  it('flags expectations naming unknown or command-only skills', () => {
    const evals = `cases:
  - id: ghost
    prompt: "x"
    expect: sitecore-ghost
  - id: demo
    prompt: "y"
    expect: sitecore-build-demo
  - id: broken
    prompt: "z"
`;
    expect(rules(run(['lint'], { cwd: app(evals) }))).toEqual(['eval-unknown-skill', 'eval-command-only', 'eval-invalid']);
  });
});
