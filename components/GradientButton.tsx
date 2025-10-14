import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
  View,
} from "react-native";

import { COLORS, FONTS, GLASS_STYLES } from "@/constants/theme";

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  icon?: React.ReactElement;
  variant?: 'primary' | 'secondary';
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  loading = false,
  disabled = false,
  testID,
  icon,
  variant = 'primary',
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const buttonStyle = variant === 'primary' ? GLASS_STYLES.button.primary : GLASS_STYLES.button.secondary;
  const textColor = variant === 'primary' ? '#1F2937' : COLORS.primary;

  return (
    <TouchableOpacity
      style={[
        buttonStyle,
        isDisabled && styles.buttonDisabled,
        style
      ]}
      disabled={isDisabled}
      testID={testID}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonDisabled: {
    backgroundColor: 'rgba(251, 191, 36, 0.5)',
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: FONTS.regular,
  },
  iconContainer: {
    marginLeft: 8,
  },
});