import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowUp, ArrowDown } from "lucide-react-native";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
  animated?: boolean;
  onPress?: () => void;
}

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
  animated = true,
  onPress,
}: MetricCardProps) {
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Subtle pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    } else {
      scaleValue.setValue(1);
      fadeValue.setValue(1);
      pulseValue.setValue(1);
    }
  }, [animated, scaleValue, fadeValue, pulseValue]);
  
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };
  
  const getChangeColor = (changeVal?: number) => {
    if (!changeVal) return "#6B7280";
    return changeVal >= 0 ? "#10B981" : "#EF4444";
  };
  
  const getChangeIcon = (changeVal?: number) => {
    if (!changeVal) return null;
    return changeVal >= 0 ? (
      <ArrowUp size={12} color="#10B981" />
    ) : (
      <ArrowDown size={12} color="#EF4444" />
    );
  };
  
  const CardContent = (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleValue },
            { scale: pulseValue },
          ],
          opacity: fadeValue,
        },
      ]}
    >
      <LinearGradient
        colors={["#1F2937", "#374151"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <View>{icon}</View>
        </View>
        
        <Text style={styles.value}>{formatValue(value)}</Text>
        <Text style={styles.title}>{title}</Text>
        
        {change !== undefined && (
          <View style={styles.changeContainer}>
            {getChangeIcon(change)}
            <Text style={[styles.changeText, { color: getChangeColor(change) }]}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </Text>
            {changeLabel && (
              <Text style={styles.changeLabel}>{changeLabel}</Text>
            )}
          </View>
        )}
        
        {/* Shimmer effect overlay */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              opacity: fadeValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={["transparent", "rgba(255, 255, 255, 0.1)", "transparent"]}
            style={styles.shimmerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View>{CardContent}</View>
      </TouchableOpacity>
    );
  }
  
  return <View>{CardContent}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  changeLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  shimmerGradient: {
    flex: 1,
    borderRadius: 16,
  },
});