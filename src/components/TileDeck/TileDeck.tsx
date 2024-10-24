/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
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
import {
  useDeckStore,
  useTileMapStore,
  useTileMapStoreState,
} from '@model/useTileMapStore';
import { Tile } from '@model/Tile';
import { posSub } from '@helpers/geo';
import { DraggableTile } from './Draggable';
import { useDragTileCheck } from './useDragTileCheck';
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
  const { worldToScreen } = useTileMapStore();
  const [draggedItem, setDraggedItem] = useState<Tile | null>(null);

  const deckTiles = useTileMapStoreState((state) => state.deckTiles);

  const { dragPosition, dragScale, dragTile, dragTargetTile } = useDeckStore();

  // listens to the drag position and checks for tiles
  // that the draggable tile is over
  useDragTileCheck();

  const draggedItemStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: dragPosition.value[0],
    top: dragPosition.value[1],
    transform: [{ scale: dragScale.value }],
    zIndex: 1000,
  }));

  const handleDragStart = useCallback((draggedTile: Tile) => {
    setDraggedItem(draggedTile);
  }, []);

  const handleDragEnd = useCallback((droppedTile: Tile, targetTile?: Tile) => {
    const dropSuccess = onDragEnd(droppedTile, targetTile);

    // log.debug('[onDragEnd]', droppedTile.id, targetTile?.id, {
    //   dropSuccess,
    // });

    const animCb = () => {
      'worklet';
      runOnJS(setDraggedItem)(null);
    };

    const duration = 200;

    if (dropSuccess && targetTile) {
      // animate to the target tile

      const targetPosition = posSub(worldToScreen(targetTile.position), [
        targetTile.size / 2,
        targetTile.size / 2,
      ]);

      dragPosition.value = withTiming(targetPosition, { duration }, animCb);
    } else {
      // animate back to the initial position
      dragPosition.value = withTiming(
        // the initial screen position was saved
        // on the dropped tile
        droppedTile.position,
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
        // runOnJS(log.debug)('🙌 drag start', currentDragTile.id);
        runOnJS(handleDragStart)(currentDragTile);
      } else if (currentDragTarget && !previousDragTarget) {
        // runOnJS(log.debug)('🙌 drag over', currentDragTarget.id);
      } else if (!currentDragTarget && previousDragTarget) {
        // runOnJS(log.debug)('🙌 drag out', previousDragTarget.id);
      } else if (!currentDragTile && previousDragTile) {
        // runOnJS(log.debug)(
        //   '🙌 drag fin',
        //   previousDragTile.id,
        //   previousDragTarget?.id,
        // );
        dragTargetTile.value = undefined;

        runOnJS(handleDragEnd)(previousDragTile, previousDragTarget);
      }
    },
  );

  const renderTile = useCallback(
    ({ item, index }: { item: Tile; index: number }) => (
      <AnimatedListItem
        entering={BounceInUp}
        exiting={BounceOutDown}
        layout={LinearTransition.springify()}
        style={styles.listItem}
      >
        <DraggableTile item={item} isHidden={draggedItem?.id === item.id}>
          <TileItem item={item} />
        </DraggableTile>
      </AnimatedListItem>
    ),
    [handleDragStart, handleDragEnd, draggedItem],
  );

  return (
    <View style={styles.container} pointerEvents='box-none'>
      <View style={styles.listContainer} ref={listContainerRef}>
        <Animated.FlatList
          itemLayoutAnimation={LinearTransition.springify()}
          ref={listRef}
          data={deckTiles}
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
