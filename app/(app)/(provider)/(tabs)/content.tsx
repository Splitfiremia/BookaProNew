import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Plus, Trash2, Camera, Send } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { useSocial } from '@/providers/SocialProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function ContentScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getProviderPortfolio, addToPortfolio, removeFromPortfolio, createPost } = useSocial();
  const [postCaption, setPostCaption] = useState<string>('');
  const [selectedPostImage, setSelectedPostImage] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);

  const userPortfolio = user?.id ? getProviderPortfolio(user.id) : [];
  const portfolioItemSize = (width - 48) / 3;

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera roll permissions to select images.');
        return false;
      }
    }
    return true;
  };

  const pickImageForPortfolio = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addToPortfolio(result.assets[0].uri);
        Alert.alert('Success', 'Image added to portfolio!');
      }
    } catch (error) {
      console.error('Error picking image for portfolio:', error);
      Alert.alert('Error', 'Failed to add image to portfolio.');
    }
  };

  const pickImageForPost = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedPostImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image for post:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const handleCreatePost = async () => {
    if (!selectedPostImage || !postCaption.trim()) {
      Alert.alert('Missing Information', 'Please select an image and add a caption.');
      return;
    }

    setIsCreatingPost(true);
    try {
      await createPost(selectedPostImage, postCaption.trim());
      setSelectedPostImage(null);
      setPostCaption('');
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleRemoveFromPortfolio = (itemId: string) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image from your portfolio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromPortfolio(itemId),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Portfolio Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manage Portfolio</Text>
            <TouchableOpacity
              testID="add-portfolio-button"
              accessibilityRole="button"
              accessibilityLabel="Add photo to portfolio"
              style={styles.addButton}
              onPress={pickImageForPortfolio}
            >
              <Plus size={20} color={COLORS.background} />
              <Text style={styles.addButtonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
          
          {userPortfolio.length > 0 ? (
            <View style={styles.portfolioGrid}>
              {userPortfolio.map((item) => (
                <View key={item.id} style={styles.portfolioItem}>
                  <ImageWithFallback
                    source={{ uri: item.imageUri }}
                    style={[styles.portfolioImage, { width: Math.floor((width - 48) / 3), height: Math.floor((width - 48) / 3) }]}
                    fallbackIcon="camera"
                  />
                  <TouchableOpacity
                    testID={`delete-portfolio-${item.id}`}
                    accessibilityRole="button"
                    accessibilityLabel="Remove portfolio image"
                    style={styles.deleteButton}
                    onPress={() => handleRemoveFromPortfolio(item.id)}
                  >
                    <Trash2 size={16} color={COLORS.background} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Camera size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>No portfolio images yet</Text>
              <Text style={styles.emptyStateSubtext}>Add photos to showcase your work</Text>
            </View>
          )}
        </View>

        {/* Create Post Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create Post</Text>
          
          <TouchableOpacity
            testID="pick-post-image"
            accessibilityRole="button"
            accessibilityLabel="Select image for post"
            style={styles.imagePickerButton}
            onPress={pickImageForPost}
          >
            {selectedPostImage && selectedPostImage.trim() !== '' ? (
              <ImageWithFallback source={{ uri: selectedPostImage }} style={styles.selectedPostImage} fallbackIcon="camera" />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Camera size={32} color={COLORS.lightGray} />
                <Text style={styles.imagePickerText}>Select Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            testID="post-caption-input"
            style={styles.captionInput}
            placeholder="Write a caption for your post..."
            placeholderTextColor={COLORS.lightGray}
            value={postCaption}
            onChangeText={setPostCaption}
            multiline
            maxLength={500}
            textAlignVertical="top"
            accessibilityLabel="Post caption"
          />

          <View style={styles.postActions}>
            <Text style={styles.characterCount}>{postCaption.length}/500</Text>
            <TouchableOpacity
              testID="submit-post-button"
              accessibilityRole="button"
              accessibilityLabel="Create post"
              style={[
                styles.postButton,
                (!selectedPostImage || !postCaption.trim() || isCreatingPost) && styles.postButtonDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={!selectedPostImage || !postCaption.trim() || isCreatingPost}
            >
              <Send size={16} color={COLORS.background} />
              <Text style={styles.postButtonText}>
                {isCreatingPost ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181611',
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2a60d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#181611',
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: FONTS.regular,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  portfolioItem: {
    position: 'relative',
    marginBottom: 8,
  },
  portfolioImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 12,
    fontFamily: FONTS.regular,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.5,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  imagePickerButton: {
    marginBottom: 16,
  },
  selectedPostImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  imagePickerPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 8,
    fontFamily: FONTS.regular,
  },
  captionInput: {
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: FONTS.regular,
    minHeight: 80,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.5,
    fontFamily: FONTS.regular,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2a60d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  postButtonDisabled: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  postButtonText: {
    color: '#181611',
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: FONTS.regular,
  },
  placeholderImage: {
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});