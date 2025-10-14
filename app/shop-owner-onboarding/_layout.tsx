import { Stack } from 'expo-router';
import { ShopOwnerOnboardingProvider } from '@/providers/ShopOwnerOnboardingProvider';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

export default function ShopOwnerOnboardingLayout() {
  return (
    <ShopOwnerOnboardingProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerShadowVisible: false,
            headerBackVisible: true,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Shop Owner Onboarding',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="shop-information"
            options={{
              title: 'Shop Information',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="owner-information"
            options={{
              title: 'Owner Information',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="shop-type"
            options={{
              title: 'Shop Type',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="service-list"
            options={{
              title: 'Service List',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="subscription-plan"
            options={{
              title: 'Subscription Plan',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="payment-information"
            options={{
              title: 'Payment Information',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="policies"
            options={{
              title: 'Shop Policies',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="completion"
            options={{
              title: 'All Set!',
              headerShown: true,
            }}
          />
        </Stack>
      </View>
    </ShopOwnerOnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});