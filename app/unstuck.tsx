import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuth } from "@/providers/AuthProvider";

export default function UnstuckScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const [keys, setKeys] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Basic redirect functionality
    if (!showAdvanced) {
      const timer = setTimeout(() => {
        console.log("Unstuck navigation - Auth status:", isAuthenticated ? "Authenticated" : "Not authenticated");
        console.log("User role:", user?.role);
        if (isAuthenticated && user) {
          // Direct routing based on user role for more reliable navigation
          console.log("Unstuck screen redirecting authenticated user based on role:", user.role);
          switch (user.role) {
            case "provider":
              router.replace("/(app)/(provider)/(tabs)/schedule");
              break;
            case "owner":
              router.replace("/(app)/(shop-owner)/(tabs)/dashboard");
              break;
            case "client":
            default:
              router.replace("/(app)/(client)/(tabs)/home");
              break;
          }
        } else {
          // Force reset to role selection screen
          console.log("Unstuck screen redirecting unauthenticated user to landing page");
          router.replace("/");
        }
      }, 1500); // Slightly longer delay to allow user to tap "Advanced Options"

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, showAdvanced]);

  useEffect(() => {
    if (showAdvanced) {
      loadStorageData();
    }
  }, [showAdvanced]);

  const loadStorageData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      setKeys([...allKeys]);

      const allPairs = await AsyncStorage.multiGet(allKeys);
      const valueObj: Record<string, string> = {};
      
      allPairs.forEach(([key, value]) => {
        valueObj[key] = value || '';
      });
      
      setValues(valueObj);
    } catch (error) {
      console.error('Error loading AsyncStorage data:', error);
      setMessage('Error loading storage data');
    }
  };

  const clearAllStorage = async () => {
    try {
      setIsClearing(true);
      await AsyncStorage.clear();
      setMessage('All storage cleared successfully');
      setKeys([]);
      setValues({});
      setTimeout(() => {
        router.replace('/');
      }, 1500);
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      setMessage('Error clearing storage');
    } finally {
      setIsClearing(false);
    }
  };

  const removeItem = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      setMessage(`Removed ${key}`);
      loadStorageData();
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      setMessage(`Error removing ${key}`);
    }
  };

  if (!showAdvanced) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.text}>Redirecting you to the app...</Text>
          <TouchableOpacity 
            style={styles.advancedButton}
            onPress={() => setShowAdvanced(true)}
            testID="show-advanced-button"
          >
            <Text style={styles.advancedButtonText}>Advanced Options</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setShowAdvanced(false)}
          testID="back-button"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>App Recovery</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Current AsyncStorage Data:</Text>
        
        {keys.length === 0 ? (
          <Text style={styles.emptyText}>No data in storage</Text>
        ) : (
          keys.map((key) => (
            <View key={key} style={styles.storageItem}>
              <View style={styles.storageItemHeader}>
                <Text style={styles.storageKey}>{key}</Text>
                <TouchableOpacity 
                  onPress={() => removeItem(key)}
                  style={styles.removeButton}
                  testID={`remove-${key}`}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.storageValue}>
                {values[key] ? (values[key].length > 100 ? values[key].substring(0, 100) + '...' : values[key]) : ''}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity 
          style={[styles.clearButton, isClearing && styles.clearingButton]}
          onPress={clearAllStorage}
          disabled={isClearing || keys.length === 0}
          testID="clear-all-button"
        >
          <Text style={styles.clearButtonText}>
            {isClearing ? 'Clearing...' : 'Clear All Storage & Reset App'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => {
            // Use the logout function to properly clear auth state
            logout();
            router.replace('/');
          }}
          testID="go-home-button"
        >
          <Text style={styles.homeButtonText}>Logout & Go to Login</Text>
        </TouchableOpacity>

        {message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    color: "#ffffff",
    marginTop: 20,
    textAlign: "center",
  },
  advancedButton: {
    marginTop: 30,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  advancedButtonText: {
    color: "#D4AF37",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 28,
    color: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D4AF37",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    marginTop: 15,
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 20,
  },
  storageItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  storageItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  storageKey: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: "#331111",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: "#EF4444",
    fontSize: 12,
  },
  storageValue: {
    color: "#ccc",
    fontSize: 12,
  },
  clearButton: {
    backgroundColor: "#331111",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  clearingButton: {
    opacity: 0.7,
  },
  clearButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
  homeButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  messageContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  messageText: {
    color: "#D4AF37",
    fontSize: 14,
  },
});