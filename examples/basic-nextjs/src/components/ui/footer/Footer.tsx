'use client';

import React, { JSX } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  Text,
  ImageField,
  LinkField,
  Field,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { Twitter, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/** GraphQL: { id, link { jsonValue } } */
interface FooterSocialLinkResult {
  id?: string;
  link?: { jsonValue?: LinkField };
  field?: { link?: LinkField; Link?: LinkField };
}

/** GraphQL: { id, groupTitle { jsonValue }, children { results } } */
interface FooterNavGroupResult {
  id?: string;
  groupTitle?: { jsonValue?: Field<string> };
  GroupTitle?: Field<string>;
  children?: {
    results: FooterNavLinkResult[];
  };
}

/** GraphQL: { id, link { jsonValue } } */
interface FooterNavLinkResult {
  id?: string;
  link?: { jsonValue?: LinkField };
  field?: { link?: LinkField; Link?: LinkField };
}

/** Supports GraphQL camelCase (jsonValue) and default JSS PascalCase (value) */
interface FooterFields {
  logo?: ImageField | { jsonValue?: ImageField };
  Logo?: ImageField;
  siteName?: Field<string> | { jsonValue?: Field<string> };
  SiteName?: Field<string>;
  tagline?: Field<string> | { jsonValue?: Field<string> };
  Tagline?: Field<string>;
  copyrightText?: Field<string> | { jsonValue?: Field<string> };
  CopyrightText?: Field<string>;
  statusLabel?: Field<string> | { jsonValue?: Field<string> };
  StatusLabel?: Field<string>;
  children?: {
    results: (FooterSocialLinkResult | FooterNavGroupResult)[];
  };
}

interface FooterProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: FooterFields;
    };
  } & FooterFields;
}

function getSocialIcon(url?: string): React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }> | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes('twitter.com') || lower.includes('x.com')) return Twitter;
  if (lower.includes('github.com')) return Github;
  if (lower.includes('linkedin.com')) return Linkedin;
  return null;
}

/**
 * Footer - Site footer with logo, tagline, social links, nav columns, and copyright bar.
 */
