---
name: sitecore-build-studio-agent
description: "Build a SitecoreAI Agentic Studio agent for one use case: interview the user, check the agent's real tools, write the Studio skill, agent JSON and README, then guide the install, test runs and audits until it passes. Use when the user asks for a new Agentic Studio agent or skill."
disable-model-invocation: true
---

# Build an Agentic Studio agent

Builds an **agent bundle** for one use case and runs the loop until the agent passes its tests:

```
interview → tool check → write bundle → install → test and audit → fix → … → final export
```

The bundle lives in `docs/ai/agentic-studio/<agent-slug>/`:

| File | What it is | Template |
|---|---|---|
| `SKILL.md` | The **Studio skill**: one Markdown document the user uploads in Agentic → Skills | `assets/studio-skill.template.md` |
| `agent.json` | The agent configuration, imported in Agentic → Agents; after install, always the Studio export | `assets/agent.template.json` |
| `README.md` | Prerequisites, install steps, test prompts, decisions, test log | `assets/README.template.md` |

A Studio skill is not a repo skill: bundles stay outside `.agents/skills/`, and `npm run agents:sync` never touches them.

Read `references/agentic-studio-platform.md` before step 3, and again whenever a run surprises you; it holds what Studio really does with skills, agent JSON and tools. `references/worked-example-abm.md` is a finished bundle with its decisions and failed runs: use it as the model for depth and tone.

## Rules

- **The user operates Studio.** You write files and exact instructions; the user uploads, imports, runs and pastes results back.
- **Questions:** one per message, at least 4 lettered options, exactly one **(Recommended)** with a one-line reason, ending with "Or type your own answer." Apply the same format to the questions the Studio agent will ask its own users.
- **Sitecore through the marketer MCP is read-only**, apart from deleting test output the user confirmed. Before the first MCP call, run the environment check from `AGENTS.md`.
- **Secrets stay out** of bundle files, the chat and commits: preview URLs with protection tokens, credentials, API keys.
- **The Studio export wins.** Once the agent is imported, `agent.json` is replaced by the user's export; keep their selections and record differences in the README.

## Steps

### 1. Frame

Read `docs/ai/config/project.yaml`. Ask for anything missing: the use case in one sentence, who will run the agent, and any example agent or skill the user has (read both the JSON and the skill text). Propose an `<agent-slug>` (kebab-case, for example `abm-landing-page`).

Done when the use case, users and slug are confirmed.

### 2. Interview

Work through the **decision areas** in order, one question each, skipping any the user already answered. Ground the options in the live environment: read the target templates, parents, example items and brand assets through the marketer MCP before asking about them.

| # | Decision area | Settles |
|---|---|---|
| 1 | Who runs it, inputs | The user role, what they type or attach, and how the agent confirms facts with them (its own intake questions) |
| 2 | Goal / output | What the agent produces and what the result asks of its reader (for a page: the call to action and its URL) |
| 3 | Sources of truth | Which source backs which kind of statement: user answers, attached files, web, brand context, Brand Kit, Sitecore documentation |
| 4 | Honesty rules | What happens when a field has no source: empty plus gap, never invented; quotes and figures verbatim |
| 5 | Sitecore target, write method | Parent, template, naming, create vs update, repeat runs, which write tools |
| 6 | Images and media | Allowed sources, tags, what is never used |
| 7 | Language | Languages written; translation in or out of scope |
| 8 | Publishing and review | Never publish (default), draft review, review checklist, closing line |
| 9 | Where it runs | Agentic → Chat, Page builder chat, required MCPs and toggles |
| 10 | Acceptance | The acceptance prompt and the edge cases that must pass |

Record each answer as a row of the README's *Decisions* table as you go.

Done when every area has a recorded decision or is marked "not applicable" with the reason.

### 3. Tool check

Before writing the Studio skill, learn what the agent really has.

1. Write a bare `agent.json` from the template with the planned toggles and `defaultContext`, and no skill.
2. Ask the user to import it as a new agent, run it in Agentic → Chat with: `List all available tools, grouped by namespace, with their full input schemas.` and paste the reply.
3. Find every tool the process needs, with its namespace and parameters. Note tools with similar names in other namespaces and how they differ. Add new platform facts, dated, to `references/agentic-studio-platform.md`.

Done when every read and write the process needs maps to a named tool with known parameters, or the gap is resolved with the user (change toggles or MCPs and rerun the check).

### 4. Write the bundle

Fill the three templates.

- **Studio skill:**
  - Every step ends with "Done when …".
  - Every limited field has its limit.
  - The *Tools* section names namespaces and write tools.
  - Writers keep the **draft review** step: the user approves a table of values, counts and sources before any write.
  - Everything inline: no links to repo files.
- **Agent prompt:** short. It names the skill exactly, stops when the skill is missing, and lists the working rules and the reply format.
- **README:** decisions, test prompts (acceptance plus the edge cases from area 10: missing input, repeat run, push to invent), install steps, prerequisites with owners.

Validate `agent.json` (parse it) and re-read the Studio skill as the agent would: each step must be executable with the named tools alone.

Done when the three files exist, the JSON parses, and every decision from step 2 appears in the skill or the README.

### 5. Install

Give the user the README's install steps (upload or update the skill, put its ID in `agent.json`, import, check the skill and MCPs under Tools & skills). Ask for the Studio export, replace `agent.json` with it, and note any differences in the README.

Done when the repo `agent.json` equals the Studio export.

### 6. Test and audit

Run the README's test prompts one at a time: the user runs each in Agentic → Chat and pastes the agent's full reply.

1. **Check the reply** against the Studio skill's process and output.
2. **Audit what it wrote:** read every created or changed item through the marketer MCP and check it against the Studio skill's checklist, field limits and evidence rules. Also check version counts and that nothing outside the target changed.
3. **Log the run** in the README test log: date, prompt, result.
4. **On a failure, diagnose before fixing:**
   - skill ignored or misread → make the rule visible in the chat or sharper in the skill
   - wrong tool or namespace → fix the *Tools* section
   - configuration → toggles, MCPs or context

   Fix the bundle, have the user re-upload or re-import, and rerun.

Done when the acceptance prompt and every edge case pass in the same version of the bundle.

### 7. Finish

Ask before removing test output (pages, versions) and verify every deletion by reading the item again. Make sure the final export is in `agent.json`, then commit the bundle on the user's branch.

Report:
- the bundle path
- the skill ID
- the passing runs
- open prerequisites and their owners
