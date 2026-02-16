'use client';

import type React from 'react';
import { Text, Image as SitecoreImage, Link as SitecoreLink } from '@sitecore-content-sdk/nextjs';
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * ArticleCard field structure
 */
interface ArticleCardFields {
  image?: { jsonValue?: ImageField };
  title?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
  badgeText?: { jsonValue?: Field<string> };
}

/**
 * ArticleCard child item structure
 */
interface ArticleCardItem {
  id: string;
  fields: ArticleCardFields;
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
    };
    children?: {
      results?: ArticleCardItem[];
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
  const { datasource, children } = data || {};
  
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
              const { id, fields: articleFields } = article;
              const { image, title, link, badgeText } = articleFields || {};
              
              return (
                <div
                  key={id}
                  className="group bg-background rounded-lg overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                >
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
                        fill
                      />
                    )}
                  </div>
                  
                  {/* Content section */}
                  <div className="p-4">
                    {(title?.jsonValue?.value || isPageEditing) && (
                      <>
                        {link?.jsonValue ? (
                          <SitecoreLink
                            field={link.jsonValue}
                            className="block"
                          >
                            <Text
                              field={title?.jsonValue}
                              tag="h3"
                              className="text-sm font-bold text-saga-navy leading-snug hover:text-saga-teal transition-colors"
                            />
                          </SitecoreLink>
                        ) : (
                          <Text
                            field={title?.jsonValue}
                            tag="h3"
                            className="text-sm font-bold text-saga-navy leading-snug"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
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
