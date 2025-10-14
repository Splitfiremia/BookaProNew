import React, { Suspense, lazy, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import { UserRole } from '@/models/database';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load dashboard layout components instead of individual pages
const ClientLayout = lazy(() => import('@/app/(app)/(client)/_layout'));
const ProviderLayout = lazy(() => import('@/app/(app)/(provider)/_layout'));
const ShopOwnerLayout = lazy(() => import('@/app/(app)/(shop-owner)/_layout'));

interface LazyDashboardProps {
  userRole: UserRole;
  userId: string;
}

// Optimized loading fallback
function DashboardLoadingFallback({ userRole }: { userRole: UserRole }) {
  const [loadingText, setLoadingText] = useState('Loading dashboard...');
  
  useEffect(() => {
    const messages = [
      'Loading dashboard...',
      'Preparing your workspace...',
      'Almost ready...'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingText(messages[index]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>{loadingText}</Text>
      <Text style={styles.loadingSubtext}>
        Setting up your {userRole} dashboard
      </Text>
    </View>
  );
}

// Error fallback component
function DashboardErrorFallback({ userRole, onRetry }: { userRole: UserRole; onRetry: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Failed to load dashboard</Text>
      <Text style={styles.errorText}>
        Unable to load the {userRole} dashboard. Please try again.
      </Text>
    </View>
  );
}

export default function LazyDashboard({ userRole, userId }: LazyDashboardProps) {
  console.log(`LazyDashboard: Loading ${userRole} dashboard for user ${userId}`);
  
  const [retryKey, setRetryKey] = useState(0);
  
  const handleRetry = () => {
    console.log('LazyDashboard: Retrying dashboard load');
    setRetryKey(prev => prev + 1);
  };
  
  // Select the appropriate dashboard layout
  const getDashboardComponent = () => {
    switch (userRole) {
      case 'client':
        return <ClientLayout />;
      case 'provider':
        return <ProviderLayout />;
      case 'owner':
        return <ShopOwnerLayout />;
      default:
        console.error('LazyDashboard: Unknown user role:', userRole);
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Unknown user role</Text>
            <Text style={styles.errorText}>
              Unable to determine dashboard type for role: {userRole}
            </Text>
          </View>
        );
    }
  };
  
  return (
    <Suspense 
      key={retryKey}
      fallback={<DashboardLoadingFallback userRole={userRole} />}
    >
      <ErrorBoundary
        fallback={<DashboardErrorFallback userRole={userRole} onRetry={handleRetry} />}
        level="critical"
        onError={(error, errorInfo) => {
          console.error('LazyDashboard ErrorBoundary:', error, errorInfo);
        }}
      >
        {getDashboardComponent()}
      </ErrorBoundary>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
});