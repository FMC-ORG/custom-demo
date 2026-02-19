'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User } from 'lucide-react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Default nav links when no datasource is configured (development fallback)
 */
const DEFAULT_NAV_LINKS = [
  { label: 'Insurance', href: '#' },
  { label: 'Holidays', href: '#' },
  { label: 'Cruises', href: '#' },
  { label: 'Money', href: '#' },
  { label: 'Magazine', href: '#' },
];

/**
 * HeaderLink child item structure (from Sitecore datasource)
 */
interface HeaderLinkItem {
  id: string;
  label?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
}

/**
 * Header component parameters
 */
interface HeaderParams {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Header fields structure (GraphQL: children inside datasource)
 */
interface HeaderFields {
  data?: {
    datasource?: {
      logoText?: { jsonValue?: Field<string> };
      mySagaLink?: { jsonValue?: LinkField };
      children?: {
        results?: HeaderLinkItem[];
      };
    };
  };
}

/**
 * Header component props
 */
interface HeaderProps extends ComponentProps {
  params: HeaderParams;
  fields: HeaderFields;
  isPageEditing?: boolean;
}

/**
 * Header component implementation
 * Renders navigation with logo, nav links, and MySaga button.
 * Uses Sitecore datasource when available; falls back to default links when not.
 */
const HeaderComponent: React.FC<HeaderProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { data } = fields || {};
  const { datasource } = data || {};
  const navItems = datasource?.children?.results || [];

  const logoText = datasource?.logoText?.jsonValue?.value ?? 'SAGA';
  const mySagaHref = datasource?.mySagaLink?.jsonValue?.value?.href ?? '#';
  const mySagaText =
    datasource?.mySagaLink?.jsonValue?.value?.text ?? 'MySaga';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks =
    navItems.length > 0
      ? navItems.map((item) => ({
          label:
            item?.label?.jsonValue?.value ??
            item?.link?.jsonValue?.value?.text ??
            'Link',
          href: item?.link?.jsonValue?.value?.href ?? '#',
        }))
      : DEFAULT_NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="#" className="flex-shrink-0">
            {(logoText || isPageEditing) && (
              <svg
                viewBox="0 0 200 50"
                className="h-8 w-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="0"
                  y="40"
                  fontFamily="Georgia, serif"
                  fontSize="42"
                  fontWeight="400"
                  letterSpacing="6"
                  fill="#1B2A6B"
                >
                  {logoText}
                </text>
              </svg>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-saga-navy font-semibold text-sm hover:underline underline-offset-4 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* MySaga Button */}
          <div className="hidden md:flex items-center">
            <Link
              href={mySagaHref}
              className="inline-flex items-center gap-2 rounded-md bg-saga-teal px-4 py-2 text-sm font-semibold text-saga-navy hover:bg-saga-teal/80 transition-colors"
            >
              <User className="h-4 w-4" />
              {mySagaText}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-saga-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-saga-navy font-semibold text-sm hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={mySagaHref}
              className="inline-flex items-center gap-2 rounded-md bg-saga-teal px-4 py-2 text-sm font-semibold text-saga-navy w-fit"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              {mySagaText}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

/**
 * Default export for Sitecore component registration
 */
export const Default: React.FC<HeaderProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  return <HeaderComponent {...props} isPageEditing={isPageEditing} />;
};
