---
name: sitecore-standards
description: "Shared Sitecore XM Cloud implementation standards for this project: React/UIIM component patterns, Sitecore editability rules, the component spec template, and the shared verification checklist. Use when creating, changing, or reviewing any Sitecore component or rendering, or when another sitecore-* skill asks for the shared standards."
metadata:
  cursorGlobs: "src/components/uiim/**"
---

# Sitecore standards

Shared standards loaded by the create, variant, and fix skills. Read the references that apply to the task:

| Reference | Use for |
|---|---|
| `references/react-uiim-guidelines.md` | React component structure, props, named exports, editable field helpers |
| `references/verification-checklist.md` | Checks common to every component type |
| `assets/sitecore-component-spec.template.yaml` | Normalising a component request into a spec before implementation |

Project-wide Sitecore rules (template IDs, MCP field names, ComponentQuery pattern) live in `docs/ai/reference/sitecore-rules.md`.
