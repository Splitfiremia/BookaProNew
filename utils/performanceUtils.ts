import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';

// Debounce hook for search and input operations
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (typeof callback === 'function') {
        callback(...args);
      }
    }, delay);
  }, [callback, delay]) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

// Throttle hook for scroll and frequent operations
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        if (typeof callback === 'function') {
          callback(...args);
        }
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback;
}

// Memoization utility for expensive calculations
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
  if (!Array.isArray(deps)) {
    throw new Error('Dependencies must be an array');
  }
  return useCallback(callback, deps);
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    if (renderCountRef.current > 1) {
      console.log(`${componentName}: Render #${renderCountRef.current}, ${timeSinceLastRender}ms since last render`);
      
      // Warn about frequent re-renders
      if (timeSinceLastRender < 100 && renderCountRef.current > 5) {
        console.warn(`${componentName}: Frequent re-renders detected. Consider optimization.`);
      }
    }
    
    lastRenderTimeRef.current = now;
  });
  
  return {
    renderCount: renderCountRef.current,
    resetRenderCount: () => { renderCountRef.current = 0; }
  };
}

// Batch state updates utility
export function useBatchedUpdates() {
  const batchRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  const batchUpdate = useCallback((updateFn: () => void) => {
    if (typeof updateFn !== 'function') return;
    batchRef.current.push(updateFn);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const updates = [...batchRef.current];
      batchRef.current = [];
      
      // Execute all batched updates
      updates.forEach(update => update());
    }, 0);
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return batchUpdate;
}

// Lazy loading utility for heavy components
export function useLazyComponent<T>(
  loader: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = useRef<React.ComponentType<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    loader()
      .then(module => {
        LazyComponent.current = module.default;
        setIsLoading(false);
      })
      .catch(err => {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setIsLoading(false);
      });
  }, [loader]);
  
  return {
    Component: LazyComponent.current,
    isLoading,
    error,
    Fallback: fallback
  };
}

// Memory usage optimization for large lists with improved performance
export function useVirtualizedList<T>(
  data: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const lastScrollOffset = useRef(0);
  const visibleRangeCache = useRef<{
    startIndex: number;
    endIndex: number;
    visibleItems: T[];
  } | null>(null);
  
  const visibleRange = useMemo(() => {
    // Use cached result if scroll offset hasn't changed significantly
    if (visibleRangeCache.current && 
        Math.abs(scrollOffset - lastScrollOffset.current) < itemHeight / 2) {
      return visibleRangeCache.current;
    }
    
    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2, // Increased buffer
      data.length
    );
    
    const result = {
      startIndex: Math.max(0, startIndex - 1),
      endIndex,
      visibleItems: data.slice(Math.max(0, startIndex - 1), endIndex)
    };
    
    visibleRangeCache.current = result;
    lastScrollOffset.current = scrollOffset;
    
    return result;
  }, [data, itemHeight, containerHeight, scrollOffset]);
  
  const handleScroll = useThrottle((offset: number) => {
    if (typeof offset !== 'number' || offset < 0) return;
    setScrollOffset(offset);
  }, 16); // 60fps
  
  return {
    visibleItems: visibleRange.visibleItems,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    handleScroll,
    totalHeight: data.length * itemHeight
  };
}

// Advanced Performance Monitor for Provider Loading Bottlenecks
export class ProviderPerformanceMonitor {
  private static instance: ProviderPerformanceMonitor;
  private providerLoadTimes: Map<string, number> = new Map();
  private providerInitTimes: Map<string, number> = new Map();
  private bottlenecks: Map<string, { count: number; totalTime: number }> = new Map();
  private operationTimes: Map<string, number[]> = new Map();

  static getInstance(): ProviderPerformanceMonitor {
    if (!ProviderPerformanceMonitor.instance) {
      ProviderPerformanceMonitor.instance = new ProviderPerformanceMonitor();
    }
    return ProviderPerformanceMonitor.instance;
  }

