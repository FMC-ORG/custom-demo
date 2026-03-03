'use client';

import type React from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
  Field,
  ImageField,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface CaseHistoryCardItem {
  id: string;
  clientName?: { jsonValue?: Field<string> };
  thumbnail?: { jsonValue?: ImageField };
  cardTitle?: { jsonValue?: Field<string> };
  sector?: { jsonValue?: Field<string> };
  cardCTALink?: { jsonValue?: LinkField };
}

interface CaseHistoryCardsFields {
  data?: {
    datasource?: {
      sectionLabel?: { jsonValue?: Field<string> };
      sectionCTALabel?: { jsonValue?: Field<string> };
      sectionCTALink?: { jsonValue?: LinkField };
      children?: {
        results?: CaseHistoryCardItem[];
      };
    };
  };
}

interface CaseHistoryCardsProps extends ComponentProps {
  params: { [key: string]: string };
  fields?: CaseHistoryCardsFields;
}

/**
 * CaseHistoryCards — editorial 2-column grid of case study cards.
 * No card borders, no shadows. Section header centered above the grid.
 */
export const Default: React.FC<CaseHistoryCardsProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const datasource = fields?.data?.datasource;
  const sectionLabel = datasource?.sectionLabel?.jsonValue;
  const sectionCTALabel = datasource?.sectionCTALabel?.jsonValue;
  const sectionCTALink = datasource?.sectionCTALink?.jsonValue;
  const cards = datasource?.children?.results ?? [];

  const hasContent =
    sectionLabel?.value || sectionCTALink?.value?.href || cards.length > 0 || isEditing;

  if (!datasource || !hasContent) {
    return (
      <section
        className={cn('case-history-cards py-12 bg-white', styles)}
        id={id}
        data-testid="case-history-cards"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="is-empty-hint text-muted-foreground">CaseHistoryCards — add card children</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('case-history-cards py-12 bg-white', styles)}
      id={id}
      data-testid="case-history-cards"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        {(sectionLabel?.value || (isEditing && sectionLabel)) && (
          <div className="text-center mb-8">
            <div className="field-sectionlabel text-base font-bold text-vg-dark">
              <ContentSdkRichText field={sectionLabel} />
            </div>
            {(sectionCTALink?.value?.href || (isEditing && sectionCTALink)) && sectionCTALink && (
              <ContentSdkLink
                field={sectionCTALink}
                editable={isEditing}
                className="text-sm text-[#1d4ed8] underline-offset-4 hover:underline mt-2 inline-block"
              >
                {sectionCTALabel?.value || sectionCTALink?.value?.text || ''}
              </ContentSdkLink>
            )}
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {cards.map((card) => {
            const img = card.thumbnail?.jsonValue;
            const title = card.cardTitle?.jsonValue;
            const client = card.clientName?.jsonValue;
            const sector = card.sector?.jsonValue;
            const link = card.cardCTALink?.jsonValue;

            return (
              <div key={card.id} className="card-img-zoom">
                {/* Image — render in edit mode even when empty so authors can add image */}
                <div className="relative aspect-[3/2] overflow-hidden">
                  {(img?.value?.src || (isEditing && img)) && img ? (
                    <ContentSdkImage
                      field={img}
                      editable={isEditing}
                      fill
                      className="object-cover"
                      alt={(img?.value?.alt ?? client?.value ?? '') as string}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-vg-surface">
                      <span className="is-empty-hint text-vg-muted">[image]</span>
                    </div>
                  )}
                </div>

                {/* Card metadata */}
                <div className="mt-3">
                  {(client?.value || (isEditing && client)) && client && (
                    <Text
                      tag="p"
                      field={client}
                      className="field-clientname text-sm font-bold text-vg-dark"
                    />
                  )}
                  {(title?.value || (isEditing && title)) && title && link?.value?.href ? (
                    <ContentSdkLink
                      field={link}
                      editable={false}
                      className="field-cardtitle text-sm text-[#1d4ed8] hover:underline mt-1 leading-snug block"
                    >
                      {title.value}
                    </ContentSdkLink>
                  ) : (
                    (title?.value || (isEditing && title)) && title && (
                      <Text
                        tag="p"
                        field={title}
                        className="field-cardtitle text-sm text-[#1d4ed8] mt-1 leading-snug"
                      />
                    )
                  )}
                  {(sector?.value || (isEditing && sector)) && sector && (
                    <Text
                      tag="p"
                      field={sector}
                      className="field-sector text-xs font-bold uppercase tracking-widest text-vg-muted mt-2"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
