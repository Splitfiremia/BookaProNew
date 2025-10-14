import { router } from 'expo-router';

/**
 * Handles navigation after successful logout
 * Ensures consistent behavior across all screens with proper error handling
 */
export const handlePostLogoutNavigation = async (): Promise<void> => {
  try {
    console.log('🚀 Navigation: Starting post-logout navigation sequence');
    
    // First, try to dismiss all modals and overlays
    try {
      router.dismissAll();
      console.log('✅ Navigation: All modals dismissed');
    } catch (dismissError) {
      console.warn('⚠️ Navigation: Could not dismiss all modals, continuing...', dismissError);
    }
    
    // Add a small delay to ensure navigation stack operations complete
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Navigate to the root/auth screen with replacement to clear history
    console.log('🔄 Navigation: Redirecting to auth screen');
    router.replace('/(auth)');
    
    console.log('✅ Navigation: Post-logout navigation completed successfully');
    
  } catch (error) {
    console.error('❌ Navigation: Critical post-logout navigation error:', error);
    
    // Multi-level fallback strategy
    try {
      console.log('🔄 Navigation: Attempting primary fallback...');
      router.replace('/');
    } catch (primaryFallbackError) {
      console.error('❌ Navigation: Primary fallback failed:', primaryFallbackError);
      
      try {
        console.log('🔄 Navigation: Attempting emergency fallback...');
        // Last resort - navigate without replacement
        router.navigate('/');
      } catch (emergencyError) {
        console.error('❌ Navigation: All navigation fallbacks failed:', emergencyError);
        throw new Error('COMPLETE_NAVIGATION_FAILURE');
      }
    }
  }
};

/**
 * Comprehensive sign out process with proper error handling and state management
 * @param logout - The logout function from AuthProvider
 * @param options - Additional options for sign out behavior
 * @returns Promise with success status and detailed error information
 */
export const performSignOut = async (
  logout: () => Promise<{ success: boolean; error?: string }>,
  options?: {
    /**
     * Whether to skip navigation (useful for testing or specific flows)
     * @default false
     */
    skipNavigation?: boolean;
    
    /**
     * Custom navigation target after logout
     * @default '/(auth)'
     */
    redirectTo?: string;
    
    /**
     * Whether to clear all navigation state
     * @default true
     */
    clearNavigationStack?: boolean;
  }
): Promise<{ 
  success: boolean; 
  error?: string;
  details?: {
    logoutSuccessful: boolean;
    navigationSuccessful?: boolean;
    timestamp: string;
  }
}> => {
  const startTime = Date.now();
  const config = {
    skipNavigation: options?.skipNavigation ?? false,
    redirectTo: options?.redirectTo ?? '/(auth)',
    clearNavigationStack: options?.clearNavigationStack ?? true,
  };
  
  try {
    console.log('🚀 SignOut: Starting comprehensive sign out process', { config });
    
    // Step 1: Perform authentication logout
    console.log('🔐 SignOut: Executing authentication logout...');
    const logoutResult = await logout();
    
    if (!logoutResult.success) {
      console.error('❌ SignOut: Authentication logout failed:', logoutResult.error);
      return {
        success: false,
        error: `Authentication failed: ${logoutResult.error}`,
        details: {
          logoutSuccessful: false,
          timestamp: new Date().toISOString(),
        }
      };
    }
    
    console.log('✅ SignOut: Authentication logout successful');
    
    // Step 2: Handle navigation if not skipped
    let navigationSuccessful = false;
    if (!config.skipNavigation) {
      try {
        console.log('🧭 SignOut: Starting post-logout navigation...');
        await handlePostLogoutNavigation();
        navigationSuccessful = true;
        console.log('✅ SignOut: Post-logout navigation completed');
      } catch (navigationError) {
        console.error('❌ SignOut: Navigation after logout failed:', navigationError);
        // We still consider this a partial success since auth logout worked
        return {
          success: false,
          error: `Logout successful but navigation failed: ${navigationError}`,
          details: {
            logoutSuccessful: true,
            navigationSuccessful: false,
            timestamp: new Date().toISOString(),
          }
        };
      }
    } else {
      console.log('⏭️ SignOut: Navigation skipped as requested');
      navigationSuccessful = true; // Consider navigation "successful" when skipped
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ SignOut: Complete sign out process finished in ${duration}ms`);
    
    return {
      success: true,
      details: {
        logoutSuccessful: true,
        navigationSuccessful,
        timestamp: new Date().toISOString(),
      }
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ SignOut: Unexpected error during sign out process (${duration}ms):`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown sign out error';
    
    return {
      success: false,
      error: `Unexpected error: ${errorMessage}`,
      details: {
        logoutSuccessful: false,
        timestamp: new Date().toISOString(),
      }
    };
  }
};

/**
 * Emergency sign out function for use when the main function fails
 * This provides a last-resort cleanup mechanism
 */
export const emergencySignOut = async (): Promise<void> => {
  console.warn('🚨 SignOut: Executing emergency sign out procedure');
  
  try {
    // Clear any stored authentication data directly
    if (typeof localStorage !== 'undefined') {
      const authKeys = ['auth_token', 'user_data', 'session_data'];
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Silent fail for storage cleanup
        }
      });
    }
    
    // Force navigation to auth screen
    await new Promise(resolve => setTimeout(resolve, 200));
    router.replace('/(auth)');
    
    console.log('✅ Emergency SignOut: Emergency procedure completed');
  } catch (error) {
    console.error('❌ Emergency SignOut: Emergency procedure failed:', error);
    // At this point, we've done all we can
    throw error;
  }
};

/**
 * Validates if the current navigation state is appropriate for post-logout
 * Useful for debugging navigation issues
 */
export const validateNavigationState = (): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check if router is available
  if (!router) {
    issues.push('Router instance is not available');
  }
  
  // Check if we're in a reasonable state for navigation
  try {
    // This is a basic check - in a real app you might have more specific validations
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    if (currentPath.includes('deep-link')) {
      issues.push('Currently in deep link, may need special handling');
    }
  } catch (error) {
    issues.push('Cannot access current navigation state');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};