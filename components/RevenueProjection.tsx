import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  ArrowUp,
  ArrowDown,
} from "lucide-react-native";

interface ProjectionData {
  current: number;
  projected: number;
  growth: number;
  confidence: number;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
}

interface RevenueProjectionProps {
  data: ProjectionData;
  period: "weekly" | "monthly" | "quarterly";
  onViewDetails?: () => void;
}

export default function RevenueProjection({
  data,
  period,
  onViewDetails,
}: RevenueProjectionProps) {
  const { projectionText, confidenceColor, growthIcon } = useMemo(() => {
    const isPositive = data.growth >= 0;
    const periodText = period === "weekly" ? "week" : period === "monthly" ? "month" : "quarter";
    
    return {
      projectionText: `Based on current trends, you're projected to earn $${data.projected.toLocaleString()} this ${periodText}`,
      confidenceColor: data.confidence >= 80 ? "#10B981" : data.confidence >= 60 ? "#F59E0B" : "#EF4444",
      growthIcon: isPositive ? (
        <ArrowUp size={16} color="#10B981" />
      ) : (
        <ArrowDown size={16} color="#EF4444" />
      ),
    };
  }, [data, period]);
  
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1E3A8A", "#3B82F6"]}
        style={styles.projectionCard}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TrendingUp size={24} color="#FFFFFF" />
            <Text style={styles.title}>Revenue Projection</Text>
          </View>
          <TouchableOpacity onPress={onViewDetails} style={styles.detailsButton}>
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.projectionContent}>
          <View style={styles.currentVsProjected}>
            <View style={styles.metricContainer}>
              <Text style={styles.metricLabel}>Current {period.slice(0, -2)}</Text>
              <Text style={styles.currentAmount}>{formatCurrency(data.current)}</Text>
            </View>
            
            <View style={styles.arrowContainer}>
              <TrendingUp size={20} color="#FFFFFF" opacity={0.7} />
            </View>
            
            <View style={styles.metricContainer}>
              <Text style={styles.metricLabel}>Projected</Text>
              <Text style={styles.projectedAmount}>{formatCurrency(data.projected)}</Text>
              <View style={styles.growthIndicator}>
                {growthIcon}
                <Text style={[styles.growthText, { color: data.growth >= 0 ? "#10B981" : "#EF4444" }]}>
                  {formatPercentage(data.growth)}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.projectionDescription}>
            {projectionText}
          </Text>
          
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${data.confidence}%`,
                    backgroundColor: confidenceColor,
                  }
                ]} 
              />
            </View>
            <Text style={styles.confidenceText}>
              {data.confidence}% confidence
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      {/* Key Factors */}
      <View style={styles.factorsSection}>
        <Text style={styles.factorsTitle}>Key Factors</Text>
        {data.factors.slice(0, 3).map((factor, index) => {
          const isPositive = factor.impact >= 0;
          return (
            <View key={`factor-${index}`} style={styles.factorItem}>
              <View style={styles.factorHeader}>
                <View style={styles.factorIcon}>
                  {isPositive ? (
                    <TrendingUp size={16} color="#10B981" />
                  ) : (
                    <TrendingDown size={16} color="#EF4444" />
                  )}
                </View>
                <Text style={styles.factorName}>{factor.name}</Text>
                <Text style={[styles.factorImpact, { color: isPositive ? "#10B981" : "#EF4444" }]}>
                  {formatPercentage(factor.impact)}
                </Text>
              </View>
              <Text style={styles.factorDescription}>{factor.description}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  projectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  detailsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  projectionContent: {
    gap: 16,
  },
  currentVsProjected: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricContainer: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  projectedAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  arrowContainer: {
    paddingHorizontal: 16,
  },
  growthIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  growthText: {
    fontSize: 14,
    fontWeight: "600",
  },
  projectionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 20,
  },
  confidenceContainer: {
    alignItems: "center",
    gap: 8,
  },
  confidenceBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  factorsSection: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  factorItem: {
    marginBottom: 12,
  },
  factorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  factorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  factorName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  factorImpact: {
    fontSize: 14,
    fontWeight: "600",
  },
  factorDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 32,
    lineHeight: 16,
  },
});