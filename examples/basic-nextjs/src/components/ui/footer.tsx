'use client';

import type React from 'react';
import Link from 'next/link';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * FooterLink child item structure
 */
interface FooterLinkItem {
  id: string;
  label?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
  external?: { jsonValue?: Field<boolean> };
}

/**
 * FooterColumn item (has nested FooterLink children)
 */
interface FooterColumnItem {
  id: string;
  title?: { jsonValue?: Field<string> };
  children?: {
    results?: FooterLinkItem[];
  };
}

/**
 * Footer component parameters
 */
interface FooterParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * Footer fields structure (GraphQL: children inside datasource, columns have nested link children)
 */
interface FooterFields {
  data?: {
    datasource?: {
      registeredOffice?: { jsonValue?: Field<string> };
      copyrightText?: { jsonValue?: Field<string> };
      logoText?: { jsonValue?: Field<string> };
      yearBadge?: { jsonValue?: Field<string> };
      socialX?: { jsonValue?: LinkField };
      socialFacebook?: { jsonValue?: LinkField };
      children?: {
        results?: FooterColumnItem[];
      };
    };
  };
}

/**
 * Footer component props
 */
interface FooterProps extends ComponentProps {
  params: FooterParams;
  fields: FooterFields;
  isPageEditing?: boolean;
}

/**
 * External link icon (matches original footer)
 */
function ExternalIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

/**
 * Footer component implementation
 */
const FooterComponent: React.FC<FooterProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { data } = fields || {};
  const { datasource } = data || {};
  const columns = datasource?.children?.results || [];
  if (!data?.datasource && !isPageEditing) {
    return (
      <footer className="bg-saga-navy text-white">
        <div className="h-12 bg-gradient-to-r from-saga-teal via-cyan-500 to-saga-teal opacity-60" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-white/70 text-center">Footer: No datasource configured</p>
        </div>
      </footer>
    );
  }

  const logoText = datasource?.logoText?.jsonValue?.value ?? 'SAGA';
  const yearBadge = datasource?.yearBadge?.jsonValue?.value ?? '1 9 5 1';
  const socialXHref = datasource?.socialX?.jsonValue?.value?.href ?? '#';
  const socialFacebookHref = datasource?.socialFacebook?.jsonValue?.value?.href ?? '#';

  return (
    <footer className="bg-saga-navy text-white">
      {/* Decorative top strip */}
      <div className="h-12 bg-gradient-to-r from-saga-teal via-cyan-500 to-saga-teal opacity-60" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo and year badge */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-10">
          {(datasource?.logoText?.jsonValue?.value || isPageEditing) && (
            <svg
              viewBox="0 0 200 50"
              className="h-8 w-auto mb-4 sm:mb-0"
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
                fill="white"
              >
                {logoText}
              </text>
            </svg>
          )}

          <div className="flex flex-col items-center">
            {(datasource?.yearBadge?.jsonValue?.value || isPageEditing) && (
              <span className="text-xs tracking-[0.4em] text-white/60 mb-1">{yearBadge}</span>
            )}
            <div className="h-10 w-10 rounded-full border border-white/30 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {columns.map((col) => {
            const links = col?.children?.results || [];
            return (
              <div key={col.id}>
                {(col.title?.jsonValue?.value || isPageEditing) && (
                  <h3 className="text-sm font-bold mb-4 text-white">
                    <Text field={col.title?.jsonValue} tag="span" />
                  </h3>
                )}
                <ul className="flex flex-col gap-2.5">
                  {links.map((linkItem) => {
                    const href = linkItem?.link?.jsonValue?.value?.href ?? '#';
                    const linkLabel =
                      linkItem?.label?.jsonValue?.value ??
                      linkItem?.link?.jsonValue?.value?.text ??
                      'Link';
                    const isExternal = Boolean(linkItem?.external?.jsonValue?.value);
                    return (
                      <li key={linkItem.id}>
                        <Link
                          href={href}
                          className="text-sm text-white/70 hover:text-white hover:underline transition-colors inline-flex items-center gap-1"
                        >
                          {linkLabel}
                          {isExternal && <ExternalIcon />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Social icons */}
        <div className="flex items-center justify-end gap-4 mt-8">
          <Link
            href={socialXHref}
            aria-label="Follow us on X"
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Link>
          <Link
            href={socialFacebookHref}
            aria-label="Follow us on Facebook"
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
            {(datasource?.registeredOffice?.jsonValue?.value || isPageEditing) && (
              <p>
                <Text
                  field={datasource?.registeredOffice?.jsonValue}
                  tag="span"
                  className="text-xs text-white/50"
                />
              </p>
            )}
            {(datasource?.copyrightText?.jsonValue?.value || isPageEditing) && (
              <p>
                <Text
                  field={datasource?.copyrightText?.jsonValue}
                  tag="span"
                  className="text-xs text-white/50"
                />
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

/**
 * Default Footer export with page editing mode
 */
export const Default: React.FC<FooterProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = props.isPageEditing ?? page.mode.isEditing;
  return <FooterComponent {...props} isPageEditing={isPageEditing} />;
};
