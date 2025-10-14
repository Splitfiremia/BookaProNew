import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  data?: any;
  isEmpty?: boolean;
}

interface LoadingStateManagerProps {
  loadingState: LoadingState;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: React.ReactNode;
  minLoadingTime?: number;
}

export const LoadingStateManager = React.memo<LoadingStateManagerProps>(({
  loadingState,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
}) => {
  const { isLoading, error, isEmpty } = loadingState;

  const content = useMemo(() => {
    if (isLoading) {
      return loadingComponent || <DefaultLoadingComponent />;
    }

    if (error) {
      return errorComponent || <DefaultErrorComponent error={error} />;
    }

    if (isEmpty) {
      return emptyComponent || <DefaultEmptyComponent />;
    }

    return children;
  }, [isLoading, error, isEmpty, loadingComponent, errorComponent, emptyComponent, children]);

  return <>{content}</>;
});

LoadingStateManager.displayName = 'LoadingStateManager';

const DefaultLoadingComponent = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
));

DefaultLoadingComponent.displayName = 'DefaultLoadingComponent';

const DefaultErrorComponent = React.memo<{ error: string }>(({ error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>{error}</Text>
  </View>
));

DefaultErrorComponent.displayName = 'DefaultErrorComponent';

const DefaultEmptyComponent = React.memo(() => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>No data available</Text>
    <Text style={styles.emptyMessage}>There&apos;s nothing to show right now.</Text>
  </View>
));

DefaultEmptyComponent.displayName = 'DefaultEmptyComponent';

// Skeleton loading components
export const SkeletonLoader = React.memo<{
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}>(({ width = '100%', height = 20, borderRadius = 4, style }) => {
  const skeletonStyle = {
    width,
    height,
    borderRadius,
  };
  
  return (
    <View
      style={[
        styles.skeleton,
        skeletonStyle,
        style,
      ]}
    />
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

export const CardSkeleton = React.memo(() => (
  <View style={styles.cardSkeleton}>
    <SkeletonLoader height={120} borderRadius={8} style={{ marginBottom: SPACING.sm }} />
    <SkeletonLoader height={16} width="80%" style={{ marginBottom: SPACING.xs }} />
    <SkeletonLoader height={14} width="60%" style={{ marginBottom: SPACING.xs }} />
    <SkeletonLoader height={12} width="40%" />
  </View>
));

CardSkeleton.displayName = 'CardSkeleton';

export const ListSkeleton = React.memo<{ count?: number }>(({ count = 5 }) => (
  <View style={styles.listSkeleton}>
    {Array.from({ length: count }, (_, index) => (
      <View key={index} style={styles.listItemSkeleton}>
        <SkeletonLoader height={40} width={40} borderRadius={20} />
        <View style={styles.listItemContent}>
          <SkeletonLoader height={16} width="70%" style={{ marginBottom: SPACING.xs }} />
          <SkeletonLoader height={12} width="50%" />
        </View>
      </View>
    ))}
  </View>
));

ListSkeleton.displayName = 'ListSkeleton';

// Progressive loading component
export const ProgressiveLoader = React.memo<{
  stages: { name: string; duration?: number }[];
  currentStage: number;
}>(({ stages, currentStage }) => {
  const progress = useMemo(() => {
    return ((currentStage + 1) / stages.length) * 100;
  }, [currentStage, stages.length]);

  return (
    <View style={styles.progressiveContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.progressiveTitle}>
        {stages[currentStage]?.name || 'Loading...'}
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` as const }]} />
      </View>
      <Text style={styles.progressText}>
        {Math.round(progress)}% complete
      </Text>
    </View>
  );
});

ProgressiveLoader.displayName = 'ProgressiveLoader';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  skeleton: {
    backgroundColor: COLORS.card,
    opacity: 0.7,
  },
  cardSkeleton: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  listSkeleton: {
    padding: SPACING.md,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  listItemContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  progressiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  progressiveTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: COLORS.card,
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
});