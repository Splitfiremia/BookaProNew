import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Save, ExternalLink } from 'lucide-react-native';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';

interface WebsiteBuilderHeaderProps {
  hasUnsavedChanges: boolean;
  isPublished: boolean;
  onSave: () => void;
  onCopyUrl: () => void;
}

export const WebsiteBuilderHeader: React.FC<WebsiteBuilderHeaderProps> = React.memo(({
  hasUnsavedChanges,
  isPublished,
  onSave,
  onCopyUrl,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Website Builder</Text>
      <View style={styles.headerActions}>
        {isPublished && (
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={onCopyUrl}
            testID="copy-website-url-button"
          >
            <ExternalLink size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.headerButton, hasUnsavedChanges && styles.hasChangesButton]}
          onPress={onSave}
          testID="save-website-button"
        >
          <Save size={20} color={hasUnsavedChanges ? '#fff' : COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

WebsiteBuilderHeader.displayName = 'WebsiteBuilderHeader';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    ...GLASS_STYLES.button,
    padding: 8,
  },
  hasChangesButton: {
    backgroundColor: COLORS.primary,
  },
});