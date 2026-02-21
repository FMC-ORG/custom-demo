'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Text, Link as SitecoreLink, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Subscription Popup - Exit intent popup for newsletter signup.
 * Triggers when user moves cursor toward top of viewport (exit intent).
 * Content driven by Sitecore datasource. Respects Enabled checkbox.
 */

const STORAGE_KEY_PREFIX = 'subscription-popup-dismissed-';
const STATIC = {
  TITLE: "Don't miss out!",
  MESSAGE:
    'Sign up to our free Saga Magazine newsletter for exclusive offers and inspiration.',
  CTA_TEXT: 'Subscribe',
  CTA_HREF: '#newsletter',
  CLOSE_TEXT: 'No thanks',
};

interface SubscriptionPopupFields {
  Enabled?: { value?: string };
  Title?: { value?: string };
  Message?: { value?: string };
  CtaText?: { value?: string };
  CtaLink?: { value?: { href?: string; text?: string } };
  CloseButtonText?: { value?: string };
}

interface SubscriptionPopupProps extends ComponentProps {
  fields?: SubscriptionPopupFields;
  isPageEditing?: boolean;
}

const SubscriptionPopupComponent: React.FC<SubscriptionPopupProps> = (props) => {
  const { fields, isPageEditing } = props;
  const [showPopup, setShowPopup] = useState(false);

  const isEnabled =
    fields?.Enabled?.value === '1' || (fields === undefined && !isPageEditing);
  const title = fields?.Title?.value ?? STATIC.TITLE;
  const message = fields?.Message?.value ?? STATIC.MESSAGE;
  const ctaText = fields?.CtaText?.value ?? STATIC.CTA_TEXT;
  const ctaHref = fields?.CtaLink?.value?.href ?? STATIC.CTA_HREF;
  const ctaLinkText = fields?.CtaLink?.value?.text ?? ctaText;
  const closeText = fields?.CloseButtonText?.value ?? STATIC.CLOSE_TEXT;

  const handleDismiss = useCallback(() => {
    setShowPopup(false);
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${path}`, '1');
    }
  }, []);

  const handleMouseOut = useCallback(
    (e: MouseEvent) => {
      if (e.relatedTarget === null || e.clientY <= 0) {
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        const dismissed = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${path}`);
        if (!dismissed) {
          setShowPopup(true);
        }
        document.removeEventListener('mouseout', handleMouseOut);
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isPageEditing || !isEnabled) return;

    const path = window.location.pathname;
    const dismissed = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${path}`);
    if (dismissed) return;

    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isPageEditing, isEnabled, handleMouseOut]);

  if (isPageEditing) {
    return (
      <div
        className="rounded border border-dashed border-muted-foreground/50 p-4 text-center text-sm text-muted-foreground"
        data-component="subscription-popup"
      >
        Subscription Popup (exit intent) — Configure datasource to enable
      </div>
    );
  }

  if (!showPopup) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-popup-title"
    >
      <div className="relative max-w-md w-full rounded-xl bg-background p-6 shadow-xl border border-border/50">
        <div className="flex flex-col gap-4">
          <h2
            id="subscription-popup-title"
            className="text-xl font-bold text-saga-navy"
          >
            {fields?.Title ? (
              <Text field={fields.Title} tag="span" />
            ) : (
              title
            )}
          </h2>
          <p className="text-sm text-saga-navy/70 leading-relaxed">
            {fields?.Message ? (
              <Text field={fields.Message} tag="span" />
            ) : (
              message
            )}
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            {fields?.CtaLink ? (
              <SitecoreLink
                field={fields.CtaLink}
                className="rounded-md border-2 border-saga-navy bg-background px-4 py-2 text-sm font-semibold text-saga-navy hover:bg-saga-navy hover:text-white transition-colors"
              >
                {ctaLinkText}
              </SitecoreLink>
            ) : (
              <Link
                href={ctaHref}
                className="rounded-md border-2 border-saga-navy bg-background px-4 py-2 text-sm font-semibold text-saga-navy hover:bg-saga-navy hover:text-white transition-colors"
              >
                {ctaLinkText}
              </Link>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md px-4 py-2 text-sm font-medium text-saga-navy/70 hover:text-saga-navy hover:underline"
            >
              {fields?.CloseButtonText ? (
                <Text field={fields.CloseButtonText} tag="span" />
              ) : (
                closeText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Default: React.FC<SubscriptionPopupProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing ?? false;
  return (
    <SubscriptionPopupComponent {...props} isPageEditing={isPageEditing} />
  );
};
