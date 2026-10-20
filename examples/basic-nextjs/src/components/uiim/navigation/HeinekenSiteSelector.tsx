import React, { JSX } from "react";
import { Field, LinkField, Link, Text } from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";
import { cn } from "@/lib/utils";
import { hasText } from "@/lib/field-utils";

interface SiteOption {
  id: string;
  siteName: { jsonValue: Field<string> };
  siteLink: { jsonValue: LinkField };
}
interface SiteSelectorDatasource {
  title: { jsonValue: Field<string> };
  description: { jsonValue: Field<string> };
  placeholder: { jsonValue: Field<string> };
  children: { results: SiteOption[] };
}
type SiteSelectorProps = ComponentProps & {
  fields: { data: { datasource: SiteSelectorDatasource } };
};
const EmptySiteSelector = () => (
  <div className="component heineken-site-selector">
    <span className="is-empty-hint">HeinekenSiteSelector</span>
  </div>
);

/** Native disclosure keeps all authored destinations real, keyboard-accessible SDK links. */
export const Default = ({
  fields,
  params,
  page,
}: SiteSelectorProps): JSX.Element => {
  const ds = fields?.data?.datasource;
  if (!ds) return <EmptySiteSelector />;
  const editing = page?.mode?.isEditing;
  const options = ds.children?.results ?? [];
  return (
    <div
      className={cn("component heineken-site-selector", params.styles)}
      id={params.RenderingIdentifier}
    >
      <section
        className="px-6 py-10 lg:py-12"
        style={{
          background: "var(--brand-muted)",
          color: "var(--brand-secondary)",
        }}
      >
        <div className="mx-auto flex max-w-[1248px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {(hasText(ds.title?.jsonValue?.value) || editing) && (
            <Text
              field={ds.title?.jsonValue}
              tag="h2"
              className="font-heading text-3xl font-medium lg:text-[36px]"
            />
          )}
          <div className="flex flex-col gap-4 font-body sm:flex-row sm:items-center sm:gap-8">
            {(hasText(ds.description?.jsonValue?.value) || editing) && (
              <Text
                field={ds.description?.jsonValue}
                tag="p"
                className="text-sm"
              />
            )}
            <details
              className="group relative min-w-[220px]"
              open={editing || undefined}
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-10 rounded border px-6 py-2 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"
                style={{ borderColor: "var(--brand-secondary)" }}
              >
                <Text field={ds.placeholder?.jsonValue} />
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform group-open:rotate-180"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <ul
                className="absolute right-0 z-40 mt-2 min-w-full rounded border p-2 shadow-xl"
                style={{
                  background: "var(--brand-bg)",
                  borderColor: "var(--brand-border)",
                }}
              >
                {options.map((option) => (
                  <li key={option.id}>
                    {(option.siteLink?.jsonValue?.value?.href || editing) && (
                      <Link
                        field={option.siteLink?.jsonValue}
                        className="block whitespace-nowrap rounded px-3 py-2 text-sm hover:underline focus-visible:outline-2"
                      >
                        <Text field={option.siteName?.jsonValue} />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
};
