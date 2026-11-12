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

Tool check on a partner tenant (2026-11-06; Marketer MCP, web search, artifacts, context retrieval and Sitecore context on; every Agent API toggle off; **no skill attached**): `api_tool` (`list_resources`), `artifacts`, `web_search`, `context_retrieval`, `sitecore_context`, `sitecore_documentation_mcp`, `marketer_mcp`, `multi_tool_use` (`parallel`). With the Agent API toggles off, the `sites`, `pages`, `content`, `assets` and `brand_kits` namespaces are gone, so `marketer_mcp` holds the only page tools. No `ToolSearch` and no `skill_runtime` were listed; `skill_runtime` may only appear once a skill is attached (re-check after install).

| Behaviour (2026-11-06) | Consequence |
|---|---|
| `sitecore_context` (on with `enableSitecoreContext`) takes `action` = `command` / `read` / `write` / `create` / `delete`, a `path` and `apply` | A second write path besides `marketer_mcp`: a writer skill must forbid it by name |
| `marketer_mcp.get_content_item_by_id` lists `language` as required; `update_content` requires `siteName` | Name both parameters in the skill's write and verify steps |
| `marketer_mcp` also exposes `delete_content`, `create_content_item`, `add_component_on_page`, personalization and A/B tools | A writer skill lists its write tools and forbids every other write |
| `marketer_mcp.get_component` fails (400, "template doesn't exist") when a rendering's Datasource Template is a **branch** template; for regular templates its `datasourceFields` lists only the template's **own** fields, not inherited ones (seen through the MCP directly) | Agents that add components cannot learn the content fields of such renderings: take field names from an existing datasource item and list them in the skill |
| **Page builder chat** tool list (2026-11-06; Agent API Sites, Pages, Content, Components on; no skill): `api_tool`, `multi_tool_use`, `artifacts`, `sites`, `content`, `components`, `pages`, `marketer_mcp`, `sitecore_documentation_mcp`. **No `sitecore_context` and no `context_retrieval`** there, unlike Agentic → Chat. `pages` adds `update_page_layout` (`add_section`, `replace_section`, `remove_section`, `move_section`, `reorder_sections`, `change_component_variant`, `attach_content`; `dryRun`, `ifMatch`), `get_page_layout`, `get_page_full_context`, `get_page_versions`, `validate_page`, `validate_accessibility`, `get_page_changes`, `approve_page_changes`, `promote_layout_to_shared`; `components` adds `search_components` and `get_component_detail`; `sites.save_site_context_skill` writes | Probe these before choosing a component write path; name forbidden writers (`promote_layout_to_shared`, `save_site_context_skill`, `approve_page_changes`) in the skill |
| `components.get_component_detail` resolves renderings whose datasource template is a branch, but returns `Datasource fields: []`; `components.search_components` ignores `region` (falls back to unfiltered) and searches every rendering in the tenant, other sites' and SXA ones included, some with the same display name as a project rendering (2026-11-06) | Field lists still come from `marketer_mcp.get_page_template_by_id`. Writer skills use fixed rendering IDs and forbid `search_components`, or the agent may place a same-named rendering from another site |
| `marketer_mcp.add_component_on_page` (2026-11-06, partner tenant): creates the datasource under the page's `Data` folder, **creating the folder** (template Page Data) on an empty page; spaces in `componentItemName` become `_`; sets `GridParameters` and `DynamicPlaceholderId` like Pages does; no new page version. Fields not sent take the datasource template's `__Standard Values`, which often hold sample text ("Add title here", "Link Text", placeholder images) | Send every content field of the component, `""` when unused. Read the template's `__Standard Values` to know which fields carry filler |
| `marketer_mcp.update_fields_on_item` with `""` on Single-Line Text and General Link fields stores `""` and the rendered layout data shows `""`: **no fallback** to `__Standard Values` (2026-11-06) | Empty-string writes are a reliable way to clear filler for text and link fields (checkbox behaviour not re-tested) |
| Studio's tool schemas list many optional parameters **without** marking them optional (for example `get_components_on_page`: `pageId, language, version, variantId, includeRenderingDetails`). Studio then sends **every** parameter with a default (`version: 0`, `variantId: ""`, `includeRenderingDetails: false`), even when the skill says to omit them. `get_components_on_page` with `version: 0` fails on every page ("HTTP error getting page layout data: 400"; the agent may paraphrase it as "no resolvable variant / Page Design"); `variantId: ""` is harmless (2026-11-06, reproduced through the MCP) | Don't tell the agent to omit parameters: give the exact value for each (for example `version` = the version read from `get_content_item_by_id`) |
| **Page builder chat context** (2026-11-06): the open page arrives as the selected Sitecore item with ID (in braces), name, path, template ID and site; language and version are **not provided**; the context's "components on the page" list did **not** match the page's real layout | Strip the braces, assume `en`, read the version and components with tools; never trust the context's component list |
| **Tool output is cut to about 9,000 characters in the agent's context** (2026-11-12, partner tenant: a 41,806-character `get_content_item_by_path` response arrived with "[32806 characters omitted from model context]"). The agent may then return an empty or partial answer without saying data is missing | Keep every call the process depends on under ~9K: read items one by one by ID, never rely on a large listing. Measure response sizes through the MCP directly before designing a scan |
| `marketer_mcp.get_content_item_by_path` returns `children.nodes` with **every field of every child** in the requested language (a year page with 6 news stories: 41.8K; with 13: 110K). In a language the children have **no version** in, the same call returns each child's ID, name, path and template with `fields: {}` (6 children: 3.5K; 13: 8.2K) (2026-11-12) | To list an item's children compactly, read the parent in a tenant language the children are not translated into, then read each child by ID in the content language. `get_all_pages_by_site` (12–26K) and `search_site` (keyword search, incomplete) are no substitute |
| `marketer_mcp.get_page_template_by_id` also accepts a **datasource** template ID and returns its full field list, inherited fields included, with types (2026-11-06, seen through the MCP directly) | The workaround for `get_component`: read `datasourceTemplateId` from `get_component`, then the fields from `get_page_template_by_id` |

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
