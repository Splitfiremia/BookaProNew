import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Search, ChevronRight, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '@/constants/theme';
import { mockAppointments } from '@/mocks/appointments';

// Define client interface
interface Client {
  id: string;
  name: string;
  image: string;
  phone: string;
  email: string;
  lastVisit: string;
  lastService: string;
  totalSpent: number;
  visitCount: number;
  notes?: string;
}

// Generate clients from appointments data
const generateClients = (): Client[] => {
  const clientMap = new Map<string, Client>();
  
  mockAppointments.forEach(appointment => {
    const clientId = `client-${appointment.id}`;
    const existingClient = clientMap.get(clientId);
    
    // Parse the date properly
    const monthNum = monthToNumber(appointment.month);
    const dayNum = parseInt(appointment.date, 10) || 1;
    const year = 2025;
    
    // Validate day is within valid range for the month
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const validDay = Math.min(Math.max(1, dayNum), daysInMonth);
    
    // Create a valid date
    let appointmentDate: Date;
    try {
      appointmentDate = new Date(year, monthNum - 1, validDay);
      if (isNaN(appointmentDate.getTime())) {
        appointmentDate = new Date();
      }
    } catch {
      appointmentDate = new Date();
    }
    
    if (existingClient) {
      // Update existing client
      existingClient.totalSpent += appointment.price;
      existingClient.visitCount += 1;
      
      // Update last visit if this appointment is more recent
      const lastVisitDate = new Date(existingClient.lastVisit);
      
      if (appointmentDate > lastVisitDate) {
        existingClient.lastVisit = appointmentDate.toISOString();
        existingClient.lastService = appointment.service;
      }
    } else {
      // Create new client with mock data
      const firstName = generateFirstName();
      const lastName = generateLastName();
      const fullName = `${firstName} ${lastName}`;
      
      clientMap.set(clientId, {
        id: clientId,
        name: fullName,
        image: `https://i.pravatar.cc/150?u=${clientId}`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        lastVisit: appointmentDate.toISOString(),
        lastService: appointment.service,
        totalSpent: appointment.price,
        visitCount: 1,
        notes: Math.random() > 0.7 ? generateRandomNote() : undefined,
      });
    }
  });
  
  return Array.from(clientMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

// Helper function to convert month abbreviation to number
const monthToNumber = (month: string): number => {
  const months: { [key: string]: number } = {
    'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
    'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
  };
  return months[month.toUpperCase()] || 1;
};

// Generate random first names
const generateFirstName = (): string => {
  const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix', 'Skyler', 'Cameron', 'Emery', 'Finley', 'Hayden', 'Kendall', 'Logan', 'Parker', 'Reese'];
  return names[Math.floor(Math.random() * names.length)];
};

// Generate random last names
const generateLastName = (): string => {
  const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  return names[Math.floor(Math.random() * names.length)];
};

// Generate random notes
const generateRandomNote = (): string => {
  const notes = [
    'Prefers shorter cuts, very particular about length',
    'Sensitive scalp, use gentle products',
    'Always tips well, great conversation',
    'Likes to try new styles occasionally',
    'Prefers appointments in the morning',
    'Regular customer, very reliable',
    'Allergic to certain products, check first',
    'Brings coffee for the team sometimes'
  ];
  return notes[Math.floor(Math.random() * notes.length)];
};

const clients = generateClients();

export default function ClientsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const insets = useSafeAreaInsets();
  
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {
      return clients;
    }
    
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastService.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);
  
  const handleClientPress = (client: Client) => {
    router.push({
      pathname: '/(app)/(provider)/client/[id]',
      params: { id: client.id }
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };
  
  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity 
      style={styles.clientCard}
      onPress={() => handleClientPress(item)}
      testID={`client-${item.id}`}
    >
      <ImageWithFallback source={{ uri: item.image || undefined }} style={styles.clientImage} fallbackIcon="user" />
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <View style={styles.clientMeta}>
          <Text style={styles.lastService}>Last service: {item.lastService}</Text>
          <View style={styles.lastVisitContainer}>
            <Clock size={12} color="#999" />
            <Text style={styles.lastVisit}>{formatDate(item.lastVisit)}</Text>
          </View>
        </View>
      </View>
      <ChevronRight color="#666" size={20} />
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="client-search-input"
        />
      </View>
      
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientItem}
        contentContainerStyle={styles.clientList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim() ? 'No clients found matching your search' : 'No clients yet'}
            </Text>
          </View>
        }
        testID="clients-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181611',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    borderRadius: 12,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  clientList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  clientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.sm,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  clientMeta: {
    gap: 4,
  },
  lastService: {
    fontSize: 14,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  lastVisitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastVisit: {
    fontSize: 12,
    color: '#999',
    fontFamily: FONTS.regular,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    borderRadius: 12,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: SPACING.xl,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
});