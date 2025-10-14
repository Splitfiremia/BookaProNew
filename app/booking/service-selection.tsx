import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Check, Clock, AlertCircle, DollarSign, ArrowRight } from "lucide-react-native";
import { useBooking } from "@/providers/BookingProvider";
import { GradientButton } from "@/components/GradientButton";
import { mockProviders } from "@/mocks/providers";

export default function ServiceSelectionScreen() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const { selectedServices, setSelectedServices, setSelectedProvider } = useBooking();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Find provider by ID
  const provider = useMemo(() => {
    return mockProviders.find(p => p.id === providerId);
  }, [providerId]);

  useEffect(() => {
    if (provider) {
      setSelectedProvider(provider);
    }
  }, [provider, setSelectedProvider]);

  // Service compatibility checking
  const checkServiceCompatibility = (serviceIds: string[]) => {
    if (!provider?.services) return [];
    
    const errors: string[] = [];
    const selectedServiceObjects = provider.services.filter(service => 
      serviceIds.includes(service.id)
    );

    // Check minimum booking amount
    const total = selectedServiceObjects.reduce((sum, service) => sum + service.price, 0);
    if (total > 0 && total < 25) {
      errors.push('Minimum booking amount is $25');
    }

    // Check for incompatible service combinations
    const serviceNames = selectedServiceObjects.map(s => s.name.toLowerCase());
    if (serviceNames.includes('color correction') && serviceNames.includes('chemical peel')) {
      errors.push('Color correction and chemical treatments cannot be booked together');
    }

    // Check total duration
    let totalMinutes = 0;
    selectedServiceObjects.forEach(service => {
      const duration = parseInt(service.duration.split(' ')[0]);
      if (service.duration.includes('hour')) {
        totalMinutes += duration * 60;
      } else {
        totalMinutes += duration;
      }
    });

    if (totalMinutes > 300) { // 5 hours max
      errors.push('Total service time cannot exceed 5 hours');
    }

    return errors;
  };

  const toggleService = (serviceId: string) => {
    let newServices: string[];
    if (selectedServices.includes(serviceId)) {
      newServices = selectedServices.filter(id => id !== serviceId);
    } else {
      newServices = [...selectedServices, serviceId];
    }
    
    setSelectedServices(newServices);
    
    // Real-time validation
    const errors = checkServiceCompatibility(newServices);
    setValidationErrors(errors);
  };

  const calculateTotal = () => {
    if (!provider?.services) return 0;
    return provider.services
      .filter(service => selectedServices.includes(service.id))
      .reduce((total, service) => total + service.price, 0);
  };

  const calculateTotalDuration = () => {
    if (!provider?.services) return 0;
    
    const selectedServiceObjects = provider.services.filter(service => 
      selectedServices.includes(service.id)
    );
    
    let totalMinutes = 0;
    selectedServiceObjects.forEach(service => {
      const duration = parseInt(service.duration.split(' ')[0]);
      if (service.duration.includes('hour')) {
        totalMinutes += duration * 60;
      } else {
        totalMinutes += duration;
      }
    });
    
    return totalMinutes;
  };

  const handleContinue = () => {
    // Validate service selection
    if (selectedServices.length === 0) {
      Alert.alert('Service Required', 'Please select at least one service to continue.');
      return;
    }

    if (validationErrors.length > 0) {
      Alert.alert('Service Selection Error', validationErrors.join('\n'));
      return;
    }

    setIsLoading(true);
    
    // Simulate validation process
    setTimeout(() => {
      setIsLoading(false);
      router.push('/booking/calendar-selection');
    }, 500);
  };

  const totalDuration = calculateTotalDuration();
  const total = calculateTotal();

  if (!provider) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle color="#FF6B6B" size={48} />
          <Text style={styles.errorText}>Provider not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>CANCEL</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELECT SERVICES</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.shopName}>{provider.shopName}</Text>
          <Text style={styles.address}>{provider.address}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AVAILABLE SERVICES</Text>
            {selectedServices.length === 0 && (
              <View style={styles.validationIndicator}>
                <AlertCircle color="#FF6B6B" size={16} />
                <Text style={styles.validationText}>Required</Text>
              </View>
            )}
          </View>

          {provider.services?.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceItem,
                  isSelected && styles.serviceItemSelected
                ]}
                onPress={() => toggleService(service.id)}
                testID={`service-${service.id}`}
              >
                <View style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected
                ]}>
                  {isSelected && (
                    <Check color="#000" size={16} />
                  )}
                </View>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View style={styles.serviceMetadata}>
                    <Clock color="#666" size={14} />
                    <Text style={styles.serviceDuration}>{service.duration}</Text>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.servicePrice}>${service.price}</Text>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Check color="#10B981" size={12} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {selectedServices.length > 0 && (
            <View style={styles.selectionSummary}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Clock color="#D4AF37" size={16} />
                  <Text style={styles.summaryText}>
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <DollarSign color="#D4AF37" size={16} />
                  <Text style={styles.summaryText}>${total}</Text>
                </View>
              </View>
              <Text style={styles.summaryLabel}>
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
              </Text>
            </View>
          )}

          {validationErrors.length > 0 && (
            <View style={styles.errorContainer}>
              {validationErrors.map((error, index) => (
                <View key={index} style={styles.errorRow}>
                  <AlertCircle color="#FF6B6B" size={16} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Service Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BOOKING GUIDELINES</Text>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineText}>• Minimum booking amount: $25</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineText}>• Maximum session duration: 5 hours</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineText}>• Some services cannot be combined</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineText}>• Prices may vary based on hair length/condition</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${total}</Text>
        </View>
        <GradientButton
          title={isLoading ? "VALIDATING..." : "CONTINUE"}
          onPress={handleContinue}
          loading={isLoading}
          disabled={selectedServices.length === 0 || validationErrors.length > 0}
          testID="continue-button"
          style={styles.continueButton}
          icon={<ArrowRight color="#000" size={20} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  cancelText: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 60,
  },
  providerInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  providerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    color: "#D4AF37",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 1,
  },
  validationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  validationText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "transparent",
  },
  serviceItemSelected: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderColor: "#D4AF37",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  checkboxSelected: {
    backgroundColor: "#D4AF37",
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  serviceMetadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  selectedIndicator: {
    marginTop: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionSummary: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4AF37",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    flex: 1,
  },
  guidelineItem: {
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
    gap: 16,
  },
  totalContainer: {
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  continueButton: {
    flex: 1,
  },
});