# One-Time Effect Hooks

## Overview

Custom hooks designed to prevent infinite re-renders in React components by ensuring effects execute only once, even when dependencies change or components re-render.

## Problem Solved

Standard `useEffect` with empty dependency arrays can still cause issues:
- Multiple executions during strict mode
- Re-renders triggering effect re-execution
- Async operations causing state updates after unmount
- Infinite loops from setState in effects

## Available Hooks

### 1. `useOneTimeEffect`

Basic one-time effect with optional dependencies and cleanup support.

```typescript
useOneTimeEffect(
  effect: () => void | (() => void) | Promise<void | (() => void)>,
  deps?: DependencyList
): void
```

**Features:**
- Executes only once regardless of re-renders
- Supports sync and async effects
- Handles cleanup functions
- Tracks mount state to prevent memory leaks
- Optional dependency array (for conditional execution)

**Example:**
```typescript
import { useOneTimeEffect } from '@/utils/performanceUtils';

function MyComponent() {
  useOneTimeEffect(() => {
    console.log('This runs only once');
    
    // Optional cleanup
    return () => {
      console.log('Cleanup on unmount');
    };
  });
  
  return <View>...</View>;
}
```

### 2. `useOneTimeAsyncEffect`

Specialized for async operations with error handling.

```typescript
useOneTimeAsyncEffect(
  effect: () => Promise<void>,
  onError?: (error: Error) => void
): void
```

**Features:**
- Designed for async operations
- Built-in error handling
- No cleanup support (use `useOneTimeEffect` if needed)
- Prevents execution after unmount

**Example:**
```typescript
import { useOneTimeAsyncEffect } from '@/utils/performanceUtils';

function DataLoader() {
  const [data, setData] = useState(null);
  
  useOneTimeAsyncEffect(
    async () => {
      const result = await fetchData();
      setData(result);
    },
    (error) => {
      console.error('Failed to load data:', error);
    }
  );
  
  return <View>{data && <Text>{data}</Text>}</View>;
}
```

### 3. `useDelayedOneTimeEffect`

One-time effect with configurable delay.

```typescript
useDelayedOneTimeEffect(
  effect: () => void | (() => void) | Promise<void | (() => void)>,
  delayMs: number = 0
): void
```

**Features:**
- Delays execution by specified milliseconds
- Perfect for non-critical initialization
- Prevents blocking initial render
- Automatic timeout cleanup on unmount

**Example:**
```typescript
import { useDelayedOneTimeEffect } from '@/utils/performanceUtils';

function PerformanceMonitor() {
  useDelayedOneTimeEffect(() => {
    // Preload cache after 2 seconds
    performanceCache.preload('app', 'init', async () => {
      return { initialized: true };
    });
  }, 2000);
  
  return <View>...</View>;
}
```

### 4. `useConditionalOneTimeEffect`

One-time effect that waits for a condition to be true.

```typescript
useConditionalOneTimeEffect(
  effect: () => void | (() => void) | Promise<void | (() => void)>,
  condition: boolean,
  deps?: DependencyList
): void
```

**Features:**
- Executes only when condition becomes true
- Still executes only once even if condition toggles
- Supports cleanup functions
- Optional additional dependencies

**Example:**
```typescript
import { useConditionalOneTimeEffect } from '@/utils/performanceUtils';

function AuthenticatedComponent() {
  const { user, isLoading } = useAuth();
  
  useConditionalOneTimeEffect(
    () => {
      // Initialize user-specific data
      initializeUserData(user.id);
    },
    !isLoading && user !== null
  );
  
  return <View>...</View>;
}
```

## Implementation Details

### Execution Tracking

All hooks use `useRef` to track execution state:

```typescript
const hasExecutedRef = useRef(false);

useEffect(() => {
  if (hasExecutedRef.current) {
    return; // Skip if already executed
  }
  
  hasExecutedRef.current = true;
  // Execute effect
}, deps);
```

### Mount State Tracking

Prevents state updates after unmount:

```typescript
const isMountedRef = useRef(true);

useEffect(() => {
  isMountedRef.current = true;
  
  return () => {
    isMountedRef.current = false;
  };
}, []);
```

### Cleanup Management

Stores cleanup functions for proper disposal:

```typescript
const cleanupRef = useRef<(() => void) | null>(null);

// Store cleanup
if (cleanup && typeof cleanup === 'function') {
  cleanupRef.current = cleanup;
}

// Execute on unmount
return () => {
  if (cleanupRef.current) {
    cleanupRef.current();
  }
};
```

## Use Cases

### Provider Initialization

```typescript
const CoreProviders = React.memo(({ children }) => {
  useDelayedOneTimeEffect(() => {
    measureAsyncOperation('core_providers_init', async () => {
      await performanceCache.preload('app', 'init', async () => {
        return { initialized: true };
      });
    });
  }, 2000);
  
  return <QueryClientProvider>...</QueryClientProvider>;
});
```

### Analytics Tracking

```typescript
function AnalyticsProvider({ children }) {
  useOneTimeEffect(() => {
    analytics.initialize();
    
    return () => {
      analytics.cleanup();
    };
  });
  
  return children;
}
```

