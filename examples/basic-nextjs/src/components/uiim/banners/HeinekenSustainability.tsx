import React, { JSX } from "react";
import {
  Field,
  ImageField,
  LinkField,
  Link,
  NextImage,
  RichText,
  Text,
} from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasRichText, hasText } from "@/lib/field-utils";

interface SustainabilityFields {
  Title: Field<string>;
  Description: Field<string>;
  BackgroundImage: ImageField;
  WheelImage: ImageField;
  PrimaryLink: LinkField;
}
type SustainabilityProps = ComponentProps & { fields: SustainabilityFields };
const EmptySustainability = () => (
  <div className="component heineken-sustainability">
    <span className="is-empty-hint">HeinekenSustainability</span>
  </div>
);

/** A static, separately authorable wheel; no source hover interactions are inferred. */
export const Default = ({
  fields,
  params,
  page,
}: SustainabilityProps): JSX.Element => {
  if (!fields) return <EmptySustainability />;
  const editing = page?.mode?.isEditing;
  return (
    <div
      className={cn("component heineken-sustainability", params.styles)}
      id={params.RenderingIdentifier}
    >
      <section
        className="relative isolate min-h-[640px] overflow-hidden px-6 py-16 lg:min-h-[768px] lg:py-0"
        style={{
          color: "var(--brand-bg)",
          background: "var(--brand-secondary)",
        }}
      >
        {(fields.BackgroundImage?.value?.src || editing) && (
          <NextImage
            field={fields.BackgroundImage}
            fill
            sizes="100vw"
            className="-z-20 object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-black/30"
        />
        <div className="mx-auto grid max-w-[1248px] items-center gap-10 lg:min-h-[768px] lg:grid-cols-[40%_60%]">
          <div className="max-w-[390px] space-y-6">
            {(hasText(fields.Title?.value) || editing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="font-heading text-3xl font-medium leading-tight lg:text-[42px]"
                style={{ color: "var(--brand-accent)" }}
              />
            )}
            {(hasRichText(fields.Description?.value) || editing) && (
              <RichText
                field={fields.Description}
                className="max-w-[330px] font-body text-base font-semibold leading-6"
              />
            )}
            {(fields.PrimaryLink?.value?.href || editing) && (
              <Button
                asChild
                className="h-auto rounded-[var(--brand-button-radius)] px-6 py-3 font-body text-base font-semibold shadow-none hover:opacity-90"
                style={{
                  background: "var(--brand-bg)",
                  color: "var(--brand-secondary)",
                }}
              >
                <Link
                  field={fields.PrimaryLink}
                  className="after:ml-3 after:text-[var(--brand-accent)] after:content-['›']"
                />
              </Button>
            )}
          </div>
          {(fields.WheelImage?.value?.src || editing) && (
            <div className="relative mx-auto aspect-square w-full max-w-[640px] lg:translate-x-6">
              {!editing && (
                <div
                  aria-hidden="true"
                  className="absolute inset-[8%] translate-x-[9%] -translate-y-[3%] rotate-[14deg] scale-95"
                >
                  <NextImage
                    field={fields.WheelImage}
                    fill
                    sizes="(min-width: 1024px) 640px, 90vw"
                    className="object-contain"
                  />
                </div>
              )}
              <div className="absolute inset-0 -rotate-[12deg]">
                <NextImage
                  field={fields.WheelImage}
                  fill
                  sizes="(min-width: 1024px) 640px, 90vw"
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
