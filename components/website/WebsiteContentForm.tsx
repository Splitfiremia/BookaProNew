import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Upload } from 'lucide-react-native';
import { ShopWebsite } from '@/models/shopWebsite';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';

interface WebsiteContentFormProps {
  websiteData: Partial<ShopWebsite>;
  onDataChange: (field: keyof ShopWebsite, value: any) => void;
}

export const WebsiteContentForm: React.FC<WebsiteContentFormProps> = React.memo(({
  websiteData,
  onDataChange,
}) => {
  const handleSocialLinkChange = (platform: string, value: string) => {
    const currentSocialLinks = websiteData.socialLinks || {};
    onDataChange('socialLinks', { 
      ...currentSocialLinks, 
      [platform]: value.trim() || undefined 
    });
  };

  return (
    <View>
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>Content</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Business Bio</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            value={websiteData.businessBio || ''}
            onChangeText={(value) => onDataChange('businessBio', value)}
            placeholder="Tell visitors about your business..."
            placeholderTextColor={COLORS.secondary}
            multiline
            numberOfLines={4}
            maxLength={1000}
            testID="business-bio-input"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Hero Image</Text>
          <TouchableOpacity style={styles.uploadButton} testID="upload-hero-image">
            <Upload size={20} color={COLORS.primary} />
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>Social Media</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Instagram</Text>
          <TextInput
            style={styles.formInput}
            value={websiteData.socialLinks?.instagram || ''}
            onChangeText={(value) => handleSocialLinkChange('instagram', value)}
            placeholder="https://instagram.com/yourshop"
            placeholderTextColor={COLORS.secondary}
            testID="instagram-input"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Facebook</Text>
          <TextInput
            style={styles.formInput}
            value={websiteData.socialLinks?.facebook || ''}
            onChangeText={(value) => handleSocialLinkChange('facebook', value)}
            placeholder="https://facebook.com/yourshop"
            placeholderTextColor={COLORS.secondary}
            testID="facebook-input"
          />
        </View>
      </View>
    </View>
  );
});

WebsiteContentForm.displayName = 'WebsiteContentForm';

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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    ...GLASS_STYLES.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500' as const,
    fontFamily: FONTS.regular,
  },
});