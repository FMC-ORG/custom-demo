# Getting started: build a custom demo

A step-by-step guide for a Solution Engineer using the **`sitecore-build-demo`** skill for the
first time. It takes a client's homepage (screenshot + URL) and produces a themed, content-filled
Sitecore XM Cloud demo on your own environment.

- **What the skill does, phase by phase:** [`sitecore-build-demo.md`](./sitecore-build-demo.md)
- **One-page visual:** [`sitecore-build-demo-diagram.md`](./sitecore-build-demo-diagram.md)

> **The whole point:** once setup is done, you build a demo by typing one sentence —
> *"create a custom demo for `<url>`"* and attaching a screenshot. The agent drives the rest and
> stops to get your approval before it writes anything to Sitecore.

---

## Before you start — what you need

| Requirement | Why |
|---|---|
| An **XM Cloud environment** you can write to | The demo's templates, renderings, datasources and page are created here via MCP. |
| A **Content Hub (DAM)** instance + credentials | Client images are uploaded, approved, and public-linked automatically. Without it, images fall back to a manual checklist. |
| **Node.js LTS + npm** | Runs the app and the Playwright scraper/extractor scripts. |
| A coding agent with **MCP support** (e.g. Claude Code) | Connects to the `sitecore-marketer` MCP that performs all Sitecore operations. |
| A **full-page screenshot** of the client homepage | The primary input. The pipeline will not start without one — web fetch alone misses layout, spacing, and section styling. |

---

## Setup (one time)

### 1. Clone the repo and branch off `main`

```bash
git clone <repo-url>
cd <repo>/examples/basic-nextjs
git checkout main && git pull
git checkout -b <client>-demo        # one branch per demo keeps environments isolated
```

> **Why a branch:** each demo is meant to run on its own branch + dedicated Sitecore environment
> deployed from serialization. That keeps the shared example items clean and lets several demos
> exist side by side.

### 2. Install dependencies (incl. the Playwright scraper)

```bash
npm install
npx playwright install chromium
```

Verify the scraper is runnable:

```bash
node docs/ai/scripts/site-scraper.mjs --help
```

> **Gotcha:** the scraper and content-extractor `import 'playwright'`, so they must be run **from
> inside `examples/basic-nextjs`** (where `node_modules` lives), not from a temp folder.

### 3. Deploy the app and connect a DAM environment

- Deploy the front-end to your XM Cloud rendering host (or run locally — see step 6).
- Make sure your **Content Hub / DAM** instance is provisioned and you have a login. You'll wire
  its credentials in step 5.

### 4. Connect the marketer MCP to your environment

In your coding agent, connect the **`sitecore-marketer`** MCP server (and optionally
`sitecore-docs` for official-behavior lookups) pointed at your XM Cloud environment.

```
/mcp        # connect / re-authorize the MCP servers
```

> **Gotcha:** MCP tokens expire mid-session. If a Sitecore call returns
> *"requires re-authorization (token expired)"*, just run `/mcp` again and retry — no work is lost.

### 5. Add Content Hub credentials to `credentials.local.yaml`

Copy the example and fill in your Content Hub values:

```bash
cp docs/ai/config/credentials.example.yaml docs/ai/config/credentials.local.yaml
```

```yaml
# docs/ai/config/credentials.local.yaml  (gitignored — never committed)
contentHub:
  host: "https://<your-instance>.sitecoresandbox.cloud/"
  authMethod: "simple"        # simple = user + password
  user: "<user>"
  password: "<password>"
  clientId: ""                # only for authMethod: oauth
  clientSecret: ""
  uploadConfig: "AssetUploadConfiguration"
```

Validate the credentials before building:

```bash
node docs/ai/scripts/upload-to-content-hub.mjs --images-dir docs/ai/demos/test --dry-run
# prints [auth] OK when the credentials are valid
```

> **Important:** the file must be named **`credentials.local.yaml`** (the gitignored name the
> pipeline reads). If you only have `credentials.yaml`, copy it to `credentials.local.yaml` —
> and delete any non-`.local` copy so secrets aren't committed.

### 6. (Optional) Run the app locally to view the result

```bash
cp .env.remote.example .env.local   # fill in SITECORE_EDGE_CONTEXT_ID, NEXT_PUBLIC_DEFAULT_SITE_NAME, SITECORE_EDITING_SECRET
npm run dev                          # open the Home page / your demo route
```

> **Note:** CDP page-view / identity events are disabled in `development` mode by design — test
> personalization on a deployed environment, not `npm run dev`.

---

## Run it — the one sentence

With setup done, start a demo by asking your agent, and **attach the full-page screenshot**:

```
create a custom demo for https://www.yokohama-tws.com/de-de
```

That's it. The natural-language request routes to the `sitecore-build-demo` skill.

> **Non-English sites are fine.** The Yokohama example is a German (`de-de`) page — the pipeline
> extracts the German DOM and **translates all content to English** before creating any items
> (demos are shown to English-speaking stakeholders).

---

## What happens next (and where you come in)

The agent runs the pipeline (full detail in the [diagram](./sitecore-build-demo-diagram.md)):

1. **Health-checks** your manifest/environment, **extracts the brand theme** from the screenshot
   (colors, fonts, radius), and **analyzes the homepage** into a section-by-section build plan.
2. **⛔ Stops and asks you to approve** — this is the one gate you must clear. You'll answer:
   - *Is the build plan correct? Approved to proceed?*
   - *Pixel-perfect custom variants, or generic template variants?*
   - (plus contact-form / image-handling questions as they arise)
3. After approval it **extracts content, uploads images to Content Hub, creates & fills
   datasources, applies the theme, builds any custom variants, and assembles the page** — tracking
   every step in `demo-progress.yaml` so it can **resume** if interrupted (`resume demo`).

---

## What you get

In `docs/ai/demos/<client>/`:

| File | Use |
|---|---|
| `demo-summary.md` | **Start here** — full build overview |
| `manual-tasks.md` | Remaining SE steps |
| `variant-checklist.md` | Set variants in Pages editor (the API can't) |
| `build-plan.yaml` / `content-map.yaml` / `images/` | Machine-readable build state |

To finish the demo, do the short manual list:
1. **Set variants** in the Pages editor (from `variant-checklist.md`).
2. **Wire NavigationHeader + SiteFooter** in the Header/Footer partial designs.
3. **Restart the dev server / redeploy** so new React exports load.

---

## Quick troubleshooting

| Symptom | Fix |
|---|---|
| MCP "token expired" | Run `/mcp` to re-authorize, then retry the call. |
| Scraper `Cannot find package 'playwright'` | Run it from `examples/basic-nextjs`; run `npx playwright install chromium`. |
| Images not uploading | Check `credentials.local.yaml` host/user/password; run the `--dry-run` auth check. |
| Pipeline won't start | Attach a **full-page screenshot** — it's mandatory. |
| Content is in the wrong language | It shouldn't be — all content is translated to English. If a source-language string slips through, flag it. |
| Root-path validation fails in Phase 0.5 | You're pointed at the wrong environment — verify `project.yaml` and your MCP connection. |
