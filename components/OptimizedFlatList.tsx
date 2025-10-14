import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, FlatListProps, ListRenderItem } from 'react-native';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  itemHeight?: number;
  estimatedItemSize?: number;
}

// Optimized FlatList with performance enhancements
export const OptimizedFlatList = memo(<T,>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  estimatedItemSize,
  ...props
}: OptimizedFlatListProps<T>) => {
  console.log('OptimizedFlatList: Rendering with', data.length, 'items');

  // Memoize the render item to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback<ListRenderItem<T>>((info) => {
    if (!info || !info.item) return null;
    return renderItem(info);
  }, [renderItem]);

  // Memoize key extractor
  const memoizedKeyExtractor = useCallback((item: T, index: number) => {
    if (!item) return index.toString();
    if (keyExtractor) {
      return keyExtractor(item, index);
    }
    // Fallback to index if no keyExtractor provided
    return index.toString();
  }, [keyExtractor]);

  // Calculate optimal performance settings
  const performanceProps = useMemo(() => {
    const baseProps = {
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      windowSize: 10,
      initialNumToRender: 10,
      updateCellsBatchingPeriod: 50,
      getItemLayout: itemHeight ? (data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }) : undefined,
    };

    // Adjust based on data size
    if (data.length > 100) {
      return {
        ...baseProps,
        maxToRenderPerBatch: 5,
        windowSize: 5,
        initialNumToRender: 5,
      };
    }

    if (data.length > 50) {
      return {
        ...baseProps,
        maxToRenderPerBatch: 8,
        windowSize: 8,
        initialNumToRender: 8,
      };
    }

    return baseProps;
  }, [data.length, itemHeight]);

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      {...performanceProps}
      {...props}
    />
  );
}) as <T>(props: OptimizedFlatListProps<T>) => React.ReactElement;

(OptimizedFlatList as any).displayName = 'OptimizedFlatList';

export default OptimizedFlatList;