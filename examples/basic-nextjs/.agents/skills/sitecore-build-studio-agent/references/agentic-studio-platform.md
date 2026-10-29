# Agentic Studio platform facts

What SitecoreAI Agentic Studio actually does with skills, agents and tools, as observed while building and testing agents in this project. Dated entries are observations, not documentation; re-check them when a run contradicts them, and add new facts here with their date.

Official docs (search them with the `sitecore_docs` MCP): *Create or edit a skill*, *Agent skills*, *Create a standard agent*, *Export or import an agent*, *Tools available to chats and agents*, *Using Invoke tool in a workflow* (tool keys of workflow agents; standard agents get different tool names, see *Tools*).

## Skills

- A Studio skill is **one Markdown document** (name, description, tags, content), created or uploaded under **Agentic → Skills**. No sibling files: everything the agent needs is inline. Creating one requires a Builder license.
- Uploading gives the skill an ID. The agent references it in `config.skills`. Editing the skill content later keeps the ID.
- Attaching a skill is not enough: the agent's system prompt must name the skill and say to load it first. Even then, an attached skill can be **partly ignored** (2026-10-29: the first ABM run used the skill's parent and template, then broke its limits and evidence rules). Rules the agent must keep need a **visible trace** in the chat: a draft table with counts and sources, a ✅/❌ checklist.

## Agent JSON

Standard agent export (`kind: "standard-agent"`):

| Key | Notes |
|---|---|
| `schema_version`, `kind`, `name`, `description`, `prompt`, `tags` | `prompt` is the system prompt; keep it short and point to the skill |
| `config.executionMode` | `standard` |
| `config.tools` | Toggles: `enableArtifacts`, `enableContextRetrieval`, `enableSitecoreContext`, `enableWebSearch`, `enableImageGeneration`, `enableInsightsData`, `enableAgentApiSites`, `…Pages`, `…Content`, `…Components`, `…Assets`, `…Personalization`, `…Jobs`, `…Briefs`, `…BrandKits`, `enableStructuredOutput` |
| `config.defaultContext` | Seen values: `sitecore-ai-knowledge`, `marketer-mcp` (this is how the **Marketer MCP** is attached). Brand context IDs put here are **dropped on import** (2026-10-29) |
| `config.skills` | Skill IDs |
| `config.output.format` | `text` |
| `config.contextRequirements` | Added by Studio: `allowedItems` (`brand_context`, `sitecore_page`, `sitecore_item`) controls what the user can attach; `autoDeriveVariants`. No "required" flag |

- **Import** creates or updates an agent (Agents → Create Agent or open agent → Import JSON). **Export** downloads the current configuration.
- **The Studio export is the source of truth.** After any change in Studio, ask the user for the export and replace the bundle's `agent.json` with it; keep their tool selections and record the differences in the README.

## Where agents run

- **Agentic → Chat**: the reference environment. The user can attach context (brand context, pages, items, files) through **Context**.
- **Page builder chat**: the open page is passed as context. Never treat it as the write target unless the user chose it.
- A brand context **cannot be fixed in the agent** through `defaultContext`. The agent can read it itself by ID with the Marketer MCP (`get_brand_context`, `get_brand_context_items`), so no user selection is needed.

## Tools

Tools are **deferred**: the agent loads namespaces with `ToolSearch` during the run. An upfront check of the tool list gives false negatives (2026-10-29: a valid run stopped with "page creation not available"). Load the namespaces the process needs at its first step, and look for each tool at the step that uses it.

Namespaces seen in a standard agent with Marketer MCP and Agent API toggles on (2026-10-29): `artifacts`, `web_search`, `context_retrieval`, `sites`, `pages`, `content`, `assets`, `brand_kits`, `skill_runtime`, `sitecore_documentation_mcp`, `marketer_mcp`. Get the real list for each agent with the **tool check** (see the skill's step 3).

| Behaviour | Consequence |
|---|---|
| `create_page` exists **only in `marketer_mcp`**: `{templateId, parentId, name, language, fields}` with `fields` as single-key objects `[{"Title": "…"}]` | The Agent API `pages` namespace cannot create pages from a template (it has `duplicate_page`) |
| `marketer_mcp.update_fields_on_item` takes `{name, value}` pairs and edits the current version in place | Create with `Title` only, then one `update_fields_on_item` with every other field |
| `marketer_mcp.update_content` with `createNewVersion: true` | One call = one new version: the update path for an existing page |
| `pages.update_page_content` and `pages.update_page_metadata` **create a new version per call** | An agent probing these tools created two empty versions (2026-10-29). Keep page writes in one namespace and name the write tools explicitly |
| `duplicate_page` copies every field of the source | Filler text survives in fields the agent leaves empty: create from the template instead |
| Template field validation (regex) is **not enforced** by the APIs | The agent must check limits itself |
| `marketer_mcp.search_assets` takes `tags` | Use tags (for example `abm-hero`) to find approved images |
| `marketer_mcp.get_page_preview_url` returns a **malformed URL that embeds the editing host's protection-bypass token**, and it fails with 401 | Never show it. Give a Page builder link instead (below) |
| Brand Kits: `brand_kits.list_brand_kits`/`get_brand_kit`, or `marketer_mcp.list_brandkits`/`get_brandkit_by_id` | Find the kit by exact name: recreating a kit changes its ID |
| `web_search` only; no page fetch | URL checks go through web search |
| `skill_runtime`: `bash`, `readFile`, `writeFile`, `create_skill`, `update_skill`, `upsert_skill_reference` | Count characters with `bash` instead of estimating |

## Page builder link

The report should give a link that opens the page in Page builder. Ask the user once to open any page in Page builder and paste the browser URL; keep its organization and tenant parameters and replace the item ID, language and version per page. Record the pattern in the Studio skill's site facts. Never put tokens or secrets into the pattern.

## Writing to Sitecore fields

- Checkbox: `0` or `1` (an empty value can fall back to standard values).
- General Link: `<link text="…" linktype="external" url="https://…" anchor="" target="_blank" />`.
- Image: `<image mediaid="{GUID}" />`.
- Rich Text: wrap in `<p>`; list the allowed tags in the Studio skill.
- Whether an empty field is hidden on the live page depends on the rendering component: check the component code before telling an agent to leave fields empty.
