import createContextHookOriginal from '@nkzw/create-context-hook';

// Re-export the original function with a wrapper to ensure it's working correctly
export default function createContextHook<T>(
  contextInitializer: () => T,
  defaultValue?: T,
) {
  return createContextHookOriginal(contextInitializer, defaultValue);
}