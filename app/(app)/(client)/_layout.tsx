import { Stack } from "expo-router";
import { COLORS } from "@/constants/theme";
import { FlatProviders } from "@/providers/LazyProviders";
import { ProviderErrorBoundary, FeatureErrorBoundary } from "@/components/SpecializedErrorBoundaries";

export default function ClientLayout() {
  return (
    <ProviderErrorBoundary providerName="Client Providers">
      <FlatProviders>
        <FeatureErrorBoundary featureName="Client Navigation">
          <Stack
            screenOptions={{
              headerShown: true,
              contentStyle: { backgroundColor: COLORS.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="provider/[id]" options={{ title: "Provider Profile" }} />
            <Stack.Screen name="booking" options={{ title: "Book Appointment" }} />
            <Stack.Screen name="appointment/[id]" options={{ title: "Appointment Details" }} />
            <Stack.Screen name="shops/explore" options={{ title: "Explore Shops" }} />
            <Stack.Screen name="shops/[id]" options={{ title: "Shop Details" }} />
          </Stack>
        </FeatureErrorBoundary>
      </FlatProviders>
    </ProviderErrorBoundary>
  );
}