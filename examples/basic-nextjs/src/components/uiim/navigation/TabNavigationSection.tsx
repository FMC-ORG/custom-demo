import React, { JSX } from 'react';
import {
  Field,
  LinkField,
  Link as ContentSdkLink,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface TabItemFields {
  id: string;
  tabLabel: { jsonValue: Field<string> };
  tabLink: { jsonValue: LinkField };
  tabIcon?: { jsonValue: Field<string> };
}

const renderIcon = (name?: string) => {
  const common = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'camera':
      return (
        <svg {...common}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    default:
      return null;
  }
};

interface TabNavigationSectionDatasource {
  title: { jsonValue: Field<string> };
  children: {
    results: TabItemFields[];
  };
}

interface TabNavigationSectionFields {
  data: {
    datasource: TabNavigationSectionDatasource;
  };
}

type TabNavigationSectionProps = ComponentProps & {
  fields: TabNavigationSectionFields;
};

const TabNavigationSectionDefaultComponent = (): JSX.Element => (
  <div className="component tab-navigation-section">
    <div className="component-content">
      <span className="is-empty-hint">TabNavigationSection</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — Copenhagen Silver StaticBadges
   Non-clickable rounded pills, icon + uppercase label,
   centered, translucent dark fill.
   ──────────────────────────────────────────── */
export const Default = ({ fields, params }: TabNavigationSectionProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TabNavigationSectionDefaultComponent />;
  const tabs = datasource.children?.results || [];

  return (
    <div className={cn('component tab-navigation-section', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {tabs.map((tab) => {
              const iconName = tab.tabIcon?.jsonValue?.value;
              return (
                <span
                  key={tab.id}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--brand-border)',
                    color: 'var(--brand-fg)',
                    borderRadius: 'var(--brand-button-radius)',
                  }}
                >
                  {iconName && renderIcon(iconName)}
                  <Text field={tab.tabLabel?.jsonValue} />
                </span>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Underline — flat text with bottom border
   ──────────────────────────────────────────── */
export const Underline = ({ fields, params, page }: TabNavigationSectionProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  const datasource = fields?.data?.datasource;
  if (!datasource) return <TabNavigationSectionDefaultComponent />;

  const tabs = datasource.children?.results || [];

  return (
    <div className={cn('component tab-navigation-section', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-6"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          {(datasource.title?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.title?.jsonValue}
              tag="h2"
              className="mb-4 text-lg font-semibold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          <div
            className="flex items-center gap-6 border-b"
            style={{ borderColor: 'var(--brand-border, #e5e7eb)' }}
          >
            {tabs.map((tab, index) => (
              <ContentSdkLink
                key={tab.id}
                field={tab.tabLink?.jsonValue}
                className={cn(
                  'relative pb-3 text-sm font-medium transition-all',
                  index === 0 ? '' : 'opacity-60 hover:opacity-100'
                )}
                style={{ color: 'var(--brand-fg, #111111)' }}
              >
                <Text field={tab.tabLabel?.jsonValue} />
                {index === 0 && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  />
                )}
              </ContentSdkLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Boxed — rectangular tabs with border
   ──────────────────────────────────────────── */
export const Boxed = ({ fields, params, page }: TabNavigationSectionProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;

  const datasource = fields?.data?.datasource;
  if (!datasource) return <TabNavigationSectionDefaultComponent />;

  const tabs = datasource.children?.results || [];

  return (
    <div className={cn('component tab-navigation-section', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-6"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          {(datasource.title?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.title?.jsonValue}
              tag="h2"
              className="mb-4 text-lg font-semibold font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          <div className="flex flex-wrap items-center gap-0">
            {tabs.map((tab, index) => (
              <ContentSdkLink
                key={tab.id}
                field={tab.tabLink?.jsonValue}
                className={cn(
                  'inline-flex items-center border px-5 py-2.5 text-sm font-medium transition-all',
                  index === 0 ? '' : 'hover:opacity-70'
                )}
                style={
                  index === 0
                    ? {
                        backgroundColor: 'var(--brand-primary)',
                        color: 'var(--brand-primary-foreground)',
                        borderColor: 'var(--brand-primary)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'var(--brand-fg, #111111)',
                        borderColor: 'var(--brand-border, #e5e7eb)',
                      }
                }
              >
                <Text field={tab.tabLabel?.jsonValue} />
              </ContentSdkLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
