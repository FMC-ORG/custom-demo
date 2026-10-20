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

type BrandActionProps = {
  field?: LinkField;
  editing?: boolean;
  className?: string;
};
export const HeinekenAction = ({
  field,
  editing,
  className,
}: BrandActionProps): JSX.Element | null => {
  if (!field?.value?.href && !editing) return null;
  return (
    <Button
      asChild
      className={cn(
        "h-auto rounded-[var(--brand-button-radius)] px-6 py-3 font-body text-base font-semibold shadow-none hover:opacity-90",
        className,
      )}
      style={{ background: "var(--brand-bg)", color: "var(--brand-secondary)" }}
    >
      <Link
        field={field ?? { value: { href: '' } }}
        className="after:ml-3 after:text-[var(--brand-accent)] after:content-['›']"
      />
    </Button>
  );
};

type PhotoProps = Pick<ComponentProps, "params" | "page"> & {
  title?: Field<string>;
  body?: Field<string>;
  image?: ImageField;
  link?: LinkField;
  eyebrow?: Field<string>;
  layout: "hero" | "purpose" | "brands" | "careers";
};
export const HeinekenPhoto = ({
  title,
  body,
  image,
  link,
  eyebrow,
  layout,
  params,
  page,
}: PhotoProps): JSX.Element => {
  const editing = page?.mode?.isEditing;
  const hero = layout === "hero";
  return (
    <div
      className={cn("component heineken-photo", params.styles)}
      id={params.RenderingIdentifier}
    >
      <section
        className={cn(
          "relative isolate flex w-full items-center overflow-hidden px-6 py-20",
          hero
            ? "min-h-[520px] lg:h-[650px]"
            : "min-h-[640px] lg:h-[clamp(640px,56vw,1080px)]",
        )}
        style={{
          color: "var(--brand-bg)",
          background: "var(--brand-secondary)",
        }}
      >
        {(image?.value?.src || editing) && (
          <NextImage
            field={image}
            fill
            sizes="100vw"
            className="-z-20 object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className={cn("absolute inset-0 -z-10", hero && "bg-black/35")}
          style={
            hero
              ? undefined
              : {
                  background:
                    "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--brand-secondary) 30%, transparent) 45%, color-mix(in srgb, var(--brand-secondary) 88%, transparent) 100%)",
                }
          }
        />
        <div className="mx-auto w-full max-w-[1248px]">
          <div
            className={cn("max-w-[560px] space-y-7", !hero && "lg:ml-[50%]")}
          >
            {(hasText(eyebrow?.value) || editing) && (
              <Text
                field={eyebrow}
                tag="p"
                className="font-body text-base font-semibold"
              />
            )}
            {(hasText(title?.value) || editing) && (
              <Text
                field={title}
                tag={hero ? "h1" : "h2"}
                className={cn(
                  "font-heading font-medium leading-[1.15]",
                  hero ? "text-4xl lg:text-[54px]" : "text-3xl lg:text-[40px]",
                )}
              />
            )}
            {(hasRichText(body?.value) || editing) && (
              <RichText
                field={body}
                className={cn(
                  "font-body font-semibold",
                  hero
                    ? "text-xl lg:text-2xl"
                    : "max-w-[520px] text-base leading-6",
                )}
              />
            )}
            <HeinekenAction field={link} editing={editing} />
          </div>
        </div>
      </section>
    </div>
  );
};

type StrategyProps = Pick<ComponentProps, "params" | "page"> & {
  title?: Field<string>;
  body?: Field<string>;
  image?: ImageField;
  link?: LinkField;
};
export const HeinekenStrategySection = ({
  title,
  body,
  image,
  link,
  params,
  page,
}: StrategyProps): JSX.Element => {
  const editing = page?.mode?.isEditing;
  return (
    <div
      className={cn("component heineken-strategy", params.styles)}
      id={params.RenderingIdentifier}
    >
      <section
        className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-0 lg:py-[100px]"
        style={{ background: "var(--brand-bg)" }}
      >
        <div className="relative h-[400px] overflow-hidden rounded-r-[var(--brand-card-radius)] lg:h-[600px]">
          {(image?.value?.src || editing) && (
            <NextImage
              field={image}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="space-y-6 px-6 lg:max-w-[690px] lg:pl-[128px] lg:pr-12">
          {(hasText(title?.value) || editing) && (
            <Text
              field={title}
              tag="h2"
              className="font-heading text-3xl font-medium lg:text-[38px]"
              style={{ color: "var(--brand-primary)" }}
            />
          )}
          {(hasRichText(body?.value) || editing) && (
            <RichText
              field={body}
              className="space-y-4 font-body text-base leading-6 [&_p+p]:mt-4"
              style={{ color: "var(--brand-muted-foreground)" }}
            />
          )}
          <HeinekenAction
            field={link}
            editing={editing}
            className="bg-neutral-100!"
          />
        </div>
      </section>
    </div>
  );
};

/** Decorative UI icons; the link label remains an editable SDK field. */
export const HeinekenSocialIcon = ({
  href,
}: {
  href?: string;
}): JSX.Element => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    {href?.includes("linkedin") ? (
      <path d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4M3 9h4v12H3zm6 0h4v1.6c.8-1.2 2-2 3.8-2 3 0 4.2 1.8 4.2 5V21h-4v-6.4c0-1.7-.5-2.8-1.9-2.8-1.5 0-2.1 1.1-2.1 2.8V21H9z" />
    ) : href?.includes("youtube") ? (
      <path d="M21 6c-.4-.8-1.2-1.2-2-1.3A60 60 0 0 0 5 4.7c-.8.1-1.6.5-2 1.3-.5 1.2-1 3.8-1 6s.5 4.8 1 6c.4.8 1.2 1.2 2 1.3a60 60 0 0 0 14 0c.8-.1 1.6-.5 2-1.3.5-1.2 1-3.8 1-6s-.5-4.8-1-6m-11 10V8l7 4z" />
    ) : href?.includes("instagram") ? (
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
      </g>
    ) : (
      <path d="M4 3h5.3l4.6 6.2L19.5 3H22l-6.9 8.1L22 21h-5.3l-5.1-7L5.5 21H3l7.3-8.9L4 3m2.7 1.5 11 15h1.6l-11-15z" />
    )}
  </svg>
);
