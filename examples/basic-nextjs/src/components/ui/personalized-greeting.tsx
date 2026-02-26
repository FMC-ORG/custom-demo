'use client';

import type React from 'react';
import { Text as ContentSdkText, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

interface PersonalizedGreetingFields {
  GreetingText?: { value?: string };
  Subtitle?: { value?: string };
}

type PersonalizedGreetingProps = ComponentProps & {
  fields?: PersonalizedGreetingFields;
};

const DEFAULT_GREETING = "Hi Helen, it's time to renew your car insurance!";
const DEFAULT_SUBTITLE =
  "Your policy expires in 20 days — let's find you a better deal before it's too late.";

/**
 * PersonalizedGreeting - greeting block for landing pages.
 * Simple datasource, no ComponentQuery. Uses default JSS shaping.
 */
export const Default: React.FC<PersonalizedGreetingProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;

  const greeting = fields?.GreetingText?.value ?? DEFAULT_GREETING;
  const subtitle = fields?.Subtitle?.value ?? DEFAULT_SUBTITLE;
  const hasDatasource = Boolean(fields);
  const showPlaceholder = !hasDatasource && isEditing;

  if (showPlaceholder) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">Add PersonalizedGreeting datasource</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {fields?.GreetingText ? (
        <ContentSdkText
          tag="h1"
          field={fields.GreetingText}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight"
        />
      ) : (
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight">
          {greeting}
        </h1>
      )}
      {fields?.Subtitle ? (
        <ContentSdkText
          tag="p"
          field={fields.Subtitle}
          className="mt-2 text-base sm:text-lg text-black"
        />
      ) : (
        <p className="mt-2 text-base sm:text-lg text-black">{subtitle}</p>
      )}
    </div>
  );
};
