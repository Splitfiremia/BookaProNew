import React from 'react';
import { ScrollView } from 'react-native';
import { ShopWebsite, WebsiteTemplate } from '@/models/shopWebsite';
import { WebsiteSettingsForm } from './WebsiteSettingsForm';
import { WebsiteContentForm } from './WebsiteContentForm';
import { WebsiteDesignForm } from './WebsiteDesignForm';
import { WebsitePreview } from './WebsitePreview';
import { TabKey } from './WebsiteBuilderTabs';

interface WebsiteBuilderContentProps {
  activeTab: TabKey;
  websiteData: Partial<ShopWebsite>;
  selectedTemplate: WebsiteTemplate;
  onDataChange: (field: keyof ShopWebsite, value: any) => void;
  onTemplateChange: (template: WebsiteTemplate) => void;
  slugAvailability?: {
    isChecking: boolean;
    isAvailable: boolean | null;
    suggestions: string[];
  };
}

export const WebsiteBuilderContent: React.FC<WebsiteBuilderContentProps> = React.memo(({
  activeTab,
  websiteData,
  selectedTemplate,
  onDataChange,
  onTemplateChange,
  slugAvailability,
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return (
          <WebsiteSettingsForm
            websiteData={websiteData}
            onDataChange={onDataChange}
            slugAvailability={slugAvailability}
          />
        );

      case 'content':
        return (
          <WebsiteContentForm
            websiteData={websiteData}
            onDataChange={onDataChange}
          />
        );

      case 'design':
        return (
          <WebsiteDesignForm
            websiteData={websiteData}
            selectedTemplate={selectedTemplate}
            onDataChange={onDataChange}
            onTemplateChange={onTemplateChange}
          />
        );

      case 'preview':
        return (
          <WebsitePreview 
            websiteData={websiteData} 
            template={selectedTemplate} 
          />
        );

      default:
        return null;
    }
  };

  const contentStyle = {
    flex: 1,
    padding: 20,
  };

  return (
    <ScrollView style={contentStyle} testID={`website-tab-content-${activeTab}`}>
      {renderTabContent()}
    </ScrollView>
  );
});

WebsiteBuilderContent.displayName = 'WebsiteBuilderContent';