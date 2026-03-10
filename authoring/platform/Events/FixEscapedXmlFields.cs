using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Data.Items;
using Sitecore.Events;
using Sitecore.Diagnostics;

namespace XmCloudNextJsStarter.Events
{
    /// <summary>
    /// Event handler that fixes double-escaped quotes in XML field values
    /// (Image, General Link) created by the Marketer MCP.
    /// Hooks into the item:saved event.
    /// </summary>
    public class FixEscapedXmlFields
    {
        // ============================================================
        // CONFIGURATION (set via config patch)
        // ============================================================

        /// <summary>
        /// The content path to scope the fix to.
        /// Only items under this path will be processed.
        /// </summary>
        public string ContentRootPath { get; set; }

        /// <summary>
        /// The XML-based field types to check.
        /// These are the field types that store data as XML
        /// and are affected by the MCP escaping issue.
        /// </summary>
        private static readonly string[] XmlFieldTypes = new[]
        {
            "Image",
            "General Link",
            "General Link with Search"
        };

        // ============================================================
        // HANDLER
        // ============================================================

        /// <summary>
        /// Called by Sitecore when the item:saved event fires.
        /// </summary>
        public void OnItemSaved(object sender, EventArgs args)
        {
            var item = Event.ExtractParameter<Item>(args, 0);
            if (item == null) return;

            // Skip items outside our target content path
            if (!string.IsNullOrEmpty(ContentRootPath)
                && !item.Paths.FullPath.StartsWith(ContentRootPath, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            // Skip the core database
            if (item.Database.Name == "core") return;

            try
            {
                var fieldsToFix = new Dictionary<string, string>();

                // Load all fields including standard fields
                item.Fields.ReadAll();

                foreach (Sitecore.Data.Fields.Field field in item.Fields)
                {
                    // Skip system fields
                    if (field.Name.StartsWith("__")) continue;

                    // Only process XML-based field types
                    if (!XmlFieldTypes.Any(t => t.Equals(field.Type, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    string originalValue = field.Value;
                    if (string.IsNullOrEmpty(originalValue)) continue;

                    string cleanedValue = CleanEscapedQuotes(originalValue);

                    if (cleanedValue != originalValue)
                    {
                        fieldsToFix[field.Name] = cleanedValue;
                    }
                }

                // Nothing to fix — exit early
                if (fieldsToFix.Count == 0) return;

                Log.Info(
                    $"[FixEscapedXmlFields] Fixing {fieldsToFix.Count} XML field(s) on item " +
                    $"'{item.Name}' ({item.ID}) at {item.Paths.FullPath}",
                    this);

                // Apply the fixes
                using (new Sitecore.SecurityModel.SecurityDisabler())
                {
                    // EventDisabler prevents this save from triggering
                    // the handler again (no infinite loop)
                    using (new Sitecore.Data.Events.EventDisabler())
                    {
                        item.Editing.BeginEdit();

                        foreach (var fix in fieldsToFix)
                        {
                            item[fix.Key] = fix.Value;

                            Log.Debug(
                                $"[FixEscapedXmlFields] Fixed field '{fix.Key}' " +
                                $"(type: {item.Fields[fix.Key]?.Type}) on '{item.Name}'",
                                this);
                        }

                        item.Editing.EndEdit();
                    }
                }

                Log.Info(
                    $"[FixEscapedXmlFields] Successfully fixed {fieldsToFix.Count} XML field(s) " +
                    $"on item '{item.Name}' ({item.ID})",
                    this);
            }
            catch (Exception ex)
            {
                Log.Error(
                    $"[FixEscapedXmlFields] Error processing item '{item.Name}' ({item.ID}): {ex.Message}",
                    ex, this);
            }
        }

        // ============================================================
        // CLEANING LOGIC
        // ============================================================

        /// <summary>
        /// Cleans escaped double quotes from XML field values.
        /// 
        /// Adjust these replacements based on the exact escaping
        /// pattern from the MCP. To check:
        ///   1. Create an item via MCP
        ///   2. Open in Content Editor → View → Raw Values
        ///   3. Inspect the Image or General Link field value
        /// </summary>
        private string CleanEscapedQuotes(string value)
        {
            if (string.IsNullOrEmpty(value)) return value;

            string result = value;

            // Double-encoded entity (most aggressive — check first)
            result = result.Replace("&amp;quot;", "\"");

            // Standard HTML entity
            result = result.Replace("&quot;", "\"");

            // Backslash-escaped quotes
            result = result.Replace("\\\"", "\"");

            // Numeric HTML entity
            result = result.Replace("&#34;", "\"");

            return result;
        }
    }
}