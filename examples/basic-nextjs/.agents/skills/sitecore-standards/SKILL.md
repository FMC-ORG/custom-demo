---
name: sitecore-standards
description: "Shared Sitecore XM Cloud implementation standards for this project: Sitecore item and rendering rules, MCP usage, React/UIIM and shadcn patterns, editability, the component spec template, and the shared verification checklist. Use when creating, changing, or reviewing any Sitecore component or rendering, or when another sitecore-* skill asks for the shared standards."
metadata:
  cursorGlobs: "src/components/uiim/**"
---

# Sitecore standards

The always-on non-negotiables are in `AGENTS.md`. This skill holds the full detail; read the references that apply to the task.

| Reference | Use for |
|---|---|
| `references/component-build.md` | The shared create procedure (§1–§12) used by the three create skills |
| `references/implementation-standards.md` | Sitecore item rules: renderings, templates, datasource folders, Available Renderings, required output order |
| `references/mcp-tools-and-docs.md` | Marketer MCP usage, `__Standard Values` creation, verification, honesty rules |
| `references/react-shadcn.md` | React/UIIM structure, Tailwind + shadcn/ui, editable field rules, data shapes per component kind |
| `references/react-uiim-guidelines.md` | Worked React patterns (simple, list, context components), variants, empty states |
| `references/verification-checklist.md` | Checks common to every component type |
| `assets/sitecore-component-spec.template.yaml` | Normalising a request into a spec before implementation |

Project-wide platform facts (template IDs, MCP field names, ComponentQuery pattern, image field format) live in `docs/ai/reference/sitecore-rules.md`; MCP tool behaviours in `docs/ai/reference/sitecore-marketer-mcp-reference.md`.
