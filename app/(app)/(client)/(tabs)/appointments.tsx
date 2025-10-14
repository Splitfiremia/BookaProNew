import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
} from "react-native";
import ImageWithFallback from '@/components/ImageWithFallback';
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Clock, User, MapPin, Phone, Star, Filter, CheckCircle, XCircle, AlertCircle, Navigation, Zap, Timer } from "lucide-react-native";
import { router } from "expo-router";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, GLASS_STYLES } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";

interface Appointment {
  id: string;
  providerName: string;
  providerImage: string;
  shopName: string;
  service: string;
  date: Date;
  time: string;
  duration: number;
  status: "upcoming" | "completed" | "cancelled";
  price: number;
  address: string;
  phone: string;
  notes?: string;
}

// Mock appointments for testing
const generateMockAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  const services = [
    "Haircut & Style",
    "Hair Color",
    "Highlights",
    "Balayage",
    "Manicure",
    "Pedicure",
    "Facial Treatment",
    "Massage Therapy",
  ];
  const providers = [
    {
      name: "Jose Santiago",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      shop: "Free Advice Barber Shop",
      address: "548 East 13th Street, New York, NY",
      phone: "(347) 721-2262"
    },
    {
      name: "Maria Lopez",
      image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200",
      shop: "Glamour Beauty Salon",
      address: "234 Broadway, New York, NY",
      phone: "(212) 555-1234"
    },
    {
      name: "Lily Chen",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200",
      shop: "Zen Nail Spa",
      address: "456 Park Avenue, New York, NY",
      phone: "(212) 555-5678"
    },
  ];
  
  const today = new Date();
  
  // Generate upcoming appointments
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + dayOffset);
    
    if (Math.random() > 0.6) { // 40% chance of appointment each day
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const hour = 9 + Math.floor(Math.random() * 10); // 9 AM to 6 PM
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      appointments.push({
        id: `apt-${dayOffset}`,
        providerName: provider.name,
        providerImage: provider.image,
        shopName: provider.shop,
        service: services[Math.floor(Math.random() * services.length)],
        date: appointmentDate,
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        duration: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
        status: "upcoming",
        price: Math.floor(Math.random() * 150) + 50,
        address: provider.address,
        phone: provider.phone,
        notes: Math.random() > 0.7 ? "Please arrive 10 minutes early" : undefined,
      });
    }
  }
  
  // Generate past appointments
  for (let dayOffset = -14; dayOffset < 0; dayOffset++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + dayOffset);
    
    if (Math.random() > 0.5) { // 50% chance of past appointment
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const hour = 9 + Math.floor(Math.random() * 10);
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      appointments.push({
        id: `apt-past-${Math.abs(dayOffset)}`,
        providerName: provider.name,
        providerImage: provider.image,
        shopName: provider.shop,
        service: services[Math.floor(Math.random() * services.length)],
        date: appointmentDate,
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        duration: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.1 ? "completed" : "cancelled",
        price: Math.floor(Math.random() * 150) + 50,
        address: provider.address,
        phone: provider.phone,
      });
    }
  }
  
  return appointments.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [appointments] = useState<Appointment[]>(generateMockAppointments());
  const [filterStatus, setFilterStatus] = useState<Appointment["status"] | "all">("all");

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesFilter = filterStatus === "all" || apt.status === filterStatus;
      return matchesFilter;
    });
  }, [appointments, filterStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return COLORS.primary;
      case "completed":
        return '#4CAF50'; // Green
      case "cancelled":
        return '#F44336'; // Red
      default:
        return COLORS.text;
    }
  };

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return Timer;
      case "completed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusGradient = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return ['#FF5A5F', '#FF8E53'];
      case "completed":
        return ['#4CAF50', '#66BB6A'];
      case "cancelled":
        return ['#F44336', '#EF5350'];
      default:
        return [COLORS.card, COLORS.card];
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const StatusIcon = getStatusIcon(item.status);
    const isUpcoming = item.status === 'upcoming';
    const isToday = item.date.toDateString() === new Date().toDateString();
    
    return (
      <TouchableOpacity
        style={[
          styles.appointmentCard,
          isToday && isUpcoming && styles.todayCard,
          item.status === 'completed' && styles.completedCard,
          item.status === 'cancelled' && styles.cancelledCard
        ]}
        onPress={() => {
          // Navigate to appointment details or provider profile
          console.log('Navigate to appointment details:', item.id);
        }}
        testID={`appointment-${item.id}`}
      >
        {/* Status Indicator Strip */}
        <View style={[
          styles.statusStrip,
          { backgroundColor: getStatusColor(item.status) }
        ]} />
        
        {/* Animated Status Pulse for Upcoming */}
        {item.status === 'upcoming' && isToday && (
          <View style={styles.pulseContainer}>
            <View style={[styles.pulseRing, { borderColor: getStatusColor(item.status) }]} />
          </View>
        )}
        
        {/* Today Badge */}
        {isToday && isUpcoming && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>TODAY</Text>
          </View>
        )}
        
        <View style={styles.appointmentHeader}>
          <View style={styles.providerInfo}>
            <View style={styles.providerImageContainer}>
              <ImageWithFallback source={{ uri: item.providerImage }} style={styles.providerImage} fallbackIcon="user" />
              {item.status === 'completed' && (
                <View style={styles.completedOverlay}>
                  <CheckCircle size={20} color="#4CAF50" />
                </View>
              )}
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{item.providerName}</Text>
              <Text style={styles.shopName}>{item.shopName}</Text>
              <View style={styles.ratingRow}>
                <Star size={12} color={COLORS.accent} fill={COLORS.accent} />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(item.status) },
              isToday && isUpcoming && styles.todayStatusBadge
            ]}>
              <StatusIcon size={12} color={COLORS.white} />
              <Text style={styles.statusText}>
                {item.status.toUpperCase()}
              </Text>
              {isToday && isUpcoming && (
                <View style={styles.zapIcon}>
                  <Zap size={10} color={COLORS.white} />
                </View>
              )}
            </View>
            {isUpcoming && (
              <Text style={[
                styles.timeUntil,
                isToday && styles.todayTimeUntil
              ]}>
                {isToday ? 'Today' : formatDate(item.date)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.appointmentBody}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{item.service}</Text>
            <Text style={styles.priceText}>${item.price}</Text>
          </View>
          
          <View style={styles.appointmentDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color={getStatusColor(item.status)} />
              <Text style={[
                styles.detailText,
                isToday && isUpcoming && styles.todayText
              ]}>
                {formatDate(item.date)} at {item.time}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={16} color={COLORS.lightGray} />
              <Text style={styles.detailText}>{item.duration} minutes</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MapPin size={16} color={COLORS.lightGray} />
              <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
            </View>
          </View>
          
          <View style={styles.appointmentFooter}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                styles.phoneButton
              ]}
              onPress={() => console.log('Call provider:', item.phone)}
            >
              <Phone size={16} color={COLORS.primary} />
              <Text style={styles.phoneText}>Call</Text>
            </TouchableOpacity>
            
            {isUpcoming && (
              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  styles.directionsButton
                ]}
                onPress={() => console.log('Get directions to:', item.address)}
              >
                <Navigation size={16} color={COLORS.accent} />
                <Text style={styles.directionsText}>Directions</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Note:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const upcomingCount = appointments.filter(apt => apt.status === "upcoming").length;
  const completedCount = appointments.filter(apt => apt.status === "completed").length;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Your Appointments</Text>
        <Text style={styles.subtitle}>
          {upcomingCount} upcoming • {completedCount} completed
        </Text>
      </View>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {["all", "upcoming", "completed", "cancelled"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.activeFilterButton,
              ]}
              onPress={() => setFilterStatus(status as typeof filterStatus)}
              testID={`filter-${status}`}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.activeFilterButtonText,
              ]}>
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Appointments List */}
      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>No appointments found</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === "all" 
                ? "Book your first appointment to get started"
                : `No ${filterStatus} appointments`
              }
            </Text>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => router.push("/(app)/(client)/(tabs)/home")}
            >
              <Text style={styles.bookButtonText}>FIND PROVIDERS</Text>
            </TouchableOpacity>
          </View>
        }
        testID="appointments-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "bold" as const,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  filterContainer: {
    paddingBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...GLASS_STYLES.card,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  activeFilterButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  appointmentCard: {
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    position: 'relative',
    overflow: 'hidden',
  },
  todayCard: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  completedCard: {
    opacity: 0.8,
  },
  cancelledCard: {
    opacity: 0.6,
  },
  statusStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  todayBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  todayBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  pulseContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    opacity: 0.6,
  },
  zapIcon: {
    marginLeft: 4,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  providerImageContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  providerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  completedOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  providerDetails: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.lightGray,
    marginLeft: 4,
    fontFamily: FONTS.regular,
  },
  providerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600" as const,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  shopName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  todayStatusBadge: {
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: COLORS.white,
    fontFamily: FONTS.bold,
    marginLeft: 4,
  },
  timeUntil: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.lightGray,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  todayTimeUntil: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },
  appointmentBody: {
    width: "100%",
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    flex: 1,
  },
  appointmentDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    marginLeft: SPACING.sm,
    flex: 1,
    fontFamily: FONTS.regular,
  },
  todayText: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },
  appointmentFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  phoneButton: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
  },
  directionsButton: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
  },
  phoneText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  directionsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    marginLeft: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  priceText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold" as const,
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },
  notesContainer: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  notesLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontStyle: "italic",
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    marginTop: SPACING.lg,
    fontWeight: "600" as const,
    fontFamily: FONTS.bold,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginTop: SPACING.sm,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  bookButton: {
    ...GLASS_STYLES.button.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
  },
  bookButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: "bold" as const,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
});