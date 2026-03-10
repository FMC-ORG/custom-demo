using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Data.Items;
using Sitecore.Events;
using Sitecore.Diagnostics;

namespace XmCloudNextJsStarter.Events
{
    public class FixEscapedXmlFields
    {
        public string ContentRootPath { get; set; }

        private static readonly string[] XmlFieldTypes = new[]
        {
            "Image",
            "General Link",
            "General Link with Search"
        };

        public void OnItemSaved(object sender, EventArgs args)
        {
            // ABSOLUTE FIRST LINE: log that we entered the method
            try
            {
                Log.Info("[FixEscapedXmlFields] >>> METHOD ENTERED <<<", this);
            }
            catch
            {
                // If even Log.Info fails, nothing we can do
            }

            try
            {
                Item item = null;

                try
                {
                    item = Event.ExtractParameter<Item>(args, 0);
                }
                catch (Exception ex)
                {
                    Log.Error("[FixEscapedXmlFields] Failed to extract item from args: " + ex.Message, ex, this);
                    return;
                }

                if (item == null)
                {
                    Log.Info("[FixEscapedXmlFields] Item is null, exiting", this);
                    return;
                }

                Log.Info(
                    $"[FixEscapedXmlFields] Processing item: '{item.Name}' " +
                    $"Path: '{item.Paths.FullPath}' DB: '{item.Database.Name}'",
                    this);

                // Skip items outside our target content path
                if (!string.IsNullOrEmpty(ContentRootPath)
                    && !item.Paths.FullPath.StartsWith(ContentRootPath, StringComparison.OrdinalIgnoreCase))
                {
                    Log.Info($"[FixEscapedXmlFields] Skipping - path doesn't match ContentRootPath: {ContentRootPath}", this);
                    return;
                }

                if (item.Database.Name == "core")
                {
                    Log.Info("[FixEscapedXmlFields] Skipping - core database", this);
                    return;
                }

                var fieldsToFix = new Dictionary<string, string>();

                item.Fields.ReadAll();

                int fieldCount = 0;
                int xmlFieldCount = 0;

                foreach (Sitecore.Data.Fields.Field field in item.Fields)
                {
                    fieldCount++;

                    if (field.Name.StartsWith("__")) continue;

                    if (!XmlFieldTypes.Any(t => t.Equals(field.Type, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    xmlFieldCount++;

                    string originalValue = field.Value;
                    if (string.IsNullOrEmpty(originalValue)) continue;

                    Log.Info(
                        $"[FixEscapedXmlFields] Found XML field: '{field.Name}' Type: '{field.Type}' " +
                        $"Value: '{originalValue}'",
                        this);

                    string cleanedValue = CleanEscapedQuotes(originalValue);

                    if (cleanedValue != originalValue)
                    {
                        fieldsToFix[field.Name] = cleanedValue;
                        Log.Info($"[FixEscapedXmlFields] WILL FIX: '{field.Name}'", this);
                    }
                    else
                    {
                        Log.Info($"[FixEscapedXmlFields] No fix needed for: '{field.Name}'", this);
                    }
                }

                Log.Info(
                    $"[FixEscapedXmlFields] Total fields: {fieldCount}, XML fields: {xmlFieldCount}, To fix: {fieldsToFix.Count}",
                    this);

                if (fieldsToFix.Count == 0) return;

                using (new Sitecore.SecurityModel.SecurityDisabler())
                {
                    using (new Sitecore.Data.Events.EventDisabler())
                    {
                        item.Editing.BeginEdit();
                        foreach (var fix in fieldsToFix)
                        {
                            item[fix.Key] = fix.Value;
                        }
                        item.Editing.EndEdit();
                    }
                }

                Log.Info(
                    $"[FixEscapedXmlFields] DONE - Fixed {fieldsToFix.Count} field(s) on '{item.Name}'",
                    this);
            }
            catch (Exception ex)
            {
                Log.Error(
                    $"[FixEscapedXmlFields] OUTER EXCEPTION: {ex.Message}",
                    ex, this);
            }
        }

        private string CleanEscapedQuotes(string value)
        {
            if (string.IsNullOrEmpty(value)) return value;

            string result = value;

            string backslashQuote = new string(new char[] { '\\', '"' });
            if (result.IndexOf(backslashQuote, StringComparison.Ordinal) >= 0)
            {
                result = result.Replace(backslashQuote, "\"");
            }

            result = result.Replace("&amp;quot;", "\"");
            result = result.Replace("&quot;", "\"");
            result = result.Replace("&#34;", "\"");
            result = result.Replace("\\u0022", "\"");

            return result;
        }
    }
}