  trackProviderInit(providerName: string): () => void {
    const startTime = Date.now();
    this.providerInitTimes.set(providerName, startTime);
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.providerLoadTimes.set(providerName, duration);
      
      if (duration > 500) {
        console.warn(`🐌 Provider bottleneck: ${providerName} took ${duration}ms to initialize`);
        const bottleneck = this.bottlenecks.get(providerName) || { count: 0, totalTime: 0 };
        bottleneck.count++;
        bottleneck.totalTime += duration;
        this.bottlenecks.set(providerName, bottleneck);
      }
      
      console.log(`✅ Provider ${providerName} initialized in ${duration}ms`);
    };
  }

  trackOperation(operationName: string, duration: number): void {
    const existing = this.operationTimes.get(operationName) || [];
    existing.push(duration);
    this.operationTimes.set(operationName, existing);
    
    if (duration > 200) {
      console.warn(`⚠️ Slow operation: ${operationName} took ${duration}ms`);
    }
  }

  getBottlenecks(): Record<string, { count: number; avgTime: number; totalTime: number }> {
    const result: Record<string, { count: number; avgTime: number; totalTime: number }> = {};
    for (const [key, value] of this.bottlenecks) {
      result[key] = {
        ...value,
        avgTime: value.totalTime / value.count,
      };
    }
    return result;
  }

  getProviderLoadTimes(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.providerLoadTimes) {
      result[key] = value;
    }
    return result;
  }

  generateReport(): void {
    console.group('🚀 Provider Performance Report');
    
    const loadTimes = this.getProviderLoadTimes();
    const bottlenecks = this.getBottlenecks();
    
    console.log('Provider Load Times:', loadTimes);
    console.log('Bottlenecks:', bottlenecks);
    
    // Identify the slowest providers
    const slowProviders = Object.entries(loadTimes)
      .filter(([, time]) => time > 300)
      .sort(([, a], [, b]) => b - a);
    
    if (slowProviders.length > 0) {
      console.warn('Slowest Providers:', slowProviders);
    }
    
    console.groupEnd();
  }

  clear(): void {
    this.providerLoadTimes.clear();
    this.providerInitTimes.clear();
    this.bottlenecks.clear();
    this.operationTimes.clear();
  }
}

// Hook for tracking provider performance
export function useProviderPerformanceTracking(providerName: string) {
  const monitor = ProviderPerformanceMonitor.getInstance();
  const endTracking = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    endTracking.current = monitor.trackProviderInit(providerName);
    
    return () => {
      if (endTracking.current) {
        endTracking.current();
      }
    };
  }, [providerName, monitor]);
  
  const trackOperation = useCallback((operationName: string, operation: () => Promise<any>) => {
    const startTime = Date.now();
    
    return operation().finally(() => {
      const duration = Date.now() - startTime;
      monitor.trackOperation(`${providerName}_${operationName}`, duration);
    });
  }, [providerName, monitor]);
  
  return { trackOperation };
}

// Hook for detecting and reporting bottlenecks
export function useBottleneckDetector(reportInterval: number = 10000) {
  const monitor = ProviderPerformanceMonitor.getInstance();
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      monitor.generateReport();
    }, reportInterval);
    
    return () => clearInterval(intervalId);
  }, [monitor, reportInterval]);
  
  return {
    getBottlenecks: () => monitor.getBottlenecks(),
    getProviderTimes: () => monitor.getProviderLoadTimes(),
    clearMetrics: () => monitor.clear(),
  };
}

// Calendar-specific performance optimizations
export function useCalendarPerformance<T>(
  data: T[],
  selectedStatuses: string[],
  selectedDate?: string
) {
  const dataHashRef = useRef<string>('');
  const cacheRef = useRef<Map<string, any>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Memoize data hash for change detection
  const dataHash = useMemo(() => {
    return JSON.stringify({
      dataLength: data.length,
      selectedStatuses: selectedStatuses.sort(),
      selectedDate,
      dataIds: data.slice(0, 10).map((item: any) => item?.id || '').join(',')
    });
  }, [data, selectedStatuses, selectedDate]);
  
  // Check if data actually changed
  const hasDataChanged = useMemo(() => {
    const changed = dataHash !== dataHashRef.current;
    if (changed) {
      dataHashRef.current = dataHash;
      console.log('Calendar data changed, invalidating cache');
    }
    return changed;
  }, [dataHash]);
  
  // Cached computation with automatic cleanup
  const getCachedResult = useCallback(<R>(key: string, computeFn: () => R): R => {
    if (!hasDataChanged && cacheRef.current.has(key)) {
      console.log(`Using cached result for: ${key}`);
      return cacheRef.current.get(key);
    }
    
    setIsProcessing(true);
    const result = computeFn();
    cacheRef.current.set(key, result);
    setIsProcessing(false);
    
    // Clean old cache entries
    if (cacheRef.current.size > 20) {
      const iterator = cacheRef.current.keys();
      const firstKey = iterator.next().value;
      if (typeof firstKey === 'string') {
        cacheRef.current.delete(firstKey);
      }
    }
    
    console.log(`Computed and cached result for: ${key}`);
    return result;
  }, [hasDataChanged]);
  
  // Batch operations for better performance
  const batchProcess = useCallback(<R>(
    items: T[],
    processor: (batch: T[]) => R[],
    batchSize: number = 50
  ): R[] => {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = processor(batch);
      results.push(...batchResults);
      
      // Yield control to prevent blocking
      if (i % (batchSize * 4) === 0) {
        setTimeout(() => {}, 0);
      }
    }
    
    return results;
  }, []);
  
  return {
    getCachedResult,
    batchProcess,
    isProcessing,
    hasDataChanged,
    clearCache: () => cacheRef.current.clear()
  };
}

