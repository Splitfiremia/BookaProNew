import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Filter, MapPin, Star, Clock } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

interface FilterOption {
  id: string;
  label: string;
  icon: React.ComponentType<any> | null;
}

interface FilterBarProps {
  selectedFilter: string;
  onFilterSelect: (filterId: string) => void;
}

const filterOptions: FilterOption[] = [
  { id: 'filter', label: 'Filter', icon: Filter },
  { id: 'nearby', label: 'Nearby', icon: MapPin },
  { id: 'price', label: 'Price', icon: null },
  { id: 'available', label: 'Available', icon: Clock },
  { id: 'rating', label: 'Top Rated', icon: Star },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedFilter,
  onFilterSelect,
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {filterOptions.map((filter) => {
        const IconComponent = filter.icon;
        return (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive
            ]}
            onPress={() => onFilterSelect(filter.id)}
          >
            {IconComponent && (
              <IconComponent 
                size={14} 
                color={selectedFilter === filter.id ? COLORS.background : COLORS.lightGray} 
              />
            )}
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    paddingBottom: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    whiteSpace: 'nowrap' as any,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(31, 41, 55, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.lightGray,
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },
  filterTextActive: {
    color: COLORS.background,
  },
});