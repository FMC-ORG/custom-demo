# Standard Values — Mandatory Setup

## ⚠️ CRITICAL: THIS IS NON-NEGOTIABLE

If you skip creating __Standard Values:
- ❌ Insert options won't work
- ❌ Items created blank/empty
- ❌ "Add" button shows nothing in Pages editor
- ❌ Folder templates don't allow children
- ❌ Parent/child components don't work

**ALWAYS create __Standard Values. NO EXCEPTIONS.**

Even if you think "this template doesn't need defaults" — you're wrong. Create it anyway.

## Why This Matters

Every template created via MCP MUST have a `__Standard Values` item.
Without it, insert options don't work, items are created blank, and the Pages "Add" button is empty.
This is the #1 cause of "why isn't this working?" issues in Sitecore development.

## How to Create

`__Standard Values` is a child of the template. Its `templateId` is the **template's own ID**.

```
create_content_item(
  name="__Standard Values",
  templateId="<the-template-id-itself>",
  parentId="<the-template-id-itself>"
)
```

Then update with appropriate fields depending on template type:

## Scenario A: Folder Templates (e.g., "Article Cards Folder")

Set `__Masters` (Insert Options) to the IDs of datasource templates allowed as children.

```
update_fields_on_content_item(
  itemId="<standard-values-id>",
  fields={
    "__Masters": "{PARENT-TEMPLATE-ID-1}|{PARENT-TEMPLATE-ID-2}"
  }
)
```

## Scenario B: Parent Templates with Children (e.g., "ArticleCards")

Set `__Masters` to **child template ID(s)** AND default field values.

```
update_fields_on_content_item(
  itemId="<standard-values-id>",
  fields={
    "__Masters": "<articlecard-child-template-id>",
    "Title": "Default Title"
  }
)
```

## Scenario C: Simple / Child Templates (e.g., "ArticleCard", "Hero")

Set default field values so new items are not empty. No `__Masters` needed unless it has children.

```
update_fields_on_content_item(
  itemId="<standard-values-id>",
  fields={
    "Title": "Default Title",
    "BadgeText": "ARTICLE",
    "Link": '<link text="Read more" anchor="" linktype="external" class="" title="" target="" querystring="" url="#" />'
  }
)
```

## Default Value Guidelines

- **Text:** placeholder text (e.g., `"Default Title"`, `"Enter description here"`)
- **General Link:** full XML with all attributes (link to `#`)
- **Image:** empty or point to placeholder media item
- **Checkbox:** `"1"` or `""`
- **Rich Text:** `"<p>Enter content here</p>"`

## Sitecore Tokens

- `$name` — item name at creation time
- `$date` / `$time` / `$now` — current date/time
- `$id` / `$parentid` / `$parentname` — item/parent identifiers
