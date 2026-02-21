"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Text, useSitecore } from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "@/lib/component-props";
import { subscribeAction } from "@/lib/actions/subscribe";

/**
 * Subscription Popup - Newsletter signup popup for demo purposes.
 * Triggers on Ctrl+Alt+S or Ctrl+Alt+N (keyboard shortcuts for demos).
 * Uses Ctrl+Alt to avoid browser conflicts (Chrome/Edge capture Ctrl+Shift).
 * Content driven by Sitecore datasource. Respects Enabled checkbox.
 * Uses subscribeAction to send confirmation email with cruise offers.
 */

const STORAGE_KEY_PREFIX = "subscription-popup-dismissed-";
const STATIC = {
  TITLE: "Don't miss out!",
  MESSAGE: "Sign up to our free Saga Magazine newsletter for exclusive offers and inspiration.",
  CTA_TEXT: "Subscribe",
  CLOSE_TEXT: "No thanks",
  FIRST_NAME_LABEL: "First name",
  LAST_NAME_LABEL: "Last name",
  EMAIL_LABEL: "Email Address",
};

interface SubscriptionPopupFields {
  Enabled?: { value?: string };
  Title?: { value?: string };
  Message?: { value?: string };
  CtaText?: { value?: string };
  CtaLink?: { value?: { href?: string; text?: string } };
  CloseButtonText?: { value?: string };
}

interface SubscriptionPopupProps extends Partial<ComponentProps> {
  fields?: SubscriptionPopupFields;
  isPageEditing?: boolean;
}

const SubscriptionPopupComponent: React.FC<SubscriptionPopupProps> = (props) => {
  const { fields, isPageEditing } = props;
  const [showPopup, setShowPopup] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEnabled = fields?.Enabled?.value === "1" || (fields === undefined && !isPageEditing);
  const title = fields?.Title?.value ?? STATIC.TITLE;
  const message = fields?.Message?.value ?? STATIC.MESSAGE;
  const ctaText = fields?.CtaText?.value ?? STATIC.CTA_TEXT;
  const closeText = fields?.CloseButtonText?.value ?? STATIC.CLOSE_TEXT;

  const handleDismiss = useCallback(() => {
    setShowPopup(false);
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${path}`, "1");
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const isTrigger = e.ctrlKey && e.altKey && !e.shiftKey && (key === "s" || key === "n");
    if (isTrigger) {
      e.preventDefault();
      e.stopPropagation();
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const dismissed = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${path}`);
      if (!dismissed) {
        setShowPopup(true);
      }
      document.removeEventListener("keydown", handleKeyDown, true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    const result = await subscribeAction(formData);
    setIsSubmitting(false);
    if (result.success) {
      setSubmittedSuccess(true);
    } else {
      setSubmitError(result.error);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPageEditing || !isEnabled) return;

    const path = window.location.pathname;
    const dismissed = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${path}`);
    if (dismissed) return;

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isPageEditing, isEnabled, handleKeyDown]);

  if (isPageEditing) {
    return (
      <div
        className="rounded border border-dashed border-muted-foreground/50 p-4 text-center text-sm text-muted-foreground"
        data-component="subscription-popup"
      >
        Subscription Popup (Ctrl+Alt+S or Ctrl+Alt+N) — Configure datasource to enable
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
          <h2 id="subscription-popup-title" className="text-xl font-bold text-saga-navy">
            {fields?.Title ? <Text field={fields.Title} tag="span" /> : title}
          </h2>
          <p className="text-sm text-saga-navy/70 leading-relaxed">
            {fields?.Message ? <Text field={fields.Message} tag="span" /> : message}
          </p>

          {submittedSuccess ? (
            <div className="py-2">
              <p className="text-saga-navy font-medium">
                Thank you for subscribing to Saga Magazine!
              </p>
              <p className="text-sm text-saga-navy/70 mt-1">
                You will receive our newsletter and exclusive offers delivered to your inbox.
              </p>
              <button
                type="button"
                onClick={handleDismiss}
                className="mt-4 rounded-md border-2 border-saga-navy bg-saga-navy px-4 py-2 text-sm font-semibold text-white hover:bg-saga-navy/90 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label htmlFor="popup-first" className="sr-only">
                  {STATIC.FIRST_NAME_LABEL}
                </label>
                <input
                  id="popup-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={STATIC.FIRST_NAME_LABEL}
                  required
                  className="w-full rounded-md border border-saga-navy/30 px-3 py-2 text-sm text-saga-navy placeholder:text-saga-navy/50 focus:border-saga-navy focus:outline-none focus:ring-1 focus:ring-saga-navy"
                />
              </div>
              <div>
                <label htmlFor="popup-last" className="sr-only">
                  {STATIC.LAST_NAME_LABEL}
                </label>
                <input
                  id="popup-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={STATIC.LAST_NAME_LABEL}
                  required
                  className="w-full rounded-md border border-saga-navy/30 px-3 py-2 text-sm text-saga-navy placeholder:text-saga-navy/50 focus:border-saga-navy focus:outline-none focus:ring-1 focus:ring-saga-navy"
                />
              </div>
              <div>
                <label htmlFor="popup-email" className="sr-only">
                  {STATIC.EMAIL_LABEL}
                </label>
                <input
                  id="popup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={STATIC.EMAIL_LABEL}
                  required
                  className="w-full rounded-md border border-saga-navy/30 px-3 py-2 text-sm text-saga-navy placeholder:text-saga-navy/50 focus:border-saga-navy focus:outline-none focus:ring-1 focus:ring-saga-navy"
                />
              </div>
              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md border-2 border-saga-navy bg-saga-navy px-4 py-2 text-sm font-semibold text-white hover:bg-saga-navy/90 disabled:opacity-60 transition-colors"
                >
                  {isSubmitting ? "Subscribing..." : ctaText}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  disabled={isSubmitting}
                  className="rounded-md px-4 py-2 text-sm font-medium text-saga-navy/70 hover:text-saga-navy hover:underline disabled:opacity-60"
                >
                  {fields?.CloseButtonText ? (
                    <Text field={fields.CloseButtonText} tag="span" />
                  ) : (
                    closeText
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const Default: React.FC<SubscriptionPopupProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing ?? false;
  return <SubscriptionPopupComponent {...props} isPageEditing={isPageEditing} />;
};
