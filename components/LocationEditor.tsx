import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/constants/theme';

type LocationType = 'shop' | 'mobile' | 'home';
type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

type TimeSlot = {
  open: string;
  close: string;
};

type BusinessHours = {
  [key in DayOfWeek]: {
    isOpen: boolean;
    hours: TimeSlot;
  };
};

type LocationData = {
  locationType: LocationType;
  shopName: string;
  streetAddress: string;
  unit: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessHours: BusinessHours;
};

type LocationEditorProps = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (locationData: LocationData) => void;
  initialData?: LocationData;
};

const defaultBusinessHours: BusinessHours = {
  Sunday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Monday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Tuesday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Wednesday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Thursday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Friday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Saturday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
};

const defaultLocationData: LocationData = {
  locationType: 'shop',
  shopName: '',
  streetAddress: '',
  unit: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  businessHours: defaultBusinessHours,
};

const LocationEditor: React.FC<LocationEditorProps> = ({
  isVisible,
  onClose,
  onSave,
  initialData = defaultLocationData,
}) => {
  const [locationData, setLocationData] = useState<LocationData>(initialData);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedTimeType, setSelectedTimeType] = useState<'open' | 'close'>('open');
  const [tempHour, setTempHour] = useState('9');
  const [tempMinute, setTempMinute] = useState('00');
  const [tempAmPm, setTempAmPm] = useState<'AM' | 'PM'>('AM');

  const handleSave = () => {
    onSave(locationData);
    onClose();
  };

  const toggleDayStatus = (day: DayOfWeek) => {
    setLocationData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          isOpen: !prev.businessHours[day].isOpen,
        },
      },
    }));
  };

  const openTimePicker = (day: DayOfWeek, type: 'open' | 'close') => {
    setSelectedDay(day);
    setSelectedTimeType(type);
    
    // Parse current time
    const timeStr = locationData.businessHours[day].hours[type];
    const [time, period] = timeStr.split(' ');
    const [hour, minute] = time.split(':');
    
    setTempHour(hour);
    setTempMinute(minute);
    setTempAmPm(period as 'AM' | 'PM');
    
    setShowTimePicker(true);
  };

  const confirmTimeSelection = () => {
    if (selectedDay) {
      const formattedTime = `${tempHour}:${tempMinute} ${tempAmPm}`;
      
      setLocationData(prev => ({
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [selectedDay]: {
            ...prev.businessHours[selectedDay],
            hours: {
              ...prev.businessHours[selectedDay].hours,
              [selectedTimeType]: formattedTime,
            },
          },
        },
      }));
      
      setShowTimePicker(false);
    }
  };

  const renderTimePicker = () => {
    const hours = ['7', '8', '9', '10', '11', '12', '1', '2', '3', '4', '5', '6'];
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
    
    return (
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
      >
        <View style={styles.timePickerModalContainer}>
          <View style={styles.timePickerContent}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <ChevronLeft size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.timePickerTitle}>
                {selectedDay} - {selectedTimeType === 'open' ? 'Opening' : 'Closing'} Time
              </Text>
              <TouchableOpacity onPress={confirmTimeSelection}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerBody}>
              <View style={styles.timePickerColumn}>
                {hours.map(hour => (
                  <TouchableOpacity 
                    key={hour}
                    style={[styles.timeOption, tempHour === hour && styles.selectedTimeOption]}
                    onPress={() => setTempHour(hour)}
                  >
                    <Text style={[styles.timeOptionText, tempHour === hour && styles.selectedTimeOptionText]}>
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.timePickerColumn}>
                {minutes.map(minute => (
                  <TouchableOpacity 
                    key={minute}
                    style={[styles.timeOption, tempMinute === minute && styles.selectedTimeOption]}
                    onPress={() => setTempMinute(minute)}
                  >
                    <Text style={[styles.timeOptionText, tempMinute === minute && styles.selectedTimeOptionText]}>
                      {minute}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.timePickerColumn}>
                <TouchableOpacity 
                  style={[styles.timeOption, tempAmPm === 'AM' && styles.selectedTimeOption]}
                  onPress={() => setTempAmPm('AM')}
                >
                  <Text style={[styles.timeOptionText, tempAmPm === 'AM' && styles.selectedTimeOptionText]}>
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.timeOption, tempAmPm === 'PM' && styles.selectedTimeOption]}
                  onPress={() => setTempAmPm('PM')}
                >
                  <Text style={[styles.timeOptionText, tempAmPm === 'PM' && styles.selectedTimeOptionText]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.timePreview}>
              <Text style={styles.timePreviewText}>
                {tempHour}:{tempMinute} {tempAmPm}
              </Text>
              <Text style={styles.timePreviewLabel}>
                {selectedTimeType === 'open' ? 'Opening' : 'Closing'} Time
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelButton}>CANCEL</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>EDIT LOCATION</Text>
          
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.saveButton}>SAVE</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADDRESS</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Location Type"
                placeholderTextColor="#777"
                value={locationData.locationType}
                onChangeText={(text) => setLocationData({...locationData, locationType: text as LocationType})}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Barbershop Name"
                placeholderTextColor="#777"
                value={locationData.shopName}
                onChangeText={(text) => setLocationData({...locationData, shopName: text})}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Street Address"
                placeholderTextColor="#777"
                value={locationData.streetAddress}
                onChangeText={(text) => setLocationData({...locationData, streetAddress: text})}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Building, Floor, Suite, Unit, etc."
                placeholderTextColor="#777"
                value={locationData.unit}
                onChangeText={(text) => setLocationData({...locationData, unit: text})}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#777"
                value={locationData.city}
                onChangeText={(text) => setLocationData({...locationData, city: text})}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="State/Region"
                placeholderTextColor="#777"
                value={locationData.state}
                onChangeText={(text) => setLocationData({...locationData, state: text})}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Zip Code"
                placeholderTextColor="#777"
                value={locationData.zipCode}
                onChangeText={(text) => setLocationData({...locationData, zipCode: text})}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.countryContainer}>
              <Text style={styles.countryLabel}>COUNTRY</Text>
              <Text style={styles.countryValue}>{locationData.country}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HOURS</Text>
            
            {(Object.keys(locationData.businessHours) as DayOfWeek[]).map((day) => (
              <View key={day} style={styles.dayRow}>
                <TouchableOpacity 
                  style={[styles.dayToggle, locationData.businessHours[day].isOpen && styles.dayToggleActive]}
                  onPress={() => toggleDayStatus(day)}
                >
                  {locationData.businessHours[day].isOpen && (
                    <View style={styles.dayToggleIndicator} />
                  )}
                </TouchableOpacity>
                
                <Text style={styles.dayName}>{day}</Text>
                
                {locationData.businessHours[day].isOpen ? (
                  <View style={styles.timeContainer}>
                    <TouchableOpacity 
                      style={styles.timeButton}
                      onPress={() => openTimePicker(day, 'open')}
                    >
                      <Text style={styles.timeText}>
                        {locationData.businessHours[day].hours.open}
                      </Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.timeSeparator}>-</Text>
                    
                    <TouchableOpacity 
                      style={styles.timeButton}
                      onPress={() => openTimePicker(day, 'close')}
                    >
                      <Text style={styles.timeText}>
                        {locationData.businessHours[day].hours.close}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.closedText}>Closed</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
        
        {renderTimePicker()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerButton: {
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  cancelButton: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  saveButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontFamily: FONTS.bold,
  },
  inputContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    height: 50,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  countryContainer: {
    paddingHorizontal: 16,
  },
  countryLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
    fontFamily: FONTS.regular,
  },
  countryValue: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayToggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    marginRight: 16,
    justifyContent: 'center',
  },
  dayToggleActive: {
    backgroundColor: COLORS.primary,
  },
  dayToggleIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.text,
    marginLeft: 20,
  },
  dayName: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  timeSeparator: {
    fontSize: 14,
    color: COLORS.text,
    marginHorizontal: 4,
    fontFamily: FONTS.regular,
  },
  closedText: {
    fontSize: 14,
    color: '#777',
    fontFamily: FONTS.regular,
  },
  timePickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timePickerContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timePickerTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  doneButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  timePickerBody: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  selectedTimeOption: {
    backgroundColor: COLORS.primary,
  },
  timeOptionText: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  selectedTimeOptionText: {
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  timePreview: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  timePreviewText: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  timePreviewLabel: {
    fontSize: 14,
    color: '#777',
    fontFamily: FONTS.regular,
  },
});

export default LocationEditor;