import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface LogoItemFields {
  id: string;
  logoImage: { jsonValue: ImageField };
  companyName: { jsonValue: Field<string> };
  logoLink: { jsonValue: LinkField };
}

interface LogoCloudDatasource {
  title: { jsonValue: Field<string> };
  children: {
    results: LogoItemFields[];
  };
}

interface LogoCloudFields {
  data: {
    datasource: LogoCloudDatasource;
  };
}

type LogoCloudProps = ComponentProps & {
  fields: LogoCloudFields;
};

const LogoCloudDefaultComponent = (): JSX.Element => (
  <div className="component logo-cloud">
    <div className="component-content">
      <span className="is-empty-hint">LogoCloud</span>
    </div>
  </div>
);

const SectionTitle = ({
  datasource,
  isEditing,
}: {
  datasource: LogoCloudDatasource;
  isEditing?: boolean;
}) => {
  if (!datasource.title?.jsonValue?.value && !isEditing) return null;
  return (
    <Text
      field={datasource.title?.jsonValue}
      tag="h2"
      className="mb-8 text-center text-xl font-semibold font-[var(--brand-heading-font,inherit)]"
      style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
    />
  );
};

const LogoWrapper = ({
  item,
  isEditing,
  children,
}: {
  item: LogoItemFields;
  isEditing?: boolean;
  children: React.ReactNode;
}) => {
  if (item.logoLink?.jsonValue?.value?.href || isEditing) {
    return (
      <ContentSdkLink
        field={item.logoLink?.jsonValue}
        className="flex items-center justify-center"
      >
        {children}
      </ContentSdkLink>
    );
  }
  return <div className="flex items-center justify-center">{children}</div>;
};

/* ────────────────────────────────────────────
   Default — horizontal row, grayscale with hover color
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: LogoCloudProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <LogoCloudDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component logo-cloud', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle datasource={datasource} isEditing={isEditing} />
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {items.map((item) => (
              <LogoWrapper key={item.id} item={item} isEditing={isEditing}>
                {(item.logoImage?.jsonValue?.value?.src || isEditing) && (
                  <ContentSdkImage
                    field={item.logoImage?.jsonValue}
                    className="h-10 max-w-[140px] object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                  />
                )}
              </LogoWrapper>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Grid — multi-row grid for many logos
   ──────────────────────────────────────────── */
export const Grid = ({ fields, params, page }: LogoCloudProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <LogoCloudDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component logo-cloud', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle datasource={datasource} isEditing={isEditing} />
          <div className="grid grid-cols-3 gap-8 md:grid-cols-6">
            {items.map((item) => (
              <LogoWrapper key={item.id} item={item} isEditing={isEditing}>
                {(item.logoImage?.jsonValue?.value?.src || isEditing) && (
                  <ContentSdkImage
                    field={item.logoImage?.jsonValue}
                    className="h-10 max-w-[140px] object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                  />
                )}
              </LogoWrapper>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithLabels — logo above, company name below
   ──────────────────────────────────────────── */
export const WithLabels = ({ fields, params, page }: LogoCloudProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <LogoCloudDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component logo-cloud', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle datasource={datasource} isEditing={isEditing} />
          <div className="flex flex-wrap items-start justify-center gap-10 md:gap-14">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <LogoWrapper item={item} isEditing={isEditing}>
                  {(item.logoImage?.jsonValue?.value?.src || isEditing) && (
                    <ContentSdkImage
                      field={item.logoImage?.jsonValue}
                      className="h-10 max-w-[140px] object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                    />
                  )}
                </LogoWrapper>
                {(item.companyName?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.companyName?.jsonValue}
                    tag="span"
                    className="text-xs font-medium font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Worley — pixel-perfect demo variant (worley.com project ticker)
   Navy strip with an infinite text marquee of CompanyName entries,
   lime dot separators, each entry linked via LogoLink. Logos unused.
   Edit mode renders a static wrapping list so every item is editable.
   ──────────────────────────────────────────── */
const WorleyTickerItem = ({ item, isEditing }: { item: LogoItemFields; isEditing?: boolean }) => (
  <span className="inline-flex shrink-0 items-center gap-3 px-6">
    <span
      aria-hidden="true"
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: 'var(--brand-primary)' }}
    />
    {item.logoLink?.jsonValue?.value?.href || isEditing ? (
      <ContentSdkLink
        field={item.logoLink?.jsonValue}
        className="whitespace-nowrap text-base text-white transition-opacity hover:opacity-80"
      >
        <Text field={item.companyName?.jsonValue} tag="span" />
      </ContentSdkLink>
    ) : (
      <Text field={item.companyName?.jsonValue} tag="span" className="whitespace-nowrap text-base text-white" />
    )}
  </span>
);

export const Worley = ({ fields, params, page }: LogoCloudProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <LogoCloudDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component logo-cloud', styles)} id={RenderingIdentifier}>
      <section
        className="w-full overflow-hidden"
        style={{ backgroundColor: 'var(--brand-secondary)', fontFamily: 'var(--brand-body-font)' }}
      >
        {(datasource.title?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.title?.jsonValue}
            tag="h2"
            className={isEditing ? 'px-10 pt-3 text-xs uppercase tracking-widest text-white/60' : 'sr-only'}
          />
        )}
        {isEditing ? (
          <div className="flex flex-wrap items-center py-5">
            {items.map((item) => (
              <WorleyTickerItem key={item.id} item={item} isEditing />
            ))}
          </div>
        ) : (
          <div className="group flex h-[68px] items-center">
            <div className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center" aria-hidden={copy === 1 ? 'true' : undefined}>
                  {items.map((item) => (
                    <WorleyTickerItem key={`${copy}-${item.id}`} item={item} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
