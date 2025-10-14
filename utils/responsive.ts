import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useDevice } from '@/providers/DeviceProvider';

export function useResponsive() {
  const device = useDevice();

  const scale = useMemo(() => {
    const base = 375;
    const width = device.width;
    const ratio = Math.min(1.25, Math.max(0.85, width / base));
    const fontAdj = 1 / (device.fontScale || 1);
    return ratio * fontAdj;
  }, [device.width, device.fontScale]);

  const rem = useMemo(() => (v: number) => Math.round(v * scale), [scale]);

  const hitSlop = useMemo(() => ({ top: 8, bottom: 8, left: 8, right: 8 }), []);

  const minTouchTarget = useMemo(() => ({ width: 44, height: 44 }), []);

  const platform = Platform.OS;

  return { scale, rem, hitSlop, minTouchTarget, platform, device } as const;
}
