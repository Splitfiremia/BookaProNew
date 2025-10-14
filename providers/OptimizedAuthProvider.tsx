import { useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from './AuthProvider';
import { UserRole } from '@/models/database';

// Performance-optimized auth provider that minimizes re-renders
export const [OptimizedAuthProvider, useOptimizedAuth] = createContextHook(() => {
  console.log('OptimizedAuthProvider: Initializing optimized auth context');
  
  const auth = useAuth();
  
  // Memoize user role to prevent unnecessary re-renders
  const userRole = useMemo<UserRole | null>(() => {
    return auth.user?.role || null;
  }, [auth.user?.role]);
  
  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo<string | null>(() => {
    return auth.user?.id || null;
  }, [auth.user?.id]);
  
  // Memoize authentication status
  const isAuthenticated = useMemo(() => {
    return auth.isAuthenticated;
  }, [auth.isAuthenticated]);
  
  // Memoize loading state
  const isLoading = useMemo(() => {
    return auth.isLoading;
  }, [auth.isLoading]);
  
  // Memoize initialization state
  const isInitialized = useMemo(() => {
    return auth.isInitialized;
  }, [auth.isInitialized]);
  
  // Memoize user data (only essential fields)
  const userData = useMemo(() => {
    if (!auth.user) return null;
    
    return {
      id: auth.user.id,
      email: auth.user.email,
      name: auth.user.name,
      role: auth.user.role,
      profileImage: auth.user.profileImage,
      phone: auth.user.phone,
    };
  }, [auth.user]);
  
  // Memoize login function to prevent re-renders
  const login = useCallback(async (email: string, password: string) => {
    console.log('OptimizedAuthProvider: Performing optimized login');
    return auth.login(email, password);
  }, [auth.login]);
  
  // Memoize logout function to prevent re-renders
  const logout = useCallback(async () => {
    console.log('OptimizedAuthProvider: Performing optimized logout');
    return auth.logout();
  }, [auth.logout]);
  
  // Memoize register function to prevent re-renders
  const register = useCallback(async (userData: any) => {
    console.log('OptimizedAuthProvider: Performing optimized registration');
    return auth.register(userData);
  }, [auth.register]);
  
  // Memoize update profile function to prevent re-renders
  const updateProfile = useCallback(async (updates: any) => {
    console.log('OptimizedAuthProvider: Performing optimized profile update');
    return auth.updateProfile(updates);
  }, [auth.updateProfile]);
  
  // Return memoized context value
  return useMemo(() => ({
    // Essential user data
    user: userData,
    userRole,
    userId,
    
    // Authentication state
    isAuthenticated,
    isLoading,
    isInitialized,
    
    // Developer mode (less frequently used)
    isDeveloperMode: auth.isDeveloperMode,
    setDeveloperMode: auth.setDeveloperMode,
    checkDeveloperMode: auth.checkDeveloperMode,
    
    // Authentication actions
    login,
    logout,
    register,
    updateProfile,
  }), [
    userData,
    userRole,
    userId,
    isAuthenticated,
    isLoading,
    isInitialized,
    auth.isDeveloperMode,
    auth.setDeveloperMode,
    auth.checkDeveloperMode,
    login,
    logout,
    register,
    updateProfile,
  ]);
});