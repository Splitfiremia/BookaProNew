import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import {
  X,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  User,
  DollarSign,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useShopManagement } from "@/providers/ShopManagementProvider";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: number;
  clientName: string;
  stylistName: string;
  shopId: string;
  shopName: string;
  service: string;
  price: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
}

export default function MultiShopCalendar() {
  const { user } = useAuth();
  const { shops } = useShopManagement();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShops, setSelectedShops] = useState<string[]>(shops.map(shop => shop.id));
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  // Mock calendar events - in real app, this would come from appointments provider
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Haircut & Style",
      time: "09:00",
      duration: 60,
      clientName: "Sarah Johnson",
      stylistName: "Maria Garcia",
      shopId: "shop-1",
      shopName: "Downtown Hair Studio",
      service: "Haircut & Style",
      price: 85,
      status: "confirmed",
    },
    {
      id: "2",
      title: "Color & Highlights",
      time: "10:30",
      duration: 120,
      clientName: "Emily Chen",
      stylistName: "Jessica Williams",
      shopId: "shop-2",
      shopName: "Uptown Beauty Lounge",
      service: "Color & Highlights",
      price: 150,
      status: "confirmed",
    },
    {
      id: "3",
      title: "Blowout",
      time: "14:00",
      duration: 45,
      clientName: "Amanda Davis",
      stylistName: "Maria Garcia",
      shopId: "shop-1",
      shopName: "Downtown Hair Studio",
      service: "Blowout",
      price: 55,
      status: "pending",
    },
    {
      id: "4",
      title: "Premium Cut & Style",
      time: "15:30",
      duration: 75,
      clientName: "Lisa Thompson",
      stylistName: "Rachel Martinez",
      shopId: "shop-2",
      shopName: "Uptown Beauty Lounge",
      service: "Premium Cut & Style",
      price: 120,
      status: "confirmed",
    },
  ];

  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => selectedShops.includes(event.shopId));
  }, [mockEvents, selectedShops]);

  const eventsByHour = useMemo(() => {
    const hours: { [key: string]: CalendarEvent[] } = {};
    
    for (let hour = 8; hour <= 20; hour++) {
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      hours[hourKey] = filteredEvents.filter(event => {
        const eventHour = parseInt(event.time.split(':')[0]);
        return eventHour === hour;
      });
    }
    
    return hours;
  }, [filteredEvents]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#10B981";
      case "pending": return "#F59E0B";
      case "completed": return "#6B7280";
      case "cancelled": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const toggleShopFilter = (shopId: string) => {
    setSelectedShops(prev => 
      prev.includes(shopId) 
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    );
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  if (user?.role !== "owner") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Multi-Shop Calendar</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.noAccessText}>Multi-shop calendar is only available for shop owners.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Multi-Shop Calendar</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Filter size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={() => navigateDate("prev")} style={styles.navButton}>
          <ChevronLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>
        
        <TouchableOpacity onPress={() => navigateDate("next")} style={styles.navButton}>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === "day" && styles.viewModeButtonActive]}
          onPress={() => setViewMode("day")}
        >
          <Text style={[styles.viewModeText, viewMode === "day" && styles.viewModeTextActive]}>
            Day
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === "week" && styles.viewModeButtonActive]}
          onPress={() => setViewMode("week")}
        >
          <Text style={[styles.viewModeText, viewMode === "week" && styles.viewModeTextActive]}>
            Week
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shop Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopFilters}>
        {shops.map((shop) => (
          <TouchableOpacity
            key={shop.id}
            style={[
              styles.shopFilter,
              selectedShops.includes(shop.id) && styles.shopFilterActive,
            ]}
            onPress={() => toggleShopFilter(shop.id)}
          >
            <MapPin size={14} color={selectedShops.includes(shop.id) ? "#FFFFFF" : "#9CA3AF"} />
            <Text style={[
              styles.shopFilterText,
              selectedShops.includes(shop.id) && styles.shopFilterTextActive,
            ]}>
              {shop.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Calendar Content */}
      <ScrollView style={styles.calendarContent} showsVerticalScrollIndicator={false}>
        {Object.entries(eventsByHour).map(([hour, events]) => (
          <View key={hour} style={styles.hourSlot}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{hour}</Text>
            </View>
            
            <View style={styles.eventsColumn}>
              {events.length === 0 ? (
                <View style={styles.emptySlot} />
              ) : (
                events.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventCard,
                      { borderLeftColor: getStatusColor(event.status) },
                    ]}
                  >
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.service}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                        <Text style={styles.statusText}>{event.status}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetail}>
                        <User size={12} color="#9CA3AF" />
                        <Text style={styles.eventDetailText}>{event.clientName}</Text>
                      </View>
                      
                      <View style={styles.eventDetail}>
                        <MapPin size={12} color="#9CA3AF" />
                        <Text style={styles.eventDetailText}>{event.shopName}</Text>
                      </View>
                      
                      <View style={styles.eventDetail}>
                        <Clock size={12} color="#9CA3AF" />
                        <Text style={styles.eventDetailText}>
                          {event.time} ({event.duration}min)
                        </Text>
                      </View>
                      
                      <View style={styles.eventDetail}>
                        <DollarSign size={12} color="#9CA3AF" />
                        <Text style={styles.eventDetailText}>{formatCurrency(event.price)}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.stylistName}>with {event.stylistName}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        ))}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noAccessText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
  },
  dateNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#1F2937",
  },
  dateInfo: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  viewModeButtonActive: {
    backgroundColor: "#374151",
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  viewModeTextActive: {
    color: "#FFFFFF",
  },
  shopFilters: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  shopFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  shopFilterActive: {
    backgroundColor: "#3B82F6",
  },
  shopFilterText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  shopFilterTextActive: {
    color: "#FFFFFF",
  },
  calendarContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hourSlot: {
    flexDirection: "row",
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  timeColumn: {
    width: 60,
    paddingTop: 8,
    paddingRight: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  eventsColumn: {
    flex: 1,
    paddingVertical: 8,
    gap: 8,
  },
  emptySlot: {
    height: 64,
  },
  eventCard: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  eventDetails: {
    gap: 4,
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventDetailText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  stylistName: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  bottomPadding: {
    height: 40,
  },
});