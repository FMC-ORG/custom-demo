'use client';
import { useCallback, useRef } from 'react';
import { useRouter as useNextRouter, usePathname } from 'next/navigation';
import { DEBOUNCE_TIME } from './constants';

const useDebouncedCallback = <T extends unknown[]>(
  cb: (...args: T) => void,
  delay: number = DEBOUNCE_TIME
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => cb(...args), delay);
    },
    [cb, delay]
  );
};

export const useRouter = () => {
  const router = useNextRouter();
  const pathname = usePathname();

  const buildUrl = useCallback(
    (query?: string, page?: number) => {
      const currentPath = pathname.split('?')[0];
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (page && page > 1) params.set('page', String(page));
      const qs = params.toString();
      return qs ? `${currentPath}?${qs}` : currentPath;
    },
    [pathname]
  );

  const setRouterQuery = useCallback(
    (value: string) => {
      router.replace(buildUrl(value));
    },
    [router, buildUrl]
  );

  const debouncedSetRouterQuery = useDebouncedCallback(setRouterQuery);

  const setQuery = useCallback(
    (value: string, debounced: boolean = true) => {
      if (debounced) {
        debouncedSetRouterQuery(value);
      } else {
        setRouterQuery(value);
      }
    },
    [debouncedSetRouterQuery, setRouterQuery]
  );

  const setRouterPage = useCallback(
    (page: number, query?: string) => {
      router.replace(buildUrl(query, page));
    },
    [router, buildUrl]
  );

  return { setRouterQuery: setQuery, setRouterPage };
};
