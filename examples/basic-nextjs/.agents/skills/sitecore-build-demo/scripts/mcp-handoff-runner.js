// Services demo-recovery.cjs `awaiting-tool` requests through the marketer MCP inside ONE codemode
// script, so a phase does not cost one agent turn per MCP call. Usage (codemode):
//
//   // @options: {"timeout_ms": 330000, "max_output_tokens": 3000}
//   const run = eval(await tools.read({ path: '.agents/skills/sitecore-build-demo/scripts/mcp-handoff-runner.js' }));
//   text(await run({ phase: 'populate', plan: 'docs/ai/demos/<client>/execution-plan.json', directory: 'docs/ai/demos/<client>' }));
//
// Rules (references/recovery.md, "Run budget and stop rules"): no sleeps, no retries of a claimed
// mutation, stop on the first anomaly and return a compact summary for the user. Never copy this
// file into a demo directory or edit it during a client build.
(async ({ phase, plan, directory, maxSteps = 150, maxSeconds = 270 } = {}) => {
  const safe = (value) => typeof value === 'string' && /^[\w./-]+$/.test(value);
  if (!['populate', 'assemble'].includes(phase) || !safe(plan) || !safe(directory))
    throw new Error('runner: phase must be populate|assemble and plan/directory plain relative paths');
  const base = `node .agents/skills/sitecore-build-demo/scripts/demo-recovery.cjs --plan ${plan} --directory ${directory} --phase ${phase}`;
  const started = Date.now();
  const seen = new Set();
  const described = new Set();
  const counts = { reads: 0, writes: 0 };
  const done = (extra) => ({ phase, ...counts, seconds: Math.round((Date.now() - started) / 1000), ...extra });
  const json = (output) => { try { return JSON.parse(output); } catch { return null; } };

  for (let step = 0; step < maxSteps; step++) {
    if (Date.now() - started > maxSeconds * 1000)
      return done({ stop: 'time budget reached', next: 'Report progress to the user, then run the runner once more.' });
    const result = await tools.bash({ command: base, timeout: 60 });
    const state = json(result.output);
    if (!state) return done({ stop: 'helper stopped', exit: result.exit_code, output: result.output.slice(0, 600) });
    if (state.status !== 'awaiting-tool')
      return done({
        stop: 'phase finished',
        status: state.status,
        unresolved: state.unresolved,
        issues: state.issues,
        next: state.status === 'complete' ? 'Continue with the next phase.' : 'STOP: report the unresolved keys and reasons to the user. Do not loop.',
      });
    const request = state.request;
    if (!/^[0-9a-f-]{36}$/i.test(request.id) || !/^[a-z_]+$/.test(request.tool))
      return done({ stop: 'invalid request identity' });
    if (seen.has(request.id))
      return done({ stop: 'no progress: the same request came back', request: request.id, next: 'STOP and report.' });
    seen.add(request.id);
    const toolName = `mcp__sitecore_marketer__${request.tool}`;
    if (!described.has(toolName)) { await describeTool(toolName); described.add(toolName); }
    const claim = await tools.bash({ command: `${base} --claim ${request.id}`, timeout: 60 });
    const claimed = json(claim.output);
    if (claim.exit_code !== 0 || !claimed) return done({ stop: 'claim refused', output: claim.output.slice(0, 600) });
    if (claimed.id !== request.id || claimed.tool !== request.tool || JSON.stringify(claimed.args) !== JSON.stringify(request.args))
      return done({ stop: 'claim differs from request' });
    let reply;
    try {
      reply = await tools[toolName](claimed.args);
    } catch (error) {
      const message = String(error?.message ?? error);
      // A service answer with an HTTP status is a response, not a lost call: record it so the
      // helper can classify it (400/422 = permanent rejection). Anything else is unknown.
      if (!/\(\d{3}\)\s*\.?\s*$/.test(message))
        return done({ stop: 'MCP call failed without a response', request: request.id, tool: request.tool, mutation: request.mutation,
          next: request.mutation ? 'Unknown outcome: never re-claim it. Report to the user.' : 'Read-only: safe to run the runner again once.' });
      reply = { isError: true, content: [{ type: 'text', text: message }] };
    }
    const file = `${directory}/reply-${request.id}.json`;
    await tools.write({ path: file, content: JSON.stringify(reply) });
    const recorded = await tools.bash({ command: `${base} --reply ${request.id} --result ${file}`, timeout: 60 });
    await tools.bash({ command: `rm -f -- ${file}`, timeout: 10 });
    if (recorded.exit_code !== 0) return done({ stop: 'reply not recorded', request: request.id, output: recorded.output.slice(0, 600) });
    counts[request.mutation ? 'writes' : 'reads']++;
  }
  return done({ stop: 'step budget reached', next: 'Report progress to the user, then run the runner once more.' });
})
