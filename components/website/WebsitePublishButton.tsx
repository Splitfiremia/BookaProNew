import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, ExternalLink } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';

interface WebsitePublishButtonProps {
  isPublished: boolean;
  isPublishing: boolean;
  onPublish: () => void;
}

export const WebsitePublishButton: React.FC<WebsitePublishButtonProps> = React.memo(({
  isPublished,
  isPublishing,
  onPublish,
}) => {
  const getButtonText = () => {
    if (isPublishing) return 'Publishing...';
    if (isPublished) return 'Published';
    return 'Publish Website';
  };

  const getButtonStyle = () => {
    if (isPublished) return [styles.publishButton, styles.publishedButton];
    if (isPublishing) return [styles.publishButton, styles.publishingButton];
    return styles.publishButton;
  };

  return (
    <View style={styles.publishContainer}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPublish}
        disabled={isPublishing}
        testID="publish-website-button"
      >
        {isPublished ? (
          <CheckCircle size={20} color="#fff" />
        ) : (
          <ExternalLink size={20} color="#fff" />
        )}
        <Text style={styles.publishButtonText}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

WebsitePublishButton.displayName = 'WebsitePublishButton';

const styles = StyleSheet.create({
  publishContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  publishButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  publishedButton: {
    backgroundColor: '#059669',
  },
  publishingButton: {
    backgroundColor: COLORS.secondary,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    fontFamily: FONTS.bold,
  },
});