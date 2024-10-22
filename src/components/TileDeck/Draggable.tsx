/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { LayoutRectangle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { createLogger } from '@helpers/log';

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AltDragItem, TileData } from './types';

const log = createLogger('DraggableTile');

export type DraggableTileProps = React.PropsWithChildren<{
  item: TileData;
  index: number;
  onDragStart: (index: number, item: TileData) => void;
  onDragEnd: (index: number, item: TileData) => void;
  // onDrag: (pos: number[]) => void;
  altDragItem: AltDragItem;
  containerBounds: LayoutRectangle;
}>;

export const DraggableTile = ({
  item,
  index,
  altDragItem,
  containerBounds,
  onDragStart,
  onDragEnd,
  children,
}: DraggableTileProps) => {
  const isDragging = useSharedValue(false);
  const hasDragged = useSharedValue(false);
  const itemId = item.id;
  // const distance = useSharedValue(0);

  const panGesture = Gesture.Pan()
    // .enabled(false)
    .onBegin((event) => {
      runOnJS(log.debug)('[panGesture][onBegin]', itemId);
    })
    .onStart((event) => {
      runOnJS(log.debug)('[panGesture][onStart]', itemId);
      isDragging.value = true;
      altDragItem.scale.value = withSpring(1.2);
      altDragItem.distance.value = 100;
      altDragItem.offsetPosition.value = [-event.x, -event.y];
      altDragItem.position.value = [
        event.absoluteX - event.x,
        event.absoluteY - event.y,
      ];
      altDragItem.initialPosition.value = altDragItem.position.value;
      runOnJS(onDragStart)(index, item);
    })
    .onChange((event) => {
      // runOnJS(log.debug)('[panGesture][onChange]', itemId);
      altDragItem.position.value = [
        event.absoluteX + altDragItem.offsetPosition.value[0],
        event.absoluteY + altDragItem.offsetPosition.value[1],
      ];

      const diff = [
        altDragItem.position.value[0] - altDragItem.initialPosition.value[0],
        altDragItem.position.value[1] - altDragItem.initialPosition.value[1],
      ];
      // get the magnitude of the vector
      const magnitude = Math.sqrt(diff[1] ** 2) / 2;
      altDragItem.distance.value = Math.max(0, 100 - magnitude);
    })
    .onEnd((event) => {
      runOnJS(log.debug)('[panGesture][onEnd]', itemId);
      altDragItem.position.value = withTiming(
        altDragItem.initialPosition.value,
        { duration: 200 },
        () => {
          isDragging.value = false;
          hasDragged.value = false;
          runOnJS(log.debug)('[onEnd] fin anim');
          runOnJS(onDragEnd)(index, item);
        },
      );
      altDragItem.scale.value = withSpring(1, { duration: 200 });
    })
    .onFinalize((event) => {
      runOnJS(log.debug)('[panGesture][onFinalize]', itemId);
    })
    .activateAfterLongPress(500);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isDragging.value ? 0 : 1,
    // zIndex: -100,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
};
