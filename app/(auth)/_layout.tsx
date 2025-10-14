import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        // Add smooth transitions between screens
        animation: "slide_from_right",
        animationDuration: 300,
        // Custom animation for iOS
        ...(Platform.OS === "ios" ? {
          gestureEnabled: true,
          gestureDirection: "horizontal",
          fullScreenGestureEnabled: true,
        } : {})
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      {/* <Stack.Screen name="role-selection" options={{ headerShown: false }} /> */}
    </Stack>
  );
}