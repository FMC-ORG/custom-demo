# Start Check — {{CLIENT}}

| | |
|---|---|
| Client URL | {{URL}} |
| Demo Branch | `{{CLIENT}}-demo` from `{{BASE_REF}}` ({{BASE_COMMIT}}) |
| Checked | {{CHECKED_AT}} |
| Result | {{READY_OR_NOT_READY}} — {{BLOCKERS}} blocker(s), {{WARNINGS}} warning(s) |

## Checks

| Check | Result | Details |
|---|---|---|
| {{CHECK_ID}} | {{PASS_FIXED_WARN_BLOCK}} | {{MESSAGE}} |

## Fixed automatically

- {{FIXED_ITEM_OR_NONE}}

## Target site

- Site: `{{SITE_COLLECTION}}/{{SITE_NAME}}` (item `{{SITE_ITEM_ID}}`)
- Another demo found: {{OTHER_DEMO_OR_NONE}}
- Preview/screenshots: {{PREVIEW_OK_OR_WARNING}}
- Manifest (Quick): {{MANIFEST_RESULT}}
- Placement API (get_component preflight): {{PLACEMENT_API_OK_OR_WARNING}}
- Showcase: {{SHOWCASE_URL_OR_NOT_SET}}

### Home components

| Instance | Component | Rendering | Placeholder | Datasource |
|---|---|---|---|---|
| {{INSTANCE_ID}} | {{COMPONENT}} | {{RENDERING_ID}} | {{PLACEHOLDER}} | {{DATASOURCE_NAME}} |

### Header / Footer

| Partial design | Instance | Datasource |
|---|---|---|
| Header | {{HEADER_INSTANCE}} | {{HEADER_DATASOURCE}} |
| Footer | {{FOOTER_INSTANCE}} | {{FOOTER_DATASOURCE}} |

## Next step

{{BUILD_COMMAND_OR_FIXES}}

Attach a full-page screenshot of the client homepage to the build command.
