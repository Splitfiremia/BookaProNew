import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { WebsiteTemplate } from '@/models/shopWebsite';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';

interface TemplateSelectionProps {
  templates: WebsiteTemplate[];
  selectedTemplate: WebsiteTemplate;
  onTemplateSelect: (template: WebsiteTemplate) => void;
}

export const TemplateSelection: React.FC<TemplateSelectionProps> = React.memo(({
  templates,
  selectedTemplate,
  onTemplateSelect,
}) => {
  const handleTemplateSelect = (template: WebsiteTemplate) => {
    if (template?.id?.trim()) {
      onTemplateSelect(template);
    }
  };

  return (
    <View style={styles.formSection}>
      <Text style={styles.formSectionTitle}>Template</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.templateScroll}
        testID="template-scroll"
      >
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateCard,
              selectedTemplate.id === template.id && styles.selectedTemplateCard,
            ]}
            onPress={() => handleTemplateSelect(template)}
            testID={`template-${template.id}`}
          >
            <View 
              style={[
                styles.templatePreview, 
                { backgroundColor: template.defaultColors.primary }
              ]} 
            />
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

TemplateSelection.displayName = 'TemplateSelection';

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
  templateScroll: {
    marginBottom: 16,
  },
  templateCard: {
    width: 120,
    marginRight: 12,
    ...GLASS_STYLES.card,
    padding: 12,
  },
  selectedTemplateCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  templatePreview: {
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  templateDescription: {
    fontSize: 12,
    color: COLORS.secondary,
    lineHeight: 16,
    fontFamily: FONTS.regular,
  },
});