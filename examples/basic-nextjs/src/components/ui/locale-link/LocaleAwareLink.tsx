'use client';

import type React from 'react';
import { Link as ContentSdkLink } from '@sitecore-content-sdk/nextjs';
import type { LinkField } from '@sitecore-content-sdk/nextjs';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { routing } from 'src/i18n/routing';
import { withLocale } from '@/utils/locale-link';

/**
 * LocaleAwareLink is a drop-in replacement for ContentSdkLink that automatically
 * prefixes internal Sitecore link field hrefs with the active locale slug.
 *
 * In editing mode it delegates to ContentSdkLink for inline editing support.
 * In non-editing mode it renders a plain next/link to avoid the `locale={false}`
 * DOM attribute warning that ContentSdkLink triggers in the App Router.
 *
 * External URLs (http/https, protocol-relative) are passed through unchanged.
 *
 * @param props - Same props as ContentSdkLink from @sitecore-content-sdk/nextjs
 * @returns {JSX.Element} A locale-prefixed link component
 */
export function LocaleAwareLink(props: React.ComponentProps<typeof ContentSdkLink>): React.JSX.Element {
  const { locale } = useParams<{ locale?: string }>();
  const currentLocale = (locale as string) ?? routing.defaultLocale;
  const localizedField = withLocale(props.field as LinkField | undefined, currentLocale) ?? props.field;

  if (props.editable) {
    return <ContentSdkLink {...props} field={localizedField} />;
  }

  const { field, editable, children, ...linkProps } = props;
  const href = (localizedField as LinkField)?.value?.href ?? '#';
  const target = (localizedField as LinkField)?.value?.target || undefined;
  const title = (localizedField as LinkField)?.value?.title || undefined;
  const text = (localizedField as LinkField)?.value?.text;

  return (
    <Link href={href} target={target} title={title} {...linkProps}>
      {children ?? text}
    </Link>
  );
}
