import React, { JSX } from "react";
import { Field, LinkField, Link, Text } from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { hasText } from "@/lib/field-utils";
import { HeinekenSocialIcon } from "@/lib/heineken-ui";

type QueryField<T> = { jsonValue: T };
interface NewsTeaser {
  id: string;
  newsTitle: QueryField<Field<string>>;
  newsDate: QueryField<Field<string>>;
  newsLink: QueryField<LinkField>;
}
interface InvestorDatasource {
  shareLabel: QueryField<Field<string>>;
  companyLabel: QueryField<Field<string>>;
  priceText: QueryField<Field<string>>;
  changeText: QueryField<Field<string>>;
  moreInfoLink: QueryField<LinkField>;
  xLink: QueryField<LinkField>;
  linkedInLink: QueryField<LinkField>;
  youTubeLink: QueryField<LinkField>;
  children: { results: NewsTeaser[] };
}
type InvestorProps = ComponentProps & {
  fields: { data: { datasource: InvestorDatasource } };
};

const EmptyInvestorNews = () => (
  <div className="component heineken-investor-news">
    <span className="is-empty-hint">HeinekenInvestorNews</span>
  </div>
);

/** Heineken screenshot layout; the financial data is an authorable, dated snapshot. */
export const Default = ({
  fields,
  params,
  page,
}: InvestorProps): JSX.Element => {
  const ds = fields?.data?.datasource;
  if (!ds) return <EmptyInvestorNews />;
  const editing = page?.mode?.isEditing;
  const social = [
    ds.xLink?.jsonValue,
    ds.linkedInLink?.jsonValue,
    ds.youTubeLink?.jsonValue,
  ];
  const stories = ds.children?.results ?? [];

  return (
    <div
      className={cn(
        "component heineken-investor-news relative z-20 -mt-10 overflow-x-clip lg:-mt-[60px]",
        params.styles,
      )}
      id={params.RenderingIdentifier}
    >
      <section
        className="relative px-6 pb-16 lg:min-h-[350px] lg:pb-24 font-body"
        style={{
          color: "var(--brand-secondary)",
          background: "linear-gradient(transparent 60px, var(--brand-bg) 60px)",
        }}
      >
        <div className="mx-auto flex max-w-[1248px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Card
            className="w-full shrink-0 gap-0 rounded-[var(--brand-card-radius)] border-0 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.09)] lg:w-[350px]"
            style={{ background: "var(--brand-bg)" }}
          >
            <div className="mb-10 flex items-center justify-between gap-4">
              {(hasText(ds.shareLabel?.jsonValue?.value) || editing) && (
                <Text
                  field={ds.shareLabel?.jsonValue}
                  tag="h2"
                  className="text-xl font-semibold"
                />
              )}
              {(ds.moreInfoLink?.jsonValue?.value?.href || editing) && (
                <Link
                  field={ds.moreInfoLink?.jsonValue}
                  className="text-sm font-semibold underline underline-offset-2 after:ml-2 after:content-['›']"
                />
              )}
            </div>
            {(hasText(ds.companyLabel?.jsonValue?.value) || editing) && (
              <Text
                field={ds.companyLabel?.jsonValue}
                tag="p"
                className="text-center text-sm"
                style={{ color: "var(--brand-muted-fg)" }}
              />
            )}
            {(hasText(ds.priceText?.jsonValue?.value) || editing) && (
              <Text
                field={ds.priceText?.jsonValue}
                tag="p"
                className="mt-2 text-center font-heading text-4xl font-medium"
                style={{ color: "var(--brand-primary)" }}
              />
            )}
            {(hasText(ds.changeText?.jsonValue?.value) || editing) && (
              <Text
                field={ds.changeText?.jsonValue}
                tag="p"
                className="mt-2 text-center text-sm"
                style={{ color: "var(--brand-muted-fg)" }}
              />
            )}
          </Card>
          <div
            className="flex items-center gap-5 pb-5 lg:mr-[190px]"
            style={{ color: "var(--brand-secondary)" }}
          >
            {social.map(
              (field, i) =>
                (field?.value?.href || editing) && (
                  editing ? <Link key={i} field={field} className="text-sm" /> : (
                    <span key={i} className="relative block h-5 w-5 opacity-65 hover:opacity-100">
                      <Link field={field} className="absolute inset-0 overflow-hidden text-transparent focus-visible:outline-2 focus-visible:outline-offset-4" />
                      <span aria-hidden="true" className="pointer-events-none"><HeinekenSocialIcon href={field?.value?.href} /></span>
                    </span>
                  )
                ),
            )}
          </div>
          <Card
            className="flex w-full flex-row gap-0 overflow-hidden rounded-[var(--brand-card-radius)] border-0 p-0 shadow-[0_18px_48px_rgba(0,0,0,0.09)] lg:absolute lg:left-[calc(50%+460px)] lg:top-0 lg:w-[600px]"
            style={{ background: "var(--brand-bg)" }}
          >
            {stories.map((story) => (
              <article
                key={story.id}
                className="flex-1 border-r px-6 py-6 last:border-r-0"
                style={{ borderColor: "var(--brand-border)" }}
              >
                {story.newsLink?.jsonValue?.value?.href || editing ? (
                  <Link
                    field={story.newsLink?.jsonValue}
                    className="block text-base font-semibold leading-6 hover:underline"
                  >
                    <Text field={story.newsTitle?.jsonValue} />
                  </Link>
                ) : (
                  hasText(story.newsTitle?.jsonValue?.value) && (
                    <Text
                      field={story.newsTitle?.jsonValue}
                      tag="h3"
                      className="text-base font-semibold leading-6"
                    />
                  )
                )}
                {(hasText(story.newsDate?.jsonValue?.value) || editing) && (
                  <Text
                    field={story.newsDate?.jsonValue}
                    tag="p"
                    className="mt-3 text-sm font-semibold"
                    style={{ color: "var(--brand-muted-fg)" }}
                  />
                )}
              </article>
            ))}
          </Card>
        </div>
      </section>
    </div>
  );
};
