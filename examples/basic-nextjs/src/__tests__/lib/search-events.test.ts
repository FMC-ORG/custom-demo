import { renderHook } from '@testing-library/react';

const mockEvent = jest.fn(() => Promise.resolve());
jest.mock('@sitecore-content-sdk/events', () => ({
  event: (...args: unknown[]) => mockEvent(...(args as [])),
}));

const mockGetClientId = jest.fn();
jest.mock('@sitecore-content-sdk/analytics-core', () => ({
  getClientId: () => mockGetClientId(),
}));

import { hasAnalyticsBrowserId, useSearchEvents } from '@/lib/search-ui/useSearchEvents';

const page = {
  mode: { isEditing: false, isPreview: false },
  siteName: 'main-website',
  layout: { sitecore: { route: { name: 'Articles', itemLanguage: 'en' } } },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const originalEnv = process.env.NODE_ENV;
const setEnv = (value: string) =>
  Object.defineProperty(process.env, 'NODE_ENV', { value, configurable: true });

beforeEach(() => {
  jest.clearAllMocks();
  setEnv('production');
});
afterAll(() => setEnv(originalEnv as string));

describe('hasAnalyticsBrowserId', () => {
  it('is false when the analytics plugin is not registered (getClientId throws)', () => {
    mockGetClientId.mockImplementation(() => {
      throw new Error('IE_004');
    });
    expect(hasAnalyticsBrowserId()).toBe(false);
  });

  it('is false before a browser ID exists and true once it does', () => {
    mockGetClientId.mockReturnValue('');
    expect(hasAnalyticsBrowserId()).toBe(false);
    mockGetClientId.mockReturnValue('browser-id');
    expect(hasAnalyticsBrowserId()).toBe(true);
  });
});

describe('useSearchEvents', () => {
  it('skips the event when analytics has no browser ID (no failing request)', () => {
    mockGetClientId.mockReturnValue('');
    const { result } = renderHook(() => useSearchEvents({ query: 'ai', uid: 'u1', page }));
    result.current('viewed');
    expect(mockEvent).not.toHaveBeenCalled();
  });

  it('sends the search event when analytics is ready', () => {
    mockGetClientId.mockReturnValue('browser-id');
    const { result } = renderHook(() => useSearchEvents({ query: 'ai', uid: 'u1', page }));
    result.current('clicked');
    expect(mockEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'search',
        siteId: 'main-website',
        core: expect.objectContaining({ componentId: 'u1', interactionType: 'clicked', keyword: 'ai' }),
      })
    );
  });

  it('stays silent in editing mode even with analytics ready', () => {
    mockGetClientId.mockReturnValue('browser-id');
    const editing = { ...page, mode: { isEditing: true, isPreview: false } };
    const { result } = renderHook(() => useSearchEvents({ query: '', uid: 'u1', page: editing }));
    result.current('viewed');
    expect(mockEvent).not.toHaveBeenCalled();
  });
});
