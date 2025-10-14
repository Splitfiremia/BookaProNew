import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, GLASS_STYLES } from '@/constants/theme';
import {
  Share2,
  UserPlus,
  CreditCard,
  Gift,
  Hash,
  HelpCircle,
  MoreHorizontal,
  LogOut,
  Edit,
} from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { performSignOut } from '@/utils/navigation';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  onPress: () => void;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = () => {
    // Prevent multiple logout attempts
    if (isSigningOut) {
      console.log('Client Profile: Already signing out, ignoring request');
      return;
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            
            try {
              console.log('Client Profile: Starting sign out process');
              const result = await performSignOut(logout);
              
              if (!result.success) {
                console.error('Client Profile: Sign out failed:', result.error);
                Alert.alert(
                  'Sign Out Error',
                  result.error || 'Failed to sign out. Please try again.'
                );
              }
            } catch (error) {
              console.error('Client Profile: Unexpected sign out error:', error);
              Alert.alert(
                'Sign Out Error',
                'An unexpected error occurred. Please try again.'
              );
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'share',
      title: 'Share With Friends',
      icon: Share2,
      onPress: () => {
        console.log('Share with friends pressed');
        // TODO: Implement share functionality
      },
    },
    {
      id: 'invite',
      title: 'Invite My Barber',
      icon: UserPlus,
      onPress: () => {
        console.log('Invite my barber pressed');
        // TODO: Implement invite barber functionality
      },
    },
    {
      id: 'payment',
      title: 'Payment Method',
      icon: CreditCard,
      onPress: () => {
        console.log('Payment method pressed');
        // TODO: Navigate to payment methods
      },
    },
    {
      id: 'vouchers',
      title: 'Vouchers',
      icon: Gift,
      onPress: () => {
        console.log('Vouchers pressed');
        // TODO: Navigate to vouchers
      },
    },
    {
      id: 'redeem',
      title: 'Redeem Code',
      icon: Hash,
      onPress: () => {
        console.log('Redeem code pressed');
        // TODO: Navigate to redeem code
      },
    },
    {
      id: 'help',
      title: 'Help & Resources',
      icon: HelpCircle,
      onPress: () => {
        console.log('Help & resources pressed');
        // TODO: Navigate to help
      },
    },
    {
      id: 'more',
      title: 'More',
      icon: MoreHorizontal,
      onPress: () => {
        console.log('More pressed');
        // TODO: Navigate to more options
      },
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const renderMenuItem = (item: MenuItem) => {
    const IconComponent = item.icon;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={item.onPress}
        testID={`menu-item-${item.id}`}
      >
        <View style={styles.menuItemLeft}>
          <IconComponent size={20} color={COLORS.white} />
          <Text style={styles.menuItemText}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header with Developer Mode indicator */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.developerModeIndicator}>
          <Text style={styles.developerModeText}>DEVELOPER MODE</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.name ? getInitials(user.name) : 'T'}
                </Text>
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Edit size={16} color={COLORS.background} />
            </View>
          </View>
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>EDIT CLIENT PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.logoutButton, isSigningOut && styles.disabledButton]}
          onPress={handleLogout}
          disabled={isSigningOut}
          testID="logout-button"
        >
          <LogOut size={20} color={isSigningOut ? COLORS.secondary : COLORS.error} />
          <Text style={[styles.logoutText, isSigningOut && styles.disabledText]}>
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  developerModeIndicator: {
    ...GLASS_STYLES.card,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  developerModeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editProfileButton: {
    ...GLASS_STYLES.button.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  editProfileButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  menuSection: {
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: COLORS.secondary,
  },
});