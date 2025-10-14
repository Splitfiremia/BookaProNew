import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "@/providers/AuthProvider";

export interface Post {
  id: string;
  providerId: string;
  imageUri: string;
  caption: string;
  createdAt: string;
  likes: number;
}

export interface PortfolioItem {
  id: string;
  providerId: string;
  imageUri: string;
  createdAt: string;
}

interface SocialState {
  followedProviderIds: string[];
  posts: Post[];
  portfolio: PortfolioItem[];
  isLoading: boolean;
}

interface SocialContextValue {
  followedProviderIds: string[];
  posts: Post[];
  portfolio: PortfolioItem[];
  isLoading: boolean;
  followProvider: (providerId: string) => Promise<void>;
  unfollowProvider: (providerId: string) => Promise<void>;
  isFollowing: (providerId: string) => boolean;
  getFollowedCount: () => number;
  createPost: (imageUri: string, caption: string) => Promise<void>;
  addToPortfolio: (imageUri: string) => Promise<void>;
  removeFromPortfolio: (itemId: string) => Promise<void>;
  getProviderPosts: (providerId: string) => Post[];
  getProviderPortfolio: (providerId: string) => PortfolioItem[];
}

const STORAGE_KEY = "social_followed_providers";
const POSTS_STORAGE_KEY = "social_posts";
const PORTFOLIO_STORAGE_KEY = "social_portfolio";

