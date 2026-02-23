'use client';

import type React from 'react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { PiggyBank, Home, ClipboardList, Shield, Umbrella, Building2, type LucideIcon } from 'lucide-react';

/**
 * Icon name to Lucide component mapping for Sitecore-driven icon selection
 */
const ICON_MAP: Record<string, LucideIcon> = {
  PiggyBank,
  Home,
  ClipboardList,
  Shield,
  Umbrella,
  Building2,
};

/** Fallback icons when featureIconName is empty or unknown */
const FALLBACK_ICONS: LucideIcon[] = [PiggyBank, Home, ClipboardList];

/**
 * BundlePromoFeature child item structure (from Sitecore datasource)
 */
interface BundlePromoFeatureItem {
  id: string;
  featureIconName?: { jsonValue?: Field<string> };
  featureTitle?: { jsonValue?: Field<string> };
  featureDescription?: { jsonValue?: Field<string> };
}

/**
 * BundlePromo component parameters
 */
interface BundlePromoParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * BundlePromo fields structure (GraphQL: children inside datasource)
 */
interface BundlePromoFields {
  data?: {
    datasource?: {
      headline?: { jsonValue?: Field<string> };
      description?: { jsonValue?: Field<string> };
      children?: {
        results?: BundlePromoFeatureItem[];
      };
    };
  };
}

/**
 * BundlePromo component props
 */
interface BundlePromoProps extends ComponentProps {
  params: BundlePromoParams;
  fields: BundlePromoFields;
  isPageEditing?: boolean;
}

/**
 * BundlePromo component implementation
 * Renders a header section with headline and description, plus a dark navy three-column feature block.
 * @param {BundlePromoProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered bundle promo component
 */
const BundlePromoComponent: React.FC<BundlePromoProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { data } = fields || {};
  const { datasource } = data || {};
  const features = datasource?.children?.results || [];

  if (!data?.datasource && !isPageEditing) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            BundlePromo: No datasource configured
          </div>
        </div>
      </section>
    );
  }

  const headline = datasource?.headline?.jsonValue;
  const description = datasource?.description?.jsonValue;

  return (
    <section className="py-12 md:py-16 bg-background">
      {/* Top section: white background, centered headline and description */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {(headline?.value || isPageEditing) && (
            <Text
              field={headline}
              tag="h2"
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-saga-navy leading-tight tracking-tight text-balance"
            />
          )}
          {(description?.value || isPageEditing) && (
            <Text
              field={description}
              tag="p"
              className="mt-4 text-base md:text-lg text-saga-navy/70 leading-relaxed"
            />
          )}
        </div>
      </div>

      {/* Bottom section: dark navy, three-column feature block */}
      <div className="mt-12 md:mt-16 bg-saga-navy py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.length > 0
              ? features.map((feature, index) => {
                  const iconName = feature.featureIconName?.jsonValue?.value;
                  const IconComponent =
                    iconName && ICON_MAP[iconName]
                      ? ICON_MAP[iconName]
                      : FALLBACK_ICONS[index % FALLBACK_ICONS.length];

                  return (
                    <div
                      key={feature.id}
                      className="flex flex-col items-center text-center"
                    >
                      {/* Icon circle: golden-orange bg, white outline */}
                      <div className="h-20 w-20 rounded-full bg-saga-gold border-2 border-white flex items-center justify-center flex-shrink-0 mb-4">
                        <IconComponent className="h-10 w-10 text-white" strokeWidth={1.5} />
                      </div>

                      {(feature.featureTitle?.jsonValue?.value || isPageEditing) && (
                        <Text
                          field={feature.featureTitle?.jsonValue}
                          tag="h3"
                          className="text-lg md:text-xl font-bold text-white mb-2"
                        />
                      )}

                      {(feature.featureDescription?.jsonValue?.value || isPageEditing) && (
                        <Text
                          field={feature.featureDescription?.jsonValue}
                          tag="p"
                          className="text-sm md:text-base text-white/90 leading-relaxed"
                        />
                      )}
                    </div>
                  );
                })
              : isPageEditing && (
                  <div className="col-span-full text-center text-white/70 py-8">
                    No features configured. Add BundlePromoFeature items as children.
                  </div>
                )}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Default export for Sitecore component registration
 */
export const Default: React.FC<BundlePromoProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = props.isPageEditing ?? page.mode.isEditing;
  return <BundlePromoComponent {...props} isPageEditing={isPageEditing} />;
};
