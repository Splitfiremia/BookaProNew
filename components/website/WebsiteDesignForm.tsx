import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShopWebsite, WebsiteTemplate, WEBSITE_TEMPLATES } from '@/models/shopWebsite';
import { COLORS, FONTS } from '@/constants/theme';
import { TemplateSelection } from './TemplateSelection';
import { ColorPicker } from './ColorPicker';

interface WebsiteDesignFormProps {
  websiteData: Partial<ShopWebsite>;
  selectedTemplate: WebsiteTemplate;
  onDataChange: (field: keyof ShopWebsite, value: any) => void;
  onTemplateChange: (template: WebsiteTemplate) => void;
}

export const WebsiteDesignForm: React.FC<WebsiteDesignFormProps> = React.memo(({
  websiteData,
  selectedTemplate,
  onDataChange,
  onTemplateChange,
}) => {
  const handleTemplateChange = (template: WebsiteTemplate) => {
    onTemplateChange(template);
    onDataChange('templateId', template.id);
    onDataChange('primaryColor', template.defaultColors.primary);
  };

  const handleColorChange = (color: string) => {
    if (color.trim()) {
      onDataChange('primaryColor', color);
    }
  };

  return (
    <View>
      <TemplateSelection
        templates={WEBSITE_TEMPLATES}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={handleTemplateChange}
      />

      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>Colors</Text>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Primary Color</Text>
          <ColorPicker
            color={websiteData.primaryColor || selectedTemplate.defaultColors.primary}
            onColorChange={handleColorChange}
          />
        </View>
      </View>
    </View>
  );
});

WebsiteDesignForm.displayName = 'WebsiteDesignForm';

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
});