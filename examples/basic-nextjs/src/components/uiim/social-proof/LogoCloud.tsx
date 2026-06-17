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
   Default — delegates to the Sage variant
   ──────────────────────────────────────────── */
export const Default = (props: LogoCloudProps): JSX.Element => <Sage {...props} />;

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

/* Sage variant — dark bg, single centered row of up to 6 white/desaturated
   logos; small muted headline; company names sr-only (logos only on live site) */
export const Sage = ({ fields, params, page }: LogoCloudProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <LogoCloudDefaultComponent />;
  const items = (datasource.children?.results || []).slice(0, 6);

  return (
    <div className={cn('component logo-cloud', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-6 py-12"
        style={{ backgroundColor: 'var(--brand-bg, #0a0a0a)' }}
      >
        <div className="mx-auto max-w-7xl">
          {(datasource.title?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.title?.jsonValue}
              tag="h2"
              className="mb-12 text-center text-sm font-medium font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-muted-foreground, #a1a1aa)' }}
            />
          )}
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-10">
            {items.map((item) => (
              <LogoWrapper key={item.id} item={item} isEditing={isEditing}>
                {(item.logoImage?.jsonValue?.value?.src || isEditing) && (
                  <ContentSdkImage
                    field={item.logoImage?.jsonValue}
                    className="h-16 w-44 object-contain brightness-0 invert md:w-[200px]"
                  />
                )}
                {(item.companyName?.jsonValue?.value || isEditing) && (
                  <Text field={item.companyName?.jsonValue} tag="span" className="sr-only" />
                )}
              </LogoWrapper>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