### Feature Flags

```typescript
function FeatureFlagLoader() {
  const [flags, setFlags] = useState({});
  
  useOneTimeAsyncEffect(
    async () => {
      const loadedFlags = await fetchFeatureFlags();
      setFlags(loadedFlags);
    },
    (error) => {
      console.error('Failed to load feature flags:', error);
      setFlags(DEFAULT_FLAGS);
    }
  );
  
  return <FeatureFlagContext.Provider value={flags}>...</FeatureFlagContext.Provider>;
}
```

### Delayed Preloading

```typescript
function AppInitializer() {
  useDelayedOneTimeEffect(() => {
    // Preload images after 3 seconds
    preloadImages([
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ]);
  }, 3000);
  
  return null;
}
```

## Best Practices

### 1. Choose the Right Hook

- **`useOneTimeEffect`**: General purpose, supports cleanup
- **`useOneTimeAsyncEffect`**: Async operations with error handling
- **`useDelayedOneTimeEffect`**: Non-critical initialization
- **`useConditionalOneTimeEffect`**: Wait for specific conditions

### 2. Avoid in Render Logic

```typescript
// ❌ Bad
function MyComponent() {
  const data = useOneTimeEffect(() => fetchData()); // Wrong usage
  return <View>{data}</View>;
}

// ✅ Good
function MyComponent() {
  const [data, setData] = useState(null);
  
  useOneTimeAsyncEffect(async () => {
    const result = await fetchData();
    setData(result);
  });
  
  return <View>{data && <Text>{data}</Text>}</View>;
}
```

### 3. Handle Errors Properly

```typescript
// ✅ Good
useOneTimeAsyncEffect(
  async () => {
    await riskyOperation();
  },
  (error) => {
    // Handle error appropriately
    showErrorToast(error.message);
  }
);
```

### 4. Use Delays for Non-Critical Work

```typescript
// ✅ Good - Don't block initial render
useDelayedOneTimeEffect(() => {
  preloadNonCriticalData();
}, 2000);
```

### 5. Cleanup Resources

```typescript
// ✅ Good
useOneTimeEffect(() => {
  const subscription = subscribeToUpdates();
  
  return () => {
    subscription.unsubscribe();
  };
});
```

## Common Pitfalls

### 1. Using Dependencies Incorrectly

```typescript
// ❌ Bad - Dependencies defeat the purpose
useOneTimeEffect(() => {
  console.log(value);
}, [value]); // Will re-execute when value changes

// ✅ Good - No dependencies for true one-time execution
useOneTimeEffect(() => {
  console.log('Only once');
});
```

### 2. Expecting Return Values

```typescript
// ❌ Bad - Effects don't return values
const data = useOneTimeEffect(() => fetchData());

// ✅ Good - Use state
const [data, setData] = useState(null);
useOneTimeAsyncEffect(async () => {
  const result = await fetchData();
  setData(result);
});
```

### 3. Forgetting Error Handling

```typescript
// ❌ Bad - Unhandled errors
useOneTimeAsyncEffect(async () => {
  await riskyOperation();
});

// ✅ Good - Handle errors
useOneTimeAsyncEffect(
  async () => {
    await riskyOperation();
  },
  (error) => {
    console.error('Operation failed:', error);
  }
);
```

## Performance Benefits

1. **Prevents Infinite Loops**: No more "Maximum update depth exceeded" errors
2. **Reduces Re-renders**: Effects don't trigger unnecessary re-renders
3. **Optimizes Startup**: Delayed effects don't block initial render
4. **Memory Safety**: Proper cleanup prevents memory leaks
5. **Predictable Behavior**: Effects execute exactly once

## Testing

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useOneTimeEffect } from '@/utils/performanceUtils';

describe('useOneTimeEffect', () => {
  it('executes effect only once', () => {
    const effect = jest.fn();
    const { rerender } = renderHook(() => useOneTimeEffect(effect));
    
    expect(effect).toHaveBeenCalledTimes(1);
    
    rerender();
    rerender();
    
    expect(effect).toHaveBeenCalledTimes(1);
  });
  
  it('calls cleanup on unmount', () => {
    const cleanup = jest.fn();
    const effect = jest.fn(() => cleanup);
    
    const { unmount } = renderHook(() => useOneTimeEffect(effect));
    
    unmount();
    
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
```

## Migration Guide

### From Standard useEffect

```typescript
// Before
useEffect(() => {
  const hasRun = useRef(false);
  
  if (hasRun.current) return;
  hasRun.current = true;
  
  initialize();
}, []);

// After
useOneTimeEffect(() => {
  initialize();
});
```

### From Manual Tracking

```typescript
// Before
const [initialized, setInitialized] = useState(false);

useEffect(() => {
  if (initialized) return;
  
  initialize();
  setInitialized(true);
}, [initialized]);

// After
useOneTimeEffect(() => {
  initialize();
});
```

## Conclusion

These hooks provide a robust solution for one-time initialization effects in React Native applications. They prevent common pitfalls like infinite re-renders while maintaining clean, readable code.

Use them in providers, analytics, feature flags, and any scenario where you need guaranteed one-time execution with proper cleanup and error handling.
