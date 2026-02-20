/**
 * Shared mock content for page-context components when page fields are missing.
 * Used for article components and breadcrumbs in disconnected/preview scenarios.
 */
export const MOCK_ARTICLE = {
  title: 'Article Title',
  excerpt:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  author: 'Author',
  content: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  ],
} as const;
