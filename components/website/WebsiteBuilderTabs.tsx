import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Settings, Type, Palette, Eye } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';

export type TabKey = 'settings' | 'content' | 'design' | 'preview';

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

interface WebsiteBuilderTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const tabs: Tab[] = [
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'content', label: 'Content', icon: Type },
  { key: 'design', label: 'Design', icon: Palette },
  { key: 'preview', label: 'Preview', icon: Eye },
];

export const WebsiteBuilderTabs: React.FC<WebsiteBuilderTabsProps> = React.memo(({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.tabNavigation}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
          onPress={() => onTabChange(tab.key)}
          testID={`website-tab-${tab.key}`}
        >
          <tab.icon size={18} color={activeTab === tab.key ? COLORS.primary : COLORS.secondary} />
          <Text style={[styles.tabButtonText, activeTab === tab.key && styles.activeTabButtonText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

WebsiteBuilderTabs.displayName = 'WebsiteBuilderTabs';

const styles = StyleSheet.create({
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  activeTabButtonText: {
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
});