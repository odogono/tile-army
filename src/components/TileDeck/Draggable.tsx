/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { createLogger } from '@helpers/log';

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useDeckStore } from '@model/useTileMapStore';
import { Tile } from '@model/Tile';

const log = createLogger('DraggableTile');

export type DraggableTileProps = React.PropsWithChildren<{
  item: Tile;
  index: number;
  onDragStart: (index: number, item: Tile) => void;
  onDragEnd: (index: number, item: Tile) => void;
}>;

export const DraggableTile = ({
  item,
  index,
  onDragStart,
  onDragEnd,
  children,
}: DraggableTileProps) => {
  // const isDragging = useSharedValue(false);
  const hasDragged = useSharedValue(false);
  const itemId = item.id;
  // const distance = useSharedValue(0);

  const {
    dragTile,
    dragPosition,
    dragInitialPosition,
    dragOffsetPosition,
    dragScale,
  } = useDeckStore();

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(500)
    .onBegin((event) => {
      runOnJS(log.debug)('[panGesture][onBegin]', itemId);
    })
    .onStart((event) => {
      runOnJS(log.debug)('[panGesture][onStart]', itemId);
      // isDragging.value = true;
      dragTile.value = item;
      dragScale.value = withSpring(1.2);
      dragOffsetPosition.value = [-event.x, -event.y];
      dragPosition.value = [
        event.absoluteX - event.x,
        event.absoluteY - event.y,
      ];
      dragInitialPosition.value = dragPosition.value;
      runOnJS(onDragStart)(index, item);
    })
    .onChange((event) => {
      // runOnJS(log.debug)('[panGesture][onChange]', itemId);
      dragPosition.value = [
        event.absoluteX + dragOffsetPosition.value[0],
        event.absoluteY + dragOffsetPosition.value[1],
      ];
    })
    .onEnd((event) => {
      runOnJS(log.debug)('[panGesture][onEnd]', itemId);

      // here is where we notify listeners that the drag has ended
      // and it is up to them to reset the state

      dragPosition.value = withTiming(
        dragInitialPosition.value,
        { duration: 200 },
        () => {
          // isDragging.value = false;
          dragTile.value = undefined;
          hasDragged.value = false;
          runOnJS(log.debug)('[onEnd] fin anim');
          runOnJS(onDragEnd)(index, item);
        },
      );
      dragScale.value = withSpring(1, { duration: 200 });
    })
    .onFinalize((event) => {
      runOnJS(log.debug)('[panGesture][onFinalize]', itemId);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: dragTile?.value?.id === item.id ? 0 : 1,
    // zIndex: -100,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
};
