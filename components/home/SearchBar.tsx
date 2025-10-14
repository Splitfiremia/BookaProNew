import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

interface SearchBarProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isSearchFocused: boolean;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  onSearchTextChange,
  onFocus,
  onBlur,
  isSearchFocused,
  onClear,
}) => {
  const searchInputRef = useRef<TextInput>(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused, searchAnimation]);

  return (
    <Animated.View 
      style={[
        styles.searchContainer,
        {
          borderColor: searchAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['transparent', COLORS.accent],
          }),
          borderWidth: searchAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 2],
          }),
        }
      ]}
    >
      <Search size={20} color={COLORS.lightGray} style={styles.searchIcon} />
      <TextInput
        ref={searchInputRef}
        style={styles.searchInput}
        placeholder="Search services, providers, shops..."
        placeholderTextColor={COLORS.lightGray}
        value={searchText}
        onChangeText={onSearchTextChange}
        onFocus={onFocus}
        onBlur={onBlur}
        returnKeyType="search"
        testID="search-input"
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <X size={18} color={COLORS.lightGray} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.card,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 48,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});