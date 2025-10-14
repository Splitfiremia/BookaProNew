import React, { memo, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Search, Clock, TrendingUp } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

interface SearchSuggestionsProps {
  visible: boolean;
  searchText: string;
  autocompleteSuggestions: string[];
  recentSearches: string[];
  popularServices: string[];
  onSuggestionPress: (suggestion: string) => void;
  onClose: () => void;
}

// Memoized suggestion item component
const SuggestionItem = memo<{
  suggestion: string;
  icon: React.ReactNode;
  onPress: (suggestion: string) => void;
}>(({ suggestion, icon, onPress }) => {
  const handlePress = () => onPress(suggestion);
  
  return (
    <TouchableOpacity style={styles.suggestionItem} onPress={handlePress}>
      {icon}
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );
});

SuggestionItem.displayName = 'SuggestionItem';

// Memoized suggestion section component
const SuggestionSection = memo<{
  title: string;
  items: string[];
  icon: React.ComponentType<any>;
  iconColor: string;
  onSuggestionPress: (suggestion: string) => void;
}>(({ title, items, icon: IconComponent, iconColor, onSuggestionPress }) => {
  if (items.length === 0) return null;
  
  return (
    <View style={styles.suggestionSection}>
      <Text style={styles.suggestionSectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <SuggestionItem
          key={`${title}-${index}`}
          suggestion={item}
          icon={<IconComponent size={16} color={iconColor} />}
          onPress={onSuggestionPress}
        />
      ))}
    </View>
  );
});

SuggestionSection.displayName = 'SuggestionSection';

export const SearchSuggestions = memo<SearchSuggestionsProps>((
  {
    visible,
    searchText,
    autocompleteSuggestions,
    recentSearches,
    popularServices,
    onSuggestionPress,
    onClose,
  }
) => {
  console.log('SearchSuggestions: Rendering');
  
  const suggestionAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(suggestionAnimation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, suggestionAnimation]);

  // Memoize sections to prevent unnecessary re-renders
  const sections = useMemo(() => {
    const sectionList = [];
    
    if (searchText.trim() && autocompleteSuggestions.length > 0) {
      sectionList.push({
        title: 'Suggestions',
        items: autocompleteSuggestions,
        icon: Search,
        iconColor: COLORS.accent,
      });
    }
    
    if (!searchText.trim() && recentSearches.length > 0) {
      sectionList.push({
        title: 'Recent Searches',
        items: recentSearches,
        icon: Clock,
        iconColor: COLORS.lightGray,
      });
    }
    
    if (!searchText.trim()) {
      sectionList.push({
        title: 'Popular Services',
        items: popularServices.slice(0, 8),
        icon: TrendingUp,
        iconColor: COLORS.accent,
      });
    }
    
    return sectionList;
  }, [searchText, autocompleteSuggestions, recentSearches, popularServices]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.suggestionOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.suggestionsContainer,
            {
              opacity: suggestionAnimation,
              transform: [{
                translateY: suggestionAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })
              }]
            }
          ]}
        >
          {sections.map((section) => (
            <SuggestionSection
              key={section.title}
              title={section.title}
              items={section.items}
              icon={section.icon}
              iconColor={section.iconColor}
              onSuggestionPress={onSuggestionPress}
            />
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

SearchSuggestions.displayName = 'SearchSuggestions';

const styles = StyleSheet.create({
  suggestionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 120,
  },
  suggestionsContainer: {
    ...GLASS_STYLES.card,
    marginHorizontal: SPACING.md,
    maxHeight: 400,
  },
  suggestionSection: {
    paddingVertical: SPACING.md,
  },
  suggestionSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  suggestionText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    marginLeft: SPACING.sm,
    flex: 1,
  },
});