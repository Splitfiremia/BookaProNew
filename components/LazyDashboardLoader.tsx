import React, { Suspense, lazy, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load dashboard components based on user role
const ClientDashboard = lazy(() => 
  import('../app/(app)/(client)/(tabs)/_layout').then(module => ({ 
    default: module.default 
  }))
);

const ProviderDashboard = lazy(() => 
  import('../app/(app)/(provider)/(tabs)/_layout').then(module => ({ 
    default: module.default 
  }))
);

const ShopOwnerDashboard = lazy(() => 
  import('../app/(app)/(shop-owner)/(tabs)/_layout').then(module => ({ 
    default: module.default 
  }))
);

// Lazy load individual tab components
const ClientHome = lazy(() => import('../app/(app)/(client)/(tabs)/home'));
const ClientAppointments = lazy(() => import('../app/(app)/(client)/(tabs)/appointments'));
const ClientProfile = lazy(() => import('../app/(app)/(client)/(tabs)/profile'));

const ProviderHome = lazy(() => import('../app/(app)/(provider)/(tabs)/home'));
const ProviderSchedule = lazy(() => import('../app/(app)/(provider)/(tabs)/schedule'));
const ProviderEarnings = lazy(() => import('../app/(app)/(provider)/(tabs)/earnings'));
const ProviderClients = lazy(() => import('../app/(app)/(provider)/(tabs)/clients'));

const ShopOwnerDashboardTab = lazy(() => import('../app/(app)/(shop-owner)/(tabs)/dashboard'));
const ShopOwnerTeam = lazy(() => import('../app/(app)/(shop-owner)/(tabs)/team'));
const ShopOwnerCalendar = lazy(() => import('../app/(app)/(shop-owner)/(tabs)/calendar'));
const ShopOwnerAnalytics = lazy(() => import('../app/(app)/(shop-owner)/(tabs)/analytics'));

// Loading components with different priorities
function HighPriorityLoader() {
  return (
    <View style={styles.highPriorityLoader}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loaderText}>Loading dashboard...</Text>
    </View>
  );
}

function MediumPriorityLoader() {
  return (
    <View style={styles.mediumPriorityLoader}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={styles.smallLoaderText}>Loading...</Text>
    </View>
  );
}

function LowPriorityLoader() {
  return (
    <View style={styles.lowPriorityLoader}>
      <Text style={styles.smallLoaderText}>Loading feature...</Text>
    </View>
  );
}

// Error boundaries for different component levels
function DashboardErrorFallback({ error }: { error?: Error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Dashboard Unavailable</Text>
      <Text style={styles.errorText}>
        {error?.message || 'Unable to load dashboard. Please try again.'}
      </Text>
    </View>
  );
}

function TabErrorFallback({ tabName }: { tabName: string }) {
  return (
    <View style={styles.tabErrorContainer}>
      <Text style={styles.tabErrorText}>{tabName} temporarily unavailable</Text>
    </View>
  );
}

// Optimized component wrappers
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
}

function LazyComponentWrapper({ 
  children, 
  fallback, 
  errorFallback,
  priority = 'medium' 
}: LazyComponentWrapperProps) {
  const defaultFallback = useMemo(() => {
    switch (priority) {
      case 'high':
        return <HighPriorityLoader />;
      case 'medium':
        return <MediumPriorityLoader />;
      case 'low':
        return <LowPriorityLoader />;
      default:
        return <MediumPriorityLoader />;
    }
  }, [priority]);

  return (
    <ErrorBoundary 
      fallback={errorFallback || <DashboardErrorFallback />}
      level={priority === 'high' ? 'critical' : 'warning'}
      resetOnPropsChange={true}
    >
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Role-based dashboard loader
interface RoleDashboardLoaderProps {
  userRole: string;
  children?: React.ReactNode;
}

export function RoleDashboardLoader({ userRole, children }: RoleDashboardLoaderProps) {
  const DashboardComponent = useMemo(() => {
    switch (userRole) {
      case 'client':
        return ClientDashboard;
      case 'provider':
        return ProviderDashboard;
      case 'owner':
        return ShopOwnerDashboard;
      default:
        return null;
    }
  }, [userRole]);

  if (!DashboardComponent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unknown user role: {userRole}</Text>
      </View>
    );
  }

  return (
    <LazyComponentWrapper 
      priority="high"
      errorFallback={<DashboardErrorFallback />}
    >
      <DashboardComponent />
      {children}
    </LazyComponentWrapper>
  );
}

// Individual tab loaders for progressive loading
export const LazyClientHome = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="high">
    <ClientHome />
    {children}
  </LazyComponentWrapper>
);

export const LazyClientAppointments = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="medium">
    <ClientAppointments />
    {children}
  </LazyComponentWrapper>
);

export const LazyClientProfile = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="low">
    <ClientProfile />
    {children}
  </LazyComponentWrapper>
);

export const LazyProviderHome = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="high">
    <ProviderHome />
    {children}
  </LazyComponentWrapper>
);

export const LazyProviderSchedule = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="high">
    <ProviderSchedule />
    {children}
  </LazyComponentWrapper>
);

export const LazyProviderEarnings = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="medium">
    <ProviderEarnings />
    {children}
  </LazyComponentWrapper>
);

export const LazyProviderClients = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="medium">
    <ProviderClients />
    {children}
  </LazyComponentWrapper>
);

export const LazyShopOwnerDashboard = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="high">
    <ShopOwnerDashboardTab />
    {children}
  </LazyComponentWrapper>
);

export const LazyShopOwnerTeam = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="medium">
    <ShopOwnerTeam />
    {children}
  </LazyComponentWrapper>
);

export const LazyShopOwnerCalendar = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="high">
    <ShopOwnerCalendar />
    {children}
  </LazyComponentWrapper>
);

export const LazyShopOwnerAnalytics = ({ children }: { children?: React.ReactNode }) => (
  <LazyComponentWrapper priority="low">
    <ShopOwnerAnalytics />
    {children}
  </LazyComponentWrapper>
);

const styles = StyleSheet.create({
  highPriorityLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  mediumPriorityLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 10,
  },
  lowPriorityLoader: {
    padding: 8,
    backgroundColor: COLORS.glass.background,
    borderRadius: 6,
    margin: 4,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  smallLoaderText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.lightGray,
    fontWeight: '400',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    lineHeight: 20,
  },
  tabErrorContainer: {
    padding: 16,
    backgroundColor: COLORS.glass.background,
    borderRadius: 8,
    margin: 8,
    alignItems: 'center',
  },
  tabErrorText: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
  },
});