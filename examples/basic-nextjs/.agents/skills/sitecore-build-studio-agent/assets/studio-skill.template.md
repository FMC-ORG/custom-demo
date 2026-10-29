<!--
Template for an Agentic Studio skill (one Markdown document, uploaded in Agentic → Skills).
Replace every {{PLACEHOLDER}}; delete sections marked (writers only) when the agent never writes to Sitecore.
Delete this comment before upload. Keep everything inline: a Studio skill has no sibling files.
-->
# {{Skill Name}}

{{One paragraph: what the agent produces, for whom, from what input. Then: "Use when the user {{trigger 1}}, {{trigger 2}}."}}

{{One paragraph: who is the authority on facts, what the agent writes, and "never publishes".}}

## Site facts

| Item | Value |
|---|---|
| Site name | `{{site}}` |
| Language | `{{en}}` |
| {{Parent item}} | `{{GUID}}` |
| {{Template}} | `{{name}}`, `{{GUID}}` |
| {{Brand context}} | `{{name}}`, `{{GUID}}` (read it yourself, see step 1) |
| {{Brand Kit}} | the **published** kit named exactly `{{name}}` |
| Page builder link | `{{pattern with {ITEM-ID}, {LANG}, {VERSION}}}` |
| {{Defaults}} | {{value}} |

## Evidence

Every statement the agent writes is backed by **evidence**: a source it can name in the report.

| Statement about | Allowed evidence |
|---|---|
| {{subject}} | {{user's answers (always win), attached file, public web sources}} |
| {{Sitecore product}} | {{brand context documents, Sitecore documentation, sitecore.com}} |
| {{quotes and figures}} | {{published source, copied verbatim}} |

A statement without evidence is left out. A field without evidence stays empty and is reported as a **gap**.

## Tools

Tools load on demand: load these namespaces with `ToolSearch` in step 1.

| Namespace | Tools this skill uses |
|---|---|
| `{{namespace}}` | `{{tool}}`, `{{tool}}` |

The **write tools** are `{{tool}}` and `{{tool}}`, both in `{{namespace}}`. Call them only in step {{N}}, only on the confirmed target, and only as the process describes. {{Similar tools in other namespaces behave differently (for example, create a version per call) and are outside this skill.}}

## Process

1. **Load tools and context.** Load the namespaces in *Tools* with `ToolSearch`. If `{{required namespace}}` does not load, stop and tell the user: "{{exact message, including where to enable it}}". {{Read the brand context / Brand Kit.}} Done when {{…}}.

2. **{{Research / read input}}.** {{…}} Done when you have {{a dossier of N facts, each with its source}}.

3. **Intake.** Show {{the dossier}}, then ask about what is missing or uncertain: **one question per message, at most {{5}} questions**. Each question offers **at least 4 lettered options**, marks exactly one **(Recommended)** with a one-line reason, and ends with "Or type your own answer." Always ask: {{questions that research cannot answer}}. Done when the user has confirmed {{…}} and answered every question. Write nothing before that.

4. **{{Plan / choose angle}}.** {{…}} Done when every value you plan has its evidence.

5. **Build the draft.** Build every value in *Field map*. Count characters with `bash` rather than estimating. Run the *Checklist*; rewrite failing values and run it again. Done when every check passes.

6. **Draft review.** (writers only) Show the user the whole draft as one table: field, value, character count / limit, evidence. Mark empty fields `EMPTY` with the reason. Below it, show the *Checklist* with ✅ or ❌ per line. Then ask:

   ```
   Write this to Sitecore?
   A. Write it (Recommended)
   B. Change a field (name it and the new value)
   C. Regenerate a section (name it)
   D. Stop without writing
   Or type your own answer.
   ```

   Done when the user chose A, or chose D. On B or C, apply the change, rerun the checklist and show the draft again.

7. **Write.** (writers only) {{Exact calls: tool, required parameters, field format, number of calls.}} Done when the write calls returned without error.

8. **Verify.** (writers only) Read the result back with `{{read tool}}`. Compare every field with the value sent; write any that differ once more with `{{tool}}` and read again. Done when every field matches or is listed as a failed write.

9. **Report** as described in *Output*.

## Field map

| Field | Type | Limit | Rule |
|---|---|---|---|
| `{{field}}` | {{Single-Line Text}} | {{40}} | {{content rule and its evidence}} |

## Checklist

- Every limited field is within its limit (counted, not estimated).
- {{Format rules: link XML, rich text tags}}.
- {{Coverage rules: what must appear where}}.
- Every fact and figure traces to its evidence; quotes are verbatim.

## Guardrails

- **Evidence only.** {{…}}
- **Never publish** and never change workflow or publishing settings.
- **{{Scope}} only.** Leave {{layout, shared content, other pages}} untouched.
- **Missing tool, stop.** When a tool you need is unavailable, stop and report it; use only the tools *Tools* names, for their stated purpose.
- **The open page is context.** {{It becomes the target only when the user chose it.}}

## Output

1. {{The result: name, path, ID}} and **Open in Page builder: {{link from the site facts pattern}}**.
2. A table of every field: name, value (shortened for rich text), evidence.
3. **Gaps:** fields left empty and why.
4. **Review checklist** for the user.
5. The line: "{{Review in Pages before publishing. Nothing was published.}}"
