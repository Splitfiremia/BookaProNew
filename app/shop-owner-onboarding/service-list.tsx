import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding, ShopService } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, Plus, Trash2, Edit2, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServiceList() {
  const router = useRouter();
  const { services, addService, updateService, removeService, nextStep } = useShopOwnerOnboarding();
  
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [servicesList, setServicesList] = useState<ShopService[]>(services);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!serviceName.trim()) newErrors.name = 'Service name is required';
    if (!price.trim()) newErrors.price = 'Price is required';
    if (isNaN(Number(price)) || Number(price) <= 0) newErrors.price = 'Please enter a valid price';
    if (!duration.trim()) newErrors.duration = 'Duration is required';
    if (isNaN(Number(duration)) || Number(duration) <= 0) newErrors.duration = 'Please enter a valid duration in minutes';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = () => {
    if (validateForm()) {
      const newService: ShopService = {
        id: editingId || `service-${Date.now()}`,
        name: serviceName,
        price: Number(price),
        duration: Number(duration)
      };
      
      if (editingId) {
        updateService(editingId, newService);
        const updatedList = servicesList.map(service => 
          service.id === editingId ? newService : service
        );
        setServicesList(updatedList);
        setEditingId(null);
      } else {
        addService(newService);
        setServicesList([...servicesList, newService]);
      }
      
      // Reset form
      setServiceName('');
      setPrice('');
      setDuration('');
      setErrors({});
    }
  };

  const handleEditService = (service: ShopService) => {
    setServiceName(service.name);
    setPrice(service.price.toString());
    setDuration(service.duration.toString());
    setEditingId(service.id);
  };

  const handleRemoveService = (serviceId: string) => {
    Alert.alert(
      "Remove Service",
      "Are you sure you want to remove this service?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: () => {
            removeService(serviceId);
            setServicesList(servicesList.filter(service => service.id !== serviceId));
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleNext = () => {
    if (servicesList.length === 0) {
      Alert.alert(
        "No Services Added",
        "You haven't added any services yet. Are you sure you want to continue?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Continue", 
            onPress: () => {
              nextStep();
              router.push('/shop-owner-onboarding/subscription-plan' as any);
            }
          }
        ]
      );
    } else {
      nextStep();
      router.push('/shop-owner-onboarding/subscription-plan' as any);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="service-list-back-button"
          >
            <ChevronLeft size={20} color={COLORS.lightGray} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Set your shop&apos;s service menu</Text>
            <Text style={styles.subtitle}>
              Define the services and prices your providers will use. They cannot change these prices.
            </Text>
          </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Service Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={serviceName}
              onChangeText={setServiceName}
              placeholder="e.g. Haircut, Styling, Manicure"
              placeholderTextColor={COLORS.input.placeholder}
              testID="service-name-input"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.priceInput]}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={[styles.input, errors.price ? styles.inputError : null]}
                value={price}
                onChangeText={(value) => setPrice(formatCurrency(value))}
                placeholder="0.00"
                placeholderTextColor={COLORS.input.placeholder}
                keyboardType="decimal-pad"
                testID="service-price-input"
              />
              {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.durationInput]}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput
                style={[styles.input, errors.duration ? styles.inputError : null]}
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                placeholderTextColor={COLORS.input.placeholder}
                keyboardType="number-pad"
                testID="service-duration-input"
              />
              {errors.duration ? <Text style={styles.errorText}>{errors.duration}</Text> : null}
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddService}
            activeOpacity={0.8}
            testID="add-service-button"
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>
              {editingId ? 'Update Service' : 'Add Service'}
            </Text>
          </TouchableOpacity>
        </View>

        {servicesList.length > 0 && (
          <View style={styles.servicesList}>
            <Text style={styles.servicesTitle}>Your Services</Text>
            
            {servicesList.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  </View>
                </View>
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditService(service)}
                    testID={`edit-service-${service.id}`}
                  >
                    <Edit2 size={18} color="#3b5998" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveService(service.id)}
                    testID={`delete-service-${service.id}`}
                  >
                    <Trash2 size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
            testID="service-list-next-button"
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  header: {
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  form: {
    ...GLASS_STYLES.card,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500' as const,
    color: COLORS.input.label,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  input: {
    ...GLASS_STYLES.input,
    backgroundColor: COLORS.input.background,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.input.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
    marginRight: 12,
  },
  durationInput: {
    flex: 1,
  },
  addButton: {
    ...GLASS_STYLES.button.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  servicesList: {
    marginBottom: SPACING.lg,
  },
  servicesTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontFamily: FONTS.bold,
  },
  serviceCard: {
    ...GLASS_STYLES.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500' as const,
    marginRight: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  serviceDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  button: {
    ...GLASS_STYLES.button.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    marginRight: SPACING.sm,
    fontFamily: FONTS.bold,
  },
});