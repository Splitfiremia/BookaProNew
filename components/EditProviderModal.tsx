import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageWithFallback from '@/components/ImageWithFallback';
import { X, User, DollarSign, Shield, Camera, Upload } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  role: 'admin' | 'standard' | 'associate';
  compensationModel: 'commission' | 'booth_rent';
  commissionRate: number;
  boothRentFee: number;
  isActive: boolean;
  shopId: string;
  joinedDate: string;
  totalEarnings: number;
  clientCount: number;
  occupancyRate: number;
}

interface EditProviderModalProps {
  visible: boolean;
  provider: Provider | null;
  onClose: () => void;
  onSave: (provider: Provider) => void;
}

const roleOptions = [
  { value: 'admin', label: 'Admin', description: 'Can manage other providers and view shop reports' },
  { value: 'standard', label: 'Standard', description: 'Can manage their own appointments and clients' },
  { value: 'associate', label: 'Associate', description: 'Read-only access to their schedule' },
] as const;

export default function EditProviderModal({ visible, provider, onClose, onSave }: EditProviderModalProps) {
  const [editedProvider, setEditedProvider] = useState<Provider | null>(provider);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setEditedProvider(provider);
  }, [provider]);

  if (!editedProvider) return null;

  const pickImage = async () => {
    try {
      // Request permissions first on iOS
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images!');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateProvider({ profileImage: result.assets[0].uri });
        setError('');
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos!');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateProvider({ profileImage: result.assets[0].uri });
        setError('');
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Failed to take photo. Please try again.');
    }
  };

  const handleSave = () => {
    if (!editedProvider.name.trim()) {
      Alert.alert('Error', 'Provider name is required');
      return;
    }

    if (editedProvider.compensationModel === 'commission' && (editedProvider.commissionRate < 0 || editedProvider.commissionRate > 100)) {
      Alert.alert('Error', 'Commission rate must be between 0 and 100');
      return;
    }

    if (editedProvider.compensationModel === 'booth_rent' && editedProvider.boothRentFee < 0) {
      Alert.alert('Error', 'Booth rent fee must be a positive number');
      return;
    }

    onSave(editedProvider);
    onClose();
  };

  const updateProvider = (updates: Partial<Provider>) => {
    setEditedProvider(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Provider</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Image Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Profile Image</Text>
            </View>
            
            <View style={styles.profileImageContainer}>
              <View style={styles.imageContainer}>
                {editedProvider.profileImage ? (
                  <ImageWithFallback 
                    source={{ uri: editedProvider.profileImage }} 
                    style={styles.profileImage} 
                    fallbackIcon="user" 
                    testID="profile-image"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Upload size={40} color={COLORS.secondary} />
                  </View>
                )}
              </View>

              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity 
                  style={styles.imageButton} 
                  onPress={pickImage}
                  testID="pick-image-button"
                >
                  <Upload size={20} color={COLORS.primary} />
                  <Text style={styles.imageButtonText}>Upload Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.imageButton} 
                  onPress={takePhoto}
                  testID="take-photo-button"
                >
                  <Camera size={20} color={COLORS.primary} />
                  <Text style={styles.imageButtonText}>Take Photo</Text>
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </View>

          {/* Basic Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editedProvider.name}
                onChangeText={(text) => updateProvider({ name: text })}
                placeholder="Provider name"
                testID="provider-name-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editedProvider.email}
                onChangeText={(text) => updateProvider({ email: text })}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                testID="provider-email-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.textInput}
                value={editedProvider.phone}
                onChangeText={(text) => updateProvider({ phone: text })}
                placeholder="Phone number"
                keyboardType="phone-pad"
                testID="provider-phone-input"
              />
            </View>
          </View>

          {/* Permission Level Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Permission Level</Text>
            </View>
            
            {roleOptions.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleOption,
                  editedProvider.role === role.value && styles.roleOptionSelected
                ]}
                onPress={() => updateProvider({ role: role.value })}
                testID={`role-${role.value}`}
              >
                <View style={styles.roleContent}>
                  <Text style={[
                    styles.roleLabel,
                    editedProvider.role === role.value && styles.roleSelectedText
                  ]}>
                    {role.label}
                  </Text>
                  <Text style={[
                    styles.roleDescription,
                    editedProvider.role === role.value && styles.roleSelectedDescription
                  ]}>
                    {role.description}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  editedProvider.role === role.value && styles.radioButtonSelected
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Compensation Model Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Compensation Model</Text>
            </View>
            
            <View style={styles.compensationToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  editedProvider.compensationModel === 'commission' && styles.toggleOptionActive
                ]}
                onPress={() => updateProvider({ compensationModel: 'commission' })}
                testID="compensation-commission"
              >
                <Text style={[
                  styles.toggleText,
                  editedProvider.compensationModel === 'commission' && styles.toggleTextActive
                ]}>
                  Commission
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  editedProvider.compensationModel === 'booth_rent' && styles.toggleOptionActive
                ]}
                onPress={() => updateProvider({ compensationModel: 'booth_rent' })}
                testID="compensation-booth-rent"
              >
                <Text style={[
                  styles.toggleText,
                  editedProvider.compensationModel === 'booth_rent' && styles.toggleTextActive
                ]}>
                  Booth Rent
                </Text>
              </TouchableOpacity>
            </View>

            {editedProvider.compensationModel === 'commission' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Commission Rate (%)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProvider.commissionRate.toString()}
                  onChangeText={(text) => {
                    const rate = parseFloat(text) || 0;
                    updateProvider({ commissionRate: rate });
                  }}
                  placeholder="60"
                  keyboardType="numeric"
                  testID="commission-rate-input"
                />
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weekly Booth Rent ($)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProvider.boothRentFee.toString()}
                  onChangeText={(text) => {
                    const fee = parseFloat(text) || 0;
                    updateProvider({ boothRentFee: fee });
                  }}
                  placeholder="200"
                  keyboardType="numeric"
                  testID="booth-rent-input"
                />
              </View>
            )}
          </View>

          {/* Status Section */}
          <View style={styles.section}>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.statusLabel}>Active Status</Text>
                <Text style={styles.statusDescription}>
                  {editedProvider.isActive ? 'Provider has full access' : 'Provider access is disabled'}
                </Text>
              </View>
              <Switch
                value={editedProvider.isActive}
                onValueChange={(value) => updateProvider({ isActive: value })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={editedProvider.isActive ? '#fff' : '#f4f3f4'}
                testID="active-status-switch"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 6,
  },
  imageButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.card,
  },
  roleOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  roleContent: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  roleSelectedText: {
    color: COLORS.primary,
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  roleSelectedDescription: {
    color: COLORS.primary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginLeft: 12,
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  compensationToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  toggleTextActive: {
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: COLORS.secondary,
  },
});