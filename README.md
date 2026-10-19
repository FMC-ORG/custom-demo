# Build a Custom Demo

> # ⚠️ Use `examples/basic-nextjs`
> **This demo builder runs on the `basic-nextjs` rendering host under `examples/`. The other
> starters in `examples/` are NOT used — ignore them.**

Turn a client's homepage (screenshot + URL) into a themed, content-filled Sitecore XM Cloud demo
on your own environment. Once setup is done, you build a demo by running **one skill command** —
`sitecore-build-demo` — with a screenshot attached. The agent does the rest, pausing once for your
approval before it writes anything to Sitecore.

Works in **Claude Code**, **Cursor**, and **Pi**. All three read the same skills from
`examples/basic-nextjs/.agents/skills/` — always start your agent from `examples/basic-nextjs`.

> **Recommended models:** for your first run, use an advanced/frontier model — **Opus**, **Fable**,
> or **Codex** — for the most reliable end-to-end result. It also works okay with Cursor's basic
> model, but you may need to make some adjustments along the way.

---

## Step 1 — Fork (or template) the repo and branch off `main`

> **⚠️ Important:** Do **not** clone this repository directly. **Fork it** or use it as a
> **template** ("Use this template" on GitHub). You only need the **`main` branch**.

```bash
# After forking / creating from template, clone YOUR copy:
git clone <your-fork-url>
cd <repo>/examples/basic-nextjs
git checkout main && git pull
git checkout -b <client>-demo
```

Use one branch per demo so each runs on its own isolated environment.

## Step 2 — Install dependencies

```bash
npm install
npm run agents:browsers   # Chromium for the site scraper (once per machine)
npm run agents:setup      # git pre-commit hook that keeps agent files in sync (once per clone)
```

Verify the scraper runs (must be run from inside `examples/basic-nextjs`):

```bash
node .agents/skills/sitecore-extract-theme/scripts/site-scraper.mjs --help
```

## Step 3 — Deploy the app

- Deploy the front end to your XM Cloud rendering host.
- The deployment automatically provisions a **`main` tenant** and, under it, a **`main-website`**
  site. You do **not** need to create a new website or modify the one created during deployment —
  the agent uses that default `main-website` as-is.
- _(Optional)_ Connect a Content Hub (DAM) environment. If you provision a Content Hub instance and
  have a login, client images are uploaded there automatically. This step is optional — without it,
  images fall back to manual upload.

## Step 4 — Open your agent and connect the marketer MCP

The repo already declares two MCP servers — `sitecore_marketer` (creates and updates Sitecore
items) and `sitecore_docs` (official Sitecore docs). Open your agent **in `examples/basic-nextjs`**
and sign in to them:

| Agent | How |
|---|---|
| **Claude Code** | Run `claude` in `examples/basic-nextjs`, approve the project MCP servers, then `/mcp` and sign in to `sitecore_marketer`. |
| **Cursor** | Open the `examples/basic-nextjs` folder, then *Settings → MCP*: enable both servers and sign in to `sitecore_marketer`. |
| **Pi** | Run `pi` in `examples/basic-nextjs` and **trust the project** when asked — Pi only loads the project skills and MCP servers after that. Then `/mcp` and sign in to `sitecore_marketer`. |

Sign in with the account for **your** XM Cloud environment. If a Sitecore call later says "token
expired", run `/mcp` again (or re-authenticate in Cursor's MCP settings) and retry.

## Step 5 — Add Content Hub credentials _(optional)_

Skip this step if you are not using Content Hub — images will fall back to manual upload.

```bash
cp docs/ai/config/credentials.example.yaml docs/ai/config/credentials.local.yaml
```

Edit `docs/ai/config/credentials.local.yaml` (gitignored — never committed):

```yaml
contentHub:
  host: "https://<your-instance>.sitecoresandbox.cloud/"
  authMethod: "simple"
  user: "<user>"
  password: "<password>"
  clientId: ""
  clientSecret: ""
  uploadConfig: "AssetUploadConfiguration"
```

The uploader authenticates when an upload/verification run starts. `--dry-run` only inspects an existing image manifest; it does **not** validate credentials or make remote calls.

