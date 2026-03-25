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
}

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
   Default — pill-shaped tabs
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: TabNavigationSectionProps): JSX.Element => {  
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
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab, index) => (
              <ContentSdkLink
                key={tab.id}
                field={tab.tabLink?.jsonValue}
                className={cn(
                  'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all',
                  index === 0
                    ? 'text-[var(--brand-primary-foreground)]'
                    : 'hover:opacity-70'
                )}
                style={
                  index === 0
                    ? { backgroundColor: 'var(--brand-primary)', color: 'var(--brand-primary-foreground)' }
                    : {
                        backgroundColor: 'var(--brand-muted, #f3f4f6)',
                        color: 'var(--brand-fg, #111111)',
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
