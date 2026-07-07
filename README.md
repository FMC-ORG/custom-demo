# Build a Custom Demo

> # ⚠️ Use `examples/basic-nextjs`
> **This demo builder runs on the `basic-nextjs` rendering host under `examples/`. The other
> starters in `examples/` are NOT used — ignore them.**

Turn a client's homepage (screenshot + URL) into a themed, content-filled Sitecore XM Cloud demo
on your own environment. Once setup is done, you build a demo by typing one sentence and attaching
a screenshot — the agent does the rest, pausing once for your approval before it writes anything to
Sitecore.

> **Recommended models:** for your first run, use an advanced/frontier model — **Opus**, **Fable**,
> or **Codex** — for the most reliable end-to-end result. It also works okay with Cursor's basic
> model, but you may need to make some adjustments along the way.

---

## Step 1 — Clone the repo and branch off `main`

```bash
git clone <repo-url>
cd <repo>/examples/basic-nextjs
git checkout main && git pull
git checkout -b <client>-demo
```

Use one branch per demo so each runs on its own isolated environment.

## Step 2 — Install dependencies

```bash
npm install
npx playwright install chromium
```

Verify the scraper runs (must be run from inside `examples/basic-nextjs`):

```bash
node docs/ai/scripts/site-scraper.mjs --help
```

## Step 3 — Deploy the app and connect a DAM environment

- Deploy the front end to your XM Cloud rendering host.
- Make sure your Content Hub (DAM) instance is provisioned and you have a login — client images
  are uploaded there automatically.

## Step 4 — Connect the marketer MCP

In your coding agent (e.g. Claude Code), connect the `sitecore-marketer` MCP server pointed at your
XM Cloud environment:

```
/mcp
```

If a Sitecore call later says "token expired", run `/mcp` again and retry.

## Step 5 — Add Content Hub credentials

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

Validate the credentials:

```bash
node docs/ai/scripts/upload-to-content-hub.mjs --images-dir docs/ai/demos/test --dry-run
# prints [auth] OK when valid
```

The file must be named `credentials.local.yaml`.

## Step 6 — Run the demo build

Ask your agent this, and **attach a full-page screenshot** of the client homepage:

```
create a custom demo for https://www.yokohama-tws.com/de-de
```

A screenshot is required — the build will not start without one. Non-English source sites are
supported; all content is translated to English automatically.

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
