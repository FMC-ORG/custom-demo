# SitecoreAI — Demo Builder

## Project Rules

Canonical rules live in `docs/ai/rules/`. Both Cursor and Claude Code reference them.

@docs/ai/rules/00-project-config-bootstrap.md
@docs/ai/rules/01-sitecore-router.md
@docs/ai/rules/02-sitecore-implementation-standards.md
@docs/ai/rules/03-react-uiim-shadcn.md
@docs/ai/rules/04-sitecore-tools-and-docs.md
@docs/ai/rules/05-sitecore-manifest.md

## Quick Reference

- **Stack**: Next.js + Sitecore XM Cloud + TypeScript + Tailwind + shadcn/ui
- **SDK**: `@sitecore-content-sdk/nextjs`
- **Config**: `docs/ai/config/project.yaml`
- **Manifest**: `docs/ai/manifests/sitecore-manifest.yaml`
- **Component Root**: `src/components/uiim/<category-kebab>/<ComponentNamePascal>.tsx`
- **Component Map**: `.sitecore/component-map.ts`
- **Theme Template**: `docs/ai/templates/client-theme.template.yaml`
- **Component Catalog**: `docs/ai/catalog/component-library-catalog.md`
- **Page Template Registry**: `docs/ai/catalog/page-template-registry.yaml`
- **Capabilities Registry**: `docs/ai/catalog/capabilities-registry.yaml`
- **Domain Glossary**: `CONTEXT.md`

## Key References (load on demand)

- `docs/ai/reference/sitecore-marketer-mcp-reference.md` — MCP field names, creation order, known behaviors
- `docs/ai/reference/sitecore-rules.md` — canonical Sitecore rules reference
- `docs/ai/skills/shared/react-uiim-guidelines.md` — React component patterns
- `docs/ai/catalog/component-registry.yaml` — machine-readable component library for site analysis
- `docs/ai/catalog/page-template-registry.yaml` — machine-readable page type registry (Article, future types)
- `docs/ai/catalog/capabilities-registry.yaml` — cross-cutting platform capabilities (search, future: personalization)
- `docs/ai/catalog/theme-component-mapping.md` — how themes drive variant selection
