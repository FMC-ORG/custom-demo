# SitecoreAI — Demo Builder

## Project Rules

These rules are shared with Cursor. Claude Code imports them directly:

@.cursor/rules/00-project-config-bootstrap.mdc
@.cursor/rules/01-sitecore-router.mdc
@.cursor/rules/02-sitecore-implementation-standards.mdc
@.cursor/rules/03-react-uiim-shadcn.mdc
@.cursor/rules/04-sitecore-tools-and-docs.mdc
@.cursor/rules/05-sitecore-manifest.mdc

## Quick Reference

- **Stack**: Next.js + Sitecore XM Cloud + TypeScript + Tailwind + shadcn/ui
- **SDK**: `@sitecore-content-sdk/nextjs`
- **Config**: `docs/ai/config/project.yaml`
- **Manifest**: `docs/ai/manifests/sitecore-manifest.yaml`
- **Component Root**: `src/components/uiim/<category-kebab>/<ComponentNamePascal>.tsx`
- **Component Map**: `.sitecore/component-map.ts`
- **Theme Template**: `docs/ai/templates/client-theme.template.yaml`
- **Component Catalog**: `docs/ai/catalog/component-library-catalog.md`

## Key References (load on demand)

- `docs/ai/reference/sitecore-marketer-mcp-reference.md` — MCP field names, creation order, known behaviors
- `docs/ai/skills/shared/sitecore-tooling-guidelines.md` — non-negotiable Sitecore rules
- `docs/ai/skills/shared/react-uiim-guidelines.md` — React component patterns
- `docs/ai/catalog/component-registry.yaml` — machine-readable component library for site analysis
- `docs/ai/catalog/theme-component-mapping.md` — how themes drive variant selection
