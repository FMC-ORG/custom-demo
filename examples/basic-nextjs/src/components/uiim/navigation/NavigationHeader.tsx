'use client';

import React, { JSX, useState, useEffect } from 'react';
import { TextField, Text } from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

/**
 * Shape of each navigation item provided by the Navigation Contents Resolver.
 */
interface NavField {
  Id: string;
  Styles: string[];
  Href: string;
  Querystring: string;
  DisplayName?: string;
  Title?: TextField;
  NavigationTitle?: TextField;
  Children?: NavField[];
}

type NavigationHeaderProps = ComponentProps & {
  fields: NavField[] | Record<string, NavField>;
};

const NavigationHeaderDefaultComponent = (): JSX.Element => (
  <div className="component navigation-header">
    <div className="component-content">
      <span className="is-empty-hint">NavigationHeader</span>
    </div>
  </div>
);

/**
 * Normalize fields from the Navigation Contents Resolver.
 * Can arrive as an array or an object with numeric keys.
 */
function getNavItems(fields: NavField[] | Record<string, NavField>): NavField[] {
  if (!fields) return [];
  if (Array.isArray(fields)) return fields;
  return Object.values(fields).filter((f) => f && typeof f === 'object' && 'Href' in f);
}

function getNavText(item: NavField): JSX.Element | string {
  if (item.NavigationTitle?.value) return <Text field={item.NavigationTitle} />;
  if (item.Title?.value) return <Text field={item.Title} />;
  return item.DisplayName || '';
}

const Logo = ({ className }: { className?: string }) => (
  <Link
    href="/"
    className={cn('text-xl font-bold tracking-tight', className)}
    style={{ color: 'var(--brand-header-fg, inherit)' }}
  >
    <span style={{ color: 'var(--brand-primary)' }}>Brand</span>Logo
  </Link>
);

const NavLinks = ({
  className,
  items,
}: {
  className?: string;
  items: NavField[];
}) => (
  <nav className={cn('hidden md:flex items-center gap-6', className)}>
    {items.map((item) => (
      <a
        key={item.Id}
        href={item.Href + (item.Querystring ? `?${item.Querystring}` : '')}
        className="text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: 'var(--brand-header-fg, inherit)' }}
      >
        {getNavText(item)}
      </a>
    ))}
  </nav>
);

const MobileMenu = ({
  items,
  open,
  onClose,
}: {
  items: NavField[];
  open: boolean;
  onClose: () => void;
}) => {
  if (!open) return null;
  return (
    <div
      className="md:hidden border-t"
      style={{ borderColor: 'var(--brand-border, #e5e7eb)' }}
    >
      <div className="px-4 py-4 flex flex-col gap-4">
        {items.map((item) => (
          <a
            key={item.Id}
            href={item.Href + (item.Querystring ? `?${item.Querystring}` : '')}
            className="text-sm font-medium"
            style={{ color: 'var(--brand-header-fg, inherit)' }}
            onClick={onClose}
          >
            {getNavText(item)}
          </a>
        ))}
      </div>
    </div>
  );
};

const CtaButton = ({ className }: { className?: string }) => (
  <a
    href="#"
    className={cn(
      'hidden md:inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90',
      className
    )}
    style={{
      backgroundColor: 'var(--brand-primary)',
      color: 'var(--brand-primary-foreground)',
    }}
  >
    Get Started
  </a>
);

const MenuButton = ({ open, onClick }: { open: boolean; onClick: () => void }) => (
  <button
    className="md:hidden p-2"
    onClick={onClick}
    aria-label="Toggle menu"
    style={{ color: 'var(--brand-header-fg, inherit)' }}
  >
    {open ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    )}
  </button>
);

export const Default = (props: NavigationHeaderProps): JSX.Element => {
  const { params, fields } = props;
  const { styles, RenderingIdentifier } = params;
  const [menuOpen, setMenuOpen] = useState(false);

  const items = getNavItems(fields);

  if (!params) return <NavigationHeaderDefaultComponent />;

  return (
    <div
      className={cn('component navigation-header', styles)}
      id={RenderingIdentifier}
    >
      <header
        className="w-full border-b"
        style={{
          backgroundColor: 'var(--brand-header-bg, #ffffff)',
          borderColor: 'var(--brand-border, #e5e7eb)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <NavLinks items={items} />
          <div className="flex items-center gap-2">
            <CtaButton />
            <MenuButton open={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
          </div>
        </div>
        <MobileMenu items={items} open={menuOpen} onClose={() => setMenuOpen(false)} />
      </header>
    </div>
  );
};

export const Transparent = (props: NavigationHeaderProps): JSX.Element => {
  const { params, fields } = props;
  const { styles, RenderingIdentifier } = params;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const items = getNavItems(fields);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!params) return <NavigationHeaderDefaultComponent />;

  return (
    <div
      className={cn('component navigation-header', styles)}
      id={RenderingIdentifier}
    >
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
          scrolled ? 'border-b shadow-sm' : ''
        )}
        style={{
          backgroundColor: scrolled
            ? 'var(--brand-header-bg, #ffffff)'
            : 'transparent',
          borderColor: scrolled
            ? 'var(--brand-border, #e5e7eb)'
            : 'transparent',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo
            className={cn(
              'transition-colors duration-300',
              !scrolled && 'drop-shadow-sm'
            )}
          />
          <NavLinks
            items={items}
            className={cn(
              'transition-colors duration-300',
              !scrolled && '[&_a]:!text-white [&_a]:drop-shadow-sm'
            )}
          />
          <div className="flex items-center gap-2">
            <CtaButton />
            <MenuButton open={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
          </div>
        </div>
        <MobileMenu items={items} open={menuOpen} onClose={() => setMenuOpen(false)} />
      </header>
    </div>
  );
};

export const Minimal = (props: NavigationHeaderProps): JSX.Element => {
  const { params } = props;
  const { styles, RenderingIdentifier } = params;

  if (!params) return <NavigationHeaderDefaultComponent />;

  return (
    <div
      className={cn('component navigation-header', styles)}
      id={RenderingIdentifier}
    >
      <header
        className="w-full"
        style={{
          backgroundColor: 'var(--brand-header-bg, #ffffff)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 sm:px-6">
          <Logo />
        </div>
      </header>
    </div>
  );
};
