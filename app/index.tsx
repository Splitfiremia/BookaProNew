import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { testUsers } from "@/mocks/users";

// Types for better TypeScript support
type UserRole = 'client' | 'provider' | 'owner';
type OnboardingType = 'client' | 'provider' | 'owner';

export default function Index() {
  const { isDeveloperMode, setDeveloperMode, login, logout, isAuthenticated, user, isInitialized } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [hasRedirected, setHasRedirected] = useState<boolean>(false);
  
  // Development-only logging
  if (__DEV__) {
    console.log('Index: Component rendering, isInitialized:', isInitialized);
  }
  
  // Log auth state for debugging (development only)
  useEffect(() => {
    if (__DEV__) {
      console.log('Index: Auth state - isAuthenticated:', isAuthenticated, 'user:', user?.email, 'isDeveloperMode:', isDeveloperMode, 'isInitialized:', isInitialized);
    }
  }, [isAuthenticated, user, isDeveloperMode, isInitialized]);

  // Auto-redirect authenticated users to their role-specific dashboard
  const redirectToRoleDashboard = useCallback((userRole: UserRole) => {
    try {
      if (__DEV__) {
        console.log('Index: Redirecting user with role:', userRole);
      }
      
      switch (userRole) {
        case "client":
          router.replace("/(app)/(client)/(tabs)/home");
          break;
        case "provider":
          router.replace("/(app)/(provider)/(tabs)/schedule");
          break;
        case "owner":
          router.replace("/(app)/(shop-owner)/(tabs)/dashboard");
          break;
        default:
          if (__DEV__) {
            console.warn('Unknown user role:', userRole);
          }
          router.replace("/(app)/(client)/(tabs)/home");
          break;
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Index: Auto-redirect navigation error:', error);
      }
    }
  }, []);

  // Auto-redirect effect with better race condition prevention
  useEffect(() => {
    // Only redirect if user is authenticated, initialized, and we haven't redirected yet
    if (isInitialized && isAuthenticated && user && !hasRedirected) {
      // Additional validation checks
      if (!user.role || !user.email) {
        if (__DEV__) {
          console.log('Index: Invalid user object, skipping redirect');
        }
        return;
      }

      // Set flag immediately to prevent multiple redirects
      setHasRedirected(true);
      
      if (__DEV__) {
        console.log('Index: Auto-redirecting authenticated user to role-specific dashboard');
      }
      
      // Minimal delay for faster redirect but avoid race conditions
      const timeoutId = setTimeout(() => {
        redirectToRoleDashboard(user.role as UserRole);
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isInitialized, isAuthenticated, user, hasRedirected, redirectToRoleDashboard]);

  // Reset redirect flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasRedirected(false);
    }
  }, [isAuthenticated]);

  const validateEmail = useCallback((email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0 || trimmedEmail.length > 254) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
  }, []);

  const handleContinue = useCallback(() => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(null);
    
    // Navigate to login/signup with the email
    router.push({
      pathname: "/(auth)/login",
      params: { 
        email: trimmedEmail,
        role: "client"
      }
    });
  }, [email, validateEmail]);

  const handleBrowseProviders = useCallback(() => {
    router.push("/(auth)/login");
  }, []);

  const toggleDeveloperMode = useCallback(() => {
    setDeveloperMode(!isDeveloperMode);
  }, [isDeveloperMode, setDeveloperMode]);

  const handleTestLogin = useCallback(async (userType: UserRole) => {
    const testUser = testUsers.find(user => user.role === userType);
    if (!testUser) {
      if (__DEV__) {
        console.error('Test user not found for type:', userType);
      }
      Alert.alert('Error', `Test user not found for ${userType}`);
      return;
    }

    setIsLoggingIn(true);
    try {
      // Ensure developer mode is enabled for test login
      if (!isDeveloperMode) {
        await setDeveloperMode(true);
      }
      
      if (__DEV__) {
        console.log('Index: Attempting test login for:', userType, 'with email:', testUser.email);
      }
      
      await login(testUser.email, testUser.password);
      
      if (__DEV__) {
        console.log(`Index: Test login successful for ${userType}`);
      }
      
      // Navigate directly to role-specific home
      redirectToRoleDashboard(userType);
    } catch (error) {
      if (__DEV__) {
        console.error('Index: Test login failed:', error);
      }
      Alert.alert(
        'Login Failed', 
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      setIsLoggingIn(false);
    }
  }, [isDeveloperMode, setDeveloperMode, login, redirectToRoleDashboard]);
  
  const handleTestOnboarding = useCallback((type: OnboardingType) => {
    try {
      switch (type) {
        case 'provider':
          router.push('/provider-onboarding');
          break;
        case 'owner':
          router.push('/shop-owner-onboarding');
          break;
        case 'client':
          router.push('/client-onboarding/profile-type');
          break;
        default:
          if (__DEV__) {
            console.warn('Index: Unknown onboarding type:', type);
          }
          router.push('/client-onboarding/profile-type');
          break;
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Index: Navigation error during test onboarding:', error);
      }
      Alert.alert('Navigation Error', 'Failed to navigate to onboarding');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const result = await logout();
      if (result.success) {
        if (__DEV__) {
          console.log('Index: User logged out successfully');
        }
      } else {
        if (__DEV__) {
          console.error('Index: Logout failed:', result.error);
        }
        Alert.alert('Logout Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Index: Logout error:', error);
      }
      Alert.alert('Error', 'Failed to logout');
    }
  }, [logout]);

  const handleQuickTestEmail = useCallback((testEmail: string) => {
    setEmail(testEmail);
    if (emailError) {
      setEmailError(null);
    }
  }, [emailError]);

  // Memoized render functions for better performance
  const renderDeveloperModeSection = useCallback(() => (
    <View style={styles.testLoginSection}>
      <Text style={styles.testLoginTitle}>Developer Mode Active</Text>
      <Text style={styles.testLoginSubtitle}>Quick test access available</Text>
      <Text style={styles.testLoginCredentials}>
        Test emails: client@test.com, provider@test.com, owner@test.com
      </Text>
      
      <Text style={styles.testSectionTitle}>Quick Login</Text>
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity
          style={[styles.testLoginButton, styles.clientButton, isLoggingIn && styles.disabledButton]}
          onPress={() => handleTestLogin('client')}
          disabled={isLoggingIn}
          accessibilityLabel={`Test login as client${isLoggingIn ? ' (logging in...)' : ''}`}
          accessibilityRole="button"
          testID="test-client-login"
        >
          <Text style={styles.testLoginButtonText}>👤 Client</Text>
          <Text style={styles.testLoginButtonSubtext}>
            {isLoggingIn ? 'Logging in...' : 'Book services'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testLoginButton, styles.providerButton, isLoggingIn && styles.disabledButton]}
          onPress={() => handleTestLogin('provider')}
          disabled={isLoggingIn}
          accessibilityLabel={`Test login as provider${isLoggingIn ? ' (logging in...)' : ''}`}
          accessibilityRole="button"
          testID="test-provider-login"
        >
          <Text style={styles.testLoginButtonText}>✂️ Provider</Text>
          <Text style={styles.testLoginButtonSubtext}>
            {isLoggingIn ? 'Logging in...' : 'Manage bookings'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testLoginButton, styles.ownerButton, isLoggingIn && styles.disabledButton]}
          onPress={() => handleTestLogin('owner')}
          disabled={isLoggingIn}
          accessibilityLabel={`Test login as owner${isLoggingIn ? ' (logging in...)' : ''}`}
          accessibilityRole="button"
          testID="test-owner-login"
        >
          <Text style={styles.testLoginButtonText}>🏪 Owner</Text>
          <Text style={styles.testLoginButtonSubtext}>
            {isLoggingIn ? 'Logging in...' : 'Manage shop'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.testSectionTitle}>Test Onboarding</Text>
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity
          style={[styles.testLoginButton, styles.clientButton]}
          onPress={() => handleTestOnboarding('client')}
          accessibilityLabel="Test client signup flow"
          accessibilityRole="button"
          testID="test-client-signup"
        >
          <Text style={styles.testLoginButtonText}>👤 Client</Text>
          <Text style={styles.testLoginButtonSubtext}>Signup flow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testLoginButton, styles.providerButton]}
          onPress={() => handleTestOnboarding('provider')}
          accessibilityLabel="Test provider onboarding flow"
          accessibilityRole="button"
          testID="test-provider-onboarding"
        >
          <Text style={styles.testLoginButtonText}>✂️ Provider</Text>
          <Text style={styles.testLoginButtonSubtext}>Onboarding flow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testLoginButton, styles.ownerButton]}
          onPress={() => handleTestOnboarding('owner')}
          accessibilityLabel="Test owner onboarding flow"
          accessibilityRole="button"
          testID="test-owner-onboarding"
        >
          <Text style={styles.testLoginButtonText}>🏪 Owner</Text>
          <Text style={styles.testLoginButtonSubtext}>Onboarding flow</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <TouchableOpacity
        style={styles.statusButton}
        onPress={() => router.push('/onboarding-status')}
        accessibilityLabel="View onboarding status"
        accessibilityRole="button"
        testID="onboarding-status-button"
      >
        <Text style={styles.statusButtonText}>View Onboarding Status</Text>
      </TouchableOpacity>
      
      {/* Clear stored data button */}
      {(isAuthenticated || user) && (
        <TouchableOpacity
          style={[styles.statusButton, styles.clearDataButton]}
          onPress={handleLogout}
          accessibilityLabel="Clear stored data and logout"
          accessibilityRole="button"
          testID="clear-data-button"
        >
          <Text style={[styles.statusButtonText, styles.clearDataButtonText]}>
            Clear Data & Logout
          </Text>
        </TouchableOpacity>
      )}
    </View>
  ), [isLoggingIn, handleTestLogin, handleTestOnboarding, isAuthenticated, user, handleLogout]);

  const renderLoggedInSection = useCallback(() => (
    <View style={styles.loggedInSection}>
      <Text style={styles.loggedInText}>Welcome back, {user?.email}</Text>
      <Text style={styles.loggedInSubtext}>Role: {user?.role}</Text>
      <TouchableOpacity
        style={styles.continueToAppButton}
        onPress={() => user && redirectToRoleDashboard(user.role as UserRole)}
        accessibilityLabel="Continue to application"
        accessibilityRole="button"
        testID="continue-to-app-button"
      >
        <Text style={styles.continueToAppButtonText}>CONTINUE TO APP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityLabel="Logout from application"
        accessibilityRole="button"
        testID="logout-button"
      >
        <Text style={styles.logoutButtonText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  ), [user, handleLogout, redirectToRoleDashboard]);

  const renderEmailForm = useCallback(() => (
    <View style={styles.contentSection}>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={[styles.emailInput, emailError && styles.emailInputError]}
            placeholder="Enter your email to get started"
            placeholderTextColor="#999999"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            accessibilityLabel="Email input field"
            accessibilityHint="Enter your email address to continue to login or signup"
            testID="email-input"
          />
        </View>
        {emailError && (
          <Text style={styles.errorText}>{emailError}</Text>
        )}

        {/* Quick Test Credentials */}
        <View style={styles.quickTestContainer}>
          <Text style={styles.quickTestLabel}>Quick test emails:</Text>
          <View style={styles.quickTestButtons}>
            <TouchableOpacity
              style={styles.quickTestButton}
              onPress={() => handleQuickTestEmail('client@test.com')}
              accessibilityLabel="Fill client test email"
              accessibilityRole="button"
              testID="quick-test-client"
            >
              <Text style={styles.quickTestButtonText}>Client</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickTestButton}
              onPress={() => handleQuickTestEmail('provider@test.com')}
              accessibilityLabel="Fill provider test email"
              accessibilityRole="button"
              testID="quick-test-provider"
            >
              <Text style={styles.quickTestButtonText}>Provider</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickTestButton}
              onPress={() => handleQuickTestEmail('owner@test.com')}
              accessibilityLabel="Fill owner test email"
              accessibilityRole="button"
              testID="quick-test-owner"
            >
              <Text style={styles.quickTestButtonText}>Owner</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          accessibilityLabel="Continue with email"
          accessibilityRole="button"
          testID="continue-button"
        >
          <Text style={styles.continueButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [email, emailError, handleQuickTestEmail, handleContinue]);

  // Show loading state while initializing to prevent hydration mismatch
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.logoSection}>
            <Text style={styles.logo}>Book a Pro</Text>
            <Text style={styles.loadingText}>Initializing...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        {/* Developer Mode Toggle */}
        <TouchableOpacity
          style={styles.developerModeToggle}
          onPress={toggleDeveloperMode}
          accessibilityLabel={isDeveloperMode ? "Disable developer mode" : "Enable developer mode"}
          accessibilityRole="button"
          accessibilityState={{ selected: isDeveloperMode }}
          testID="developer-mode-toggle"
        >
          <Text style={styles.developerModeText}>
            {isDeveloperMode ? 'DEV MODE' : 'LIVE MODE'}
          </Text>
        </TouchableOpacity>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Text style={styles.logo}>Book a Pro</Text>
              <Text style={styles.tagline}>Book. Manage. Grow.</Text>
            </View>

            {/* Developer Mode Test Login Section */}
            {isDeveloperMode && renderDeveloperModeSection()}

            {/* Show user info if authenticated but not in developer mode */}
            {isAuthenticated && user && !isDeveloperMode && renderLoggedInSection()}

            {/* Main email form - only show if not authenticated */}
            {!isAuthenticated && renderEmailForm()}

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <TouchableOpacity
                style={styles.browseButton}
                onPress={handleBrowseProviders}
                accessibilityLabel="Browse providers without logging in"
                accessibilityRole="button"
                testID="browse-providers-button"
              >
                <Text style={styles.browseButtonText}>BROWSE PROVIDERS</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181611',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  developerModeToggle: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 16,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1000,
  },
  developerModeText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 64,
    fontWeight: '300',
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1,
  },
  testLoginSection: {
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  testLoginTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  testSectionTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  testLoginSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 8,
  },
  testLoginCredentials: {
    fontSize: 12,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  testButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  testLoginButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    minHeight: 80,
  },
  clientButton: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    borderColor: "#007BFF",
  },
  providerButton: {
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    borderColor: "#28A745",
  },
  ownerButton: {
    backgroundColor: "rgba(220, 53, 69, 0.1)",
    borderColor: "#DC3545",
  },
  testLoginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  testLoginButtonSubtext: {
    color: "#CCCCCC",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14,
  },
  statusButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  clearDataButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderColor: '#FF4444',
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  clearDataButtonText: {
    color: '#FF4444',
  },
  contentSection: {
    flex: 1,
    justifyContent: "center",
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(209, 213, 219, 1)',
    fontWeight: "500",
    marginBottom: 8,
  },
  emailInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(107, 114, 128, 1)',
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    color: "#FFFFFF",
  },
  emailInputError: {
    borderBottomColor: "#FF4444",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: "#FBBF24",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(107, 114, 128, 1)',
  },
  orText: {
    color: 'rgba(156, 163, 175, 1)',
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 16,
  },
  browseButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  browseButtonText: {
    color: "#FBBF24",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  quickTestContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  quickTestLabel: {
    color: "#999999",
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  quickTestButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  quickTestButton: {
    flex: 1,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  quickTestButtonText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  loggedInSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  loggedInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loggedInSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 12,
    minWidth: 120,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  continueToAppButton: {
    backgroundColor: '#28A745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  continueToAppButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});