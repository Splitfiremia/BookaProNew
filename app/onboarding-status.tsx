import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';


export default function OnboardingStatusScreen() {
  const router = useRouter();
  const clientOnboarding = useOnboarding();
  const providerOnboarding = useProviderOnboarding();
  const shopOwnerOnboarding = useShopOwnerOnboarding();

  const renderSection = (title: string, data: Record<string, any>) => {
    if (!data || typeof data !== 'object') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.dataContainer}>
            <Text style={styles.dataValue}>No data available</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.dataContainer}>
          {Object.entries(data).map(([key, value]) => {
            // Skip functions and complex objects
            if (typeof value === 'function' || (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 5)) {
              return null;
            }
            
            // Format arrays and objects for display
            let displayValue = value;
            if (Array.isArray(value)) {
              displayValue = `[${value.length} items]`;
            } else if (typeof value === 'object' && value !== null) {
              displayValue = JSON.stringify(value, null, 2);
            }
            
            return (
              <View key={key} style={styles.dataRow}>
                <Text style={styles.dataKey}>{key}:</Text>
                <Text style={styles.dataValue}>
                  {displayValue === null || displayValue === undefined 
                    ? 'null' 
                    : String(displayValue)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Onboarding Status</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {renderSection('General Onboarding', clientOnboarding)}
        {renderSection('Provider Onboarding', providerOnboarding)}
        {renderSection('Shop Owner Onboarding', shopOwnerOnboarding)}
        
        <View style={styles.buttonContainer}>

          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => router.push('/reset-onboarding')}
          >
            <Text style={styles.resetButtonText}>Reset All Onboarding Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#f07945',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  dataContainer: {
    marginTop: 8,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  dataKey: {
    fontWeight: '600',
    color: '#666666',
    marginRight: 8,
    minWidth: 120,
  },
  dataValue: {
    flex: 1,
    color: '#333333',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#f07945',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  clientButton: {
    backgroundColor: '#4a90e2',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});