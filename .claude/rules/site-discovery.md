# Site Discovery Workflow

When starting work on a Sitecore XM Cloud project, you need to identify the site structure before creating content or components.

## Why This Matters

- Site collection and site name vary by environment
- Incorrect paths = items created in wrong location
- MCP tools require exact site names
- Content tree structure differs between projects

## 4-Step Discovery Process

### Step 1: Check Environment Variables

```bash
cat examples/basic-nextjs/.env.local | grep SITE_NAME
```

This is usually the fastest way to find the site name. Look for:
- `SITE_NAME=<site-name>`
- `GRAPH_QL_ENDPOINT` (contains site identifier)
- `JSS_APP_NAME` (legacy, sometimes present)

### Step 2: Try MCP Search (May Fail)

```
mcp__marketer__search_site(
  site_name="<name-from-env>",
  search_query="home"
)
```

**Known issue:** `list_sites` frequently returns 500 errors. This is normal.

If search fails, proceed to Step 3.

### Step 3: Explore Content Tree Manually

Start at the root and navigate down:

```
mcp__marketer__get_content_item_by_path(itemPath="/sitecore/content")
```

Look at the `children` results to identify site collections.

Then drill down:
```
/sitecore/content/<collection-name>
/sitecore/content/<collection-name>/<site-name>
```

**Common patterns:**
- `/sitecore/content/<company>/<site>/` — company name as collection
- `/sitecore/content/<site>/` — single site, no collection wrapper
- `/sitecore/content/<env>/<site>/` — environment-based collections

### Step 4: Verify Critical Paths

Once you've identified the site root, confirm these folders exist:

**Required folders:**
- **Home**: `/sitecore/content/<collection>/<site>/Home/`
- **Data**: `/sitecore/content/<collection>/<site>/Data/`
- **Presentation**: `/sitecore/content/<collection>/<site>/Presentation/`

**Check for:**
```
mcp__marketer__get_content_item_by_path(
  itemPath="/sitecore/content/<collection>/<site>/Data"
)
```

If Data folder missing, you'll need to create datasource folders here.

**Headless Variants location:**
```
/sitecore/content/<collection>/<site>/Presentation/Headless Variants/
```

Required for component variant definitions.

## Common Site Structures

### SXA Site (Full Structure)

```
/sitecore/content/<collection>/<site>/
  ├── Home/                    ← Pages
  ├── Data/                    ← Datasource items
  ├── Media/                   ← Site-specific media
  ├── Presentation/
  │   ├── Headless Variants/   ← Component variants
  │   ├── Styles/
  │   └── Available Renderings/
  ├── Settings/                ← Site settings
  └── Dictionary/              ← Translations
```

### Minimal Headless Site

```
/sitecore/content/<site>/
  ├── Home/                    ← Pages
  ├── Data/                    ← Datasource items
  └── Presentation/
      └── Headless Variants/   ← Component variants
```

## Troubleshooting

**Can't find site in content tree:**
- Check `/sitecore/content/` first — might be directly under root
- Look for recently modified items (your site is likely newest)
- Check commit history for site creation
- Ask user for site name if unclear

**Multiple sites found:**
- Check `.env.local` for which one is active
- Look at `sitecore.config.ts` for site configuration
- Check page routes to see which site they belong to

**MCP tools failing:**
- `list_sites` is unreliable — use path exploration instead
- `search_site` sometimes works when `list_sites` doesn't
- `get_content_item_by_path` is most reliable
- Don't give up on MCP if one tool fails

## Document Your Findings

After discovery, document the site structure:

**Update CLAUDE.md with:**
```markdown
**Current Project**:
- Site path: `/sitecore/content/<collection>/<site>/`
- Site collection: `<collection>`
- Site name: `<site>`
- Data folder: `/sitecore/content/<collection>/<site>/Data/`
- Variants: `/sitecore/content/<collection>/<site>/Presentation/Headless Variants/`
```

This saves time for future agents working on the project.

## Quick Reference

| Need | Command |
|------|---------|
| Check env vars | `cat examples/basic-nextjs/.env.local \| grep SITE_NAME` |
| Explore root | `get_content_item_by_path(itemPath="/sitecore/content")` |
| Verify folder | `get_content_item_by_path(itemPath="<full-path>")` |
| Search pages | `search_site(site_name="<name>", search_query="home")` |

**Estimated time:** 2-5 minutes with this workflow vs 20-30 minutes trial-and-error.
