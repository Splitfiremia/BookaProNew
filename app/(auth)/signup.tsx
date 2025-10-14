import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,

  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const params = useLocalSearchParams();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [animatedValue] = useState(new Animated.Value(0));
  
  const [formData, setFormData] = useState({
    email: (params.email as string) || '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignup = async () => {
    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName || 
        !formData.phone || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Register the user
      await register({
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        role: 'client'
      }, formData.password);
      
      // Navigate to profile type selection after successful registration
      router.replace('/client-onboarding/profile-type');
    } catch (err) {
      console.error('Signup error:', err);
      alert('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  // Animation for smooth transitions
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [animatedValue]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundOverlay} />
        
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.spacer} />

              {/* Glass Morphism Card */}
              <Animated.View style={[styles.glassCard, { opacity: animatedValue }]}>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                  <View style={styles.tabWithBack}>
                    <TouchableOpacity 
                      style={styles.backButtonInline} 
                      onPress={() => router.back()}
                    >
                      <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                      onPress={() => setActiveTab('signup')}
                    >
                      <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>SIGN UP</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                    onPress={() => {
                      setActiveTab('login');
                      router.replace({
                        pathname: '/(auth)/login',
                        params: { email: formData.email }
                      });
                    }}
                  >
                    <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>LOG IN</Text>
                  </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>EMAIL</Text>
                    <TextInput
                      style={styles.glassInput}
                      value={formData.email}
                      onChangeText={(text) => setFormData({...formData, email: text})}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.nameRow}>
                    <View style={styles.nameField}>
                      <Text style={styles.inputLabel}>First Name</Text>
                      <TextInput
                        style={styles.glassInput}
                        value={formData.firstName}
                        onChangeText={(text) => setFormData({...formData, firstName: text})}
                        placeholder="First"
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      />
                    </View>
                    <View style={styles.nameField}>
                      <Text style={styles.inputLabel}>Last Name</Text>
                      <TextInput
                        style={styles.glassInput}
                        value={formData.lastName}
                        onChangeText={(text) => setFormData({...formData, lastName: text})}
                        placeholder="Last"
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.glassInput}
                      value={formData.phone}
                      onChangeText={(text) => setFormData({...formData, phone: text})}
                      placeholder="(555) 123-4567"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <TextInput
                      style={styles.glassInput}
                      value={formData.password}
                      onChangeText={(text) => setFormData({...formData, password: text})}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <TextInput
                      style={styles.glassInput}
                      value={formData.confirmPassword}
                      onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      secureTextEntry
                    />
                  </View>

                  {/* SMS Opt-in */}
                  <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setSmsOptIn(!smsOptIn)}
                  >
                    <View style={[styles.checkbox, smsOptIn && styles.checkboxChecked]}>
                      {smsOptIn && <Ionicons name="checkmark" size={16} color="#1F2937" />}
                    </View>
                    <Text style={styles.checkboxText}>
                      By checking this box, you agree to receive SMS appointment updates. 
                      Message & data rates may apply. Message frequency varies. 
                      STOP to cancel.
                    </Text>
                  </TouchableOpacity>

                  {/* Terms */}
                  <Text style={styles.termsText}>
                    By signing up, I agree to the{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>

                  {/* Sign Up Button */}
                  <TouchableOpacity 
                    style={styles.signupButton}
                    onPress={handleSignup}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.signupButtonText}>
                      {isSubmitting ? 'CREATING...' : 'SIGN UP'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#181611',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  tabWithBack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonInline: {
    padding: 8,
    marginRight: 8,
  },
  spacer: {
    minHeight: 20,
  },
  glassCard: {
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.1)',
      android: 'rgba(31, 41, 55, 0.3)',
      web: 'rgba(31, 41, 55, 0.3)',
    }),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    padding: 20,
    marginBottom: 20,
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    }),
    ...(Platform.OS === 'android' && {
      elevation: 10,
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingBottom: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FBBF24',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#FBBF24',
  },
  form: {
    marginBottom: 0,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  glassInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(156, 163, 175, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  nameField: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#FBBF24',
    borderColor: '#FBBF24',
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  termsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  termsLink: {
    color: '#FBBF24',
    textDecorationLine: 'underline',
  },
  signupButton: {
    backgroundColor: '#FBBF24',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signupButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});