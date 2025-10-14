import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { X, Check } from "lucide-react-native";
import { priceRanges, distanceRanges, availabilityOptions, sortOptions } from "@/mocks/providers";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  priceRange: { min: number; max: number };
  distance: number;
  availability: string;
  sortBy: string;
  minRating: number;
}

export default function FilterModal({ visible, onClose, onApplyFilters, currentFilters }: FilterModalProps) {
  const { width } = useWindowDimensions();
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      priceRange: { min: 0, max: 1000 },
      distance: 50,
      availability: "All Times",
      sortBy: "Distance",
      minRating: 0,
    };
    setFilters(resetFilters);
  };

  const ratingOptions = [0, 3.0, 3.5, 4.0, 4.5, 4.8];

  const dynamicStyles = {
    optionChip: {
      ...styles.optionChip,
      minWidth: (width - 64) / 2,
    },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.optionsGrid}>
              {priceRanges.map((range) => {
                const isSelected = filters.priceRange.min === range.min && filters.priceRange.max === range.max;
                return (
                  <TouchableOpacity
                    key={`${range.min}-${range.max}`}
                    style={[dynamicStyles.optionChip, isSelected && styles.selectedChip]}
                    onPress={() => setFilters({ ...filters, priceRange: { min: range.min, max: range.max } })}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                      {range.label}
                    </Text>
                    {isSelected && <Check color="#000" size={16} style={styles.checkIcon} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Distance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance</Text>
            <View style={styles.optionsGrid}>
              {distanceRanges.map((range) => {
                const isSelected = filters.distance === range.value;
                return (
                  <TouchableOpacity
                    key={range.value}
                    style={[dynamicStyles.optionChip, isSelected && styles.selectedChip]}
                    onPress={() => setFilters({ ...filters, distance: range.value })}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                      {range.label}
                    </Text>
                    {isSelected && <Check color="#000" size={16} style={styles.checkIcon} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.optionsGrid}>
              {availabilityOptions.map((option) => {
                const isSelected = filters.availability === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[dynamicStyles.optionChip, isSelected && styles.selectedChip]}
                    onPress={() => setFilters({ ...filters, availability: option })}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                      {option}
                    </Text>
                    {isSelected && <Check color="#000" size={16} style={styles.checkIcon} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minimum Rating</Text>
            <View style={styles.optionsGrid}>
              {ratingOptions.map((rating) => {
                const isSelected = filters.minRating === rating;
                const label = rating === 0 ? "Any Rating" : `${rating}+ Stars`;
                return (
                  <TouchableOpacity
                    key={rating}
                    style={[dynamicStyles.optionChip, isSelected && styles.selectedChip]}
                    onPress={() => setFilters({ ...filters, minRating: rating })}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                      {label}
                    </Text>
                    {isSelected && <Check color="#000" size={16} style={styles.checkIcon} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.optionsGrid}>
              {sortOptions.map((option) => {
                const isSelected = filters.sortBy === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[dynamicStyles.optionChip, isSelected && styles.selectedChip]}
                    onPress={() => setFilters({ ...filters, sortBy: option })}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                      {option}
                    </Text>
                    {isSelected && <Check color="#000" size={16} style={styles.checkIcon} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  resetText: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
  },
  selectedChip: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  optionText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedText: {
    color: "#000",
    fontWeight: "600",
  },
  checkIcon: {
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  applyButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});