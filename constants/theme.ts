import { Platform } from 'react-native';

export const COLORS = {
  primary: '#FBBF24', // Amber-400 (Gold)
  secondary: '#B0B0B9',
  background: '#181611', // Dark background from approved design
  backgroundLight: '#F3F4F6', // Gray-100 (background-light)
  text: '#ffffff',
  white: '#ffffff',
  gray: '#333333',
  lightGray: '#999999',
  accent: '#d4af37',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  disabled: '#555555',
  border: 'rgba(255, 255, 255, 0.1)',
  card: 'rgba(31, 41, 55, 0.3)', // Glass morphism card
  overlay: 'rgba(0, 0, 0, 0.7)',
  glass: {
    background: 'rgba(31, 41, 55, 0.3)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    background: 'transparent',
    border: 'rgba(107, 114, 128, 1)',
    placeholder: 'rgba(156, 163, 175, 0.7)',
    label: 'rgba(209, 213, 219, 1)',
  },
};

export const FONTS = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  display: Platform.select({ ios: 'System', android: 'Roboto', web: 'Pacifico' }),
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 20, // Glass morphism cards
  round: 9999,
};

export const GLASS_STYLES = {
  card: {
    backgroundColor: COLORS.glass.background,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
    }),
    ...(Platform.OS === 'android' && {
      elevation: 15,
    }),
  },
  input: {
    backgroundColor: COLORS.input.background,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.input.border,
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '400',
    fontFamily: FONTS.regular,
  },
  button: {
    backgroundColor: 'rgba(31, 41, 55, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    primary: {
      backgroundColor: COLORS.primary,
      paddingVertical: 12,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      ...(Platform.OS !== 'web' && {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }),
      ...(Platform.OS === 'android' && {
        elevation: 8,
      }),
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: COLORS.primary,
      paddingVertical: 12,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
    },
  },
};

export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  GLASS_STYLES,
};