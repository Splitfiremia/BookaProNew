import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, Calendar, Clock, User, DollarSign, FileText, ChevronDown } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/constants/theme';
import { useServices } from '@/providers/ServicesProvider';
import { useAppointments } from '@/providers/AppointmentProvider';
import { useAuth } from '@/providers/AuthProvider';

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface ManualAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedTime?: string;
  clients?: Client[];
}

interface ServiceOption {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export default function ManualAppointmentModal({
  visible,
  onClose,
  selectedDate,
  selectedTime,
  clients = [],
}: ManualAppointmentModalProps) {
  const { user } = useAuth();
  const { requestAppointment } = useAppointments();
  const servicesContext = useServices();
  
  // Safety check for services context
  console.log('ManualAppointmentModal: servicesContext:', servicesContext);
  console.log('ManualAppointmentModal: getProviderServices available:', !!servicesContext?.getProviderServices);
  
  // Form state - always initialize hooks at top level
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClientName, setNewClientName] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<Date>(selectedDate || new Date());
  const [appointmentTime, setAppointmentTime] = useState<Date>(() => {
    const date = new Date();
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    } else {
      date.setHours(9, 0, 0, 0);
    }
    return date;
  });
  const [notes, setNotes] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get available services with fallback
  const availableServices = useMemo(() => {
    if (!servicesContext?.getProviderServices) {
      console.warn('getProviderServices is not available from ServicesProvider, using fallback services');
      // Fallback services for when context is not available
      return [
        {
          id: 'fallback_1',
          name: "Women's Haircut",
          duration: 45,
          price: 75,
        },
        {
          id: 'fallback_2',
          name: "Men's Haircut",
          duration: 30,
          price: 55,
        },
        {
          id: 'fallback_3',
          name: 'Color & Highlights',
          duration: 120,
          price: 150,
        },
        {
          id: 'fallback_4',
          name: 'Blowout',
          duration: 30,
          price: 45,
        },
      ];
    }
    try {
      const services = servicesContext.getProviderServices();
      return services.map(service => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
      }));
    } catch (error) {
      console.error('Error getting provider services:', error);
      return [];
    }
  }, [servicesContext]);

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return clients;
    return clients.filter(client => 
      client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
    );
  }, [clients, clientSearchQuery]);

  // Reset form
  const resetForm = useCallback(() => {
    setClientType('existing');
    setSelectedClient(null);
    setNewClientName('');
    setClientSearchQuery('');
    setSelectedService(null);
    setCustomPrice('');
    setAppointmentDate(selectedDate || new Date());
    const timeDate = new Date();
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      timeDate.setHours(hours, minutes, 0, 0);
    } else {
      timeDate.setHours(9, 0, 0, 0);
    }
    setAppointmentTime(timeDate);
    setNotes('');
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowClientDropdown(false);
    setShowServiceDropdown(false);
  }, [selectedDate, selectedTime]);

  // Handle modal close
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Validate form
  const isFormValid = useMemo(() => {
    const hasClient = clientType === 'existing' ? selectedClient : newClientName.trim();
    return hasClient && selectedService && appointmentDate && appointmentTime;
  }, [clientType, selectedClient, newClientName, selectedService, appointmentDate, appointmentTime]);

  // Handle save appointment
  const handleSaveAppointment = useCallback(async () => {
    if (!isFormValid || !user?.id) return;

    setIsLoading(true);
    try {
      const clientName = clientType === 'existing' ? selectedClient!.name : newClientName.trim();
      const clientId = clientType === 'existing' ? selectedClient!.id : `temp-client-${Date.now()}`;

      // Format date and time
      const dateStr = appointmentDate.toISOString().split('T')[0];
      const timeStr = appointmentTime.toTimeString().slice(0, 5);
      const endTime = new Date(appointmentTime);
      endTime.setMinutes(endTime.getMinutes() + selectedService!.duration);
      const endTimeStr = endTime.toTimeString().slice(0, 5);

      // Create appointment data
      const appointmentData = {
        clientId,
        providerId: user.id,
        serviceId: selectedService!.id,
        shopId: user.mockData?.profile?.shopId || undefined,
        date: dateStr,
        startTime: timeStr,
        endTime: endTimeStr,
        notes: notes.trim() || `Manual appointment for ${clientName}`,
      };

      await requestAppointment(appointmentData);
      
      Alert.alert(
        'Success',
        `Appointment scheduled for ${clientName} on ${appointmentDate.toLocaleDateString()} at ${timeStr}`,
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      console.error('Error creating appointment:', error);
      Alert.alert('Error', 'Failed to create appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isFormValid, user, selectedService, clientType, selectedClient, newClientName, appointmentDate, appointmentTime, notes, requestAppointment, handleClose]);

  // Handle date change
  const handleDateChange = useCallback((event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setAppointmentDate(date);
    }
  }, []);

  // Handle time change
  const handleTimeChange = useCallback((event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setAppointmentTime(time);
    }
  }, []);
  
  // Don't render loading state - just use fallback services if context is not ready

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Manual Appointment</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Client Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client</Text>
            
            {/* Client Type Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, clientType === 'existing' && styles.activeToggle]}
                onPress={() => setClientType('existing')}
              >
                <Text style={[styles.toggleText, clientType === 'existing' && styles.activeToggleText]}>
                  Existing Client
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, clientType === 'new' && styles.activeToggle]}
                onPress={() => setClientType('new')}
              >
                <Text style={[styles.toggleText, clientType === 'new' && styles.activeToggleText]}>
                  New Client
                </Text>
              </TouchableOpacity>
            </View>

            {clientType === 'existing' ? (
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowClientDropdown(!showClientDropdown)}
                >
                  <User size={20} color={COLORS.text} />
                  <Text style={[styles.dropdownText, !selectedClient && styles.placeholderText]}>
                    {selectedClient ? selectedClient.name : 'Select a client'}
                  </Text>
                  <ChevronDown size={20} color={COLORS.text} />
                </TouchableOpacity>
                
                {showClientDropdown && (
                  <View style={styles.dropdownList}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search clients..."
                      placeholderTextColor={COLORS.lightGray}
                      value={clientSearchQuery}
                      onChangeText={setClientSearchQuery}
                    />
                    <ScrollView style={styles.clientList} nestedScrollEnabled>
                      {filteredClients.map((client) => (
                        <TouchableOpacity
                          key={client.id}
                          style={styles.clientItem}
                          onPress={() => {
                            if (client?.name) {
                              setSelectedClient(client);
                              setShowClientDropdown(false);
                              setClientSearchQuery('');
                            }
                          }}
                        >
                          <Text style={styles.clientName}>{client.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <User size={20} color={COLORS.text} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter client name"
                  placeholderTextColor={COLORS.lightGray}
                  value={newClientName}
                  onChangeText={setNewClientName}
                />
              </View>
            )}
          </View>

          {/* Service Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowServiceDropdown(!showServiceDropdown)}
              >
                <Text style={[styles.dropdownText, !selectedService && styles.placeholderText]}>
                  {selectedService ? selectedService.name : 'Select a service'}
                </Text>
                <ChevronDown size={20} color={COLORS.text} />
              </TouchableOpacity>
              
              {showServiceDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.serviceList} nestedScrollEnabled>
                    {availableServices.map((service) => (
                      <TouchableOpacity
                        key={service.id}
                        style={styles.serviceItem}
                        onPress={() => {
                          if (service?.name && service?.price) {
                            setSelectedService(service);
                            setCustomPrice(service.price.toString());
                            setShowServiceDropdown(false);
                          }
                        }}
                      >
                        <View style={styles.serviceInfo}>
                          <Text style={styles.serviceName}>{service.name}</Text>
                          <Text style={styles.serviceDetails}>
                            {service.duration} min • ${service.price}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Custom Price */}
            {selectedService && (
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={COLORS.text} />
                <TextInput
                  style={styles.textInput}
                  placeholder={`Default: $${selectedService.price}`}
                  placeholderTextColor={COLORS.lightGray}
                  value={customPrice}
                  onChangeText={setCustomPrice}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={[styles.inputContainer, styles.dateTimeInput]}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={COLORS.text} />
                <Text style={styles.dateTimeText}>
                  {appointmentDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.inputContainer, styles.dateTimeInput]}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color={COLORS.text} />
                <Text style={styles.dateTimeText}>
                  {appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <View style={[styles.inputContainer, styles.notesContainer]}>
              <FileText size={20} color={COLORS.text} />
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                placeholder="Add any notes about this appointment..."
                placeholderTextColor={COLORS.lightGray}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, !isFormValid && styles.disabledButton]}
            onPress={handleSaveAppointment}
            disabled={!isFormValid || isLoading}
          >
            <Text style={[styles.saveButtonText, !isFormValid && styles.disabledButtonText]}>
              {isLoading ? 'Saving...' : 'Save Appointment'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={appointmentDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={appointmentTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 4,
    marginBottom: SPACING.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  activeToggleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  placeholderText: {
    color: COLORS.lightGray,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchInput: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  clientList: {
    maxHeight: 150,
  },
  clientItem: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  clientName: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  serviceList: {
    maxHeight: 150,
  },
  serviceItem: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  serviceInfo: {
    gap: 4,
  },
  serviceName: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  serviceDetails: {
    fontSize: 14,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dateTimeInput: {
    flex: 1,
  },
  dateTimeText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  notesContainer: {
    alignItems: 'flex-start',
    minHeight: 80,
  },
  notesInput: {
    minHeight: 60,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  disabledButtonText: {
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});