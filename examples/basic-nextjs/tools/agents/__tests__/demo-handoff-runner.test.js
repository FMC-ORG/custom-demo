'use strict';
// The bundled codemode runner must stop instead of looping and must keep service rejections.
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '../../../.agents/skills/sitecore-build-demo/scripts/mcp-handoff-runner.js'),
  'utf8',
);
const awaiting = (id, tool = 'get_components_on_page', mutation = false) =>
  JSON.stringify({ status: 'awaiting-tool', request: { id, tool, args: { pageId: 'p' }, mutation } });
const ID1 = '11111111-1111-1111-1111-111111111111';
const ID2 = '22222222-2222-2222-2222-222222222222';
const options = { phase: 'assemble', plan: 'docs/ai/demos/x/execution-plan.json', directory: 'docs/ai/demos/x' };

function harness(steps, call) {
  const commands = [];
  const writes = [];
  global.describeTool = async () => ({});
  global.tools = {
    bash: async ({ command }) => {
      commands.push(command);
      if (command.includes('--claim')) {
        const id = command.split('--claim ')[1];
        const step = JSON.parse(steps.current);
        return { exit_code: 0, output: JSON.stringify({ id, tool: step.request.tool, args: step.request.args, mutation: step.request.mutation }) };
      }
      if (command.includes('--reply') || command.startsWith('rm ')) return { exit_code: 0, output: '' };
      steps.current = steps.list.shift();
      return { exit_code: 0, output: steps.current };
    },
    write: async ({ content }) => { writes.push(JSON.parse(content)); return 'ok'; },
    mcp__sitecore_marketer__get_components_on_page: call,
    mcp__sitecore_marketer__set_component_datasource: call,
  };
  return { run: eval(source), commands, writes };
}
afterEach(() => { delete global.tools; delete global.describeTool; });

test('stops when the helper hands back the same request (no progress) and never sleeps', async () => {
  const h = harness({ list: [awaiting(ID1), awaiting(ID1)] }, async () => ({ components: [] }));
  const result = await h.run(options);
  expect(result.stop).toMatch(/no progress/);
  expect(h.commands.some((c) => /\bsleep\b/.test(c))).toBe(false);
});

test('a 422 thrown by the tool is recorded as a reply so the helper can classify it', async () => {
  const h = harness(
    { list: [awaiting(ID1, 'set_component_datasource', true), JSON.stringify({ status: 'partial', unresolved: [{ key: 'footer:wire' }], issues: [] })] },
    async () => { throw new Error('Agent API request failed: Datasource template mismatch (422)'); },
  );
  const result = await h.run(options);
  expect(h.writes[0]).toMatchObject({ isError: true });
  expect(result).toMatchObject({ stop: 'phase finished', status: 'partial', writes: 1 });
  expect(result.next).toMatch(/STOP/);
});

test('a mutation lost without any response stops the run and is never re-claimed', async () => {
  const h = harness({ list: [awaiting(ID2, 'set_component_datasource', true), awaiting(ID1)] }, async () => { throw new Error('fetch failed'); });
  const result = await h.run(options);
  expect(result).toMatchObject({ stop: 'MCP call failed without a response', mutation: true });
  expect(h.commands.filter((c) => c.includes('--claim'))).toHaveLength(1);
});
