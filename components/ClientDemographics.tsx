import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  Smartphone,
  CreditCard,
} from "lucide-react-native";

interface DemographicData {
  ageGroups: {
    range: string;
    percentage: number;
    count: number;
  }[];
  genderDistribution: {
    gender: string;
    percentage: number;
    count: number;
  }[];
  locationData: {
    area: string;
    percentage: number;
    distance: string;
  }[];
  bookingPatterns: {
    timeSlot: string;
    popularity: number;
    count: number;
  }[];
  deviceUsage: {
    platform: string;
    percentage: number;
  }[];
  paymentMethods: {
    method: string;
    percentage: number;
    avgAmount: number;
  }[];
}

interface ClientDemographicsProps {
  data: DemographicData;
}

export default function ClientDemographics({ data }: ClientDemographicsProps) {
  const renderProgressBar = (percentage: number, color: string = "#3B82F6") => (
    <View style={styles.progressBar}>
      <View 
        style={[
          styles.progressFill, 
          { width: `${percentage}%`, backgroundColor: color }
        ]} 
      />
    </View>
  );
  
  const getAgeGroupColor = (index: number) => {
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
    return colors[index % colors.length];
  };
  
  const getGenderColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case "female": return "#EC4899";
      case "male": return "#3B82F6";
      case "non-binary": return "#8B5CF6";
      default: return "#6B7280";
    }
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Age Distribution */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Age Distribution</Text>
        </View>
        <View style={styles.chartContainer}>
          {data.ageGroups.map((group, index) => (
            <View key={`age-${group.range}`} style={styles.dataRow}>
              <View style={styles.dataLabel}>
                <Text style={styles.labelText}>{group.range}</Text>
                <Text style={styles.countText}>{group.count} clients</Text>
              </View>
              <View style={styles.dataValue}>
                {renderProgressBar(group.percentage, getAgeGroupColor(index))}
                <Text style={styles.percentageText}>{group.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Gender Distribution */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={20} color="#EC4899" />
          <Text style={styles.sectionTitle}>Gender Distribution</Text>
        </View>
        <View style={styles.genderGrid}>
          {data.genderDistribution.map((item) => (
            <View key={`gender-${item.gender}`} style={styles.genderCard}>
              <View style={[styles.genderIcon, { backgroundColor: getGenderColor(item.gender) }]}>
                <Users size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.genderPercentage}>{item.percentage.toFixed(1)}%</Text>
              <Text style={styles.genderLabel}>{item.gender}</Text>
              <Text style={styles.genderCount}>{item.count} clients</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Location Data */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MapPin size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Client Locations</Text>
        </View>
        <View style={styles.chartContainer}>
          {data.locationData.map((location) => (
            <View key={`location-${location.area}`} style={styles.dataRow}>
              <View style={styles.dataLabel}>
                <Text style={styles.labelText}>{location.area}</Text>
                <Text style={styles.countText}>{location.distance} away</Text>
              </View>
              <View style={styles.dataValue}>
                {renderProgressBar(location.percentage, "#10B981")}
                <Text style={styles.percentageText}>{location.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Booking Patterns */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Popular Booking Times</Text>
        </View>
        <View style={styles.chartContainer}>
          {data.bookingPatterns.map((pattern) => (
            <View key={`pattern-${pattern.timeSlot}`} style={styles.dataRow}>
              <View style={styles.dataLabel}>
                <Text style={styles.labelText}>{pattern.timeSlot}</Text>
                <Text style={styles.countText}>{pattern.count} bookings</Text>
              </View>
              <View style={styles.dataValue}>
                {renderProgressBar(pattern.popularity, "#F59E0B")}
                <Text style={styles.percentageText}>{pattern.popularity.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Device Usage */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Smartphone size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Device Usage</Text>
        </View>
        <View style={styles.deviceGrid}>
          {data.deviceUsage.map((device) => (
            <View key={`device-${device.platform}`} style={styles.deviceCard}>
              <Smartphone size={24} color="#8B5CF6" />
              <Text style={styles.devicePercentage}>{device.percentage.toFixed(1)}%</Text>
              <Text style={styles.deviceLabel}>{device.platform}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Payment Methods */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CreditCard size={20} color="#EF4444" />
          <Text style={styles.sectionTitle}>Payment Preferences</Text>
        </View>
        <View style={styles.chartContainer}>
          {data.paymentMethods.map((method) => (
            <View key={`payment-${method.method}`} style={styles.dataRow}>
              <View style={styles.dataLabel}>
                <Text style={styles.labelText}>{method.method}</Text>
                <Text style={styles.countText}>Avg: ${method.avgAmount.toFixed(0)}</Text>
              </View>
              <View style={styles.dataValue}>
                {renderProgressBar(method.percentage, "#EF4444")}
                <Text style={styles.percentageText}>{method.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chartContainer: {
    gap: 12,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dataLabel: {
    flex: 1,
    marginRight: 16,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  countText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  dataValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 100,
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: "#374151",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    minWidth: 35,
    textAlign: "right",
  },
  genderGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  genderCard: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 12,
  },
  genderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  genderPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  genderCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  deviceGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  deviceCard: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 12,
  },
  devicePercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  deviceLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});