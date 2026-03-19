'use client';

import React, { JSX } from 'react';
import {
  NextImage as ContentSdkImage,
  ImageField,
  Link as ContentSdkLink,
  LinkField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EurobankHeaderBannerFields = {
  Logo: ImageField;
  EBankingLink: LinkField;
};

type EurobankHeaderBannerProps = ComponentProps & {
  fields: EurobankHeaderBannerFields;
};

// ---------------------------------------------------------------------------
// Static nav data (structural — not authored per instance)
// ---------------------------------------------------------------------------

const utilityLinks = ['Private Banking', 'International Customers', 'Group'];

const mainNavLinks = ['About Eurobank', 'Cards', 'Digital Wallets', 'Rewards'];

// ---------------------------------------------------------------------------
// Empty-state fallback
// ---------------------------------------------------------------------------

const EurobankHeaderBannerDefaultComponent = (): JSX.Element => (
  <div className="component eurobank-header-banner">
    <div className="component-content">
      <span className="is-empty-hint">EurobankHeaderBanner</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Default variant
// ---------------------------------------------------------------------------

export const Default = ({ fields, params, page }: EurobankHeaderBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  if (!fields) return <EurobankHeaderBannerDefaultComponent />;

  const { Logo, EBankingLink } = fields;

  return (
    <div className={cn('component eurobank-header-banner', styles)} id={RenderingIdentifier}>
      <div className="component-content">
        <header className="w-full">
          {/* ---------------------------------------------------------------- */}
          {/* Top utility bar — dark navy                                      */}
          {/* ---------------------------------------------------------------- */}
          <div className="bg-[#1a2d5a] text-white text-xs">
            <div className="mx-auto max-w-[1280px] px-4 flex items-center justify-between h-9">
              {/* Logo / brand name */}
              <div className="flex items-center flex-shrink-0">
                {Logo?.value?.src ? (
                  <ContentSdkImage
                    field={Logo}
                    className="h-6 w-auto object-contain"
                  />
                ) : (
                  <span className="font-bold text-sm tracking-widest select-none">EUROBANK</span>
                )}
              </div>

              {/* Utility navigation links */}
              <nav aria-label="Utility navigation" className="flex items-center gap-0">
                {utilityLinks.map((label, i) => (
                  <span key={label} className="flex items-center">
                    {i > 0 && (
                      <span className="mx-3 text-white/40 select-none">|</span>
                    )}
                    <a
                      href="#"
                      className="hover:text-white/80 transition-colors px-1"
                    >
                      {label}
                    </a>
                  </span>
                ))}
              </nav>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Main navigation bar — white with red bottom accent               */}
          {/* ---------------------------------------------------------------- */}
          <div className="bg-white border-b-[3px] border-[#e4002b]">
            <div className="mx-auto max-w-[1280px] px-4 flex items-center justify-between h-14">
              {/* Main nav links */}
              <nav aria-label="Main navigation" className="flex items-center gap-6">
                {mainNavLinks.map((label) => (
                  <a
                    key={label}
                    href="#"
                    className="text-[#1a2d5a] text-sm font-medium hover:text-[#e4002b] transition-colors whitespace-nowrap"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              {/* e-Banking CTA */}
              {(EBankingLink?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={EBankingLink}
                  className="inline-flex items-center justify-center rounded px-5 py-2 text-sm font-semibold bg-[#e4002b] text-white hover:bg-[#c40025] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e4002b] focus-visible:ring-offset-2"
                />
              )}
            </div>
          </div>
        </header>
      </div>
    </div>
  );
};
