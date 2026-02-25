'use client';

import type React from 'react';
import { useState } from 'react';
import { Link as ContentSdkLink } from '@sitecore-content-sdk/nextjs';
import type { LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { Menu, X, Sparkles, Star, User } from 'lucide-react';
import Link from 'next/link';

interface HeaderFields {
  LogoLink?: LinkField | { value?: { href?: string; text?: string } };
  LogoText?: { value?: string };
}

type HeaderProps = ComponentProps & {
  fields?: HeaderFields;
};

const DEFAULT_NAV_LINKS = [
  { label: 'Car', href: '#' },
  { label: 'Home', href: '#' },
  { label: 'Travel', href: '#' },
  { label: 'Van', href: '#' },
  { label: 'Life', href: '#' },
  { label: 'Motorbike', href: '#' },
  { label: 'Pet', href: '#' },
  { label: 'Utilities', href: '#' },
  { label: 'Finance & business', href: '#' },
];

const DEFAULT_UTILITY_LINKS = [
  { label: 'Ask Confused', href: '#', icon: Sparkles },
  { label: 'Rewards', href: '#', icon: Star },
  { label: 'Sign in', href: '#', icon: User },
];

/**
 * Header component styled after Confused.com - dark two-row layout with logo,
 * utility links, and main navigation. Supports Sitecore datasource with fallback
 * to static content for disconnected demo.
 */
export const Default: React.FC<HeaderProps> = (props) => {
  const { fields } = props;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoText = fields?.LogoText?.value ?? 'Confused.com';
  const logoHref = fields?.LogoLink?.value?.href ?? '/';
  const useContentSdkLogo = Boolean(fields?.LogoLink);

  const LogoWrapper = useContentSdkLogo && fields?.LogoLink ? (
    <ContentSdkLink field={fields.LogoLink as LinkField} className="flex items-center gap-1 flex-shrink-0">
      <span className="text-xl font-bold tracking-tight">{logoText.split('.')[0]}</span>
      {logoText.includes('.') && (
        <span className="flex h-5 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white">
          .com
        </span>
      )}
    </ContentSdkLink>
  ) : (
    <Link href={logoHref} className="flex items-center gap-1 flex-shrink-0">
      <span className="text-xl font-bold tracking-tight">{logoText.split('.')[0]}</span>
      {logoText.includes('.') && (
        <span className="flex h-5 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white">
          .com
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-confused-dark text-white">
      {/* Top band: Logo + Utility links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          {LogoWrapper}

          {/* Utility links */}
          <div className="hidden md:flex items-center gap-1 rounded-lg bg-confused-container px-2 py-1">
            {DEFAULT_UTILITY_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Bottom band: Main navigation */}
      <nav className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center gap-1 py-3">
            {DEFAULT_NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-confused-dark">
          <div className="px-4 py-4 flex flex-col gap-1">
            {DEFAULT_UTILITY_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-confused-container text-white font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-2" />
            {DEFAULT_NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Beige accent stripe */}
      <div className="h-1 bg-confused-accent" />
    </header>
  );
};
