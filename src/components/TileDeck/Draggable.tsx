/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { createLogger } from '@helpers/log';

import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useDeckStore } from '@model/useTileMapStore';
import { Tile } from '@model/Tile';

const log = createLogger('DraggableTile');

export type DraggableTileProps = React.PropsWithChildren<{
  item: Tile;
  index: number;
  onDragStart: (draggedTile: Tile) => void;
  onDragEnd: (droppedTile: Tile) => void;
  isHidden?: boolean;
}>;

export const DraggableTile = ({
  item,
  index,
  onDragStart,
  onDragEnd,
  children,
  isHidden = false,
}: DraggableTileProps) => {
  const {
    dragTile,
    dragPosition,
    dragInitialPosition,
    dragOffsetPosition,
    dragScale,
  } = useDeckStore('fromDraggableTile');

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(500)
    .onBegin((event) => {
      // runOnJS(log.debug)('[panGesture][onBegin]', itemId);
    })
    .onStart((event) => {
      // runOnJS(log.debug)('[panGesture][onStart]', itemId);
      // isDragging.value = true;
      dragTile.value = item;
      dragScale.value = withSpring(1.2);
      dragOffsetPosition.value = [-event.x, -event.y];
      dragPosition.value = [
        event.absoluteX - event.x,
        event.absoluteY - event.y,
      ];
      dragInitialPosition.value = dragPosition.value;
      // runOnJS(setIsHidden)(true);
    })
    .onChange((event) => {
      // runOnJS(log.debug)('[panGesture][onChange]', itemId);
      dragPosition.value = [
        event.absoluteX + dragOffsetPosition.value[0],
        event.absoluteY + dragOffsetPosition.value[1],
      ];
    })
    .onEnd((event) => {
      // clear the dragTile - this will be picked up
      // in the TileDeck which then finishes the drag
      dragTile.value = undefined;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isHidden ? 0 : 1,
    // zIndex: -100,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
};
