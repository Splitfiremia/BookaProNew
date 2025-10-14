import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function ClientOnboardingLayout() {
  const colorScheme = useColorScheme();
  
  // Adaptive background color based on system theme
  const backgroundColor = colorScheme === 'dark' 
    ? COLORS.backgroundDark || COLORS.background 
    : COLORS.background;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor },
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animationDuration: 300,
      }}
    >
      <Stack.Screen 
        name="profile-type" 
        options={{
          title: 'Profile Type',
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="welcome" 
        options={{
          title: 'Welcome',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="search" 
        options={{
          title: 'Find Services',
          gestureEnabled: false, // Prevent accidental back gesture during search
        }}
      />
      <Stack.Screen 
        name="payment" 
        options={{
          title: 'Payment Setup',
          animation: 'slide_from_right',
          gestureEnabled: false, // Important for payment screens to prevent accidental navigation
        }}
      />
    </Stack>
  );
}