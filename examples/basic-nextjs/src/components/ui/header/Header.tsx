'use client';

import React, { useState, JSX } from 'react';
import {
  NextImage as ContentSdkImage,
  Text,
  ImageField,
  LinkField,
  Field,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/ui/language-switcher/LanguageSwitcher';
import { LocaleAwareLink } from '@/components/ui/locale-link/LocaleAwareLink';
import { routing } from 'src/i18n/routing';

/** GraphQL returns { id, link { jsonValue } }; default JSS may use field.link */
interface HeaderNavItemResult {
  id?: string;
  link?: { jsonValue?: LinkField };
  field?: {
    link?: LinkField;
    Link?: LinkField;
  };
}

/** Supports both GraphQL camelCase (logo, siteName) and default JSS PascalCase (Logo, SiteName) */
interface HeaderFields {
  logo?: ImageField | { jsonValue?: ImageField };
  Logo?: ImageField;
  siteName?: Field<string> | { jsonValue?: Field<string> };
  SiteName?: Field<string>;
  secondaryCta?: LinkField | { jsonValue?: LinkField };
  SecondaryCta?: LinkField;
  primaryCta?: LinkField | { jsonValue?: LinkField };
  PrimaryCta?: LinkField;
  children?: {
    results: HeaderNavItemResult[];
  };
}

interface HeaderProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: HeaderFields;
    };
  } & HeaderFields;
}

/**
 * Header - Main navigation bar with logo, site name, nav items, and CTA buttons.
 * Displays below the promotional header with full navigation.
 */
export const Default = ({ params, fields }: HeaderProps): JSX.Element => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;
  const { locale } = useParams<{ locale?: string }>();
  const currentLocale = (locale as string) ?? routing.defaultLocale;

  const datasource = fields?.data?.datasource ?? fields;
  // Support GraphQL camelCase (jsonValue) and default JSS PascalCase (value)
  const logo = (datasource?.logo as ImageField) ?? datasource?.Logo;
  const logoField = (logo as { jsonValue?: ImageField })?.jsonValue ?? logo;
  const siteName = (datasource?.siteName as Field<string>) ?? datasource?.SiteName;
  const siteNameField = (siteName as { jsonValue?: Field<string> })?.jsonValue ?? siteName;
  const secondaryCta = (datasource?.secondaryCta as LinkField) ?? datasource?.SecondaryCta;
  const secondaryCtaField =
    (secondaryCta as { jsonValue?: LinkField })?.jsonValue ?? secondaryCta;
  const primaryCta = (datasource?.primaryCta as LinkField) ?? datasource?.PrimaryCta;
  const primaryCtaField = (primaryCta as { jsonValue?: LinkField })?.jsonValue ?? primaryCta;
  const navItems = datasource?.children?.results ?? [];

  const hasContent =
    logoField?.value?.src ||
    siteNameField?.value ||
    secondaryCtaField?.value?.href ||
    primaryCtaField?.value?.href ||
    navItems.length > 0 ||
    (isEditing && datasource);

  if (!hasContent) {
    return (
      <header
        className={cn('sticky top-0 z-50 border-b border-border bg-background', styles)}
        id={id}
        data-testid="header"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <span className="is-empty-hint text-muted-foreground">Header</span>
          </div>
        </div>
      </header>
    );
  }

  const navLinks = navItems
    .filter(
      (item) =>
        item?.link?.jsonValue ?? item?.field?.link ?? item?.field?.Link
    )
    .map((item, index) => ({
      key: `${item.id ?? index}-nav`,
      field: (item.link?.jsonValue ??
        item.field?.link ??
        item.field?.Link) as LinkField,
    }));

  return (
    <header
      className={cn('sticky top-0 z-50 border-b border-border bg-background', styles)}
      id={id}
      data-testid="header"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Site Name */}
          <Link
            href={`/${currentLocale}`}
            className="flex flex-shrink-0 items-center gap-2"
            aria-label={siteNameField?.value?.toString() ?? 'Home'}
          >
            {(logoField?.value?.src || (isEditing && logoField)) && (
              <div className="relative h-8 w-8 flex-shrink-0">
                <ContentSdkImage
                  field={logoField}
                  editable={isEditing}
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
                className="field-sitename text-lg font-semibold text-foreground"
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ key, field }) => (
              <LocaleAwareLink
                key={key}
                field={field}
                editable={isEditing}
                className="text-sm font-semibold text-foreground hover:underline underline-offset-4"
              />
            ))}
          </nav>

          {/* CTA Buttons + Language Switcher */}
          <div className="hidden items-center gap-3 md:flex">
            {(secondaryCtaField?.value?.href || (isEditing && secondaryCtaField)) && (
              <LocaleAwareLink
                field={secondaryCtaField}
                editable={isEditing}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              />
            )}
            {(primaryCtaField?.value?.href || (isEditing && primaryCtaField)) && (
              <LocaleAwareLink
                field={primaryCtaField}
                editable={isEditing}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              />
            )}
            <LanguageSwitcher isEditing={isEditing} />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="p-2 text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col gap-4 px-4 py-4">
            {navLinks.map(({ key, field }) => (
              <LocaleAwareLink
                key={key}
                field={field}
                editable={isEditing}
                className="text-sm font-semibold text-foreground hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
            {(secondaryCtaField?.value?.href || (isEditing && secondaryCtaField)) && (
              <LocaleAwareLink
                field={secondaryCtaField}
                editable={isEditing}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground w-fit"
                onClick={() => setMobileMenuOpen(false)}
              />
            )}
            {(primaryCtaField?.value?.href || (isEditing && primaryCtaField)) && (
              <LocaleAwareLink
                field={primaryCtaField}
                editable={isEditing}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground w-fit"
                onClick={() => setMobileMenuOpen(false)}
              />
            )}
            <LanguageSwitcher isEditing={isEditing} className="pt-1 border-t border-border" />
          </div>
        </div>
      )}
    </header>
  );
};
