/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { colours } from '@model/state';
import { Canvas } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { createLogger } from '@helpers/log';
import { Position } from '@types';

import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { TileComponent } from '../TileComponent'; // Assuming you have a Tile component

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the type for the tile data
type TileData = {
  id: string;
  // Add other properties your Tile component needs
};

const log = createLogger('TileDeck');

type AltDragItem = {
  position: SharedValue<Position>;
  offsetPosition: SharedValue<Position>;
  initialPosition: SharedValue<Position>;
  isActive: SharedValue<boolean>;
  distance: SharedValue<number>;
};

type DraggableTileProps = {
  item: TileData;
  index: number;
  // onDragStart: (pos: number[], index: number, item: TileData) => void;
  // onDragEnd: () => void;
  // onDrag: (pos: number[]) => void;
  altDragItem: AltDragItem;
};

const DraggableTile = ({ item, index, altDragItem }: DraggableTileProps) => {
  const isDragging = useSharedValue(false);
  // const distance = useSharedValue(0);

  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      isDragging.value = true;
      runOnJS(log.debug)('[longPressGesture][onStart]');
    });

  const gesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((event, state) => {
      if (isDragging.value) {
        state.activate();
        // isDragging.value = true;
        altDragItem.isActive.value = true;
        // altDragItem.distance.value = 100;
        // altDragItem.isActive.value = true;
        // altDragItem.offsetPosition.value = [-event.x, -event.y];
        // altDragItem.position.value = [
        //   event.absoluteX - event.x,
        //   event.absoluteY - event.y,
        // ];
        // altDragItem.initialPosition.value = altDragItem.position.value;
        runOnJS(log.debug)('[onTouchesMove] activate');
      } else {
        state.fail();
        runOnJS(log.debug)('[onTouchesMove] fail');
      }
    })
    .onBegin((event) => {
      // isDragging.value = true;
      // // dragItem.value.isActive = true;
      altDragItem.distance.value = 100;
      // altDragItem.isActive.value = true;
      altDragItem.offsetPosition.value = [-event.x, -event.y];
      altDragItem.position.value = [
        event.absoluteX - event.x,
        event.absoluteY - event.y,
      ];
      altDragItem.initialPosition.value = altDragItem.position.value;
      // runOnJS(log.debug)('[onBegin] x, y', altDragItem.position.value);
    })
    .onUpdate((event) => {
      // runOnJS(log.debug)('[onUpdate] x, y', event.absoluteX, event.absoluteY);
      altDragItem.position.value = [
        event.absoluteX + altDragItem.offsetPosition.value[0],
        event.absoluteY + altDragItem.offsetPosition.value[1],
      ];

      const diff = [
        altDragItem.position.value[0] - altDragItem.initialPosition.value[0],
        altDragItem.position.value[1] - altDragItem.initialPosition.value[1],
      ];

      // normalize
      // const norm = Math.sqrt(diff[0] ** 2 + diff[1] ** 2);
      // const nDiff = [diff[0] / norm, diff[1] / norm];

      // get the magnitude of the vector
      const magnitude = Math.sqrt(diff[1] ** 2) / 2;

      altDragItem.distance.value = Math.max(0, 100 - magnitude);

      // runOnJS(log.debug)('[onUpdate] distance', altDragItem.distance.value);
    })
    .onEnd(() => {
      altDragItem.position.value = withTiming(
        altDragItem.initialPosition.value,
        { duration: 200 },
        () => {
          // dragItem.value.isActive = false;
          altDragItem.isActive.value = false;
          isDragging.value = false;
        },
      );
    });

  const combinedGesture = Gesture.Simultaneous(longPressGesture, gesture);

  const animatedStyle = useAnimatedStyle(() => ({
    // transform: [
    // { translateX: position.value[0] },
    // { translateY: position.value[1] },
    // { scale: scale.value },
    // ],
    // width: isDragging.value ? altDragItem.distance.value : 100,
    // width: 100,
    // height: isDragging.value ? 50 : 100,
    backgroundColor:
      isDragging.value && altDragItem.isActive.value
        ? 'transparent'
        : '#f9c2ff',
    zIndex: isDragging.value && altDragItem.isActive.value ? 100 : 1,
  }));

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={[styles.item, animatedStyle]} />
    </GestureDetector>
  );
};

export const TileDeck: React.FC = () => {
  const listRef = useRef<FlatList<TileData>>(null);

  const altDragItem: AltDragItem = {
    position: useSharedValue([0, 0]),
    offsetPosition: useSharedValue([0, 0]),
    initialPosition: useSharedValue([0, 0]),
    isActive: useSharedValue(false),
    distance: useSharedValue(0),
  };

  // Sample data for tiles, replace with your actual data source
  const tileData: TileData[] = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
  ];

  // const draggingIndex = useSharedValue(null);

  // const onDragStart = useCallback((pos, index, item) => {
  //   // draggedItemInitialPosition.value = pos;
  //   // draggedItemPosition.value = pos;
  //   // isDragging.value = true;
  //   // setDraggingItem({ index, item });
  // }, []);

  // const onDrag = useCallback((pos) => {
  //   log.debug('[onDrag] x, y', pos);
  //   // draggedItemPosition.value = pos;
  // }, []);

  // const onDragEnd = useCallback(() => {}, []);

  const draggedItemStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: altDragItem.position.value[0],
    top: altDragItem.position.value[1],
    width: altDragItem.isActive.value ? 100 : 0,
    height: altDragItem.isActive.value ? 100 : 0,
    backgroundColor: altDragItem.isActive.value ? '#F00' : '#FFF',
    // opacity: dragItem.value.isActive ? 1 : 0,
    zIndex: 1000,
  }));

  const animatedListStyle = useAnimatedStyle(() => ({
    // marginLeft: altDragItem.isActive.value
    //   ? Math.min(50, (100 - altDragItem.distance.value) / 2)
    //   : 0,
  }));

  const renderTile = ({ item, index }: { item: TileData; index: number }) => (
    <DraggableTile
      item={item}
      index={index}
      // onDragStart={onDragStart}
      // onDragEnd={onDragEnd}
      // onDrag={onDrag}
      altDragItem={altDragItem}
    />

    // <Canvas style={styles.canvas}>
    //   <TileComponent
    //     id={item.id}
    //     position={[50, 50]}
    //     size={100}
    //     type='normal'
    //     colour={colours[Math.floor(Math.random() * colours.length)]}
    //     hasShadow={false}
    //     isAnimated={false}
    //   />
    // </Canvas>
    // <TileComponent id={item.id} position={[0, 0]} size={100} type='normal' />
  );

  return (
    <View style={styles.container} pointerEvents='box-none'>
      <View style={styles.listContainer}>
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
      {true && (
        <Animated.View style={draggedItemStyle}>
          {/* Render dragged item content here */}
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
    backgroundColor: '#00FF0011',
  },
  listContainer: {
    position: 'absolute',
    bottom: 100,
  },
  list: {
    marginLeft: 0,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    width: 100,
    height: 100,
    backgroundColor: '#F00',
  },
});
