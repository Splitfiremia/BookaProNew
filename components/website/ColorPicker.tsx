import React from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

const predefinedColors = [
  '#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706',
  '#0891b2', '#be185d', '#4338ca', '#9333ea', '#ea580c',
  '#0d9488', '#1f2937', '#374151', '#6b7280', '#000000'
];

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(({ 
  color, 
  onColorChange 
}) => {
  const handleColorSelect = (selectedColor: string) => {
    if (selectedColor?.trim()) {
      onColorChange(selectedColor);
    }
  };

  const handleTextChange = (text: string) => {
    if (text.length <= 7) { // Limit to hex color format
      onColorChange(text);
    }
  };

  return (
    <View style={styles.colorPicker}>
      <View style={styles.colorGrid}>
        {predefinedColors.map((presetColor) => {
          if (!presetColor?.trim()) return null;
          return (
            <TouchableOpacity
              key={presetColor}
              style={[
                styles.colorSwatch,
                { backgroundColor: presetColor },
                color === presetColor && styles.selectedColorSwatch,
              ]}
              onPress={() => handleColorSelect(presetColor)}
              testID={`color-swatch-${presetColor}`}
            />
          );
        })}
      </View>
      <TextInput
        style={styles.colorInput}
        value={color}
        onChangeText={handleTextChange}
        placeholder="#000000"
        placeholderTextColor={COLORS.secondary}
        maxLength={7}
        testID="color-input"
      />
    </View>
  );
});

ColorPicker.displayName = 'ColorPicker';

const styles = StyleSheet.create({
  colorPicker: {
    gap: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorSwatch: {
    borderColor: COLORS.text,
  },
  colorInput: {
    ...GLASS_STYLES.input,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});