Demo recovery requires an approved, unchanged plan and surviving local records. Follow the [P0 recovery execution contract](examples/basic-nextjs/.agents/skills/sitecore-build-demo/references/recovery.md) for explicit first-run initialization, safe resumes, and the durable marketer MCP handoff. Do not initialize new journals over an existing legacy demo.

The file must be named `credentials.local.yaml`.

## Step 6 — Run the demo build skill

The demo builder is the **`sitecore-build-demo`** skill. It is **command-only**: the agent never
starts it on its own, so asking in plain words ("create a custom demo for …") will not kick it off —
run the command explicitly, followed by the client URL, and **attach a full-page screenshot** of the
client homepage in the same message.

| Agent | Type this | Attach the screenshot by… |
|---|---|---|
| **Claude Code** | `/sitecore-build-demo create a custom demo for https://www.yokohama-tws.com/de-de` | pasting or dragging the image into the prompt |
| **Cursor** | `/sitecore-build-demo create a custom demo for https://www.yokohama-tws.com/de-de` | pasting or dragging the image into the chat |
| **Pi** | `/skill:sitecore-build-demo create a custom demo for https://www.yokohama-tws.com/de-de` | pasting it (`Ctrl+V`; `Alt+V` on Windows/WSL), dragging it in, or typing `@` and picking the file |

Tips:

- **A screenshot is required** — the build stops at Phase 0 and asks for one if it is missing. If
  your terminal cannot attach images, save it inside the repo (e.g.
  `docs/ai/demos/<client>/homepage.png` — the `demos/` folder is gitignored) and reference it
  with `@`.
- **Non-English sites** are supported; all content is translated to English automatically.
- **Interrupted?** Re-run the command with `resume demo for <client>` (e.g.
  `/sitecore-build-demo resume demo for yokohama`). Progress is saved in
  `docs/ai/demos/<client>/demo-progress.yaml`, so finished phases are skipped.
- Typing `/sitecore-` lists every demo-builder skill. Everyday component work (create a component,
  add a variant, fix a rendering) does **not** need a command — just ask, and the agent picks the
  right skill (see `examples/basic-nextjs/AGENTS.md`).

### What the skill does

| Phase | What happens | You |
|---|---|---|
| 0 – 0.5 | Collects inputs, validates Content Hub credentials, checks the Sitecore manifest against your environment | answer any questions |
| 1 | Extracts the brand theme (colors, fonts, shape) from the site | **confirm the theme** |
| 2 | Analyzes the screenshot and maps every section to a template component + variant | **approve the plan** (Step 7) |
| 2.5 – 3 | Extracts real content, uploads images to Content Hub, creates and fills datasource items | — |
| 4 – 5.5 | Applies the theme, builds any custom components and (if chosen) pixel-perfect variants | — |
| 6 – 7 | Assembles the Home page and writes a summary with your manual to-do list | finish the demo (Step 8) |

All working files land in `examples/basic-nextjs/docs/ai/demos/<client>/`.

## Step 7 — Approve the plan

The agent analyzes the page and stops to ask you:

- Is the build plan correct? Approved to proceed?
- Pixel-perfect custom variants, or generic template variants?

Answer, and it continues: extract content, upload images, create and fill datasources, apply the
theme, build variants, and assemble the page.

## Step 8 — Finish the demo

When it completes, do the short manual list it hands you (in `docs/ai/demos/<client>/`):

1. Set component variants in the Pages editor (from `variant-checklist.md`).
2. Wire NavigationHeader + SiteFooter in the Header/Footer partial designs.
3. Restart the dev server / redeploy so new components load.

To view locally:

```bash
cp .env.remote.example .env.local   # fill in your XM Cloud values
npm run dev
```

---

## Enable search _(optional)_

Adds a full search experience to any custom demo: a **results page** (instant filtering, sort,
pagination, shareable `?q=` links), an auto-updating **"Latest content" strip**, a **typeahead
suggest box**, and a **search pill in the site header**. The React components ship with this repo
(`SearchResults`, `SearchCollection`, `SearchTypeahead` + the NavigationHeader search slot) — 
enabling search is configuration, not coding.

