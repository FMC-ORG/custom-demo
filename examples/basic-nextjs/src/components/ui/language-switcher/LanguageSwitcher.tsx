'use client';

import type React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { routing } from 'src/i18n/routing';

/**
 * Returns a human-readable display name for a locale code using the browser's Intl API.
 * Falls back to the raw locale string if Intl.DisplayNames is unavailable.
 * @param {string} locale - BCP 47 locale code (e.g. "en", "en-CA")
 * @returns {string} Display name (e.g. "English", "English (Canada)")
 */
function getLocaleDisplayName(locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
  } catch {
    return locale;
  }
}

interface LanguageSwitcherProps {
  /** When true (Sitecore editing mode) the switcher is hidden */
  isEditing?: boolean;
  className?: string;
}

/**
 * LanguageSwitcher renders a locale selection dropdown in the header.
 * It reads the current locale from the URL params, lists all supported locales
 * from routing.ts, and navigates to the same path in the selected locale.
 *
 * Navigation uses public-facing URLs (no site prefix) — the
 * AppRouterMultisiteMiddleware injects the site segment internally.
 *
 * @param {LanguageSwitcherProps} props
 * @returns {JSX.Element | null} The switcher dropdown, or null when only one locale is configured or in editing mode
 */
export function LanguageSwitcher({ isEditing, className }: LanguageSwitcherProps): React.JSX.Element | null {
  const params = useParams<{ locale: string; path?: string[] }>();
  const router = useRouter();

  // Hide when in editing mode or when there is nothing to switch to
  if (isEditing || routing.locales.length <= 1) {
    return null;
  }

  const currentLocale = params.locale ?? routing.defaultLocale;

  /**
   * Reconstructs the public URL with the new locale and navigates to it.
   * The AppRouterMultisiteMiddleware adds the /site prefix transparently.
   */
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;
    if (newLocale === currentLocale) return;

    const pathSegments = (params.path as string[] | undefined) ?? [];
    const suffix = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '';
    router.push(`/${newLocale}${suffix}`);
  };

  return (
    <div className={cn('relative flex items-center gap-1.5', className)}>
      <Globe className="pointer-events-none h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <select
        value={currentLocale}
        onChange={handleChange}
        aria-label="Select language"
        className={cn(
          'appearance-none bg-transparent py-1 pl-0 pr-5 text-sm font-medium text-foreground',
          'cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm',
          'hover:text-foreground/80'
        )}
      >
        {routing.locales.map((locale) => (
          <option key={locale} value={locale}>
            {getLocaleDisplayName(locale)}
          </option>
        ))}
      </select>
      {/* Custom chevron since appearance-none removes the native one */}
      <svg
        className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