export const [SocialProvider, useSocial] = createContextHook(() => {
  const { user } = useAuth();
  const [socialState, setSocialState] = useState<SocialState>({
    followedProviderIds: [],
    posts: [],
    portfolio: [],
    isLoading: true,
  });

  // Load social data from AsyncStorage on mount
  useEffect(() => {
    const loadSocialData = async () => {
      if (!user?.id) {
        setSocialState({ followedProviderIds: [], posts: [], portfolio: [], isLoading: false });
        return;
      }

      try {
        console.log('SocialProvider: Loading social data for user:', user.id);
        const userStorageKey = `${STORAGE_KEY}_${user.id}`;
        const postsStorageKey = `${POSTS_STORAGE_KEY}_${user.id}`;
        const portfolioStorageKey = `${PORTFOLIO_STORAGE_KEY}_${user.id}`;
        
        const [followedData, postsData, portfolioData] = await Promise.all([
          AsyncStorage.getItem(userStorageKey),
          AsyncStorage.getItem(postsStorageKey),
          AsyncStorage.getItem(portfolioStorageKey)
        ]);
        
        const followedIds = followedData ? JSON.parse(followedData) as string[] : [];
        const posts = postsData ? JSON.parse(postsData) as Post[] : [];
        const portfolio = portfolioData ? JSON.parse(portfolioData) as PortfolioItem[] : [];
        
        console.log('SocialProvider: Loaded social data - followed:', followedIds.length, 'posts:', posts.length, 'portfolio:', portfolio.length);
        setSocialState({ followedProviderIds: followedIds, posts, portfolio, isLoading: false });
      } catch (error) {
        console.error('SocialProvider: Error loading social data:', error);
        setSocialState({ followedProviderIds: [], posts: [], portfolio: [], isLoading: false });
      }
    };

    loadSocialData();
  }, [user?.id]);

  // Save social data to AsyncStorage
  const saveSocialData = useCallback(async (data: Partial<SocialState>) => {
    if (!user?.id) return;

    try {
      const promises = [];
      
      if (data.followedProviderIds !== undefined) {
        const userStorageKey = `${STORAGE_KEY}_${user.id}`;
        promises.push(AsyncStorage.setItem(userStorageKey, JSON.stringify(data.followedProviderIds)));
      }
      
      if (data.posts !== undefined) {
        const postsStorageKey = `${POSTS_STORAGE_KEY}_${user.id}`;
        promises.push(AsyncStorage.setItem(postsStorageKey, JSON.stringify(data.posts)));
      }
      
      if (data.portfolio !== undefined) {
        const portfolioStorageKey = `${PORTFOLIO_STORAGE_KEY}_${user.id}`;
        promises.push(AsyncStorage.setItem(portfolioStorageKey, JSON.stringify(data.portfolio)));
      }
      
      await Promise.all(promises);
      console.log('SocialProvider: Saved social data');
    } catch (error) {
      console.error('SocialProvider: Error saving social data:', error);
    }
  }, [user?.id]);

  // Follow a provider
  const followProvider = useCallback(async (providerId: string) => {
    if (!user?.id) {
      console.warn('SocialProvider: Cannot follow provider - user not authenticated');
      return;
    }

    if (socialState.followedProviderIds.includes(providerId)) {
      console.log('SocialProvider: Already following provider:', providerId);
      return;
    }

    try {
      console.log('SocialProvider: Following provider:', providerId);
      const updatedFollowedIds = [...socialState.followedProviderIds, providerId];
      
      setSocialState(prev => ({
        ...prev,
        followedProviderIds: updatedFollowedIds,
      }));
      
      await saveSocialData({ followedProviderIds: updatedFollowedIds });
      console.log('SocialProvider: Successfully followed provider:', providerId);
    } catch (error) {
      console.error('SocialProvider: Error following provider:', error);
      // Revert state on error
      setSocialState(prev => ({
        ...prev,
        followedProviderIds: prev.followedProviderIds.filter(id => id !== providerId),
      }));
    }
  }, [user?.id, socialState.followedProviderIds, saveSocialData]);

  // Unfollow a provider
  const unfollowProvider = useCallback(async (providerId: string) => {
    if (!user?.id) {
      console.warn('SocialProvider: Cannot unfollow provider - user not authenticated');
      return;
    }

    if (!socialState.followedProviderIds.includes(providerId)) {
      console.log('SocialProvider: Not following provider:', providerId);
      return;
    }

    try {
      console.log('SocialProvider: Unfollowing provider:', providerId);
      const updatedFollowedIds = socialState.followedProviderIds.filter(id => id !== providerId);
      
      setSocialState(prev => ({
        ...prev,
        followedProviderIds: updatedFollowedIds,
      }));
      
      await saveSocialData({ followedProviderIds: updatedFollowedIds });
      console.log('SocialProvider: Successfully unfollowed provider:', providerId);
    } catch (error) {
      console.error('SocialProvider: Error unfollowing provider:', error);
      // Revert state on error
      setSocialState(prev => ({
        ...prev,
        followedProviderIds: [...prev.followedProviderIds, providerId],
      }));
    }
  }, [user?.id, socialState.followedProviderIds, saveSocialData]);

  // Check if following a provider
  const isFollowing = useCallback((providerId: string) => {
    return socialState.followedProviderIds.includes(providerId);
  }, [socialState.followedProviderIds]);

  // Get count of followed providers
  const getFollowedCount = useCallback(() => {
    return socialState.followedProviderIds.length;
  }, [socialState.followedProviderIds]);

  // Create a new post
  const createPost = useCallback(async (imageUri: string, caption: string) => {
    if (!user?.id) {
      console.warn('SocialProvider: Cannot create post - user not authenticated');
      return;
    }

    try {
      console.log('SocialProvider: Creating post for provider:', user.id);
      const newPost: Post = {
        id: Date.now().toString(),
        providerId: user.id,
        imageUri,
        caption,
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      
      const updatedPosts = [newPost, ...socialState.posts];
      
      setSocialState(prev => ({
        ...prev,
        posts: updatedPosts,
      }));
      
      await saveSocialData({ posts: updatedPosts });
      console.log('SocialProvider: Successfully created post');
    } catch (error) {
      console.error('SocialProvider: Error creating post:', error);
    }
  }, [user?.id, socialState.posts, saveSocialData]);

  // Add item to portfolio
  const addToPortfolio = useCallback(async (imageUri: string) => {
    if (!user?.id) {
      console.warn('SocialProvider: Cannot add to portfolio - user not authenticated');
      return;
    }

    try {
      console.log('SocialProvider: Adding to portfolio for provider:', user.id);
      const newItem: PortfolioItem = {
        id: Date.now().toString(),
        providerId: user.id,
        imageUri,
        createdAt: new Date().toISOString(),
      };
      
      const updatedPortfolio = [newItem, ...socialState.portfolio];
      
      setSocialState(prev => ({
        ...prev,
        portfolio: updatedPortfolio,
      }));
      
      await saveSocialData({ portfolio: updatedPortfolio });
      console.log('SocialProvider: Successfully added to portfolio');
    } catch (error) {
      console.error('SocialProvider: Error adding to portfolio:', error);
    }
  }, [user?.id, socialState.portfolio, saveSocialData]);

  // Remove item from portfolio
  const removeFromPortfolio = useCallback(async (itemId: string) => {
    if (!user?.id) {
      console.warn('SocialProvider: Cannot remove from portfolio - user not authenticated');
      return;
    }

    try {
      console.log('SocialProvider: Removing from portfolio:', itemId);
      const updatedPortfolio = socialState.portfolio.filter(item => item.id !== itemId);
      
      setSocialState(prev => ({
        ...prev,
        portfolio: updatedPortfolio,
      }));
      
      await saveSocialData({ portfolio: updatedPortfolio });
      console.log('SocialProvider: Successfully removed from portfolio');
    } catch (error) {
      console.error('SocialProvider: Error removing from portfolio:', error);
    }
  }, [user?.id, socialState.portfolio, saveSocialData]);

  // Get posts for a specific provider
  const getProviderPosts = useCallback((providerId: string) => {
    return socialState.posts.filter(post => post.providerId === providerId);
  }, [socialState.posts]);

  // Get portfolio for a specific provider
  const getProviderPortfolio = useCallback((providerId: string) => {
    return socialState.portfolio.filter(item => item.providerId === providerId);
  }, [socialState.portfolio]);

  const contextValue = useMemo((): SocialContextValue => ({
    followedProviderIds: socialState.followedProviderIds,
    posts: socialState.posts,
    portfolio: socialState.portfolio,
    isLoading: socialState.isLoading,
    followProvider,
    unfollowProvider,
    isFollowing,
    getFollowedCount,
    createPost,
    addToPortfolio,
    removeFromPortfolio,
    getProviderPosts,
    getProviderPortfolio,
  }), [socialState, followProvider, unfollowProvider, isFollowing, getFollowedCount, createPost, addToPortfolio, removeFromPortfolio, getProviderPosts, getProviderPortfolio]);

  return contextValue;
});