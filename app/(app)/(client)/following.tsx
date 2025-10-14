import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import ImageWithFallback from '@/components/ImageWithFallback';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Star, MapPin, Heart, ArrowLeft } from "lucide-react-native";
import { useSocial } from "@/providers/SocialProvider";
import { mockProviders } from "@/mocks/providers";

export default function FollowingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { followedProviderIds, unfollowProvider } = useSocial();

  // Get followed providers from mock data
  const followedProviders = mockProviders.filter(provider => 
    followedProviderIds.includes(provider.id)
  );

  const handleProviderPress = (providerId: string) => {
    router.push(`/(app)/(client)/provider/${providerId}`);
  };

  const handleUnfollow = async (providerId: string) => {
    try {
      await unfollowProvider(providerId);
    } catch (error) {
      console.error('Error unfollowing provider:', error);
    }
  };

  const renderProviderItem = ({ item }: { item: typeof mockProviders[0] }) => (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={() => handleProviderPress(item.id)}
    >
      <View style={styles.providerInfo}>
        <ImageWithFallback
          source={{ uri: item.profileImage || item.image || undefined }}
          style={styles.providerImage}
          fallbackIcon="user"
        />
        <View style={styles.providerDetails}>
          <View style={styles.providerHeader}>
            <Text style={styles.providerName}>{item.name}</Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Star size={12} color="#FFB800" fill="#FFB800" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
          <Text style={styles.providerCategory}>{item.category}</Text>
          <Text style={styles.shopName}>{item.shopName}</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color="#666" />
            <Text style={styles.locationText}>{item.address}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.unfollowButton}
          onPress={() => handleUnfollow(item.id)}
        >
          <Heart size={16} color="#FF3B30" fill="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Heart size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Followed Providers</Text>
      <Text style={styles.emptyDescription}>
        Start following your favorite providers to see them here
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => router.push("/(app)/(client)/(tabs)/home")}
      >
        <Text style={styles.exploreButtonText}>Explore Providers</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Following</Text>
        <View style={styles.headerRight}>
          <Text style={styles.followingCount}>{followedProviderIds.length}</Text>
        </View>
      </View>

      {/* Content */}
      {followedProviders.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={followedProviders}
          keyExtractor={(item) => item.id}
          renderItem={renderProviderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  followingCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  listContainer: {
    padding: 20,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  providerCategory: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  shopName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  actionButtons: {
    alignItems: 'center',
  },
  unfollowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});