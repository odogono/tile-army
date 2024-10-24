/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { colours } from '@model/state';
import { Canvas } from '@shopify/react-native-skia';
import { createLogger } from '@helpers/log';

import Animated, {
  BounceInUp,
  BounceOutDown,
  LinearTransition,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useDeckStore, useTileMapStore } from '@model/useTileMapStore';
import { createTile, Tile } from '@model/Tile';
import { Position } from '@types';
import { findByRect } from '@model/rtree';
import { posAdd, posSub } from '@helpers/geo';
import { DraggableTile } from './Draggable';
import { TileComponent } from '../TileComponent';

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
  onDragOver: (draggedTile: Tile, targetTile: Tile) => boolean;
  onDragEnd: (draggedTile: Tile, targetTile?: Tile) => boolean;
};

const AnimatedListItem = Animated.createAnimatedComponent(View);

export const TileDeck: React.FC<TileDeckProps> = ({
  onDragOver,
  onDragEnd,
}) => {
  const listRef = useRef<FlatList<Tile>>(null);
  const listContainerRef = useRef<View>(null);
  const { screenToWorld, worldToScreen } = useTileMapStore();
  const [draggedItem, setDraggedItem] = useState<Tile | null>(null);

  const [tileData, setTileData] = useState([
    createTile({ id: '1', colour: colours[0] }),
    createTile({ id: '2', colour: colours[1] }),
    createTile({ id: '3', colour: colours[2] }),
    createTile({ id: '4', colour: colours[3] }),
    createTile({ id: '5', colour: colours[4] }),
    createTile({ id: '6', colour: colours[5] }),
  ]);

  const {
    dragPosition,
    dragScale,
    dragTile,
    dragTargetTile,
    spatialIndex,
    dragInitialPosition,
  } = useDeckStore('fromTileDeck');

  const draggedItemStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: dragPosition.value[0],
    top: dragPosition.value[1],
    transform: [{ scale: dragScale.value }],
    zIndex: 1000,
  }));

  const handleDragStart = useCallback((draggedTile: Tile) => {
    log.debug('[onDragStart]', draggedTile);
    setDraggedItem(draggedTile);
  }, []);

  const handleDragEnd = useCallback((droppedTile: Tile, targetTile?: Tile) => {
    const dropSuccess = onDragEnd(droppedTile, targetTile);

    log.debug('[onDragEnd]', droppedTile.id, targetTile?.id, {
      dropSuccess,
    });

    const animCb = () => {
      'worklet';
      runOnJS(setDraggedItem)(null);
    };

    const duration = 200;

    if (dropSuccess && targetTile) {
      setTileData((current) =>
        current.filter((tile) => tile.id !== droppedTile.id),
      );

      const targetPosition = posSub(worldToScreen(targetTile.position), [
        targetTile.size / 2,
        targetTile.size / 2,
      ]);

      dragPosition.value = withTiming(targetPosition, { duration }, animCb);
    } else {
      dragPosition.value = withTiming(
        dragInitialPosition.value,
        { duration },
        animCb,
      );
    }
    dragScale.value = withSpring(1, { duration });
  }, []);

  useAnimatedReaction(
    () => [dragTile.value, dragTargetTile.value],
    ([current, target], previous) => {
      const currentDragTile = current;
      const previousDragTile = previous?.[0];
      const currentDragTarget = target;
      const previousDragTarget = previous?.[1];

      if (currentDragTile && !previousDragTile) {
        runOnJS(log.debug)('🙌 drag start', currentDragTile.id);
        runOnJS(handleDragStart)(currentDragTile);
      } else if (currentDragTarget && !previousDragTarget) {
        runOnJS(log.debug)('🙌 drag over', currentDragTarget.id);
      } else if (!currentDragTarget && previousDragTarget) {
        runOnJS(log.debug)('🙌 drag out', previousDragTarget.id);
      } else if (!currentDragTile && previousDragTile) {
        runOnJS(log.debug)(
          '🙌 drag fin',
          previousDragTile.id,
          previousDragTarget?.id,
        );
        dragTargetTile.value = undefined;

        runOnJS(handleDragEnd)(previousDragTile, previousDragTarget);
      }
    },
  );

  const checkForTiles = useCallback((position: Position) => {
    const adjustedPosition: Position = posAdd(position, [50, 50]);

    const worldPosition = screenToWorld(adjustedPosition);

    const cursorRect = {
      x: worldPosition[0],
      y: worldPosition[1],
      width: 5,
      height: 5,
    };

    const tiles = findByRect(spatialIndex, cursorRect);

    dragTargetTile.value = tiles.length > 0 ? tiles[0] : undefined;
  }, []);

  useAnimatedReaction(
    () => dragPosition.value,
    (position) => {
      if (dragTile.value) {
        runOnJS(checkForTiles)(position);
      }
    },
  );
  // useRenderingTrace('TileDeck', { listContainerBounds, draggedItem });

  const renderTile = useCallback(
    ({ item, index }: { item: Tile; index: number }) => (
      <AnimatedListItem
        entering={BounceInUp}
        exiting={BounceOutDown}
        layout={LinearTransition.springify()}
        style={styles.listItem}
      >
        <DraggableTile
          item={item}
          index={index}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          isHidden={draggedItem?.id === item.id}
        >
          <TileItem item={item} />
        </DraggableTile>
      </AnimatedListItem>
    ),
    [handleDragStart, handleDragEnd, draggedItem],
  );

  log.debug('render?', !!draggedItem);

  return (
    <View style={styles.container} pointerEvents='box-none'>
      <View style={styles.listContainer} ref={listContainerRef}>
        <Animated.FlatList
          itemLayoutAnimation={LinearTransition.springify()}
          ref={listRef}
          data={tileData}
          keyExtractor={(item) => item.id}
          renderItem={renderTile}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={styles.listContent}
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
    width: '100%',
  },
  list: {
    width: '100%',
  },
  listContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listItem: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: 100,
    height: 100,
  },
});
