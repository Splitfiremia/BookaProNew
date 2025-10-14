import React, { useState, useCallback } from 'react';
import { View, Image, StyleSheet, ImageProps, ViewStyle, ImageStyle } from 'react-native';
import { User, Camera, ImageIcon } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface ImageWithFallbackProps extends Omit<ImageProps, 'source'> {
  source: { uri?: string } | number;
  fallbackIcon?: 'user' | 'camera' | 'image';
  fallbackStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  showLoadingState?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  source,
  fallbackIcon = 'image',
  fallbackStyle,
  containerStyle,
  imageStyle,
  showLoadingState = true,
  style,
  ...props
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleError = useCallback(() => {
    const sourceUri = typeof source === 'object' ? source.uri : source;
    console.log('Image failed to load:', sourceUri);
    if (sourceUri === '' || sourceUri === null || sourceUri === undefined) {
      console.warn('Empty or invalid URI passed to ImageWithFallback:', sourceUri);
    }
    setHasError(true);
    setIsLoading(false);
  }, [source]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  // Check if source is valid
  const isValidSource = () => {
    if (typeof source === 'number') return true; // Local image
    if (typeof source === 'object' && source.uri) {
      const uri = source.uri?.trim();
      return uri && 
             uri.length > 0 && 
             uri !== 'undefined' && 
             uri !== 'null' && 
             uri !== '' &&
             (uri.startsWith('http') || uri.startsWith('file://') || uri.startsWith('data:'));
    }
    return false;
  };

  const getFallbackIcon = () => {
    const iconSize = 24;
    const iconColor = COLORS.lightGray;
    
    switch (fallbackIcon) {
      case 'user':
        return <User size={iconSize} color={iconColor} />;
      case 'camera':
        return <Camera size={iconSize} color={iconColor} />;
      default:
        return <ImageIcon size={iconSize} color={iconColor} />;
    }
  };

  const shouldShowFallback = !isValidSource() || hasError;
  const shouldShowLoading = isValidSource() && isLoading && showLoadingState && !hasError;

  return (
    <View style={[styles.container, containerStyle]}>
      {shouldShowFallback ? (
        <View style={[styles.fallback, style, fallbackStyle]}>
          {getFallbackIcon()}
        </View>
      ) : (
        <>
          <Image
            {...props}
            source={source}
            style={[style, imageStyle]}
            onError={handleError}
            onLoad={handleLoad}
            onLoadStart={handleLoadStart}
          />
          {shouldShowLoading && (
            <View style={[styles.loadingOverlay, style]}>
              <View style={styles.loadingIndicator} />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  fallback: {
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderTopColor: 'transparent',
    // Note: For a real loading animation, you'd use Animated.View with rotation
  },
});

export default ImageWithFallback;