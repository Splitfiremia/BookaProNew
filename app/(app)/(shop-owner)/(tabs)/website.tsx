import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { WebsiteBuilderHeader } from '@/components/website/WebsiteBuilderHeader';
import { WebsiteBuilderTabs, TabKey } from '@/components/website/WebsiteBuilderTabs';
import { WebsiteBuilderContent } from '@/components/website/WebsiteBuilderContent';
import { WebsitePublishButton } from '@/components/website/WebsitePublishButton';
import { useWebsiteBuilder } from '@/hooks/useWebsiteBuilder';

export default function WebsiteBuilderScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('settings');
  
  const {
    websiteData,
    selectedTemplate,
    hasUnsavedChanges,
    isPublishing,
    slugAvailability,
    handleDataChange,
    handleTemplateChange,
    handleSave,
    handlePublish,
    copyWebsiteUrl,
  } = useWebsiteBuilder();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WebsiteBuilderHeader
        hasUnsavedChanges={hasUnsavedChanges}
        isPublished={websiteData.isPublished || false}
        onSave={handleSave}
        onCopyUrl={copyWebsiteUrl}
      />

      <WebsiteBuilderTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <View style={styles.content}>
        <WebsiteBuilderContent
          activeTab={activeTab}
          websiteData={websiteData}
          selectedTemplate={selectedTemplate}
          onDataChange={handleDataChange}
          onTemplateChange={handleTemplateChange}
          slugAvailability={slugAvailability}
        />
      </View>

      <WebsitePublishButton
        isPublished={websiteData.isPublished || false}
        isPublishing={isPublishing}
        onPublish={handlePublish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});