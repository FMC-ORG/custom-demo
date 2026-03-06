# Sitecore Field Value Formats for MCP

When setting field values via `create_content_item` or `update_content`, use these formats.

## Text Fields

- **Single-Line / Multi-Line:** Plain string — `"Title": "My Article Title"`
- **Rich Text:** HTML string — `"Description": "<p>Some <strong>rich</strong> content</p>"`

## General Link — XML Format (CRITICAL)

The value must be a Sitecore link XML string with **all attributes present** (even if empty).
Attribute order: `text`, `anchor`, `linktype`, `class`, `title`, `target`, `querystring`, then `id` or `url`.

### Internal link

```xml
<link text="" anchor="" linktype="internal" class="" title="" target="" querystring="" id="{ITEM-GUID}" />
```

### Internal link with text + new tab

```xml
<link text="Read article" anchor="" linktype="internal" class="" title="" target="_blank" querystring="" id="{ITEM-GUID}" />
```

### External link

```xml
<link text="Visit site" anchor="" linktype="external" class="" title="" target="_blank" querystring="" url="https://example.com" />
```

### External link (hash/anchor)

```xml
<link text="Learn more" anchor="" linktype="external" class="" title="" target="" querystring="" url="#" />
```

### Media link

```xml
<link text="Download PDF" anchor="" linktype="media" class="" title="" target="_blank" querystring="" id="{MEDIA-ITEM-GUID}" />
```

### How to Pass in MCP

Pass raw XML as plain string. Do NOT escape quotes with backslashes — the tool handles JSON serialization.

```
update_content(
  itemId="<item-id>",
  siteName="<site-name>",
  fields={
    "CtaLink": '<link text="Learn more" anchor="" linktype="internal" class="" title="" target="_blank" querystring="" id="{C09AF119-...}" />'
  }
)
```

### Common Mistakes

- ❌ Abbreviated XML — missing `anchor`, `class`, `title`, `target`, `querystring` attributes
- ❌ Escaped quotes — `text=\"Read more\"` — don't manually escape
- ❌ Wrong attribute order
- ✅ All attributes present, normal quotes, correct order

## Image

```xml
<image mediaid="{MEDIA-ITEM-GUID}" />
```

In fields payload: `"Image": '<image mediaid="{MEDIA-ITEM-GUID}" />'`

## Checkbox

- True: `"IsActive": "1"`
- False: `"IsActive": ""`

## Date / DateTime

ISO format: `"PublishDate": "20250217T120000Z"`

## MCP Update Tools

- `update_content` — requires `itemId`, `siteName`, `fields`. For content under a site.
- `update_fields_on_content_item` — requires `itemId`, `fields` only. For templates, renderings, items outside site.

The API `updatedFields` response may not list every field updated. Verify in Content Editor if unsure. The update applies when the call returns success.
