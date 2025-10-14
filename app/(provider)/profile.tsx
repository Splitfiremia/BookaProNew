import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { 
  Settings, 
  Calendar, 
  DollarSign, 
  Clock, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { COLORS, FONTS } from '@/constants/theme';
import { mockProviders } from '@/mocks/appointments';

export default function ProfileScreen() {
  const { logout } = useAuth();
  
  // Use the first provider from our mock data
  const provider = mockProviders[0];
  
  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };
  
  const handleNavigation = (route: string) => {
    router.push(route as any);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: provider.image }} 
          style={styles.profileImage} 
        />
        <Text style={styles.profileName}>{provider.name}</Text>
        <Text style={styles.profileShop}>{provider.shopName}</Text>
        <View style={styles.ratingContainer}>
          <Star size={16} color={COLORS.primary} fill={COLORS.primary} />
          <Star size={16} color={COLORS.primary} fill={COLORS.primary} />
          <Star size={16} color={COLORS.primary} fill={COLORS.primary} />
          <Star size={16} color={COLORS.primary} fill={COLORS.primary} />
          <Star size={16} color={COLORS.primary} fill={COLORS.primary} />
          <Text style={styles.ratingText}>5.0 (48 reviews)</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => handleNavigation("/provider-onboarding/profile")}
        >
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNavigation("/provider-calendar")}
        >
          <View style={styles.menuIconContainer}>
            <Calendar size={20} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemText}>Calendar Settings</Text>
            <Text style={styles.menuItemDescription}>Manage your availability</Text>
          </View>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNavigation("/provider-onboarding/services")}
        >
          <View style={styles.menuIconContainer}>
            <DollarSign size={20} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemText}>Services & Pricing</Text>
            <Text style={styles.menuItemDescription}>Manage your service offerings</Text>
          </View>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNavigation("/tip-settings")}
        >
          <View style={styles.menuIconContainer}>
            <DollarSign size={20} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemText}>Tip Settings</Text>
            <Text style={styles.menuItemDescription}>Manage your tip preferences</Text>
          </View>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNavigation("/payout-settings")}
        >
          <View style={styles.menuIconContainer}>
            <DollarSign size={20} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemText}>Payout Settings</Text>
            <Text style={styles.menuItemDescription}>Manage your payment methods</Text>
          </View>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => console.log("Notification settings")}
        >
          <View style={styles.menuIconContainer}>
            <Bell size={20} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Text style={styles.menuItemDescription}>Manage your notification preferences</Text>
          </View>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => console.log("Appointment settings")}
        >
          <View style={styles.menuIconContainer}>
            <Clock size={20} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemText}>Appointment Settings</Text>
            <Text style={styles.menuItemDescription}>Manage booking preferences</Text>
          </View>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => console.log("Help center")}
        >
          <View style={styles.menuIconContainer}>
            <HelpCircle size={20} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemText}>Help Center</Text>
            <Text style={styles.menuItemDescription}>Get help with your account</Text>
          </View>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => console.log("Contact support")}
        >
          <View style={styles.menuIconContainer}>
            <HelpCircle size={20} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemText}>Contact Support</Text>
            <Text style={styles.menuItemDescription}>Get in touch with our team</Text>
          </View>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#FF4444" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  profileShop: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(240, 121, 69, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: FONTS.bold,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `rgba(${parseInt(COLORS.primary.slice(1, 3), 16)}, ${parseInt(COLORS.primary.slice(3, 5), 16)}, ${parseInt(COLORS.primary.slice(5, 7), 16)}, 0.1)`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
});