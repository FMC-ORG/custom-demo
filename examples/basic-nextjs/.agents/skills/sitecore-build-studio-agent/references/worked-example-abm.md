# Worked example: SitecoreAI ABM Landing Page Builder

The first agent built with this process (2026-10-29, `sitecore-demo` environment). The full bundle lives on the `sitecore-demo` branch under the Agentic Studio bundles folder (`abm-landing-page`). IDs below are examples from that environment; never copy them into another bundle.

**Use case:** a Sitecore marketer types an account name ("IKEA") and gets a draft landing page under `/Home/lp` that sells SitecoreAI to that account, built on the fixed-shape Landing Page template (hero, 3 features, 3 stats, testimonial, 5 FAQs, final CTA; about 40 route fields). Modelled on a HEINEKEN press release agent the user supplied.

## Decisions

| Area | Decision |
|---|---|
| Who runs it, inputs | A marketer types the account name. The agent researches the web, shows a sourced dossier, then asks about gaps: one question per message, max 5, each with at least 4 lettered options and one (Recommended). The marketer's answers win. Nothing is written before confirmation |
| Goal / output | The marketer picks the page's goal per page (briefing, event, account executive meeting) with its exact URL. Default: `Book a SitecoreAI briefing` → sitecore.com/request-a-demo. Replaced a hardcoded event that had expired |
| Sources of truth | Brand context = what Sitecore sells (read by ID through the Marketer MCP); Brand Kit = voice (found by exact name); Sitecore documentation = capability check; web = account research |
| Honesty rules | Testimonial: a real published quote, verbatim, else empty. Stats: sourced Sitecore outcomes only, else empty. No logos unless supplied. The old skill's "safe stats" and fictional testimonials were dropped |
| Sitecore target, write method | `marketer_mcp.create_page` (Title only) + one `update_fields_on_item`; update = one `update_content` with `createNewVersion`. Never duplicate the example page (its filler survives in empty fields). Name `<account>-<goal>`. Existing page: ask update / new / stop |
| Images | Marketer's image, else a library asset tagged `abm-hero`, else empty. No generated images, no account logos |
| Language | English only |
| Publishing | Never publishes; ends with a review checklist and "Review in Pages before publishing. Nothing was published." Indexing was already off site-wide |
| Location | Bundle kept in the repo as a demo artifact; the repo's own `sitecore-abm-page` skill untouched |
| Acceptance | Run for IKEA in Agentic → Chat, then audit the page through the Marketer MCP |

## Test log: what failed and what fixed it

| Run | Symptom | Cause | Fix |
|---|---|---|---|
| IKEA #1 | 404 CTA URL, empty internal link, invented testimonial ("Proposed discussion point"), slogan stats over the 8-char limit, titles over 40 chars, too few account mentions | Skill attached but partly ignored; the goal URL came from the marketer unchecked | Intake checks the goal URL; draft review with counts and sources (template default); character counts with `bash` |
| Sage #1 (Page builder chat) | "Page creation not available"; two empty versions of the open IKEA page | The agent looked for `create_page` in `pages` (it is only in `marketer_mcp`) and probed `update_page_*`, which create a version per call | Tools section naming namespace and write tools; page writes only through `marketer_mcp`; the open page is never the target unless chosen |
| No brand context | Stopped: "brand context not available" | Brand context IDs in `defaultContext` are dropped on import | Agent reads the brand context by ID with `get_brand_context` |
| After fix | Stopped: "page creation not available" | Upfront tool-list check; tools are deferred | Load namespaces with `ToolSearch` at step 1; check each tool at the step that uses it |
| Tool check | — | Asked the agent to list all its tools | Revealed the namespaces above; should have been the first run (now step 3 of the build skill) |
| Sage #2 | Passed: version 1 only, all limits met, sourced stats, empty testimonial reported as a gap | — | Preview link failed (401, malformed URL with a protection token): replaced by a Page builder link |

## Shape of the final Studio skill

Sections in order: purpose (one paragraph), site facts (table of IDs, URLs, defaults), evidence (statement type → allowed source), tools (namespace → tools; write-tool rules), process (8 steps, each ending "Done when …"), angles, field map (one table per page section: field, type, limit, rule), rich text format, checklist, guardrails, output.

Excerpts that worked:

```markdown
The **write tools** are `create_page`, `update_fields_on_item` and `update_content`, all in `marketer_mcp`.
Call them only in step 6 and step 7, only on the confirmed target page, and only as the process describes.
Page work goes through `marketer_mcp` alone: tools with similar names in other namespaces (`pages`, `content`)
create page versions and are outside this skill.
```

```markdown
Question 2 of 5 — Who is the page written for?
A. Chief Digital Officer (Recommended: IKEA's digital transformation is led at CDO level)
B. Chief Marketing Officer
C. Head of E-commerce
D. Head of Customer Experience
Or type your own answer.
```

```markdown
6. **Write.**
   - New page: `create_page` with `parentId`, `templateId`, `name`, `language` = `en`, and
     `fields` = `[{"Title": "<Title value>"}]`. Then **one** `update_fields_on_item` call on the new page ID
     with every other field as `{"name": "<field>", "value": "<value>"}` pairs; it edits version 1 in place.
```

The agent prompt stayed short: role, job, "Always follow the <skill> skill … load it before anything else; if it is not available, stop", seven working rules, and the reply format.
