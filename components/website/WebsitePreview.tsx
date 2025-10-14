import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShopWebsite, WebsiteTemplate } from '@/models/shopWebsite';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';

interface WebsitePreviewProps {
  websiteData: Partial<ShopWebsite>;
  template: WebsiteTemplate;
}

const mockShopName = "Demo Barbershop";
const mockServices = [
  { name: "Classic Cut", price: "$25", duration: "30 min" },
  { name: "Beard Trim", price: "$15", duration: "15 min" },
  { name: "Hot Shave", price: "$35", duration: "45 min" },
];

export const WebsitePreview: React.FC<WebsitePreviewProps> = React.memo(({ 
  websiteData, 
  template 
}) => {
  const primaryColor = websiteData.primaryColor || template.defaultColors.primary;
  const siteTitle = websiteData.siteTitle || mockShopName;
  const tagline = websiteData.tagline || "Professional Barbering Services";
  const businessBio = websiteData.businessBio || "Experience the finest cuts and grooming services in town";

  return (
    <View style={[styles.previewContainer, { backgroundColor: '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.previewHeader, { backgroundColor: primaryColor }]}>
        <Text style={styles.previewHeaderText}>
          {siteTitle}
        </Text>
      </View>

      {/* Hero Section */}
      <View style={styles.previewHero}>
        <View style={[styles.previewHeroImage, { backgroundColor: '#f3f4f6' }]}>
          <Text style={styles.previewImagePlaceholder}>Hero Image</Text>
        </View>
        <Text style={styles.previewHeroTitle}>
          {tagline}
        </Text>
        <Text style={styles.previewHeroSubtitle}>
          {businessBio}
        </Text>
        <View style={[styles.previewBookButton, { backgroundColor: primaryColor }]}>
          <Text style={styles.previewBookButtonText}>Book Now</Text>
        </View>
      </View>

      {/* Services Section */}
      {template.features.hasServicesGrid && (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>Our Services</Text>
          {mockServices.map((service) => (
            <View key={service.name} style={styles.previewServiceItem}>
              <View>
                <Text style={styles.previewServiceName}>{service.name}</Text>
                <Text style={styles.previewServiceDuration}>{service.duration}</Text>
              </View>
              <Text style={[styles.previewServicePrice, { color: primaryColor }]}>
                {service.price}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* About Section */}
      {template.features.hasAboutSection && (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>About Us</Text>
          <Text style={styles.previewSectionText}>
            {businessBio}
          </Text>
        </View>
      )}

      {/* Contact Section */}
      {template.features.hasContactSection && (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>Contact</Text>
          <Text style={styles.previewSectionText}>
            📍 123 Main Street, City, State{'\n'}
            📞 (555) 123-4567{'\n'}
            ✉️ info@demobarbershop.com
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={[styles.previewFooter, { backgroundColor: primaryColor }]}>
        <Text style={styles.previewFooterText}>
          © 2024 {siteTitle}
        </Text>
      </View>
    </View>
  );
});

WebsitePreview.displayName = 'WebsitePreview';

const styles = StyleSheet.create({
  previewContainer: {
    alignSelf: 'center',
    overflow: 'hidden',
    ...GLASS_STYLES.card,
  },
  previewHeader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  previewHeaderText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  previewHero: {
    padding: 20,
    alignItems: 'center',
  },
  previewHeroImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  previewImagePlaceholder: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.regular,
  },
  previewHeroTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  previewHeroSubtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: FONTS.regular,
  },
  previewBookButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  previewBookButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  previewSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  previewSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  previewSectionText: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  previewServiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewServiceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  previewServiceDuration: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  previewServicePrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    fontFamily: FONTS.bold,
  },
  previewFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  previewFooterText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: FONTS.regular,
  },
});