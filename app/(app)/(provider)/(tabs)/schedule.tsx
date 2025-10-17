import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Clock, User, MapPin, ChevronRight, Filter, Plus } from "lucide-react-native";
import { router } from "expo-router";
import { COLORS, FONTS, GLASS_STYLES } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import ProviderFunctionButtons from "@/components/ProviderFunctionButtons";
import ManualAppointmentModal from "@/components/ManualAppointmentModal";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: Date;
  time: string;
  duration: number;
  status: "upcoming" | "in-progress" | "completed" | "cancelled";
  price: number;
  location?: string;
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
    "Keratin Treatment",
    "Hair Extensions",
    "Beard Trim",
    "Hot Shave",
  ];
  const clients = [
    "Sarah Johnson",
    "Mike Chen",
    "Emily Davis",
    "James Wilson",
    "Lisa Anderson",
    "Robert Taylor",
    "Maria Garcia",
    "David Brown",
  ];
  const statuses: Appointment["status"][] = ["upcoming", "in-progress", "completed", "cancelled"];
  
  const today = new Date();
  
  // Generate appointments for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + dayOffset);
    
    // Generate 3-8 appointments per day
    const appointmentsPerDay = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < appointmentsPerDay; i++) {
      const hour = 9 + Math.floor(Math.random() * 10); // 9 AM to 6 PM
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      appointments.push({
        id: `apt-${dayOffset}-${i}`,
        clientName: clients[Math.floor(Math.random() * clients.length)],
        service: services[Math.floor(Math.random() * services.length)],
        date: appointmentDate,
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        duration: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
        status: dayOffset === 0 && i === 0 ? "in-progress" : 
                dayOffset < 0 ? "completed" : 
                Math.random() > 0.9 ? "cancelled" : "upcoming",
        price: Math.floor(Math.random() * 150) + 50,
        location: Math.random() > 0.7 ? "Home Visit" : "Studio",
        notes: Math.random() > 0.7 ? "Regular client, prefers organic products" : undefined,
      });
    }
  }
  
  // Add some manual appointments to show different styling
  appointments.push({
    id: 'manual-1',
    clientName: 'Walk-in Client',
    service: 'Quick Trim',
    date: today,
    time: '15:30',
    duration: 30,
    status: 'upcoming',
    price: 35,
    location: 'Studio',
    notes: 'Manual appointment - cash payment',
  });
  
  return appointments.sort((a, b) => {
    const dateA = new Date(`${a.date.toDateString()} ${a.time}`);
    const dateB = new Date(`${b.date.toDateString()} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
};

export default function ProviderScheduleScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [appointments] = useState<Appointment[]>(generateMockAppointments());
  const [filterStatus, setFilterStatus] = useState<Appointment["status"] | "all">("all");
  const [showManualAppointmentModal, setShowManualAppointmentModal] = useState(false);
  const [showFabOptions, setShowFabOptions] = useState(false);

  // Filter appointments for selected date
  const todayAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const isSameDay = apt.date.toDateString() === selectedDate.toDateString();
      const matchesFilter = filterStatus === "all" || apt.status === filterStatus;
      return isSameDay && matchesFilter;
    });
  }, [appointments, selectedDate, filterStatus]);

  // Get week dates for horizontal calendar
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return COLORS.primary;
      case "in-progress":
        return COLORS.warning;
      case "completed":
        return COLORS.success;
      case "cancelled":
        return COLORS.error;
      default:
        return COLORS.text;
    }
  };

  const renderAppointment = useCallback(({ item }: { item: Appointment }) => {
    const isManualAppointment = item.id.startsWith('manual-');
    
    return (
      <TouchableOpacity
        style={[
          styles.appointmentCard,
          isManualAppointment && styles.manualAppointmentCard
        ]}
        onPress={() => router.push(`/(app)/(provider)/appointment/${item.id}`)}
      >
        <View style={styles.appointmentHeader}>
          <View style={styles.timeContainer}>
            <Clock size={16} color={COLORS.primary} />
            <Text style={styles.appointmentTime}>{item.time}</Text>
            <Text style={styles.appointmentDuration}>({item.duration} min)</Text>
            {isManualAppointment && (
              <View style={styles.manualBadge}>
                <Text style={styles.manualBadgeText}>MANUAL</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.replace("-", " ").toUpperCase()}
            </Text>
          </View>
        </View>

      <View style={styles.appointmentBody}>
        <View style={styles.clientInfo}>
          <User size={18} color={COLORS.text} />
          <Text style={styles.clientName}>{item.clientName}</Text>
        </View>
        <Text style={styles.serviceName}>{item.service}</Text>
        <View style={styles.appointmentFooter}>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={COLORS.text} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
        {item.notes && (
          <Text style={styles.notesText}>Note: {item.notes}</Text>
        )}
      </View>
      
      <View style={styles.chevronContainer}>
        <ChevronRight size={20} color={COLORS.text} />
      </View>
    </TouchableOpacity>
  );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.mainContainer}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || "Provider"}!</Text>
          <Text style={styles.subtitle}>Your schedule for today</Text>
        </View>
        
        {/* Provider Function Buttons */}
        <ProviderFunctionButtons />

        {/* Date selection moved to Schedule functionality */}

        {/* Filter Buttons - Fixed */}
        <View style={styles.filterContainerWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {["all", "upcoming", "in-progress", "completed", "cancelled"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filterStatus === status && styles.activeFilterButton,
                ]}
                onPress={() => setFilterStatus(status as typeof filterStatus)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterStatus === status && styles.activeFilterButtonText,
                ]}>
                  {status === "all" ? "All" : status.replace("-", " ").charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Scrollable Content Area */}
        <View style={styles.scrollableArea}>
          <FlatList
            data={todayAppointments}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Calendar size={48} color={COLORS.text} />
                <Text style={styles.emptyText}>No appointments for this day</Text>
                <Text style={styles.emptySubtext}>Pull down to refresh</Text>
              </View>
            }
          />
        </View>

        {/* Quick Actions - Fixed at bottom */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(app)/(provider)/availability")}
          >
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Availability</Text>
          </TouchableOpacity>
        </View>

        {/* Floating Action Button */}
        <View style={styles.fabContainer}>
          {showFabOptions && (
            <View style={styles.fabOptionsContainer}>
              <TouchableOpacity
                style={styles.fabOption}
                onPress={() => {
                  setShowManualAppointmentModal(true);
                  setShowFabOptions(false);
                }}
              >
                <Text style={styles.fabOptionText}>Add Manual Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowFabOptions(!showFabOptions)}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Manual Appointment Modal */}
        <ManualAppointmentModal
          visible={showManualAppointmentModal}
          onClose={() => setShowManualAppointmentModal(false)}
          clients={[
            { id: 'client-1', name: 'Sarah Johnson', phone: '(555) 123-4567' },
            { id: 'client-2', name: 'Mike Chen', phone: '(555) 234-5678' },
            { id: 'client-3', name: 'Emily Davis', phone: '(555) 345-6789' },
            { id: 'client-4', name: 'James Wilson', phone: '(555) 456-7890' },
            { id: 'client-5', name: 'Lisa Anderson', phone: '(555) 567-8901' },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: 4,
  },
  calendarContainer: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  weekCalendarContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateCard: {
    width: 60,
    height: 80,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedDateCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  todayDateCard: {
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  selectedDateText: {
    color: "#FFFFFF",
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  filterContainerWrapper: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...GLASS_STYLES.card,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scrollableArea: {
    flex: 1,
    marginBottom: 80, // Space for the quick actions
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chevronContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
  },
  appointmentCard: {
    ...GLASS_STYLES.card,
    padding: 16,
    marginBottom: 12,
    flexDirection: "column",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  appointmentDuration: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  appointmentBody: {
    width: "100%",
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  serviceName: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 8,
  },
  appointmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.success,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.6,
    marginTop: 8,
    fontStyle: "italic",
  },
  chevron: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.6,
    marginTop: 8,
  },
  quickActions: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 80,
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.background,
    paddingTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    ...GLASS_STYLES.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "600",
  },
  manualAppointmentCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  manualBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  manualBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  fabOptionsContainer: {
    marginBottom: 12,
    ...GLASS_STYLES.card,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  fabOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  fabOptionText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});