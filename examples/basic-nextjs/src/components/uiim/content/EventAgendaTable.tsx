import React, { JSX } from 'react';
import {
  Field,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface AgendaRowFields {
  id: string;
  timeSlot: { jsonValue: Field<string> };
  sectionLabel: { jsonValue: Field<string> };
  mainstageTitle: { jsonValue: Field<string> };
  mainstageBody: { jsonValue: Field<string> };
  breakoutTitle: { jsonValue: Field<string> };
  breakoutBody: { jsonValue: Field<string> };
}

interface EventAgendaTableDatasource {
  eyebrow: { jsonValue: Field<string> };
  title: { jsonValue: Field<string> };
  timeHeader: { jsonValue: Field<string> };
  mainstageHeader: { jsonValue: Field<string> };
  breakoutHeader: { jsonValue: Field<string> };
  children: { results: AgendaRowFields[] };
}

interface EventAgendaTableFields {
  data: { datasource: EventAgendaTableDatasource };
}

type EventAgendaTableProps = ComponentProps & { fields: EventAgendaTableFields };

const Empty = (): JSX.Element => (
  <div className="component event-agenda-table">
    <span className="is-empty-hint">EventAgendaTable</span>
  </div>
);

export const Default = ({ fields, params, page }: EventAgendaTableProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const ds = fields?.data?.datasource;
  if (!ds) return <Empty />;
  const rows = ds.children?.results || [];

  return (
    <div className={cn('component event-agenda-table', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          {(ds.eyebrow?.jsonValue?.value || isEditing) && (
            <Text
              field={ds.eyebrow?.jsonValue}
              tag="p"
              className="text-xs font-semibold tracking-[0.4em] uppercase"
              style={{ color: 'var(--brand-muted-foreground)' }}
            />
          )}
          {(ds.title?.jsonValue?.value || isEditing) && (
            <Text
              field={ds.title?.jsonValue}
              tag="h2"
              className="mt-3 text-4xl md:text-5xl font-bold tracking-wide"
              style={{ color: 'var(--brand-fg)', fontFamily: 'var(--brand-heading-font)' }}
            />
          )}
        </div>

        <div
          className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-2xl"
          style={{
            backgroundColor: 'var(--brand-muted)',
            border: '1px solid var(--brand-border)',
            boxShadow: 'var(--brand-card-shadow)',
          }}
        >
          {/* Header row */}
          <div
            className="hidden md:grid md:grid-cols-[140px_1fr_1fr] px-6 py-4 text-xs font-bold tracking-[0.2em] uppercase"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              color: 'var(--brand-muted-foreground)',
              borderBottom: '1px solid var(--brand-border)',
            }}
          >
            <Text field={ds.timeHeader?.jsonValue} tag="span" />
            <Text field={ds.mainstageHeader?.jsonValue} tag="span" />
            <Text field={ds.breakoutHeader?.jsonValue} tag="span" />
          </div>

          {/* Rows */}
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr] gap-y-2 px-6 py-5"
              style={{
                borderBottom: idx < rows.length - 1 ? '1px solid var(--brand-border)' : 'none',
              }}
            >
              <div>
                {row.timeSlot?.jsonValue?.value && (
                  <Text
                    field={row.timeSlot.jsonValue}
                    tag="p"
                    className="text-sm font-mono font-medium"
                    style={{ color: 'var(--brand-fg)' }}
                  />
                )}
                {row.sectionLabel?.jsonValue?.value && (
                  <Text
                    field={row.sectionLabel.jsonValue}
                    tag="p"
                    className="mt-1 text-[10px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: 'var(--brand-primary)' }}
                  />
                )}
              </div>

              <div className="text-sm" style={{ color: 'var(--brand-fg)' }}>
                {row.mainstageTitle?.jsonValue?.value && (
                  <Text
                    field={row.mainstageTitle.jsonValue}
                    tag="p"
                    className="font-semibold"
                  />
                )}
                {row.mainstageBody?.jsonValue?.value && (
                  <ContentSdkRichText
                    field={row.mainstageBody.jsonValue}
                    className="mt-1 text-xs leading-relaxed [&_p]:m-0 [&_p+p]:mt-1"
                    style={{ color: 'var(--brand-muted-foreground)' }}
                  />
                )}
              </div>

              <div className="text-sm" style={{ color: 'var(--brand-fg)' }}>
                {row.breakoutTitle?.jsonValue?.value && (
                  <Text
                    field={row.breakoutTitle.jsonValue}
                    tag="p"
                    className="font-semibold"
                  />
                )}
                {row.breakoutBody?.jsonValue?.value && (
                  <ContentSdkRichText
                    field={row.breakoutBody.jsonValue}
                    className="mt-1 text-xs leading-relaxed [&_p]:m-0 [&_p+p]:mt-1"
                    style={{ color: 'var(--brand-muted-foreground)' }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
