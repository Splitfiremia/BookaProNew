import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Clock, DollarSign } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, GLASS_STYLES } from '@/constants/theme';

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  description?: string;
  popular?: boolean;
}

const services: Service[] = [
  { id: '1', name: 'Haircut', duration: '30 min', price: '$35', description: 'Professional haircut and styling', popular: true },
  { id: '2', name: 'Beard Trim', duration: '20 min', price: '$25', description: 'Beard shaping and trimming' },
  { id: '3', name: 'Hair & Beard', duration: '45 min', price: '$55', description: 'Complete grooming package', popular: true },
  { id: '4', name: 'Hot Towel Shave', duration: '30 min', price: '$40', description: 'Classic hot towel shave experience' },
];

export default function SelectServiceScreen() {
  const router = useRouter();
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    // Auto-advance to next step for faster booking
    setTimeout(() => {
      router.push(`/(app)/(client)/booking/select-date?providerId=${providerId}&serviceId=${serviceId}`);
    }, 300);
  };

  const handleContinue = () => {
    if (selectedService) {
      router.push(`/(app)/(client)/booking/select-date?providerId=${providerId}&serviceId=${selectedService}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>What service do you need?</Text>
          <Text style={styles.subtitle}>Tap to select and continue</Text>
        </View>

        <View style={styles.servicesContainer}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                service.popular && styles.popularCard
              ]}
              onPress={() => handleServiceSelect(service.id)}
              activeOpacity={0.8}
            >
              {service.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>
                  {service.name}
                </Text>
                {service.description && (
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                )}
                <View style={styles.serviceDetails}>
                  <View style={styles.serviceDetailItem}>
                    <Clock size={16} color={COLORS.lightGray} />
                    <Text style={styles.serviceDuration}>
                      {service.duration}
                    </Text>
                  </View>
                  <View style={styles.serviceDetailItem}>
                    <DollarSign size={16} color={COLORS.accent} />
                    <Text style={styles.servicePrice}>
                      {service.price}
                    </Text>
                  </View>
                </View>
              </View>
              <ChevronRight 
                size={20} 
                color={COLORS.lightGray}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  servicesContainer: {
    padding: SPACING.md,
  },
  serviceCard: {
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  popularCard: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.card,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: SPACING.md,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    zIndex: 1,
  },
  popularText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  serviceDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  serviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  serviceDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  servicePrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },
});