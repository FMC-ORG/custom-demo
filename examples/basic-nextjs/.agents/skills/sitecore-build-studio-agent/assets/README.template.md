# {{Agent Name}} (Agentic Studio)

{{One paragraph: what the agent does, for whom, and an example result. Demo artifact of branch `{{branch}}`; modelled on {{example, if any}}.}}

These files are **not** a repo skill: they live outside `.agents/skills/`, so `npm run agents:sync` ignores them.

| File | What it is |
|---|---|
| `SKILL.md` | Studio skill, uploaded in Agentic Studio as **{{Skill Name}}** |
| `agent.json` | Agent configuration, kept identical to the Studio export (skill `{{skill ID}}`). After changing the agent in Studio, export it and replace this file |

## Prerequisites ({{environment}})

| Item | State | Owner |
|---|---|---|
| {{Template, parent, components, variants}} | {{exists / to do}} | {{who}} |

## Install

1. Agentic Studio → **Skills** → **Create skill** (or edit the existing one) → upload `SKILL.md` as **{{Skill Name}}**. Copy the skill ID.
2. Put the ID in `agent.json` under `config.skills`.
3. Agentic Studio → **Agents** → **Create Agent** (or open the agent) → **Import JSON** → `agent.json`. Under **Tools & skills**, confirm the skill and the MCPs ({{Marketer MCP}}). Save, then export the agent and replace `agent.json` with the export.
4. Run the agent from **Agentic → Chat**.

## Test prompts

| Prompt | Expected |
|---|---|
| {{acceptance prompt}} | {{result}} |
| {{missing input}} | Asks for it and stops |
| {{repeat run}} | {{asks update / new / stop}} |
| {{push to invent}} | Refuses; uses evidence or leaves the field empty |

## Decisions ({{date}})

| # | Area | Decision |
|---|---|---|
| 1 | Who runs it, inputs | {{…}} |

## Test log

| Date | Run | Result |
|---|---|---|
| {{date}} | Tool check | {{namespaces and the tools the process uses}} |
