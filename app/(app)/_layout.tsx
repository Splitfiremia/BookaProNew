import { Stack, router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
import { COLORS, FONTS, FONT_SIZES, SPACING } from "@/constants/theme";

export default function AppLayout() {
  const { isLoading, isAuthenticated, user, isInitialized } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const hasRedirected = useRef(false);

  // Immediate initialization to prevent hydration timeout
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (isReady && isInitialized && !isLoading && !isAuthenticated && !hasRedirected.current) {
      console.log('AppLayout: User not authenticated, redirecting');
      hasRedirected.current = true;
      
      router.replace("/");
    }
  }, [isReady, isInitialized, isLoading, isAuthenticated]);

  // Reset redirect flag when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated]);

  // Show loading only if not ready or still initializing
  if (!isReady || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Authenticating...</Text>
      </View>
    );
  }

  // Don't render stack if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  // Render stack immediately when authenticated
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(client)" />
      <Stack.Screen name="(provider)" />
      <Stack.Screen name="(shop-owner)" />
    </Stack>
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
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});