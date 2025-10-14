import React, { useState, useRef, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS, GLASS_STYLES, SPACING } from '@/constants/theme';

interface SearchContainerProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder?: string;
}

export const SearchContainer: React.FC<SearchContainerProps> = ({
  searchText,
  onSearchChange,
  onFocus,
  onBlur,
  placeholder = "Search services, providers, shops..."
}) => {
  const searchInputRef = useRef<TextInput>(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsSearchFocused(true);
    onFocus();
    
    Animated.timing(searchAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [onFocus, searchAnimation]);

  const handleBlur = useCallback(() => {
    setIsSearchFocused(false);
    onBlur();
    
    Animated.timing(searchAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [onBlur, searchAnimation]);

  const clearSearch = useCallback(() => {
    onSearchChange('');
    searchInputRef.current?.focus();
  }, [onSearchChange]);

  return (
    <Animated.View 
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          ...GLASS_STYLES.card,
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          height: 48,
        },
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
      <Search size={20} color={COLORS.lightGray} style={{ marginRight: SPACING.sm }} />
      <TextInput
        ref={searchInputRef}
        style={{
          flex: 1,
          color: COLORS.white,
          fontSize: 16,
        }}
        placeholder={placeholder}
        placeholderTextColor={COLORS.lightGray}
        value={searchText}
        onChangeText={onSearchChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        testID="search-input"
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={clearSearch} style={{ padding: 4, marginLeft: 8 }}>
          <X size={18} color={COLORS.lightGray} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default SearchContainer;