export const Default = ({ params, fields }: FooterProps): JSX.Element => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource ?? fields;
  if (!datasource) {
    return (
      <footer
        className={cn('border-t border-border bg-muted/30 py-8', styles)}
        id={id}
        data-testid="footer"
      >
        <div className="mx-auto max-w-7xl px-4">
          <span className="is-empty-hint text-muted-foreground">Footer</span>
        </div>
      </footer>
    );
  }

  // Support GraphQL camelCase (jsonValue) and default JSS PascalCase (value)
  const logo = (datasource?.logo as ImageField) ?? datasource?.Logo;
  const logoField = (logo as { jsonValue?: ImageField })?.jsonValue ?? logo;
  const siteName = (datasource?.siteName as Field<string>) ?? datasource?.SiteName;
  const siteNameField = (siteName as { jsonValue?: Field<string> })?.jsonValue ?? siteName;
  const tagline = (datasource?.tagline as Field<string>) ?? datasource?.Tagline;
  const taglineField = (tagline as { jsonValue?: Field<string> })?.jsonValue ?? tagline;
  const copyrightText = (datasource?.copyrightText as Field<string>) ?? datasource?.CopyrightText;
  const copyrightField =
    (copyrightText as { jsonValue?: Field<string> })?.jsonValue ?? copyrightText;
  const statusLabel = (datasource?.statusLabel as Field<string>) ?? datasource?.StatusLabel;
  const statusField = (statusLabel as { jsonValue?: Field<string> })?.jsonValue ?? statusLabel;

  const children = datasource?.children?.results ?? [];
  const socialLinks = children.filter(
    (c): c is FooterSocialLinkResult =>
      !('children' in c && c.children?.results?.length) &&
      (!!(c as FooterSocialLinkResult).link || !!(c as FooterSocialLinkResult).field?.link || !!(c as FooterSocialLinkResult).field?.Link)
  );
  const navGroups = children.filter(
    (c): c is FooterNavGroupResult =>
      ('children' in c && Array.isArray(c.children?.results)) ||
      'groupTitle' in c ||
      'GroupTitle' in c
  );

  const hasContent =
    logoField?.value?.src ||
    siteNameField?.value ||
    taglineField?.value ||
    copyrightField?.value ||
    socialLinks.length > 0 ||
    navGroups.length > 0 ||
    (isEditing && datasource);

  if (!hasContent) {
    return (
      <footer
        className={cn('border-t border-border bg-muted/30 py-8', styles)}
        id={id}
        data-testid="footer"
      >
        <div className="mx-auto max-w-7xl px-4">
          <span className="is-empty-hint text-muted-foreground">Footer</span>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={cn('border-t border-border bg-muted/30 py-12', styles)}
      id={id}
      data-testid="footer"
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Top section: left block + nav columns */}
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-12">
          {/* Left: Logo, Site Name, Tagline, Social */}
          <div className="flex flex-col gap-4 md:max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label={siteNameField?.value?.toString() ?? 'Home'}
            >
              {(logoField?.value?.src || (isEditing && logoField)) && (
                <div className="relative h-8 w-8 flex-shrink-0">
                  <ContentSdkImage
                    field={logoField}
                    alt={siteNameField?.value?.toString() ?? 'Logo'}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              )}
              {(siteNameField?.value || (isEditing && siteNameField)) && (
                <Text
                  tag="span"
                  field={siteNameField}
                  className="text-lg font-semibold text-foreground"
                />
              )}
            </Link>
            {(taglineField?.value || (isEditing && taglineField)) && (
              <Text
                tag="p"
                field={taglineField}
                className="field-tagline text-sm text-muted-foreground"
              />
            )}
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((item, index) => {
                const linkField = (item.link?.jsonValue ?? item.field?.link ?? item.field?.Link) as
                  | LinkField
                  | undefined;
                if (!linkField) return null;
                const href = linkField?.value?.href;
                const Icon = getSocialIcon(href);
                if (!href && !isEditing) return null;
                return (
                  <ContentSdkLink
                    key={item.id ?? index}
                    field={linkField}
                    editable={isEditing}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={linkField?.value?.text ?? 'Social link'}
                  >
                    {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
                  </ContentSdkLink>
                );
              })}
            </div>
          </div>

          {/* Right: Nav columns */}
          <div className="flex flex-wrap gap-8 md:gap-12">
            {navGroups.map((group) => {
              const groupTitleRaw = group.groupTitle ?? group.GroupTitle;
              const groupTitleField =
                (groupTitleRaw as { jsonValue?: Field<string> })?.jsonValue ?? (groupTitleRaw as Field<string>);
              const groupTitle =
                (groupTitleField as Field<string>)?.value ??
                (groupTitleRaw as { jsonValue?: Field<string> })?.jsonValue?.value;
              const links = group.children?.results ?? [];
              const linkFields = links
                .map((l) => l.link?.jsonValue ?? l.field?.link ?? l.field?.Link as LinkField | undefined)
                .filter(Boolean);
              return (
                <nav key={group.id ?? groupTitle} className="flex flex-col gap-3">
                  {(groupTitle || (isEditing && groupTitleField)) && (
                    <Text
                      tag="h3"
                      field={groupTitleField as Field<string>}
                      className="text-sm font-semibold uppercase tracking-wider text-foreground"
                    />
                  )}
                  <ul className="flex flex-col gap-2">
                    {linkFields.map((field, i) => (
                      <li key={i}>
                        <ContentSdkLink
                          field={field as LinkField}
                          editable={isEditing}
                          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              );
            })}
          </div>
        </div>

        {/* Bottom bar: Copyright + Status */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          {(copyrightField?.value || (isEditing && copyrightField)) && (
            <Text
              tag="span"
              field={copyrightField}
              className="field-copyrighttext text-sm text-muted-foreground"
            />
          )}
          {(statusField?.value || (isEditing && statusField)) && (
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full bg-green-500"
                aria-hidden
              />
              <Text
                tag="span"
                field={statusField}
                className="text-sm text-muted-foreground"
              />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
