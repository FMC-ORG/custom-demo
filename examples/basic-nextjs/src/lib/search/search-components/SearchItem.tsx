'use client';
import { HTMLAttributes, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Field, Text, TextField, Link } from '@sitecore-content-sdk/nextjs';
import Image from 'next/image';
import { ChevronRight, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ItemCardFrame, ItemListFrame } from './SearchItemCommon';
import { SearchDocument, SearchFieldsMapping, SearchItemVariant } from './models';
import { DICTIONARY_KEYS } from './constants';

type SearchItemFields = {
  summary?: Field<string>;
  category?: Field<string>;
  title?: Field<string>;
  tags?: Field<string[] | string>;
  link?: Field<string>;
  image?: Field<string>;
};

type SearchItemProps = {
  data: SearchDocument;
  mapping: SearchFieldsMapping;
  variant?: SearchItemVariant;
  onClick: () => void;
} & HTMLAttributes<HTMLDivElement>;

const getField = (
  fields: { [key: string]: string | string[] },
  key: string | undefined
): { value: string | string[] } | undefined => {
  if (!key) return undefined;
  if (fields[key] === undefined || fields[key] === null) return undefined;
  return { value: fields[key] };
};

// --- Local helper renderers ---

const ItemTitle = ({ field, className }: { field: Field<string>; className?: string }) => (
  <h3 className={cn('text-lg font-semibold text-foreground mb-3', className)}>
    <Text field={field} />
  </h3>
);

const ItemSummary = ({ field, className }: { field: Field<string>; className?: string }) => (
  <p className={cn('text-muted-foreground mb-4', className)}>
    <Text field={field} />
  </p>
);

const ItemCategory = ({ field }: { field: Field<string> }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    <Badge variant="secondary">
      <Text field={field} />
    </Badge>
  </div>
);

const ItemTags = ({ field }: { field: Field<string[] | string> }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {Array.isArray(field.value) ? (
      field.value.map((tag, index) => (
        <Badge key={index} variant="outline">
          {tag}
        </Badge>
      ))
    ) : (
      <Badge variant="outline">
        <Text field={field as TextField} />
      </Badge>
    )}
  </div>
);

const ItemLink = ({ field, onClick }: { field: Field<string>; onClick: () => void }) => {
  const t = useTranslations();
  return (
    <Link
      field={{ href: field.value }}
      className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
      onClick={onClick}
    >
      {t(DICTIONARY_KEYS.READ_MORE) || 'Read More'}
      <ChevronRight className="size-4 ml-1" />
    </Link>
  );
};

const ItemImage = ({
  field,
  variant = 'card',
  width = 400,
  height = 250,
}: {
  field: Field<string>;
  variant?: SearchItemVariant;
  width?: number;
  height?: number;
}) => {
  const [brokenImage, setBrokenImage] = useState(false);
  const isCard = variant === 'card';

  return (
    <div
      className={cn('bg-muted relative', isCard ? 'w-full' : 'h-full')}
      style={isCard ? { height } : { width }}
    >
      {!brokenImage ? (
        <Image
          fill
          src={field.value as string}
          alt=""
          onError={() => setBrokenImage(true)}
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <ImageOff className="size-8 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

// --- Main SearchItem ---

export const SearchItem = ({ data, mapping, variant = 'card', onClick }: SearchItemProps) => {
  const isCard = variant === 'card';

  const fields = useMemo((): SearchItemFields => {
    return {
      title: mapping.title
        ? (getField(data, mapping.title) as { value: string } | undefined)
        : undefined,
      image: mapping.images
        ? (getField(data, mapping.images) as { value: string } | undefined)
        : undefined,
      tags: mapping.tags
        ? (getField(data, mapping.tags) as { value: string | string[] } | undefined)
        : undefined,
      summary: mapping.description
        ? (getField(data, mapping.description) as { value: string } | undefined)
        : undefined,
      category: mapping.type
        ? (getField(data, mapping.type) as { value: string } | undefined)
        : undefined,
      link: mapping.link
        ? (getField(data, mapping.link) as { value: string } | undefined)
        : undefined,
    };
  }, [data, mapping]);

  const image = fields.image ? <ItemImage field={fields.image} variant={variant} /> : undefined;

  const components = (
    <>
      {fields.category && <ItemCategory field={fields.category} />}
      {fields.title && <ItemTitle field={fields.title} className="line-clamp-2" />}
      {fields.tags && <ItemTags field={fields.tags} />}
      {fields.summary && <ItemSummary field={fields.summary} className="line-clamp-3" />}
      {fields.link && <ItemLink field={fields.link} onClick={onClick} />}
    </>
  );

  return isCard ? (
    <ItemCardFrame image={image}>{components}</ItemCardFrame>
  ) : (
    <ItemListFrame image={image}>{components}</ItemListFrame>
  );
};
