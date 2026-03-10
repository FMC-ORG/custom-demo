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
            Log.Info(
            $"[FixEscapedXmlFields] Handler triggered for item '{item.Name}' " +
            $"at path '{item.Paths.FullPath}', database '{item.Database.Name}'",
            this);

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

                    // Debug: log raw value and char codes of first 80 chars
                    string debugChars = string.Join(",",
                        originalValue.Substring(0, Math.Min(80, originalValue.Length))
                        .Select(c => ((int)c).ToString("X2")));

                    Log.Info(
                        $"[FixEscapedXmlFields] Checking field '{field.Name}' (type: {field.Type}) " +
                        $"on '{item.Name}'. Length: {originalValue.Length}. " +
                        $"First 80 char codes: {debugChars}",
                        this);

                    Log.Info(
                        $"[FixEscapedXmlFields] Raw value: {originalValue}",
                        this);

                    string cleanedValue = CleanEscapedQuotes(originalValue);

                    if (cleanedValue != originalValue)
                    {
                        fieldsToFix[field.Name] = cleanedValue;

                        Log.Info(
                            $"[FixEscapedXmlFields] WILL FIX field '{field.Name}'. " +
                            $"Before: {originalValue} | After: {cleanedValue}",
                            this);
                    }
                    else
                    {
                        Log.Info(
                            $"[FixEscapedXmlFields] No change needed for field '{field.Name}'",
                            this);
                    }
                }

                // Nothing to fix — exit early
                if (fieldsToFix.Count == 0)
                {
                    Log.Info(
                        $"[FixEscapedXmlFields] No fields to fix on item '{item.Name}' ({item.ID})",
                        this);
                    return;
                }

                Log.Info(
                    $"[FixEscapedXmlFields] Fixing {fieldsToFix.Count} XML field(s) on item " +
                    $"'{item.Name}' ({item.ID}) at {item.Paths.FullPath}",
                    this);

                // Apply the fixes
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
        /// Cleans escaped quotes from XML field values.
        /// 
        /// Known pattern from MCP Marketer:
        ///   \" (backslash + double quote) should become just "
        ///   
        /// Example broken value:
        ///   &lt;link text=\"Read more\" linktype=\"external\" /&gt;
        /// 
        /// Expected clean value:
        ///   &lt;link text="Read more" linktype="external" /&gt;
        /// </summary>
        private string CleanEscapedQuotes(string value)
        {
            if (string.IsNullOrEmpty(value)) return value;

            string result = value;

            // PRIMARY FIX: Backslash-escaped double quotes
            // The literal two-character sequence: \  then  "
            // Using char array to be absolutely explicit about what we're replacing
            string backslashQuote = new string(new char[] { '\\', '"' });
            string justQuote = "\"";

            if (result.IndexOf(backslashQuote, StringComparison.Ordinal) >= 0)
            {
                result = result.Replace(backslashQuote, justQuote);
            }

            // ALSO TRY: Unicode escape variants
            // Some serializers use the Unicode escape \u0022 for quotes
            result = result.Replace("\\u0022", "\"");

            // Double-encoded HTML entity
            result = result.Replace("&amp;quot;", "\"");

            // Standard HTML entity
            result = result.Replace("&quot;", "\"");

            // Numeric HTML entity
            result = result.Replace("&#34;", "\"");

            return result;
        }
    }
}