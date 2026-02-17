'use client';

import type React from 'react';
import Link from 'next/link';
import { Text, Image as SitecoreImage } from '@sitecore-content-sdk/nextjs';
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * ArticleCard child item structure
 */
interface ArticleCardItem {
  id: string;
  image?: { jsonValue?: ImageField };
  title?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
  badgeText?: { jsonValue?: Field<string> };
}

/**
 * ArticleCards component parameters
 */
interface ArticleCardsParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * ArticleCards fields structure
 */
interface ArticleCardsFields {
  data?: {
    datasource?: {
      title?: { jsonValue?: Field<string> };
      children?: {
        results: ArticleCardItem[];
      };
    };

  };
}

/**
 * ArticleCards component props
 */
interface ArticleCardsProps extends ComponentProps {
  params: ArticleCardsParams;
  fields: ArticleCardsFields;
  isPageEditing?: boolean;
}

/**
 * ArticleCards component implementation
 * @param {ArticleCardsProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered article cards component
 */
const ArticleCardsComponent: React.FC<ArticleCardsProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { data } = fields || {};
  const { datasource } = data || {};
  const { children } = datasource || {};
  // Handle missing datasource  
  if (!data?.datasource && !isPageEditing) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            ArticleCards component: No datasource configured
          </div>
        </div>
      </section>
    );
  }

  const articles = children?.results || [];
  const sectionTitle = datasource?.title?.jsonValue;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Optional section title */}
        {(sectionTitle?.value || isPageEditing) && (
          <div className="mb-8">
            <Text
              field={sectionTitle}
              tag="h2"
              className="text-2xl md:text-3xl font-bold text-saga-navy"
            />
          </div>
        )}
        
        {/* Articles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.length > 0 ? (
            articles.map((article) => {
              const { id, image, title, link, badgeText } = article;
              
              const linkHref = link?.jsonValue?.value?.href || '#';
              
              const cardContent = (
                <>
                  {/* Image section */}
                  <div className="relative h-48 overflow-hidden">
                    {/* Badge */}
                    {(badgeText?.jsonValue?.value || isPageEditing) && (
                      <span className="absolute top-3 left-3 z-10 bg-saga-teal/80 text-saga-navy text-xs font-bold px-3 py-1 rounded">
                        <Text
                          field={badgeText?.jsonValue}
                          tag="span"
                          editable={false}
                        />
                      </span>
                    )}
                    
                    {/* Article image */}
                    {image?.jsonValue && (
                      <SitecoreImage
                        field={image.jsonValue}
                        className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
                      />
                    )}
                  </div>
                  
                  {/* Content section */}
                  <div className="p-4">
                    {(title?.jsonValue?.value || isPageEditing) && (
                      <Text
                        field={title?.jsonValue}
                        tag="h3"
                        className="text-sm font-bold text-saga-navy leading-snug hover:text-saga-teal transition-colors"
                      />
                    )}
                  </div>
                </>
              );
              
              return (
                <Link
                  key={id}
                  href={linkHref}
                  className="group bg-background rounded-lg overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow block"
                >
                  {cardContent}
                </Link>
              );
            })
          ) : (
            isPageEditing && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No article cards configured. Add ArticleCard items as children.
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Default export for Sitecore component registration
 */
export const Default: React.FC<ArticleCardsProps> = (props) => {
  const { page } = props;
  const isPageEditing = page.mode.isEditing;
  
  return <ArticleCardsComponent {...props} isPageEditing={isPageEditing} />;
};

// Export component for direct use if needed
export { ArticleCardsComponent as ArticleCards };
