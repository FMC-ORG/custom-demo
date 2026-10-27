import {
  AI_CRAWLERS,
  NOINDEX_DIRECTIVES,
  isIndexingAllowed,
  noIndexRobotsTxt,
} from '@/lib/indexing';

describe('isIndexingAllowed', () => {
  it('is off by default (demo sites are not indexed)', () => {
    expect(isIndexingAllowed({})).toBe(false);
    expect(isIndexingAllowed({ SITE_ALLOW_INDEXING: '' })).toBe(false);
    expect(isIndexingAllowed({ SITE_ALLOW_INDEXING: 'false' })).toBe(false);
    expect(isIndexingAllowed({ SITE_ALLOW_INDEXING: '1' })).toBe(false);
  });

  it('is on only with an explicit SITE_ALLOW_INDEXING=true', () => {
    expect(isIndexingAllowed({ SITE_ALLOW_INDEXING: 'true' })).toBe(true);
    expect(isIndexingAllowed({ SITE_ALLOW_INDEXING: ' TRUE ' })).toBe(true);
  });
});

describe('noIndexRobotsTxt', () => {
  const txt = noIndexRobotsTxt('https://demo.example.com');

  it('blocks every AI crawler', () => {
    for (const agent of AI_CRAWLERS) {
      expect(txt).toContain(`User-agent: ${agent}\nDisallow: /`);
    }
  });

  it('lets search engines crawl so they can read the noindex directives', () => {
    expect(txt).toContain('User-agent: *\nAllow: /');
    expect(txt).not.toMatch(/User-agent: \*\nDisallow: \//);
  });

  it('advertises no sitemaps', () => {
    expect(txt.toLowerCase()).not.toContain('sitemap:');
  });
});

describe('NOINDEX_DIRECTIVES', () => {
  it('includes noindex and nofollow', () => {
    expect(NOINDEX_DIRECTIVES).toMatch(/noindex/);
    expect(NOINDEX_DIRECTIVES).toMatch(/nofollow/);
  });
});
