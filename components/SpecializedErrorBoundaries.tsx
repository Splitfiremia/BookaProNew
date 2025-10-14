import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from './ErrorBoundary';

interface CriticalErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

function CriticalErrorFallback({ componentName }: { componentName?: string }) {
  return (
    <View style={styles.criticalErrorContainer}>
      <AlertTriangle size={32} color={COLORS.error} />
      <Text style={styles.criticalErrorTitle}>Critical Error</Text>
      <Text style={styles.criticalErrorMessage}>
        {componentName ? `${componentName} failed to load` : 'A critical component failed to load'}
      </Text>
      <Text style={styles.criticalErrorSubtext}>
        Please restart the app or contact support if this persists.
      </Text>
    </View>
  );
}

export function CriticalErrorBoundary({ 
  children, 
  componentName, 
  onError 
}: CriticalErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="critical"
      fallback={<CriticalErrorFallback componentName={componentName} />}
      onError={onError}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
}

interface ProviderErrorBoundaryProps {
  children: React.ReactNode;
  providerName: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

function ProviderErrorFallback({ providerName }: { providerName: string }) {
  return (
    <View style={styles.providerErrorContainer}>
      <AlertTriangle size={24} color={COLORS.error} />
      <Text style={styles.providerErrorTitle}>Provider Error</Text>
      <Text style={styles.providerErrorMessage}>
        {providerName} provider failed to initialize
      </Text>
    </View>
  );
}

export function ProviderErrorBoundary({ 
  children, 
  providerName, 
  onError 
}: ProviderErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="warning"
      fallback={<ProviderErrorFallback providerName={providerName} />}
      onError={onError}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
}

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  fallbackComponent?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

function FeatureErrorFallback({ featureName }: { featureName: string }) {
  return (
    <View style={styles.featureErrorContainer}>
      <Text style={styles.featureErrorMessage}>
        {featureName} is temporarily unavailable
      </Text>
    </View>
  );
}

export function FeatureErrorBoundary({ 
  children, 
  featureName, 
  fallbackComponent,
  onError 
}: FeatureErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="info"
      fallback={fallbackComponent || <FeatureErrorFallback featureName={featureName} />}
      onError={onError}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  criticalErrorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  criticalErrorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  criticalErrorMessage: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  criticalErrorSubtext: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    opacity: 0.8,
  },
  providerErrorContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: SPACING.md,
    margin: SPACING.sm,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  providerErrorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  providerErrorMessage: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  featureErrorContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: SPACING.sm,
    margin: SPACING.xs,
    alignItems: 'center',
    opacity: 0.7,
  },
  featureErrorMessage: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});