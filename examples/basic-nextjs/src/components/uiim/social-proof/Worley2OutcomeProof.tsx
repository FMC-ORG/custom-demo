import { JSX } from "react";
import {
  Field,
  RichText as ContentSdkRichText,
  Text,
} from "@sitecore-content-sdk/nextjs";

import { Card, CardContent } from "@/components/ui/card";
import { hasRichText, hasText } from "@/lib/field-utils";
import { cn } from "@/lib/utils";
import { ComponentProps } from "lib/component-props";

type Worley2OutcomeProofFields = {
  Title: Field<string>;
  Description: Field<string>;
  StatValue: Field<string>;
  StatDescription: Field<string>;
  QuoteText: Field<string>;
  AuthorName: Field<string>;
  AuthorRole: Field<string>;
  SourceText: Field<string>;
};

type Worley2OutcomeProofProps = ComponentProps & {
  fields: Worley2OutcomeProofFields;
};

const Worley2OutcomeProofEmpty = (): JSX.Element => (
  <div className="component worley2-outcome-proof">
    <div className="component-content">
      <span className="is-empty-hint">Worley2OutcomeProof</span>
    </div>
  </div>
);

export const Default = ({
  fields,
  params,
  page,
}: Worley2OutcomeProofProps): JSX.Element => {
  if (!fields) return <Worley2OutcomeProofEmpty />;

  const isEditing = page?.mode?.isEditing;

  return (
    <section
      className={cn(
        "component worley2-outcome-proof bg-[var(--brand-muted)] py-14 text-[var(--brand-fg)] md:py-20",
        params.styles,
      )}
      id={params.RenderingIdentifier}
    >
      <div className="component-content mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-2 md:gap-12 md:px-10">
        <div className="flex flex-col justify-between gap-10">
          <div className="space-y-4">
            {(hasText(fields.Title?.value) || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="font-heading text-3xl font-bold tracking-tight md:text-5xl"
              />
            )}
            {(hasRichText(fields.Description?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="max-w-xl font-body text-base leading-7"
              />
            )}
          </div>

          <div className="space-y-3">
            {(hasText(fields.StatValue?.value) || isEditing) && (
              <Text
                field={fields.StatValue}
                tag="p"
                className="font-heading text-5xl font-bold text-[var(--brand-accent)] md:text-6xl"
              />
            )}
            {(hasRichText(fields.StatDescription?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields.StatDescription}
                className="max-w-xl font-body text-sm leading-6"
              />
            )}
          </div>
        </div>

        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-0">
            <div className="space-y-4">
              <span
                aria-hidden="true"
                className="font-heading text-6xl font-bold leading-none text-[var(--brand-accent)]"
              >
                “
              </span>
              {(hasRichText(fields.QuoteText?.value) || isEditing) && (
                <ContentSdkRichText
                  field={fields.QuoteText}
                  className="font-body text-xl leading-8 md:text-2xl md:leading-9"
                />
              )}
            </div>

            <div className="space-y-1 font-body">
              {(hasText(fields.AuthorName?.value) || isEditing) && (
                <Text field={fields.AuthorName} tag="p" className="font-bold" />
              )}
              {(hasText(fields.AuthorRole?.value) || isEditing) && (
                <Text
                  field={fields.AuthorRole}
                  tag="p"
                  className="font-semibold"
                />
              )}
              {(hasText(fields.SourceText?.value) || isEditing) && (
                <Text
                  field={fields.SourceText}
                  tag="p"
                  className="pt-2 text-sm italic"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

/* Worley2Outcome variant — turquoise split statistic and customer proof band */
export const Worley2Outcome = ({
  fields,
  params,
  page,
}: Worley2OutcomeProofProps): JSX.Element => {
  if (!fields) return <Worley2OutcomeProofEmpty />;

  const isEditing = page?.mode?.isEditing;

  return (
    <section
      className={cn(
        "component worley2-outcome-proof text-[var(--brand-fg)]",
        params.styles,
      )}
      id={params.RenderingIdentifier}
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--brand-primary) 28%, var(--brand-header-bg))",
      }}
    >
      <div className="component-content mx-auto grid max-w-[90rem] gap-12 px-5 py-16 md:grid-cols-2 md:gap-20 md:px-10 md:py-20">
        <div className="flex flex-col justify-between gap-12">
          <div className="max-w-xl space-y-4">
            {(hasText(fields.Title?.value) || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl"
              />
            )}
            {(hasRichText(fields.Description?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="max-w-md font-body text-sm leading-6"
              />
            )}
          </div>
          <div className="max-w-lg space-y-3">
            {(hasText(fields.StatValue?.value) || isEditing) && (
              <Text
                field={fields.StatValue}
                tag="p"
                className="font-heading text-6xl font-bold leading-none text-[var(--brand-accent)] md:text-7xl"
              />
            )}
            {(hasRichText(fields.StatDescription?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields.StatDescription}
                className="font-body text-sm leading-6"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-10 border-t border-[var(--brand-fg)]/20 pt-10 md:border-l md:border-t-0 md:pl-16 md:pt-0">
          <div className="relative space-y-5">
            <span
              aria-hidden="true"
              className="block font-heading text-7xl font-bold leading-none text-[var(--brand-accent)]"
            >
              “
            </span>
            {(hasRichText(fields.QuoteText?.value) || isEditing) && (
              <ContentSdkRichText
                field={fields.QuoteText}
                className="font-body text-xl leading-8 md:text-2xl md:leading-9"
              />
            )}
            <span
              aria-hidden="true"
              className="ml-auto block w-fit font-heading text-7xl font-bold leading-none text-[var(--brand-accent)]"
            >
              ”
            </span>
          </div>
          <div className="space-y-1 font-body text-sm">
            {(hasText(fields.AuthorName?.value) || isEditing) && (
              <Text field={fields.AuthorName} tag="p" className="font-bold" />
            )}
            {(hasText(fields.AuthorRole?.value) || isEditing) && (
              <Text field={fields.AuthorRole} tag="p" className="font-semibold" />
            )}
            {(hasText(fields.SourceText?.value) || isEditing) && (
              <Text field={fields.SourceText} tag="p" className="pt-3 italic" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
