import { JSX } from 'react';
import {
  Text,
  RichText,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  Field,
  ImageField,
  LinkField,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

type PromoBannerFields = {
  Title?: Field<string>;
  Description?: Field<string>;
  PromoImage?: ImageField;
  PrimaryLink?: LinkField;
};

type PromoBannerProps = ComponentProps & {
  fields: PromoBannerFields;
};

/**
 * Promo Banner - dark theme banner with left image, right text (gradient headline, body, CTA).
 * Matches design: ~40% image left, ~60% text/CTA right, black background.
 */
const PromoBanner = ({ fields, params, page }: PromoBannerProps): JSX.Element => {
  const { styles, RenderingIdentifier: id } = params;
  const { isEditing } = page?.mode ?? { isEditing: false };

  const showTitle = fields.Title?.value || isEditing;
  const showDescription = fields.Description?.value || isEditing;
  const showCta = fields.PrimaryLink?.value?.href || isEditing;

  return (
    <section
      className={cn('component promo-banner bg-black text-white', styles)}
      id={id}
    >
      <div className="grid min-h-[400px] md:grid-cols-[2fr_3fr] md:min-h-[480px]">
        {/* Left: Image */}
        <div className="relative min-h-[240px] overflow-hidden md:min-h-0">
          {fields.PromoImage?.value?.src ? (
            <ContentSdkImage
              field={fields.PromoImage}
              className="h-full w-full object-cover"
              alt={fields.Title?.value?.toString() || 'Promo banner'}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-900">
              {isEditing && fields.PromoImage ? (
                <ContentSdkImage
                  field={fields.PromoImage}
                  className="h-full w-full object-cover"
                  alt="Promo image"
                />
              ) : (
                <span className="text-sm text-neutral-500">Promo image</span>
              )}
            </div>
          )}
        </div>

        {/* Right: Text + CTA */}
        <div className="flex flex-col justify-center px-6 py-10 md:px-12 md:py-16">
          <div className="space-y-6">
            {showTitle && (
              <Text
                tag="h2"
                field={fields.Title as Field<string>}
                className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent"
              />
            )}
            {showDescription && (
              <RichText
                field={fields.Description as Field<string>}
                className="prose prose-invert prose-lg max-w-none text-white"
              />
            )}
            {showCta && fields.PrimaryLink && (
              <ContentSdkLink
                field={fields.PrimaryLink}
                className={cn(
                  'inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black',
                  'transition-colors hover:bg-neutral-200'
                )}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default withDatasourceCheck()<PromoBannerProps>(PromoBanner);
