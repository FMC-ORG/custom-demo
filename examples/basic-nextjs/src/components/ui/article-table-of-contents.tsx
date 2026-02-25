'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';

type ArticleTableOfContentsProps = ComponentProps;

interface TocItem {
  id: string;
  text: string;
}

function extractHeadingsFromDom(): TocItem[] {
  const container = document.querySelector('[data-article-body]');
  if (!container) return [];
  const h2s = container.querySelectorAll('h2');
  const items: TocItem[] = [];
  h2s.forEach((h2) => {
    const text = h2.textContent?.trim() ?? '';
    const id = h2.id;
    if (text && id) items.push({ id, text });
  });
  return items;
}

export const Default: React.FC<ArticleTableOfContentsProps> = (props) => {
  const { params } = props;
  const { page } = useSitecore();

  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const updateToc = () => {
      setTocItems(extractHeadingsFromDom());
    };

    updateToc();

    const observer = new MutationObserver(updateToc);
    const container = document.querySelector('[data-article-body]');
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }

    const timer = setTimeout(updateToc, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px', threshold: 0 }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length === 0) return null;

  return (
    <aside
      className={cn('article-table-of-contents', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="sticky top-24">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          What&apos;s on this page?
        </h2>
        <nav aria-label="Table of contents">
          <ul className="space-y-2">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    'block text-sm py-1 hover:text-foreground transition-colors',
                    activeId === item.id
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};
