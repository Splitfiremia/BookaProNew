import React, { useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp, Download, Eye } from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  type: "line" | "bar" | "area";
  title: string;
  subtitle?: string;
  height?: number;
  showValues?: boolean;
  currency?: boolean;
  percentage?: boolean;
  animated?: boolean;
  onExport?: () => void;
  onViewDetails?: () => void;
}

export default function AnalyticsChart({
  data,
  type,
  title,
  subtitle,
  height = 200,
  showValues = true,
  currency = false,
  percentage = false,
  animated = true,
  onExport,
  onViewDetails,
}: AnalyticsChartProps) {
  const chartWidth = screenWidth - 40;
  const chartHeight = height - 60;
  const animationValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      animationValue.setValue(1);
      scaleValue.setValue(1);
    }
  }, [data, animated]);
  
  const { maxValue, minValue, normalizedData } = useMemo(() => {
    if (data.length === 0) {
      return { maxValue: 0, minValue: 0, normalizedData: [] };
    }
    
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    
    const normalized = data.map((item, index) => ({
      ...item,
      normalizedValue: ((item.value - min) / range) * chartHeight,
      x: (index / (data.length - 1 || 1)) * (chartWidth - 40),
    }));
    
    return {
      maxValue: max,
      minValue: min,
      normalizedData: normalized,
    };
  }, [data, chartHeight, chartWidth]);
  
  const formatValue = (value: number) => {
    if (currency) {
      return `$${value.toLocaleString()}`;
    }
    if (percentage) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };
  
  const renderBarChart = () => {
    const barWidth = Math.max(20, (chartWidth - 40) / data.length - 10);
    
    return (
      <View style={[styles.chartContainer, { height: chartHeight + 60 }]}>
        <View style={styles.barsContainer}>
          {normalizedData.map((point, index) => {
            const animatedHeight = animated
              ? animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.max(4, point.normalizedValue)],
                  extrapolate: 'clamp',
                })
              : Math.max(4, point.normalizedValue);
            
            return (
              <TouchableOpacity key={`bar-${index}`} style={styles.barWrapper} activeOpacity={0.8}>
                <View style={styles.barContainer}>
                  <Animated.View
                    style={[
                      styles.barAnimatedContainer,
                      {
                        height: animated ? animatedHeight : Math.max(4, point.normalizedValue),
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={point.color ? [point.color, point.color + "80"] : ["#3B82F6", "#1E40AF"]}
                      style={[
                        styles.bar,
                        {
                          width: barWidth,
                          height: '100%',
                        },
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                  </Animated.View>
                  {showValues && (
                    <Animated.View
                      style={[
                        styles.barValueContainer,
                        {
                          opacity: animationValue,
                          transform: [{ translateY: animationValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          })}],
                        },
                      ]}
                    >
                      <Text style={styles.barValue}>
                        {formatValue(point.value)}
                      </Text>
                    </Animated.View>
                  )}
                </View>
                <Text style={styles.barLabel}>{point.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  
  const handleExport = () => {
    if (Platform.OS === 'web') {
      console.log(`Exporting chart: ${title}`);
    }
    onExport?.();
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
          opacity: animationValue,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <TrendingUp size={20} color="#3B82F6" />
            <Text style={styles.title}>{title}</Text>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        <View style={styles.headerActions}>
          {onViewDetails && (
            <TouchableOpacity style={styles.actionButton} onPress={onViewDetails}>
              <Eye size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          {onExport && (
            <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
              <Download size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {renderBarChart()}
      </ScrollView>
      
      {/* Y-axis labels */}
      <Animated.View 
        style={[
          styles.yAxisLabels,
          {
            opacity: animationValue,
          },
        ]}
      >
        {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, minValue].map((value, index) => (
          <Text key={`y-label-${index}`} style={styles.yAxisLabel}>
            {formatValue(value)}
          </Text>
        ))}
      </Animated.View>
      
      {/* Trend Indicator */}
      {data.length > 1 && (
        <Animated.View 
          style={[
            styles.trendIndicator,
            {
              opacity: animationValue,
              transform: [{ translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })}],
            },
          ]}
        >
          <View style={styles.trendContent}>
            <TrendingUp size={14} color="#10B981" />
            <Text style={styles.trendText}>
              {data[data.length - 1].value > data[0].value ? 'Trending up' : 'Trending down'}
            </Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  chartContainer: {
    position: "relative",
  },
  yAxisLabels: {
    position: "absolute",
    left: 0,
    top: 60,
    height: 200,
    justifyContent: "space-between",
  },
  yAxisLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
    width: 40,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: "100%",
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: "center",
    flex: 1,
  },
  barContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 200,
    marginBottom: 8,
  },
  barAnimatedContainer: {
    borderRadius: 4,
    minHeight: 4,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 4,
  },
  barLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  trendIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trendContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  barValueContainer: {
    alignItems: "center",
  },
});