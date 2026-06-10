import React, { JSX } from 'react';
import { Field, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface ConnectedSitePanelFields {
  EyebrowLabel: Field<string>;
  SiteName: Field<string>;
  SitePath: Field<string>;
  FolderLabel: Field<string>;
  FolderPath: Field<string>;
  ItemCountLabel: Field<string>;
  ItemCount: Field<string>;
  ItemCountSuffix: Field<string>;
}

type ConnectedSitePanelProps = ComponentProps & { fields: ConnectedSitePanelFields };

const Empty = (): JSX.Element => (
  <div className="component connected-site-panel">
    <span className="is-empty-hint">ConnectedSitePanel</span>
  </div>
);

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const PhotoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

export const Default = ({ fields, params, page }: ConnectedSitePanelProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <Empty />;

  return (
    <div className={cn('component connected-site-panel', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-8">
        <div
          className="mx-auto max-w-3xl rounded-2xl p-6"
          style={{
            backgroundColor: 'var(--brand-muted)',
            border: '1px solid var(--brand-border)',
            boxShadow: 'var(--brand-card-shadow)',
          }}
        >
          {(fields.EyebrowLabel?.value || isEditing) && (
            <Text
              field={fields.EyebrowLabel}
              tag="p"
              className="text-xs font-semibold tracking-[0.18em] uppercase"
              style={{ color: 'var(--brand-muted-foreground)' }}
            />
          )}

          {(fields.SiteName?.value || isEditing) && (
            <Text
              field={fields.SiteName}
              tag="h3"
              className="mt-2 text-2xl font-bold"
              style={{ color: 'var(--brand-fg)' }}
            />
          )}

          {(fields.SitePath?.value || isEditing) && (
            <Text
              field={fields.SitePath}
              tag="p"
              className="mt-1 text-sm font-mono"
              style={{ color: 'var(--brand-muted-foreground)' }}
            />
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--brand-border)',
              }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--brand-muted-foreground)' }}>
                <FolderIcon />
                {(fields.FolderLabel?.value || isEditing) && (
                  <Text field={fields.FolderLabel} tag="span" className="text-sm font-medium" />
                )}
              </div>
              {(fields.FolderPath?.value || isEditing) && (
                <Text
                  field={fields.FolderPath}
                  tag="p"
                  className="mt-2 text-xs font-mono break-all"
                  style={{ color: 'var(--brand-muted-foreground)' }}
                />
              )}
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--brand-border)',
              }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--brand-muted-foreground)' }}>
                <PhotoIcon />
                {(fields.ItemCountLabel?.value || isEditing) && (
                  <Text field={fields.ItemCountLabel} tag="span" className="text-sm font-medium" />
                )}
              </div>
              {(fields.ItemCount?.value || isEditing) && (
                <Text
                  field={fields.ItemCount}
                  tag="p"
                  className="mt-2 text-3xl font-bold"
                  style={{ color: 'var(--brand-fg)' }}
                />
              )}
              {(fields.ItemCountSuffix?.value || isEditing) && (
                <Text
                  field={fields.ItemCountSuffix}
                  tag="p"
                  className="text-xs"
                  style={{ color: 'var(--brand-muted-foreground)' }}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
