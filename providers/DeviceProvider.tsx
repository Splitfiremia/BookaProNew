import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, PixelRatio } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import createContextHook from '@nkzw/create-context-hook';

export type Orientation = 'portrait' | 'landscape';

export interface DeviceInfo {
  width: number;
  height: number;
  orientation: Orientation;
  isSmallPhone: boolean;
  isTablet: boolean;
  platform: 'ios' | 'android' | 'web';
  fontScale: number;
  hasNotchLikeInsets: boolean;
}

export const [DeviceContext, useDevice] = createContextHook<DeviceInfo>(() => {
  const insets = useSafeAreaInsets();
  const window = Dimensions.get('window');
  const [dims, setDims] = useState<{ width: number; height: number }>(() => ({ width: window.width, height: window.height }));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window: w }) => {
      setDims({ width: w.width, height: w.height });
    });
    return () => {
      try {
        // @ts-ignore
        sub?.remove?.();
      } catch (e) {
        console.log('Dimension listener cleanup error', e);
      }
    };
  }, []);

  const value: DeviceInfo = useMemo(() => {
    const orientation: Orientation = dims.height >= dims.width ? 'portrait' : 'landscape';
    const minDim = Math.min(dims.width, dims.height);
    const maxDim = Math.max(dims.width, dims.height);
    const isTablet = maxDim / minDim <= 1.6 && Math.max(dims.width, dims.height) >= 900;
    const isSmallPhone = !isTablet && minDim < 360;
    const fontScale = PixelRatio.getFontScale();
    const platform = Platform.OS as 'ios' | 'android' | 'web';
    const hasNotchLikeInsets = (insets.top > 24 || insets.bottom > 16) && platform !== 'web';

    return {
      width: dims.width,
      height: dims.height,
      orientation,
      isSmallPhone,
      isTablet,
      platform,
      fontScale,
      hasNotchLikeInsets,
    };
  }, [dims.width, dims.height, insets.top, insets.bottom]);

  return value;
});

export function WithSafeAreaDeviceProvider({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <DeviceContext>{children}</DeviceContext>
    </SafeAreaProvider>
  );
}

export function useInsetStyles(padding?: { top?: number; bottom?: number; left?: number; right?: number }) {
  const insets = useSafeAreaInsets();
  return useMemo(() => {
    return {
      paddingTop: (padding?.top ?? 0) + insets.top,
      paddingBottom: (padding?.bottom ?? 0) + insets.bottom,
      paddingLeft: (padding?.left ?? 0) + insets.left,
      paddingRight: (padding?.right ?? 0) + insets.right,
    } as const;
  }, [insets.top, insets.bottom, insets.left, insets.right, padding?.top, padding?.bottom, padding?.left, padding?.right]);
}
