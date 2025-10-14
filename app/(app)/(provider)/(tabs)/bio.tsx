import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Share as RNShare,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Info, Camera, User, Clock, Link as LinkIcon } from 'lucide-react-native';
import { COLORS, FONTS, GLASS_STYLES, SPACING } from '@/constants/theme';
import LocationEditor from '@/components/LocationEditor';
import { useLocation, LocationData } from '@/providers/LocationProvider';
import AlertModal from '@/components/AlertModal';
import { generateProviderBookingLink } from '@/utils/bookingService';

export default function BioScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'services'>('info');
  const providerName = "Luis Martinez";
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ visible: false, title: '', message: '', type: 'info' });
  const { locationData, saveLocationData } = useLocation();
  
  const handleShareBookingLink = async () => {
    try {
      const bookingLink = generateProviderBookingLink('provider-1', 'shop-1');
      const message = `Book your appointment with ${providerName} directly: ${bookingLink}`;
      
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && 'share' in navigator && typeof (navigator as any).canShare === 'function') {
          const shareData = {
            title: `Book with ${providerName}`,
            text: message
          };
          
          if ((navigator as any).canShare(shareData)) {
            try {
              await (navigator as any).share(shareData);
            } catch (error: any) {
              if (error.name !== 'AbortError') {
                console.error('Error sharing booking link:', error);
                Linking.openURL(`mailto:?subject=${encodeURIComponent(`Book with ${providerName}`)}&body=${encodeURIComponent(message)}`);
              }
            }
          } else {
            Linking.openURL(`mailto:?subject=${encodeURIComponent(`Book with ${providerName}`)}&body=${encodeURIComponent(message)}`);
          }
        } else {
          Linking.openURL(`mailto:?subject=${encodeURIComponent(`Book with ${providerName}`)}&body=${encodeURIComponent(message)}`);
        }
      } else {
        await RNShare.share({
          message: message,
          url: bookingLink,
        });
      }
    } catch (error) {
      console.error('Error sharing booking link:', error);
    }
  };
  
  // Create separate functions for each tab to avoid linting issues
  const handleInfoPress = () => setActiveTab('info');
  const handleReviewsPress = () => setActiveTab('reviews');
  const handleServicesPress = () => setActiveTab('services');
  
  const handleSaveLocation = async (data: LocationData) => {
    if (!data) {
      console.error('Invalid location data');
      return;
    }
    
    // Validate required fields
    if (data.locationType && typeof data.shopName === 'string') {
      const success = await saveLocationData(data);
      if (success) {
        setAlertConfig({
          visible: true,
          title: 'Success',
          message: 'Location and hours saved successfully',
          type: 'success'
        });
      } else {
        setAlertConfig({
          visible: true,
          title: 'Error',
          message: 'Failed to save location and hours',
          type: 'error'
        });
      }
    } else {
      setAlertConfig({
        visible: true,
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        type: 'warning'
      });
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>L</Text>
          </View>
        </View>
        <Text style={styles.brandName}>the Cut</Text>
        <Text style={styles.providerName}>{providerName}</Text>
        
        {/* TheCut-style Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShareBookingLink}>
          <LinkIcon size={16} color={COLORS.background} />
          <Text style={styles.shareButtonText}>Share Booking Link</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={handleInfoPress}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>INFO</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={handleReviewsPress}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>REVIEWS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={handleServicesPress}
        >
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>SERVICES</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'info' && (
          <View style={styles.infoContainer}>
            <Pressable 
              style={styles.infoCard}
              onPress={() => setShowLocationEditor(true)}
            >
              <View style={styles.iconContainer}>
                <MapPin size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.infoCardTitle}>ADDRESS & HOURS</Text>
              <View style={styles.infoPreview}>
                <Text style={styles.infoPreviewText} numberOfLines={1}>
                  {locationData.streetAddress || 'Add address'}
                </Text>
                {Object.values(locationData.businessHours).some(day => day.isOpen) && (
                  <View style={styles.hoursIndicator}>
                    <Clock size={12} color="#999" />
                    <Text style={styles.hoursIndicatorText}>
                      {Object.values(locationData.businessHours).filter(day => day.isOpen).length} days open
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
            
            <Pressable style={styles.infoCard}>
              <View style={styles.iconContainer}>
                <Info size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.infoCardTitle}>INFO</Text>
            </Pressable>
            
            <Pressable style={styles.infoCard}>
              <View style={styles.iconContainer}>
                <Camera size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.infoCardTitle}>PHOTOS</Text>
            </Pressable>
            
            <Pressable style={styles.infoCard}>
              <View style={styles.iconContainer}>
                <User size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.infoCardTitle}>PROFILE PICTURE</Text>
            </Pressable>
          </View>
        )}
        
        {activeTab === 'reviews' && (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>Reviews section coming soon</Text>
          </View>
        )}
        
        {activeTab === 'services' && (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>Services section coming soon</Text>
          </View>
        )}
      </ScrollView>
      
      <LocationEditor 
        isVisible={showLocationEditor}
        onClose={() => setShowLocationEditor(false)}
        onSave={handleSaveLocation}
        initialData={locationData}
      />
      
      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={[{ text: 'OK' }]}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181611',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    marginBottom: 8,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    ...GLASS_STYLES.card,
    borderRadius: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#f2a60d',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#777',
    fontFamily: FONTS.bold,
  },
  activeTabText: {
    color: '#f2a60d',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  infoCard: {
    width: '48%',
    aspectRatio: 1,
    ...GLASS_STYLES.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(242, 166, 13, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f2a60d',
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f2a60d',
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  comingSoonText: {
    fontSize: 18,
    color: '#777',
    fontFamily: FONTS.regular,
  },
  infoPreview: {
    marginTop: 8,
    width: '100%',
  },
  infoPreviewText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  hoursIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  hoursIndicatorText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
    fontFamily: FONTS.regular,
  },
  shareButton: {
    flexDirection: 'row',
    ...GLASS_STYLES.button.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  shareButtonText: {
    color: '#181611',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
});