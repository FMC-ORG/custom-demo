import React from 'react';
import { render } from '@testing-library/react';

// Store original env
const originalEnv = process.env;

// Mock the Cloud SDK modules
const mockInitialize = jest.fn().mockResolvedValue(undefined);
const mockAddSearch = jest.fn().mockReturnValue({ initialize: mockInitialize });
const mockAddEvents = jest.fn().mockReturnValue({ addSearch: mockAddSearch });
const mockCloudSDK = jest.fn().mockReturnValue({ addEvents: mockAddEvents });

jest.mock('@sitecore-cloudsdk/core/browser', () => ({
  CloudSDK: (...args: unknown[]) => mockCloudSDK(...args),
}));

jest.mock('@sitecore-cloudsdk/events/browser', () => ({}));
jest.mock('@sitecore-cloudsdk/search/browser', () => ({}));

describe('CloudSDKInit Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should render null (no visible UI)', () => {
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID = 'test-context-id';
    process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME = 'test-site';

    // Re-import to pick up env vars
    jest.isolateModules(() => {
      const CloudSDKInit = require('@/components/cloud-sdk/CloudSDKInit').default;
      const { container } = render(<CloudSDKInit />);
      expect(container.innerHTML).toBe('');
    });
  });

  it('should call CloudSDK initialization when Edge Context ID is present', async () => {
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID = 'test-context-id';
    process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME = 'test-site';

    await jest.isolateModulesAsync(async () => {
      const CloudSDKInit = require('@/components/cloud-sdk/CloudSDKInit').default;
      render(<CloudSDKInit />);

      // Wait for async init
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockCloudSDK).toHaveBeenCalledWith(
        expect.objectContaining({
          sitecoreEdgeContextId: 'test-context-id',
          siteName: 'test-site',
          enableBrowserCookie: true,
        })
      );
      expect(mockAddEvents).toHaveBeenCalled();
      expect(mockAddSearch).toHaveBeenCalled();
      expect(mockInitialize).toHaveBeenCalled();
    });
  });

  it('should not call CloudSDK initialization when Edge Context ID is missing', async () => {
    delete process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;

    await jest.isolateModulesAsync(async () => {
      const CloudSDKInit = require('@/components/cloud-sdk/CloudSDKInit').default;
      render(<CloudSDKInit />);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockCloudSDK).not.toHaveBeenCalled();
    });
  });
});
