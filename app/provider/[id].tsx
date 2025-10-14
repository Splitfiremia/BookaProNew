import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone,
  Share2,
  Heart,
  DollarSign,
  Globe,
  Instagram,
  Users,
  Calendar,
  Award,
  Camera
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useBooking } from "@/providers/BookingProvider";
import { useSavedProviders } from "@/providers/SavedProvidersProvider";
import { mockProviders, type PortfolioItem, type TeamMember } from "@/mocks/providers";
import { LinearGradient } from "expo-linear-gradient";

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { setSelectedProvider } = useBooking();
  const { isProviderSaved, toggleSavedProvider } = useSavedProviders();
  const [activeTab, setActiveTab] = useState<"portfolio" | "info" | "reviews" | "services" | "team">("portfolio");
  const [portfolioFilter, setPortfolioFilter] = useState<string>("All");

  const provider = mockProviders.find(p => p.id === id) || mockProviders[0];
  const isFavorite = isProviderSaved(provider.id);

  const handleBookAppointment = () => {
    setSelectedProvider(provider);
    router.push({
      pathname: "/booking/service-selection",
      params: { providerId: provider.id }
    });
  };

  const handleCall = () => {
    Linking.openURL(`tel:${provider.phone}`);
  };

  const handleWebsite = () => {
    if (provider.website) {
      Linking.openURL(`https://${provider.website}`);
    }
  };

  const handleInstagram = () => {
    if (provider.instagram) {
      const username = provider.instagram.replace('@', '');
      Linking.openURL(`https://instagram.com/${username}`);
    }
  };

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        try {
          // Use a simpler share object to avoid permission issues
          await (navigator as any).share({
            title: provider.name,
            text: `Check out ${provider.name} at ${provider.shopName}`
            // Removed URL as it can cause permission issues in some browsers
          });
        } catch (error) {
          console.error('Error sharing:', error);
          // Silently fail - no need to show an error to the user
          // The share button is a nice-to-have feature
        }
      }
    } else {
      // For mobile platforms, we could implement native sharing
      // This would use the Share API from react-native
      try {
        await Share.share({
          message: `Check out ${provider.name} at ${provider.shopName}`,
          title: provider.name
        });
      } catch (error) {
        console.error('Error sharing on mobile:', error);
      }
    }
  };

  const getPortfolioCategories = () => {
    if (!provider.portfolio) return ["All"];
    const categories = ["All", ...new Set(provider.portfolio.map(item => item.category))];
    return categories;
  };

  const getFilteredPortfolio = () => {
    if (!provider.portfolio) return [];
    if (portfolioFilter === "All") return provider.portfolio;
    return provider.portfolio.filter(item => item.category === portfolioFilter);
  };

  const renderPortfolioItem = (item: PortfolioItem) => {
    const isBeforeAfter = item.beforeImage;
    
    if (isBeforeAfter) {
      return (
        <View key={item.id} style={styles.beforeAfterContainer}>
          <View style={styles.beforeAfterImages}>
            <View style={styles.beforeAfterImageWrapper}>
              <Image source={{ uri: item.beforeImage }} style={styles.beforeAfterImage} />
              <Text style={styles.beforeAfterLabel}>BEFORE</Text>
            </View>
            <View style={styles.beforeAfterImageWrapper}>
              <Image source={{ uri: item.image }} style={styles.beforeAfterImage} />
              <Text style={styles.beforeAfterLabel}>AFTER</Text>
            </View>
          </View>
          <View style={styles.portfolioItemInfo}>
            <Text style={styles.portfolioItemTitle}>{item.title}</Text>
            <Text style={styles.portfolioItemDescription}>{item.description}</Text>
          </View>
        </View>
      );
    }

    return (
      <View key={item.id} style={styles.portfolioItemContainer}>
        <Image source={{ uri: item.image }} style={styles.portfolioItemImage} />
        <View style={styles.portfolioItemOverlay}>
          <Text style={styles.portfolioItemTitle}>{item.title}</Text>
          <Text style={styles.portfolioItemDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderTeamMember = (member: TeamMember) => {
    return (
      <TouchableOpacity key={member.id} style={styles.teamMemberCard}>
        <Image source={{ uri: member.image }} style={styles.teamMemberImage} />
        <View style={styles.teamMemberInfo}>
          <Text style={styles.teamMemberName}>{member.name}</Text>
          <Text style={styles.teamMemberRole}>{member.role}</Text>
          <View style={styles.teamMemberRating}>
            <Star size={14} color="#D4AF37" fill="#D4AF37" />
            <Text style={styles.teamMemberRatingText}>{member.rating} ({member.reviewCount})</Text>
          </View>
          <Text style={styles.teamMemberBio}>{member.bio}</Text>
          <View style={styles.teamMemberSpecialties}>
            {member.specialties.map((specialty) => (
              <View key={specialty} style={styles.specialtyTag}>
                <Text style={styles.specialtyTagText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: provider.coverImage || provider.image }} 
            style={styles.coverImage} 
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          />
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.rightActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleSavedProvider(provider.id)}
              >
                <Heart 
                  color={isFavorite ? "#D4AF37" : "#fff"} 
                  fill={isFavorite ? "#D4AF37" : "transparent"}
                  size={24} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share2 color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.providerHeader}>
            <Image source={{ uri: provider.profileImage || provider.image }} style={styles.profileImage} />
            <View style={styles.headerInfo}>
              <View style={styles.ratingBadge}>
                <Star color="#000" size={16} fill="#000" />
                <Text style={styles.ratingText}>{provider.rating} ({provider.reviewCount})</Text>
              </View>
              {provider.isShopOwner && (
                <View style={styles.ownerBadge}>
                  <Award color="#D4AF37" size={16} />
                  <Text style={styles.ownerBadgeText}>Shop Owner</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.floatingBookButton} onPress={handleBookAppointment}>
            <LinearGradient
              colors={["#D4AF37", "#F5E6D3"]}
              style={styles.floatingBookGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Calendar color="#000" size={20} />
              <Text style={styles.floatingBookText}>BOOK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.shopName}>{provider.shopName}</Text>
            <View style={styles.specialtiesContainer}>
              {provider.specialties?.map((specialty) => (
                <View key={specialty} style={styles.specialtyChip}>
                  <Text style={styles.specialtyChipText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
              <Phone color="#D4AF37" size={20} />
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>
            {provider.website && (
              <TouchableOpacity style={styles.quickActionButton} onPress={handleWebsite}>
                <Globe color="#D4AF37" size={20} />
                <Text style={styles.quickActionText}>Website</Text>
              </TouchableOpacity>
            )}
            {provider.instagram && (
              <TouchableOpacity style={styles.quickActionButton} onPress={handleInstagram}>
                <Instagram color="#D4AF37" size={20} />
                <Text style={styles.quickActionText}>Instagram</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "portfolio" && styles.activeTab]}
              onPress={() => setActiveTab("portfolio")}
            >
              <Camera size={16} color={activeTab === "portfolio" ? "#D4AF37" : "#666"} />
              <Text style={[styles.tabText, activeTab === "portfolio" && styles.activeTabText]}>
                PORTFOLIO
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "info" && styles.activeTab]}
              onPress={() => setActiveTab("info")}
            >
              <MapPin size={16} color={activeTab === "info" ? "#D4AF37" : "#666"} />
              <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>
                INFO
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "services" && styles.activeTab]}
              onPress={() => setActiveTab("services")}
            >
              <DollarSign size={16} color={activeTab === "services" ? "#D4AF37" : "#666"} />
              <Text style={[styles.tabText, activeTab === "services" && styles.activeTabText]}>
                SERVICES
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
              onPress={() => setActiveTab("reviews")}
            >
              <Star size={16} color={activeTab === "reviews" ? "#D4AF37" : "#666"} />
              <Text style={[styles.tabText, activeTab === "reviews" && styles.activeTabText]}>
                REVIEWS
              </Text>
            </TouchableOpacity>
            {provider.teamMembers && provider.teamMembers.length > 0 && (
              <TouchableOpacity
                style={[styles.tab, activeTab === "team" && styles.activeTab]}
                onPress={() => setActiveTab("team")}
              >
                <Users size={16} color={activeTab === "team" ? "#D4AF37" : "#666"} />
                <Text style={[styles.tabText, activeTab === "team" && styles.activeTabText]}>
                  TEAM
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {activeTab === "portfolio" && (
            <View style={styles.portfolioContent}>
              <View style={styles.portfolioFilters}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {getPortfolioCategories().map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.portfolioFilter,
                        portfolioFilter === category && styles.portfolioFilterActive
                      ]}
                      onPress={() => setPortfolioFilter(category)}
                    >
                      <Text style={[
                        styles.portfolioFilterText,
                        portfolioFilter === category && styles.portfolioFilterTextActive
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.portfolioGrid}>
                {getFilteredPortfolio().map(renderPortfolioItem)}
              </View>
            </View>
          )}

          {activeTab === "info" && (
            <View style={styles.infoContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ABOUT</Text>
                <Text style={styles.aboutText}>{provider.about}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>LOCATION & CONTACT</Text>
                <View style={styles.infoRow}>
                  <MapPin color="#D4AF37" size={20} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.shopNameText}>{provider.shopName}</Text>
                    <Text style={styles.infoText}>{provider.address}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Phone color="#D4AF37" size={20} />
                  <Text style={styles.infoText}>{provider.phone}</Text>
                </View>
                {provider.website && (
                  <View style={styles.infoRow}>
                    <Globe color="#D4AF37" size={20} />
                    <Text style={styles.infoText}>{provider.website}</Text>
                  </View>
                )}
                {provider.instagram && (
                  <View style={styles.infoRow}>
                    <Instagram color="#D4AF37" size={20} />
                    <Text style={styles.infoText}>{provider.instagram}</Text>
                  </View>
                )}
              </View>

              {provider.businessHours && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>BUSINESS HOURS</Text>
                  <View style={styles.hoursContainer}>
                    {provider.businessHours.map((day) => (
                      <View key={day.day} style={styles.hourRow}>
                        <Text style={styles.dayText}>{day.day}</Text>
                        <Text style={[styles.hoursText, !day.isOpen && styles.closedText]}>
                          {day.hours}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === "reviews" && (
            <View style={styles.reviewsContent}>
              {provider.reviews?.map((review) => (
                <View key={`${review.userName}-${review.date}`} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: review.userImage }} style={styles.reviewerImage} />
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.userName}</Text>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={`star-${i}`} 
                            size={12} 
                            color="#D4AF37" 
                            fill={i < review.rating ? "#D4AF37" : "transparent"} 
                          />
                        ))}
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === "services" && (
            <View style={styles.servicesContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SERVICE MENU</Text>
                {provider.services?.map((service) => (
                  <TouchableOpacity key={service.id} style={styles.serviceCard}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDuration}>{service.duration}</Text>
                    </View>
                    <View style={styles.servicePriceContainer}>
                      <Text style={styles.servicePrice}>${service.price}</Text>
                      <TouchableOpacity 
                        style={styles.addServiceButton}
                        onPress={() => {
                          setSelectedProvider(provider);
                          router.push({
                            pathname: "/booking/service-selection",
                            params: { providerId: provider.id }
                          });
                        }}
                      >
                        <Text style={styles.addServiceButtonText}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {activeTab === "team" && provider.teamMembers && (
            <View style={styles.teamContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MEET THE TEAM</Text>
                {provider.teamMembers.map(renderTeamMember)}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.fromText}>Starting from</Text>
          <Text style={styles.priceText}>${provider.startingPrice}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <LinearGradient
            colors={["#D4AF37", "#F5E6D3"]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Calendar color="#000" size={20} />
            <Text style={styles.bookButtonText}>BOOK APPOINTMENT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  headerActions: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  rightActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  providerHeader: {
    position: "absolute",
    bottom: -40,
    left: 20,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#D4AF37",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4AF37",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
    marginBottom: 8,
  },
  ratingText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  providerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#D4AF37",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    letterSpacing: 1,
  },
  activeTabText: {
    color: "#D4AF37",
  },
  infoContent: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 1,
  },
  aboutText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  shopNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4AF37",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#ccc",
  },
  hoursContainer: {
    flex: 1,
  },
  hoursText: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 4,
  },
  portfolioImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  reviewsContent: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
  servicesContent: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D4AF37",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  priceContainer: {
    marginRight: 16,
  },
  fromText: {
    fontSize: 12,
    color: "#666",
  },
  priceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  bookButton: {
    flex: 1,
  },
  gradientButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 1,
    marginLeft: 8,
  },
  headerInfo: {
    flexDirection: "column",
    gap: 8,
  },
  ownerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  ownerBadgeText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  floatingBookButton: {
    position: "absolute",
    bottom: -25,
    right: 20,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingBookGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  floatingBookText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  providerInfo: {
    marginBottom: 20,
  },
  shopName: {
    fontSize: 18,
    color: "#D4AF37",
    fontWeight: "600",
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  specialtyChipText: {
    color: "#ccc",
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    gap: 8,
  },
  quickActionText: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "600",
  },
  portfolioContent: {
    gap: 16,
  },
  portfolioFilters: {
    marginBottom: 16,
  },
  portfolioFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 12,
  },
  portfolioFilterActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  portfolioFilterText: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "500",
  },
  portfolioFilterTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  portfolioGrid: {
    gap: 16,
  },
  beforeAfterContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  beforeAfterImages: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  beforeAfterImageWrapper: {
    flex: 1,
    position: "relative",
  },
  beforeAfterImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  beforeAfterLabel: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  portfolioItemContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  portfolioItemImage: {
    width: "100%",
    height: 200,
  },
  portfolioItemOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
  },
  portfolioItemInfo: {
    gap: 4,
  },
  portfolioItemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  portfolioItemDescription: {
    color: "#ccc",
    fontSize: 14,
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  dayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  closedText: {
    color: "#666",
    fontStyle: "italic",
  },
  servicePriceContainer: {
    alignItems: "flex-end",
    gap: 8,
  },
  addServiceButton: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addServiceButtonText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },
  teamContent: {
    gap: 16,
  },
  teamMemberCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    gap: 12,
  },
  teamMemberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  teamMemberInfo: {
    flex: 1,
    gap: 4,
  },
  teamMemberName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  teamMemberRole: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "500",
  },
  teamMemberRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  teamMemberRatingText: {
    color: "#ccc",
    fontSize: 12,
  },
  teamMemberBio: {
    color: "#ccc",
    fontSize: 12,
    lineHeight: 16,
  },
  teamMemberSpecialties: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  specialtyTag: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  specialtyTagText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "500",
  },
});