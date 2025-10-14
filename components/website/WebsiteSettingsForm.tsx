import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { ShopWebsite } from '@/models/shopWebsite';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';
import { WebsiteBuilderService } from '@/services/WebsiteBuilderService';

interface WebsiteSettingsFormProps {
  websiteData: Partial<ShopWebsite>;
  onDataChange: (field: keyof ShopWebsite, value: any) => void;
  slugAvailability?: {
    isChecking: boolean;
    isAvailable: boolean | null;
    suggestions: string[];
  };
}

export const WebsiteSettingsForm: React.FC<WebsiteSettingsFormProps> = React.memo(({
  websiteData,
  onDataChange,
  slugAvailability,
}) => {
  const handleSlugChange = (value: string) => {
    const sanitized = WebsiteBuilderService.sanitizeSlug(value);
    onDataChange('subdomainSlug', sanitized);
  };

  return (
    <View style={styles.formSection}>
      <Text style={styles.formSectionTitle}>Site Settings</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Site Title</Text>
        <TextInput
          style={styles.formInput}
          value={websiteData.siteTitle || ''}
          onChangeText={(value) => onDataChange('siteTitle', value)}
          placeholder="Enter your site title"
          placeholderTextColor={COLORS.secondary}
          maxLength={100}
          testID="site-title-input"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Subdomain</Text>
        <View style={[
          styles.subdomainContainer,
          slugAvailability?.isAvailable === false && styles.subdomainError,
          slugAvailability?.isAvailable === true && styles.subdomainSuccess
        ]}>
          <Text style={styles.subdomainPrefix}>bookerpro.com/</Text>
          <TextInput
            style={styles.subdomainInput}
            value={websiteData.subdomainSlug || ''}
            onChangeText={handleSlugChange}
            placeholder="yourshop"
            placeholderTextColor={COLORS.secondary}
            maxLength={50}
            testID="subdomain-input"
          />
          {slugAvailability?.isChecking && (
            <View style={styles.statusIcon}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
          {!slugAvailability?.isChecking && slugAvailability?.isAvailable === true && (
            <View style={styles.statusIcon}>
              <CheckCircle size={20} color="#10B981" />
            </View>
          )}
          {!slugAvailability?.isChecking && slugAvailability?.isAvailable === false && (
            <View style={styles.statusIcon}>
              <XCircle size={20} color="#EF4444" />
            </View>
          )}
        </View>
        
        {/* Availability Status */}
        {slugAvailability?.isAvailable === true && (
          <Text style={styles.availabilitySuccess}>
            ✓ This subdomain is available
          </Text>
        )}
        {slugAvailability?.isAvailable === false && (
          <Text style={styles.availabilityError}>
            ✗ This subdomain is already taken
          </Text>
        )}
        
        {/* Suggestions */}
        {slugAvailability?.suggestions && slugAvailability.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>
              <AlertCircle size={14} color={COLORS.secondary} /> Try these alternatives:
            </Text>
            <View style={styles.suggestionsList}>
              {slugAvailability.suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => onDataChange('subdomainSlug', suggestion)}
                  testID={`suggestion-${suggestion}`}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Tagline</Text>
        <TextInput
          style={styles.formInput}
          value={websiteData.tagline || ''}
          onChangeText={(value) => onDataChange('tagline', value)}
          placeholder="A short catchphrase for your business"
          placeholderTextColor={COLORS.secondary}
          maxLength={150}
          testID="tagline-input"
        />
      </View>
    </View>
  );
});

WebsiteSettingsForm.displayName = 'WebsiteSettingsForm';

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 24,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: FONTS.bold,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  formInput: {
    ...GLASS_STYLES.input,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  subdomainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.input,
    paddingHorizontal: 0,
  },
  subdomainPrefix: {
    fontSize: 16,
    color: COLORS.secondary,
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
  },
  subdomainInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: FONTS.regular,
  },
  subdomainError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  subdomainSuccess: {
    borderColor: '#10B981',
    borderWidth: 1,
  },
  statusIcon: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  availabilitySuccess: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  availabilityError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  suggestionsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.background + '80',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 8,
    fontFamily: FONTS.regular,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  suggestionText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontWeight: '500' as const,
  },
});