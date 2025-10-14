import { useMemo, useCallback, useRef } from 'react';

// Memoization utilities for expensive computations
export const useMemoizedComputation = <T, Args extends readonly unknown[]>(
  computeFn: (...args: Args) => T,
  deps: Args,
  options?: {
    maxCacheSize?: number;
    ttl?: number; // Time to live in milliseconds
  }
): T => {
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
  const { maxCacheSize = 10, ttl = 5 * 60 * 1000 } = options || {};

  return useMemo(() => {
    const key = JSON.stringify(deps);
    const cached = cacheRef.current.get(key);
    const now = Date.now();

    // Check if cached value is still valid
    if (cached && (!ttl || now - cached.timestamp < ttl)) {
      console.log('useMemoizedComputation: Cache hit for', key.substring(0, 50));
      return cached.value;
    }

    console.log('useMemoizedComputation: Computing new value for', key.substring(0, 50));
    const result = computeFn(...deps);

    // Store in cache
    cacheRef.current.set(key, { value: result, timestamp: now });

    // Clean up old entries if cache is too large
    if (cacheRef.current.size > maxCacheSize) {
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, entries.length - maxCacheSize);
      toDelete.forEach(([keyToDelete]) => cacheRef.current.delete(keyToDelete));
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

// Debounced callback hook
export const useDebouncedCallback = <Args extends readonly unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
  deps: readonly unknown[] = []
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
        timeoutRef.current = undefined;
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...deps]
  );
};

// Throttled callback hook
export const useThrottledCallback = <Args extends readonly unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
  deps: readonly unknown[] = []
) => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
          timeoutRef.current = undefined;
        }, delay - timeSinceLastCall);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...deps]
  );
};

// Memoized filter hook
export const useMemoizedFilter = <T>(
  items: T[],
  filterFn: (item: T) => boolean,
  deps: readonly unknown[] = []
): T[] => {
  return useMemo(() => {
    console.log('useMemoizedFilter: Filtering', items.length, 'items');
    return items.filter(filterFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filterFn, ...deps]);
};

// Memoized sort hook
export const useMemoizedSort = <T>(
  items: T[],
  compareFn: (a: T, b: T) => number,
  deps: readonly unknown[] = []
): T[] => {
  return useMemo(() => {
    console.log('useMemoizedSort: Sorting', items.length, 'items');
    return [...items].sort(compareFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, compareFn, ...deps]);
};

// Memoized search hook
export const useMemoizedSearch = <T>(
  items: T[],
  searchTerm: string,
  searchFn: (item: T, term: string) => boolean,
  options?: {
    minSearchLength?: number;
    caseSensitive?: boolean;
  }
): T[] => {
  const { minSearchLength = 1, caseSensitive = false } = options || {};

  return useMemo(() => {
    if (!searchTerm || searchTerm.length < minSearchLength) {
      return items;
    }

    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    console.log('useMemoizedSearch: Searching', items.length, 'items for', term);
    
    return items.filter(item => searchFn(item, term));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchTerm, searchFn, minSearchLength, caseSensitive]);
};

// Memoized group by hook
export const useMemoizedGroupBy = <T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
  deps: readonly unknown[] = []
): Record<K, T[]> => {
  return useMemo(() => {
    console.log('useMemoizedGroupBy: Grouping', items.length, 'items');
    const groups = {} as Record<K, T[]>;
    
    items.forEach(item => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, keyFn, ...deps]);
};

// Memoized pagination hook
export const useMemoizedPagination = <T>(
  items: T[],
  page: number,
  pageSize: number
): {
  paginatedItems: T[];
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} => {
  return useMemo(() => {
    const totalPages = Math.ceil(items.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    console.log('useMemoizedPagination: Page', page, 'of', totalPages, 'with', paginatedItems.length, 'items');

    return {
      paginatedItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }, [items, page, pageSize]);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  renderCountRef.current += 1;
  const currentTime = Date.now();
  const timeSinceLastRender = currentTime - lastRenderTimeRef.current;
  lastRenderTimeRef.current = currentTime;

  if (__DEV__) {
    console.log(
      `Performance Monitor [${componentName}]: Render #${renderCountRef.current}, Time since last render: ${timeSinceLastRender}ms`
    );
  }

  return {
    renderCount: renderCountRef.current,
    timeSinceLastRender,
  };
};