> # ⚠️ Search does NOT work in the Pages editor or Preview
> **By design, the search components never call the live search API in editing or preview mode —
> they render skeleton placeholders there. Seeing skeletons in Page Builder is normal, not
> broken.** To see search actually working you need the app running as a real rendering host:
> the **deployed site** (Vercel / XM Cloud rendering host) or **local `npm run dev`** opened
> directly at `http://localhost:3000` — not through the editor iframe.

> # ⚠️ Publishing is NOT enough — re-run the index after every content change
> **The search index is a snapshot, not a live view. Any content change — a new article, an
> updated title, a swapped image — stays invisible to search even after you publish, until you
> manually re-run the index** in Sitecore AI → Search → Configuration Manager (open the source →
> run/re-index). The order matters and both steps are required: **1) publish, 2) re-index.**
> Re-indexing before publishing re-reads the old published content and changes nothing.
> Same for deletions: a deleted article keeps appearing in results until a publish + re-index.

Full recipe and field reference: [`docs/ai/catalog/capabilities-registry.yaml`](examples/basic-nextjs/docs/ai/catalog/capabilities-registry.yaml)
(the `search` capability). Endpoint behavior and gotchas:
[`docs/ai/reference/agent-api-limitations.md`](examples/basic-nextjs/docs/ai/reference/agent-api-limitations.md) § 6.

### Step A — Prepare the content

Search shows what the index ingested, so the content template needs the fields you want on the
result cards: a title, a body/description, a date, an image — and **a URL field** (e.g.
`ArticleUrl`, Single-Line Text, filled with each page's site-relative path like
`/Articles/My-Article`). Indexes have no URL attribute by default; without this field, result
cards render without links. Ask your agent to add and fill it if the demo content doesn't have one.

Then **publish** — the index only sees published content.

### Step B — Create the search source (Sitecore AI UI)

In **Sitecore AI → Search → Configuration Manager**, create a source over your content. On the
field-configuration screen:

- **Include** every field the cards need (title, description, image, date, URL field).
- Mark the title and description **Searchable** (what the keyphrase matches against).
- Mark the date field **Sortable** (powers the sort control and the "latest" strip).
- Do **not** mark the URL field Searchable (URL text would pollute matching).

The source's Fields tab should end up looking like this (articles example):

![Search source field configuration — Include, Searchable, and Sortable flags per field](docs/images/search-source-fields.png)

> ⚠️ A source's field set is **fixed at creation** — fields added to the template later never
> appear in an existing index. If you need another field, create a new source and repoint the
> datasource items to its GUID.

Run the index, then copy the **index GUID** from the index details (also visible in the index URL).

### Step C — Create the Sitecore items (agent)

Ask your agent, giving it the GUID and your field names:

```
Enable search for this demo. Index GUID: <guid>.
Map title=<TitleField>, description=<BodyField>, image=<ImageField>,
link=<UrlField>, date=<DateField>. Results page: <page>.
```

The agent uses the `sitecore-search` skill (no command needed — it is picked automatically) and,
following the capabilities registry, creates the datasource templates/renderings (first
time only), one datasource item per component with your index GUID + attribute mappings, places
the components (results page + strip), and wires the **header search** via the NavigationHeader
datasource's `Search` section (leave its `SearchIndex` empty for no header search).

Any mapping you leave empty degrades gracefully — cards simply render without that element.

### Step D — Verify

```bash
cd examples/basic-nextjs

# HTTP boundary: dumps the exact attribute names + documents the index returns
node .agents/skills/sitecore-search/scripts/search-probe.mjs <index-guid> [keyphrase]

# Browser protocols (dev server running):
node .agents/skills/sitecore-search/scripts/search-verify.mjs      # results page
node .agents/skills/sitecore-search/scripts/collection-verify.mjs  # latest-content strip
node .agents/skills/sitecore-search/scripts/typeahead-verify.mjs   # typeahead + ?q= handoff
```

The browser scripts assert this repo's built-in articles corpus — for a different vertical, ask
the agent to adapt the expected titles/queries (a few lines at the top of each script).

If something looks off, probe first — no-result queries usually mean unpublished content or a
stale index, and the probe shows the real attribute names to use in the mappings. Note the index
refreshes on publish + re-run, and keyphrase matching is loose (multi-word queries match partial
words — the expected document ranks first rather than being the only hit).