/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { colours } from '@model/state';
import { Canvas } from '@shopify/react-native-skia';
import { createLogger } from '@helpers/log';

import Animated, { runOnJS, useAnimatedStyle } from 'react-native-reanimated';
import { useRenderingTrace } from '@helpers/useRenderingTrace';
import { useViewBounds } from '@hooks/useViewBounds';
import { useDeckStore } from '@model/useTileMapStore';
import { createTile, Tile } from '@model/Tile';
import { DraggableTile } from './Draggable';
import { TileComponent } from '../TileComponent'; // Assuming you have a Tile component

const log = createLogger('TileDeck');

const TileItem = ({ item }: { item: Tile }) => (
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

export type TileDeckProps = {
  onDragOver: (tile: Tile) => void;
  onDragEnd: (tile: Tile) => void;
};

export const TileDeck: React.FC<TileDeckProps> = ({
  onDragOver,
  onDragEnd,
}) => {
  const listRef = useRef<FlatList<Tile>>(null);
  const listContainerRef = useRef<View>(null);
  const listContainerBounds = useViewBounds(listContainerRef);
  const [draggedItem, setDraggedItem] = useState<Tile | null>(null);

  const { dragPosition, dragScale } = useDeckStore();

  const tileData: Tile[] = [
    createTile({ id: '1', colour: colours[0] }),
    createTile({ id: '2', colour: colours[1] }),
    createTile({ id: '3', colour: colours[2] }),
    createTile({ id: '4', colour: colours[3] }),
    createTile({ id: '5', colour: colours[4] }),
    createTile({ id: '6', colour: colours[5] }),
  ];

  const draggedItemStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: dragPosition.value[0],
    top: dragPosition.value[1],
    transform: [{ scale: dragScale.value }],
    zIndex: 1000,
    opacity: 0.1,
  }));

  const animatedListStyle = useAnimatedStyle(() => ({
    // marginLeft: altDragItem.isActive.value
    //   ? Math.min(50, (100 - altDragItem.distance.value) / 2)
    //   : 0,
  }));

  const handleDragStart = useCallback((index: number, item: Tile) => {
    log.debug('[onDragStart]', index, item);
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback((index: number, item: Tile) => {
    log.debug('[onDragEnd]', index, item);
    setDraggedItem(null);
  }, []);

  const renderTile = ({ item, index }: { item: Tile; index: number }) => (
    <DraggableTile
      item={item}
      index={index}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TileItem item={item} />
    </DraggableTile>
  );

  // useRenderingTrace('TileDeck', { listContainerBounds, draggedItem });

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
