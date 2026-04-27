# Sitecore skill routing

When the user asks to create, update, diagnose, or fix a Sitecore XM Cloud component, classify the request first and then use the matching skill.

## Classification rules

### Use `sitecore-create-context-component` when
- the component should **not** have its own datasource item
- content should come from **route/page fields**
- optional rendering params may be used
- the component is page-scoped rather than reusable datasource content

### Use `sitecore-create-simple-component` when
- the component uses **one datasource item**
- there are **no authorable child datasource items**
- the rendering should **not** use `ComponentQuery`

### Use `sitecore-create-list-component` when
- the component has a **parent datasource item**
- there are **authorable child items**
- the rendering **must** use `ComponentQuery`
- React should use the GraphQL datasource shape

### Use `sitecore-fix-componentquery` when
- datasource data is not loading because `ComponentQuery` is missing, wrong, or mismatched
- the React data shape does not match the rendering query
- child items are not rendering due to query shape issues

### Use `sitecore-fix-datasource-picker` when
- the datasource picker is empty
- authors cannot create/select datasource items
- datasource template, datasource location, folder template, or insert options are misconfigured

### Use `sitecore-add-variants` when
- a component needs multiple visual presentations (variants) of the same content
- the request mentions "variant", "variation", "alternate layout", or "alternate style"
- a design shows two or more distinct layouts for the same component
- an existing component needs a new named export / variant added

### Use `sitecore-create-demo-variants` when
- the demo builder pipeline reaches Phase 5.5
- the user says "create custom variants", "match the screenshot exactly", "replicate the visual style", "pixel-perfect"
- existing template variants are close but don't match the client's exact layout, spacing, or visual details
- the user wants each component to look identical to the client's homepage, not just color-matched

## Required process
1. Classify the request before implementing.
2. Load the matching skill and its referenced docs.
3. If screenshots are attached, inspect them first.
4. Normalize the work into `docs/ai/templates/sitecore-component-spec.template.yaml`.
5. Check `docs/ai/manifests/sitecore-manifest.yaml` for an existing entry for this component.
   - If `status: complete`, confirm with the user before re-creating.
   - If `status: partial` or `failed`, plan to resume using recorded item IDs.
6. Ask concise follow-up questions if critical information is missing.
7. Before implementation, show:
   - chosen skill/workflow
   - assumptions
   - completed or partial spec
   - manifest status (new / resuming partial / updating existing)
   - plan
8. Then implement.

## Do not skip classification
Do not jump directly into code or Sitecore item changes until the request has been classified into:
- context-only
- simple datasource
- list datasource
- fix ComponentQuery
- fix datasource picker
- add variants
- create demo variants (pixel-perfect matching)

## Repo-first rule
If repository conventions conflict with a default skill behavior, follow the repository convention and explain the deviation.
