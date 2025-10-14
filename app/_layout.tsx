import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ModeIndicator } from "@/components/ModeIndicator";
import { CriticalErrorBoundary } from "@/components/SpecializedErrorBoundaries";
import OptimizedProviderTree from "@/providers/OptimizedProviderTree";
import { COLORS } from "@/constants/theme";
import { initializeDeepLinking, cleanupDeepLinking } from "@/utils/deepLinkHandler";

// Memoize navigation component to prevent unnecessary re-renders
const RootLayoutNav = React.memo(() => {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: styles.contentStyle
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="unstuck" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-status" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: "Not Found", headerShown: true }} />
    </Stack>
  );
});

RootLayoutNav.displayName = 'RootLayoutNav';

export default function RootLayout() {
  if (__DEV__) {
    console.log('RootLayout: Rendering');
  }
  
  // Initialize deep linking after mount
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initializeApp = async () => {
      try {
        if (mounted) {
          if (__DEV__) {
            console.log('RootLayout: Initializing deep linking');
          }
          await initializeDeepLinking();
        }
      } catch (error) {
        if (__DEV__) {
          console.error('RootLayout: Deep linking initialization failed:', error);
        }
        // Consider implementing retry logic here for production
      }
    };
    
    // Delay initialization to not block initial render (reduced from 500ms to 300ms)
    timeoutId = setTimeout(initializeApp, 300);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      try {
        if (__DEV__) {
          console.log('RootLayout: Cleaning up deep linking');
        }
        cleanupDeepLinking();
      } catch (error) {
        if (__DEV__) {
          console.error('RootLayout: Deep linking cleanup failed:', error);
        }
      }
    };
  }, []);
  
  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      <CriticalErrorBoundary componentName="Root Application">
        <OptimizedProviderTree>
          <RootLayoutNav />
          <ModeIndicator />
        </OptimizedProviderTree>
      </CriticalErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contentStyle: { backgroundColor: COLORS.background },
  gestureHandler: { flex: 1 },
});