// Hook for optimizing appointment filtering
export function useAppointmentFiltering<T extends { date: string; status: string }>(
  appointments: T[],
  selectedStatuses: string[],
  selectedDate?: string
) {
  const { getCachedResult } = useCalendarPerformance(appointments, selectedStatuses, selectedDate || '');
  
  // Optimized filtering with caching
  const filteredAppointments = useMemo(() => {
    return getCachedResult('filtered', () => {
      console.log('Filtering appointments:', appointments.length, 'items');
      return appointments.filter(apt => selectedStatuses.includes(apt.status));
    });
  }, [appointments, selectedStatuses, getCachedResult]);
  
  // Optimized date grouping
  const appointmentsByDate = useMemo(() => {
    return getCachedResult('byDate', () => {
      console.log('Grouping appointments by date');
      const grouped = new Map<string, T[]>();
      
      for (const apt of filteredAppointments) {
        const existing = grouped.get(apt.date);
        if (existing) {
          existing.push(apt);
        } else {
          grouped.set(apt.date, [apt]);
        }
      }
      
      return grouped;
    });
  }, [filteredAppointments, getCachedResult]);
  
  // Selected date appointments
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return appointmentsByDate.get(selectedDate) || [];
  }, [appointmentsByDate, selectedDate]);
  
  return {
    filteredAppointments,
    appointmentsByDate,
    selectedDateAppointments
  };
}

// Hook for calendar marked dates optimization
export function useCalendarMarkedDates<T extends { date: string; color: string }>(
  appointmentsByDate: Map<string, T[]>,
  selectedDate?: string
) {
  const { getCachedResult } = useCalendarPerformance(
    Array.from(appointmentsByDate.entries()),
    [],
    selectedDate || ''
  );
  
  return useMemo(() => {
    return getCachedResult('markedDates', () => {
      console.log('Computing marked dates for calendar');
      const marked: { [key: string]: any } = {};
      
      // Process appointments by date
      for (const [date, dayAppointments] of appointmentsByDate) {
        const dots = dayAppointments.slice(0, 3).map(apt => ({
          color: apt.color,
          selectedDotColor: apt.color,
        }));
        
        marked[date] = {
          dots,
          selected: date === selectedDate,
          selectedColor: date === selectedDate ? '#2196F3' : undefined,
        };
      }
      
      // Mark selected date even if no appointments
      if (selectedDate && !marked[selectedDate]) {
        marked[selectedDate] = {
          selected: true,
          selectedColor: '#2196F3',
        };
      }
      
      return marked;
    });
  }, [appointmentsByDate, selectedDate, getCachedResult]);
}

// One-time effect hooks to prevent infinite re-renders
import { DependencyList } from 'react';

type CleanupFunction = void | (() => void);
type EffectCallback = () => CleanupFunction | Promise<CleanupFunction>;

export function useOneTimeEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  const hasExecutedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }

    hasExecutedRef.current = true;

    const executeEffect = async () => {
      try {
        const cleanup = await effect();
        
        if (isMountedRef.current && cleanup && typeof cleanup === 'function') {
          cleanupRef.current = cleanup;
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[useOneTimeEffect] Error executing effect:', error);
        }
      }
    };

    executeEffect();
  }, deps);
}

export function useOneTimeAsyncEffect(
  effect: () => Promise<void>,
  onError?: (error: Error) => void
): void {
  const hasExecutedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }

    hasExecutedRef.current = true;

    const executeEffect = async () => {
      try {
        await effect();
      } catch (error) {
        if (isMountedRef.current) {
          if (__DEV__) {
            console.error('[useOneTimeAsyncEffect] Error:', error);
          }
          if (onError && error instanceof Error) {
            onError(error);
          }
        }
      }
    };

    executeEffect();
  }, []);
}

export function useDelayedOneTimeEffect(
  effect: EffectCallback,
  delayMs: number = 0
): void {
  const hasExecutedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }

    hasExecutedRef.current = true;

    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      try {
        const cleanup = await effect();
        
        if (isMountedRef.current && cleanup && typeof cleanup === 'function') {
          cleanupRef.current = cleanup;
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[useDelayedOneTimeEffect] Error:', error);
        }
      }
    }, delayMs);
  }, [delayMs]);
}

export function useConditionalOneTimeEffect(
  effect: EffectCallback,
  condition: boolean,
  deps?: DependencyList
): void {
  const hasExecutedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hasExecutedRef.current || !condition) {
      return;
    }

    hasExecutedRef.current = true;

    const executeEffect = async () => {
      try {
        const cleanup = await effect();
        
        if (isMountedRef.current && cleanup && typeof cleanup === 'function') {
          cleanupRef.current = cleanup;
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[useConditionalOneTimeEffect] Error:', error);
        }
      }
    };

    executeEffect();
  }, [condition, ...(deps || [])]);
}

export function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  return operation()
    .then(result => {
      const duration = Date.now() - start;
      if (__DEV__) {
        console.log(`[Performance] ${name}: ${duration}ms`);
      }
      return result;
    })
    .catch(error => {
      const duration = Date.now() - start;
      if (__DEV__) {
        console.error(`[Performance] ${name} failed after ${duration}ms:`, error);
      }
      throw error;
    });
}