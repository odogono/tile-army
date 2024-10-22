/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { colours } from '@model/state';
import { Canvas } from '@shopify/react-native-skia';
import { createLogger } from '@helpers/log';

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useRenderingTrace } from '@helpers/useRenderingTrace';
import { useViewBounds } from '@hooks/useViewBounds';
import { useDeckStore } from '@model/useTileMapStore';
import { AltDragItem, TileData } from './types';
import { DraggableTile } from './Draggable';
import { TileComponent } from '../TileComponent'; // Assuming you have a Tile component

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const log = createLogger('TileDeck');

const TileItem = ({ item }: { item: TileData }) => (
  <Canvas style={styles.canvas}>
    <TileComponent
      id={item.id}
      position={[50, 50]}
      size={100}
      type='normal'
      colour={item.colour}
      hasShadow={false}
      isAnimated={false}
    />
  </Canvas>
);

export const TileDeck: React.FC = () => {
  const listRef = useRef<FlatList<TileData>>(null);
  const listContainerRef = useRef<View>(null);
  const listContainerBounds = useViewBounds(listContainerRef);
  const [draggedItem, setDraggedItem] = useState<TileData | null>(null);

  const { dragPosition, dragScale } = useDeckStore();

  const tileData: TileData[] = [
    { id: '1', colour: colours[0] },
    { id: '2', colour: colours[1] },
    { id: '3', colour: colours[2] },
    { id: '4', colour: colours[3] },
    { id: '5', colour: colours[4] },
    { id: '6', colour: colours[5] },
  ];

  const draggedItemStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: dragPosition.value[0],
    top: dragPosition.value[1],
    transform: [{ scale: dragScale.value }],
    zIndex: 1000,
  }));

  const animatedListStyle = useAnimatedStyle(() => ({
    // marginLeft: altDragItem.isActive.value
    //   ? Math.min(50, (100 - altDragItem.distance.value) / 2)
    //   : 0,
  }));

  const onDragStart = (index: number, item: TileData) => {
    runOnJS(log.debug)('[onDragStart]', index, item);
    setDraggedItem(item);
  };

  const onDragEnd = (index: number, item: TileData) => {
    runOnJS(log.debug)('[onDragEnd]', index, item);
    setDraggedItem(null);
  };

  const renderTile = ({ item, index }: { item: TileData; index: number }) => (
    <DraggableTile
      item={item}
      index={index}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <TileItem item={item} />
    </DraggableTile>
  );

  useRenderingTrace('TileDeck', { listContainerBounds, draggedItem });

  return (
    <View style={styles.container} pointerEvents='box-none'>
      <View style={styles.listContainer} ref={listContainerRef}>
        <Animated.FlatList
          ref={listRef}
          data={tileData}
          keyExtractor={(item) => item.id}
          renderItem={renderTile}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.list, animatedListStyle]}
        />
      </View>
      {draggedItem && (
        <Animated.View style={draggedItemStyle}>
          <TileItem item={draggedItem} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  listContainer: {
    position: 'absolute',
    bottom: 100,
  },
  list: {
    marginLeft: 0,
  },
  canvas: {
    width: 100,
    height: 100,
  },
});
