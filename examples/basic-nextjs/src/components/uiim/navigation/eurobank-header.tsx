'use client';


import React, { useState, JSX } from 'react';
import {
  Field,
  Image as SitecoreImage,
  ImageField,
  Link as SitecoreLink,
  LinkField,
  Text,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { Menu, X, Search, MapPin, Calendar, Phone } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EurobankHeaderFields = {
  Logo: ImageField;
  PhoneNumber: Field<string>;
  NewCustomerLink: LinkField;
  EBankingLink: LinkField;
};

type EurobankHeaderProps = ComponentProps & {
  fields: EurobankHeaderFields;
};

// ---------------------------------------------------------------------------
// Static data (hardcoded per design)
// ---------------------------------------------------------------------------

const utilityLinksLeft = [
  { label: 'Private', href: '#' },
  { label: 'Business', href: '#' },
  { label: 'Private Banking', href: '#' },
  { label: 'Eurobank Group', href: '#' },
  { label: '€return', href: '#' },
];

const utilityLinksRight = [
  { label: 'ATM & Stores', href: '#', icon: MapPin },
  { label: 'Appointment', href: '#', icon: Calendar },
];

const mainNavItems = [
  { label: 'FOR EVERY AS NEED', href: '#' },
  { label: 'PRODUCTS & SERVICES', href: '#' },
  { label: 'ELECTRONIC BANKING', href: '#' },
  { label: 'PERSONAL BANKING', href: '#' },
];

// ---------------------------------------------------------------------------
// Empty-state fallback
// ---------------------------------------------------------------------------

const EurobankHeaderEmptyState = (): JSX.Element => (
  <div className="component eurobank-header">
    <div className="component-content">
      <span className="is-empty-hint">EurobankHeader</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export const Default = ({ fields }: EurobankHeaderProps): JSX.Element => {
  const [mobileOpen, setMobileOpen] = useState(false);  
  if (!fields) return <EurobankHeaderEmptyState />;

  const { Logo, PhoneNumber, NewCustomerLink, EBankingLink } = fields;

  return (
    <header className="w-full">
      {/* ------------------------------------------------------------------ */}
      {/* Top utility bar                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#1a2d5a] text-white text-xs">
        <div className="mx-auto max-w-[1280px] px-4 flex items-center justify-between h-9">
          {/* Left links */}
          <nav aria-label="Utility navigation" className="hidden md:flex items-center gap-0">
            {utilityLinksLeft.map((link, i) => (
              <span key={link.label} className="flex items-center">
                {i > 0 && i < 3 && (
                  <span className="mx-2 text-white/40 select-none">|</span>
                )}
                {i === 3 && <span className="mx-3 text-white/40 select-none">|</span>}
                <a
                  href={link.href}
                  className={cn(
                    'hover:text-white/80 transition-colors',
                    i < 3 ? 'px-1' : 'px-2'
                  )}
                >
                  {link.label}
                </a>
              </span>
            ))}
          </nav>

          {/* Right links */}
          <nav aria-label="Secondary utility navigation" className="hidden md:flex items-center gap-4 ml-auto">
            {utilityLinksRight.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1 hover:text-white/80 transition-colors"
              >
                <link.icon className="w-3 h-3" />
                {link.label}
              </a>
            ))}

            {/* Communication + phone */}
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>Communication</span>
              {PhoneNumber?.value ? (
                <Text
                  field={PhoneNumber}
                  tag="span"
                  className="font-semibold"
                />
              ) : (
                <span className="font-semibold">210955000</span>
              )}
            </span>

            {/* Language selector */}
            <button className="flex items-center gap-1 hover:text-white/80 transition-colors" aria-label="Select language">
              EL
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main navigation bar                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-[1280px] px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" aria-label="Eurobank home">
            {Logo?.value?.src ? (
              <SitecoreImage
                field={Logo}
                className="h-10 w-auto object-contain"
              />
            ) : (
              /* Text fallback matching Eurobank brand */
              <span className="flex items-center gap-1.5 font-bold text-xl tracking-widest select-none">
                <svg viewBox="0 0 20 20" className="h-7 w-auto" aria-hidden="true">
                  <polygon points="0,18 10,2 20,18" fill="#e4002b" />
                </svg>
                <span className="text-[#1a2d5a]">EUROBANK</span>
              </span>
            )}
          </Link>

          {/* Desktop nav items */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6 ml-8">
            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[#1a2d5a] text-xs font-semibold tracking-wide hover:text-[#e4002b] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {/* Search */}
            <button
              aria-label="Search"
              className="text-[#1a2d5a] hover:text-[#e4002b] transition-colors p-1"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* New customer CTA */}
            {NewCustomerLink?.value?.href ? (
              <SitecoreLink
                field={NewCustomerLink}
                className="inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-semibold bg-[#1a2d5a] text-white hover:bg-[#253d7a] transition-colors"
              />
            ) : (
              <a
                href="#"
                className="inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-semibold bg-[#1a2d5a] text-white hover:bg-[#253d7a] transition-colors"
              >
                New customer
              </a>
            )}

            {/* e-Banking CTA */}
            {EBankingLink?.value?.href ? (
              <SitecoreLink
                field={EBankingLink}
                className="inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-semibold bg-[#e4002b] text-white hover:bg-[#c40025] transition-colors"
              />
            ) : (
              <a
                href="#"
                className="inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-semibold bg-[#e4002b] text-white hover:bg-[#c40025] transition-colors"
              >
                e-Banking
              </a>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-[#1a2d5a] hover:text-[#e4002b] transition-colors ml-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile menu                                                         */}
      {/* ------------------------------------------------------------------ */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-md">
          <nav aria-label="Mobile navigation" className="px-4 py-4 flex flex-col gap-3">
            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[#1a2d5a] text-sm font-semibold tracking-wide hover:text-[#e4002b] transition-colors py-1 border-b border-gray-100 last:border-0"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <div className="flex flex-col gap-2 pt-2">
              {NewCustomerLink?.value?.href ? (
                <SitecoreLink
                  field={NewCustomerLink}
                  className="inline-flex justify-center rounded px-4 py-2 text-sm font-semibold bg-[#1a2d5a] text-white"
                />
              ) : (
                <a href="#" className="inline-flex justify-center rounded px-4 py-2 text-sm font-semibold bg-[#1a2d5a] text-white">
                  New customer
                </a>
              )}
              {EBankingLink?.value?.href ? (
                <SitecoreLink
                  field={EBankingLink}
                  className="inline-flex justify-center rounded px-4 py-2 text-sm font-semibold bg-[#e4002b] text-white"
                />
              ) : (
                <a href="#" className="inline-flex justify-center rounded px-4 py-2 text-sm font-semibold bg-[#e4002b] text-white">
                  e-Banking
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
