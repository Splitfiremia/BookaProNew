import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Edit3, 
  Clock, 
  DollarSign,
  Save,
  X
} from 'lucide-react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '@/constants/theme';
import { mockAppointments } from '@/mocks/appointments';

// Define client interface (same as in clients.tsx)
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

// Generate clients from appointments data (same logic as clients.tsx)
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

// Helper functions (same as clients.tsx)
const monthToNumber = (month: string): number => {
  const months: { [key: string]: number } = {
    'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
    'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
  };
  return months[month.toUpperCase()] || 1;
};

const generateFirstName = (): string => {
  const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix', 'Skyler', 'Cameron', 'Emery', 'Finley', 'Hayden', 'Kendall', 'Logan', 'Parker', 'Reese'];
  return names[Math.floor(Math.random() * names.length)];
};

const generateLastName = (): string => {
  const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  return names[Math.floor(Math.random() * names.length)];
};

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

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [editedNotes, setEditedNotes] = useState<string>('');
  const insets = useSafeAreaInsets();
  
  // Find the client
  const client = clients.find(c => c.id === id);
  
  if (!client) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Client Not Found' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Client not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Get client's appointment history
  const clientAppointments = mockAppointments.filter(
    appointment => `client-${appointment.id}` === client.id
  );
  
  const handleCall = () => {
    const phoneNumber = client.phone.replace(/[^\d]/g, '');
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Unable to make phone call');
      }
    });
  };
  
  const handleMessage = () => {
    const phoneNumber = client.phone.replace(/[^\d]/g, '');
    Linking.openURL(`sms:${phoneNumber}`).catch(() => {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Unable to send message');
      }
    });
  };
  
  const handleBookAppointment = () => {
    router.push({
      pathname: '/(app)/(provider)/booking',
      params: { clientId: client.id, clientName: client.name }
    });
  };
  
  const handleEditNotes = () => {
    setEditedNotes(client.notes || '');
    setShowNotesModal(true);
  };
  
  const handleSaveNotes = () => {
    // In a real app, this would save to the backend
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Notes saved successfully');
    }
    setShowNotesModal(false);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  

  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top }}>
        {/* Client Header */}
        <View style={styles.clientHeader}>
          <Image source={{ uri: client.image }} style={styles.clientImage} />
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientStats}>
              {client.visitCount} visits • ${client.totalSpent} total spent
            </Text>
            <Text style={styles.lastVisit}>
              Last visit: {formatDate(client.lastVisit)}
            </Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleBookAppointment}
            testID="book-appointment-button"
          >
            <Calendar size={20} color="#000" />
            <Text style={styles.primaryButtonText}>Book Appointment</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleCall}
              testID="call-button"
            >
              <Phone size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleMessage}
              testID="message-button"
            >
              <MessageSquare size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditNotes}
              testID="edit-notes-button"
            >
              <Edit3 size={16} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.notesContainer}>
            {client.notes ? (
              <Text style={styles.notesText}>{client.notes}</Text>
            ) : (
              <Text style={styles.emptyNotesText}>
                No notes yet. Tap &quot;Edit&quot; to add notes about this client.
              </Text>
            )}
          </View>
        </View>
        
        {/* Appointment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment History</Text>
          
          {clientAppointments.length > 0 ? (
            clientAppointments.map((appointment) => (
              <TouchableOpacity 
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => router.push(`/(app)/(provider)/appointment/${appointment.id}`)}
                testID={`appointment-${appointment.id}`}
              >
                <View style={styles.appointmentDate}>
                  <Text style={styles.appointmentDay}>{appointment.day}</Text>
                  <Text style={styles.appointmentDateNum}>{appointment.date}</Text>
                  <Text style={styles.appointmentMonth}>{appointment.month}</Text>
                </View>
                
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentService}>{appointment.service}</Text>
                  <View style={styles.appointmentMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={COLORS.lightGray} />
                      <Text style={styles.metaText}>{appointment.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <DollarSign size={14} color={COLORS.lightGray} />
                      <Text style={styles.metaText}>${appointment.price}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: 
                      appointment.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 
                      appointment.status === 'confirmed' ? 'rgba(59, 130, 246, 0.1)' : 
                      appointment.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 
                      'rgba(239, 68, 68, 0.1)'
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    {
                      color: 
                        appointment.status === 'completed' ? COLORS.success : 
                        appointment.status === 'confirmed' ? COLORS.info : 
                        appointment.status === 'pending' ? COLORS.warning : 
                        COLORS.error
                    }
                  ]}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>No appointment history</Text>
            </View>
          )}
        </View>
        
        {/* Bottom Spacing for Back Button */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Bottom Back Button */}
      <View style={[styles.bottomBackButton, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.backButtonWidget}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color="#FFF" />
          <Text style={styles.backButtonWidgetText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      {/* Notes Edit Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowNotesModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Notes</Text>
            <TouchableOpacity 
              onPress={handleSaveNotes}
              style={styles.modalSaveButton}
            >
              <Save size={20} color={COLORS.primary} />
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={styles.notesInput}
              value={editedNotes}
              onChangeText={setEditedNotes}
              placeholder="Add notes about this client..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              textAlignVertical="top"
              testID="notes-input"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.bold,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#000',
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  clientHeader: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clientImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.md,
  },
  clientInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  clientStats: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 4,
    fontFamily: FONTS.regular,
  },
  lastVisit: {
    fontSize: 14,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  actionButtons: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  notesContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  emptyNotesText: {
    fontSize: 16,
    color: COLORS.lightGray,
    fontStyle: 'italic',
    fontFamily: FONTS.regular,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appointmentDate: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 50,
  },
  appointmentDay: {
    fontSize: 12,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  appointmentDateNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  appointmentMonth: {
    fontSize: 12,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  appointmentMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  emptyHistory: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: COLORS.lightGray,
    fontStyle: 'italic',
    fontFamily: FONTS.regular,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  modalSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalSaveText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  notesInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
  },
  bottomBackButton: {
    position: 'absolute',
    left: SPACING.lg,
    zIndex: 10,
  },
  backButtonWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 30,
    gap: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonWidgetText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
});