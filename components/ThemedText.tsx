import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '@/constants/theme';

interface ThemedTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'button';
  bold?: boolean;
  color?: string;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  variant = 'body',
  bold = false,
  color = COLORS.text,
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        bold && styles.bold,
        { color },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: 16,
  },
  bold: {
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
  h1: {
    fontSize: FONT_SIZES.xxxl,
    fontFamily: FONTS.bold,
    marginBottom: 16,
    color: COLORS.text,
  },
  h2: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    marginBottom: 14,
    color: COLORS.text,
  },
  h3: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginBottom: 12,
    color: COLORS.text,
  },
  h4: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: 10,
    color: COLORS.text,
  },
  body: {
    fontSize: FONT_SIZES.md,
  },
  caption: {
    fontSize: FONT_SIZES.sm,
  },
  button: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.text,
  },
});