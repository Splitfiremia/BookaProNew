import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { validateForm, ValidationRules, ValidationErrors, required, minLength } from "@/utils/validation";
import { testUsers } from "@/mocks/users";
import { COLORS } from "@/constants/theme";

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [animatedValue] = useState(new Animated.Value(0));
  const [splashOpacity] = useState(new Animated.Value(1));
  const [splashScale] = useState(new Animated.Value(1));
  const [logoTranslateY] = useState(new Animated.Value(0));
  const [taglineOpacity] = useState(new Animated.Value(0));
  
  // Pre-fill password if email matches a test user
  const getTestPassword = (email: string) => {
    const testUser = testUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
    return testUser ? testUser.password : "";
  };

  const initialEmail = (params.email as string) || "";
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: getTestPassword(initialEmail),
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validation rules
  const validationRules: ValidationRules = {
    email: [required],
    password: [required, minLength(6)],
  };

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Regular field validation
    const fieldError = validateForm(newFormData, { [field]: validationRules[field] });
    setErrors({ ...errors, [field]: fieldError[field] });
  };

  const handleLogin = async () => {
    // Validate all fields
    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);

    // Check if there are any errors
    const hasErrors = Object.values(formErrors).some(error => error !== null);
    if (hasErrors) return;

    try {
      setIsSubmitting(true);
      const email = formData.email.trim();
      
      // Check if this is a test user and provide a helpful error message
      const isTestUser = testUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (isTestUser) {
        // For test users, verify the password matches
        const testUser = testUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
        if (testUser && formData.password !== testUser.password) {
          throw new Error(`Invalid credentials. Available test users: ${testUsers.map(u => u.email).join(',')}`);  
        }
      }
      
      // Login will trigger the redirection in the root layout
      const result = await login(email, formData.password);
      
      if (result.success) {
        // Navigate to root and let the auto-redirect logic handle role-based redirection
        console.log('Login successful, redirecting to root for proper routing');
        router.replace("/");
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Invalid credentials. Please check your email and password.";
      setErrors({ password: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = () => {
    router.push({
      pathname: "/(auth)/signup",
      params: { 
        email: formData.email,
        role: params.role || "client"
      }
    });
  };

  // Update password when email changes from params
  useEffect(() => {
    if (params.email) {
      const email = params.email as string;
      const password = getTestPassword(email);
      setFormData(prev => ({ ...prev, email, password }));
    }
  }, [params.email]);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(logoTranslateY, {
          toValue: -20,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(splashScale, {
          toValue: 0.9,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowSplash(false);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    });
  }, [animatedValue, logoTranslateY, splashOpacity, splashScale, taglineOpacity]);
  
  // Prevent navigation flashes by setting a minimum loading time
  useEffect(() => {
    if (isSubmitting) {
      const minLoadingTime = setTimeout(() => {}, 500); // Ensure loading state shows for at least 500ms
      return () => clearTimeout(minLoadingTime);
    }
  }, [isSubmitting]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundOverlay} />
        
        {/* Splash Screen */}
        {showSplash && (
          <Animated.View 
            style={[
              styles.splashContainer,
              {
                opacity: splashOpacity,
                transform: [{ scale: splashScale }],
              },
            ]}
          >
            <Animated.View
              style={{
                transform: [{ translateY: logoTranslateY }],
              }}
            >
              <Text style={styles.splashLogo}>Book a Pro</Text>
            </Animated.View>
            <Animated.Text
              style={[
                styles.splashTagline,
                { opacity: taglineOpacity },
              ]}
            >
              Book · Manage · Grow
            </Animated.Text>
          </Animated.View>
        )}
        
        {/* Main Content */}
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.spacer} />
              
              {/* Glass Morphism Card */}
              <Animated.View style={[styles.glassCard, { opacity: animatedValue }]}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.glassInput}
                    value={formData.email}
                    onChangeText={(value) => handleChange("email", value)}
                    placeholder="Enter your email to log in or sign up"
                    placeholderTextColor="rgba(156, 163, 175, 0.7)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="login-email-input"
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <TouchableOpacity
                  style={[styles.continueButton, (!formData.email || isSubmitting) && styles.continueButtonDisabled]}
                  onPress={handleLogin}
                  disabled={!formData.email || isSubmitting}
                >
                  <Text style={styles.continueButtonText}>
                    {isSubmitting ? 'LOADING...' : 'CONTINUE'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={handleSignup}
                >
                  <Text style={styles.browseButtonText}>BROWSE SERVICES</Text>
                </TouchableOpacity>
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
    paddingBottom: 32,
    paddingTop: 60,
  },
  spacer: {
    flex: 0.3,
    minHeight: 40,
  },
  glassCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    marginBottom: 32,
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
    }),
    ...(Platform.OS === 'android' && {
      elevation: 15,
    }),
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(209, 213, 219, 1)',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  },
  glassInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(107, 114, 128, 1)',
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    ...(Platform.OS !== 'web' && {
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    }),
    ...(Platform.OS === 'android' && {
      elevation: 8,
    }),
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(251, 191, 36, 0.5)',
  },
  continueButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(107, 114, 128, 1)',
  },
  dividerText: {
    color: 'rgba(156, 163, 175, 1)',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  },
  browseButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  browseButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#181611',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  splashLogo: {
    fontSize: 48,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -1,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  },
  splashTagline: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(209, 213, 219, 0.9)',
    marginTop: 12,
    letterSpacing: 2,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', web: 'Poppins' }),
  },
});