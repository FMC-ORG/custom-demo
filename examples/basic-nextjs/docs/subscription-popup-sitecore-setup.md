# Subscription Popup — Sitecore Setup (Marketer MCP)

**Status: COMPLETED via MCP** — Template, folder, datasource, and rendering have been created.

Run these commands via the Sitecore Marketer MCP when authenticated. Replace placeholder IDs with values from `get_content_item_by_path` responses.

## 1. Get Parent IDs

```
get_content_item_by_path(path="/sitecore/templates/Project/saga-group/Components/Forms")
# → formsFolderId

get_content_item_by_path(path="/sitecore/templates/Project/saga-group/Folders")
# → foldersRootId

get_content_item_by_path(path="/sitecore/content/saga-group/saga-group/Data")
# → dataFolderId

get_content_item_by_path(path="/sitecore/layout/Renderings/Project/saga-group/Forms")
# → formsRenderingsFolderId
```

## 2. Create Template

```
create_content_item(
  name="SubscriptionPopup",
  templateId="ab86861a-6030-46c5-b394-e8f99e8b87db",
  parentId="<formsFolderId>"
)
# → subscriptionPopupTemplateId
```

## 3. Create Template Section

```
create_content_item(
  name="Data",
  templateId="e269fbb5-3750-427a-9149-7aa950b49301",
  parentId="<subscriptionPopupTemplateId>"
)
# → dataSectionId
```

## 4. Create Template Fields

```
create_content_item(name="Enabled", templateId="455a3e98-a627-4b40-8035-e683a0331ac7", parentId="<dataSectionId>", fields={"Type": "Checkbox"})
create_content_item(name="Title", templateId="455a3e98-a627-4b40-8035-e683a0331ac7", parentId="<dataSectionId>", fields={"Type": "Single-Line Text"})
create_content_item(name="Message", templateId="455a3e98-a627-4b40-8035-e683a0331ac7", parentId="<dataSectionId>", fields={"Type": "Multi-Line Text"})
create_content_item(name="CtaText", templateId="455a3e98-a627-4b40-8035-e683a0331ac7", parentId="<dataSectionId>", fields={"Type": "Single-Line Text"})
create_content_item(name="CtaLink", templateId="455a3e98-a627-4b40-8035-e683a0331ac7", parentId="<dataSectionId>", fields={"Type": "General Link"})
create_content_item(name="CloseButtonText", templateId="455a3e98-a627-4b40-8035-e683a0331ac7", parentId="<dataSectionId>", fields={"Type": "Single-Line Text"})
```

## 5. Create Folder Template

```
create_content_item(
  name="Subscription Popup Folder",
  templateId="0437fee2-44c9-46a6-abe9-28858d9fee8c",
  parentId="<foldersRootId>"
)
# → subscriptionPopupFolderTemplateId
```

## 6. Create Folder Instance

```
create_content_item(
  name="Subscription Popups",
  templateId="0437fee2-44c9-46a6-abe9-28858d9fee8c",
  parentId="<dataFolderId>"
)
# → subscriptionPopupsFolderId
```

## 7. Create Default Datasource

```
create_content_item(
  name="Subscription Popup Default",
  templateId="<subscriptionPopupTemplateId>",
  parentId="<subscriptionPopupsFolderId>",
  fields={
    "Enabled": "1",
    "Title": "Don't miss out!",
    "Message": "Sign up to our free Saga Magazine newsletter for exclusive offers and inspiration.",
    "CtaText": "Subscribe",
    "CtaLink": "<link linktype=\"external\" url=\"#newsletter\" text=\"Subscribe\" />",
    "CloseButtonText": "No thanks"
  }
)
```

## 8. Create JSON Rendering

```
create_content_item(
  name="SubscriptionPopup",
  templateId="04646a89-996f-4ee7-878a-ffdbf1f0ef0d",
  parentId="<formsRenderingsFolderId>"
)
# → subscriptionPopupRenderingId
```

## 9. Update Rendering Fields

```
update_fields_on_content_item(
  itemId="<subscriptionPopupRenderingId>",
  fields={
    "componentName": "subscription-popup",
    "Datasource Template": "/sitecore/templates/Project/saga-group/Components/Forms/SubscriptionPopup",
    "Datasource Location": "query:$site/*[@@name='Data']/*[@@name='Subscription Popups']|query:$sharedSites/*[@@name='Data']/*[@@name='Subscription Popups']",
    "AddFieldEditorButton": "1"
  }
)
```

Note: Leave `ComponentQuery` empty (single datasource, no children).

## 10. Add to Page

In XM Cloud Pages, add the Subscription Popup component to a placeholder (e.g. `headless-main`). Select the "Subscription Popup Default" datasource. The popup will trigger on exit intent when Enabled is checked.
