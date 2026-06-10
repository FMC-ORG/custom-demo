'use client';

import React, { JSX, useMemo, useState } from 'react';
import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface GalleryPhotoFields {
  id: string;
  photoCode: { jsonValue: Field<string> };
  attendeeName: { jsonValue: Field<string> };
  eventDate: { jsonValue: Field<string> };
  category: { jsonValue: Field<string> };
  photo: { jsonValue: ImageField };
  tapToViewLabel: { jsonValue: Field<string> };
}

interface CommunityGalleryGridDatasource {
  searchPlaceholder: { jsonValue: Field<string> };
  clearLabel: { jsonValue: Field<string> };
  categoryAllLabel: { jsonValue: Field<string> };
  categories: { jsonValue: Field<string> };
  emptyStateText: { jsonValue: Field<string> };
  children: { results: GalleryPhotoFields[] };
}

interface CommunityGalleryGridFields {
  data: { datasource: CommunityGalleryGridDatasource };
}

type CommunityGalleryGridProps = ComponentProps & { fields: CommunityGalleryGridFields };

const Empty = (): JSX.Element => (
  <div className="component community-gallery-grid">
    <span className="is-empty-hint">CommunityGalleryGrid</span>
  </div>
);

const hashGradient = (code: string): string => {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash << 5) - hash + code.charCodeAt(i);
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 60) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 35%), hsl(${hue2}, 50%, 20%))`;
};

export const Default = ({ fields, params, page }: CommunityGalleryGridProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const ds = fields?.data?.datasource;
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const photos = useMemo(() => ds?.children?.results || [], [ds]);

  const categories = useMemo(() => {
    const all = ds?.categoryAllLabel?.jsonValue?.value || 'All';
    const raw = ds?.categories?.jsonValue?.value || '';
    const parsed = raw.split('|').map((s) => s.trim()).filter(Boolean);
    return [all, ...parsed];
  }, [ds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return photos.filter((p) => {
      const code = p.photoCode?.jsonValue?.value?.toLowerCase() || '';
      const name = p.attendeeName?.jsonValue?.value?.toLowerCase() || '';
      const cat = p.category?.jsonValue?.value || '';
      const matchesQuery = !q || code.includes(q) || name.includes(q);
      const matchesCategory = activeCategory === categories[0] || cat === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [photos, query, activeCategory, categories]);

  if (!ds) return <Empty />;

  return (
    <div className={cn('component community-gallery-grid', styles)} id={RenderingIdentifier}>
      <section className="w-full px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Search bar + Clear */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ds.searchPlaceholder?.jsonValue?.value || 'Search…'}
              className="flex-1 px-5 py-3 text-sm"
              style={{
                backgroundColor: '#ffffff',
                color: '#0a0a0a',
                borderRadius: 'var(--brand-button-radius)',
                border: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveCategory(categories[0]);
              }}
              className="px-6 py-3 text-sm font-semibold"
              style={{
                color: 'var(--brand-fg)',
                backgroundColor: 'transparent',
                border: '1px solid var(--brand-border)',
                borderRadius: 'var(--brand-button-radius)',
              }}
            >
              {ds.clearLabel?.jsonValue?.value || 'Clear'}
            </button>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className="px-6 py-2 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#0a0a0a' : 'var(--brand-fg)',
                    border: '1px solid var(--brand-border)',
                    borderRadius: 'var(--brand-button-radius)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div
              className="text-center py-16 text-sm"
              style={{ color: 'var(--brand-muted-foreground)' }}
            >
              {ds.emptyStateText?.jsonValue?.value || 'No photos found.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((p) => {
                const code = p.photoCode?.jsonValue?.value || '';
                const name = p.attendeeName?.jsonValue?.value || '';
                const date = p.eventDate?.jsonValue?.value || '';
                const tap = p.tapToViewLabel?.jsonValue?.value || 'Tap to view';
                const hasImage = !!p.photo?.jsonValue?.value?.src;
                return (
                  <div
                    key={p.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer group"
                    style={{
                      background: hasImage ? undefined : hashGradient(code || name),
                      border: '1px solid var(--brand-border)',
                      boxShadow: 'var(--brand-card-shadow)',
                    }}
                  >
                    {hasImage && (
                      <ContentSdkImage
                        field={p.photo?.jsonValue}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {code && (
                        <p className="text-[10px] font-mono tracking-wider uppercase opacity-70" style={{ color: '#ffffff' }}>
                          {code}
                        </p>
                      )}
                      {name && (
                        <p className="text-base font-bold mt-1" style={{ color: '#ffffff' }}>
                          {name}
                        </p>
                      )}
                      <p className="text-xs mt-1 opacity-70" style={{ color: '#ffffff' }}>
                        {date}{date && ' · '}{tap}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
