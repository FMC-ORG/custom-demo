/**
 * Facet helpers for the search components (spec: search v4, ADR 0010).
 *
 * Endpoint facts (probed 2026-10-27 against a push source):
 * - Facets are addressed by the source's DISPLAY name (e.g. "ArticleTopic"), not the
 *   lowercase document attribute ("articletopic" -> HTTP 400).
 * - An unknown facet name fails the WHOLE search with HTTP 400 — callers must degrade.
 * - Multiple values in one `eq` filter are OR-ed.
 * - Counts are disjunctive: a facet's own counts ignore its own filter (other facets narrow),
 *   so one request is enough to render "tick more values" counts.
 */

export interface FacetDefinition {
  /** Facet name as configured in the search source (request + URL key). */
  name: string;
  /** Visitor-facing heading. */
  label: string;
}

/** Selected values per facet name. */
export type FacetSelection = Record<string, string[]>;

/** Minimal structural copy of the SDK FacetRequest (not re-exported by nextjs/search). */
export interface FacetRequestShape {
  fields: { name: string; filters?: { operator: 'eq'; value: string[] }[] }[];
}

/** "ArticleTopic" -> "Topic", "ContentType" -> "Content Type". */
export const humanizeFacetName = (name: string): string => {
  const base = name.replace(/^Article(?=[A-Z])/, '');
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
};

/**
 * Parse the authorable `Facets` field: comma-separated `Name` or `Name:Label` entries,
 * e.g. "ArticleTopic:Topic, ArticleAuthor". Duplicates and blanks are dropped.
 */
export const parseFacetDefinitions = (value: string | undefined | null): FacetDefinition[] => {
  if (!value) return [];
  const seen = new Set<string>();
  const defs: FacetDefinition[] = [];
  for (const entry of value.split(',')) {
    const [rawName, ...rest] = entry.split(':');
    const name = rawName.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const label = rest.join(':').trim() || humanizeFacetName(name);
    defs.push({ name, label });
  }
  return defs;
};

/** URL encoding of one facet's selection: values joined with "|" (commas occur in labels). */
export const FACET_VALUE_SEPARATOR = '|';

export const serializeFacetValues = (values: string[] | undefined): string =>
  (values ?? []).join(FACET_VALUE_SEPARATOR);

export const parseFacetValues = (raw: string): string[] =>
  raw
    .split(FACET_VALUE_SEPARATOR)
    .map((v) => v.trim())
    .filter(Boolean);

/** Build the request: every configured facet (for counts) plus OR-filters for selections. */
export const buildFacetRequest = (
  defs: FacetDefinition[],
  selection: FacetSelection
): FacetRequestShape | undefined => {
  if (!defs.length) return undefined;
  return {
    fields: defs.map(({ name }) => {
      const values = selection[name] ?? [];
      return values.length ? { name, filters: [{ operator: 'eq', value: values }] } : { name };
    }),
  };
};

/** Toggle one value in a selection, returning a new object (empty facets removed). */
export const toggleFacetValue = (
  selection: FacetSelection,
  name: string,
  value: string
): FacetSelection => {
  const current = selection[name] ?? [];
  const nextValues = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  const next = { ...selection };
  if (nextValues.length) next[name] = nextValues;
  else delete next[name];
  return next;
};

export const countSelected = (selection: FacetSelection): number =>
  Object.values(selection).reduce((sum, values) => sum + values.length, 0);

export interface FacetOption {
  value: string;
  count: number;
  selected: boolean;
}

/**
 * Merge the API facet values with the current selection so a selected value never
 * disappears (e.g. its count dropped to 0 under a new keyphrase) and can be unticked.
 */
export const facetOptions = (
  apiValues: { text: string | number | boolean; count: number }[] | undefined,
  selected: string[] | undefined
): FacetOption[] => {
  const chosen = new Set(selected ?? []);
  const options: FacetOption[] = (apiValues ?? []).map((v) => ({
    value: String(v.text),
    count: v.count,
    selected: chosen.has(String(v.text)),
  }));
  for (const value of chosen) {
    if (!options.some((o) => o.value === value)) options.push({ value, count: 0, selected: true });
  }
  return options;
};

/** Normalize a Sitecore item ID to the dashed lowercase GUID the search API keys documents by. */
export const normalizeItemId = (id: string | undefined | null): string => {
  const hex = String(id ?? '')
    .replace(/[{}-]/g, '')
    .toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return '';
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
