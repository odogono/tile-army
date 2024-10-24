/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { useDeckStore } from '@model/useTileMapStore';
import { Tile } from '@model/Tile';
import { Position } from '@types';

export type DraggableTileProps = React.PropsWithChildren<{
  item: Tile;
  isHidden?: boolean;
}>;

export const DraggableTile = ({
  item,
  children,
  isHidden = false,
}: DraggableTileProps) => {
  // stores the relative position of the drag tile
  const offset = useSharedValue<Position>([0, 0]);
  const { dragTile, dragPosition, dragScale } = useDeckStore();

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(150)
    .onStart((event) => {
      dragTile.value = item;
      dragScale.value = withSpring(1.2);
      offset.value = [-event.x, -event.y];
      dragPosition.value = [
        event.absoluteX - event.x,
        event.absoluteY - event.y,
      ];

      dragTile.value.position = dragPosition.value;
    })
    .onChange((event) => {
      dragPosition.value = [
        event.absoluteX + offset.value[0],
        event.absoluteY + offset.value[1],
      ];
    })
    .onEnd((event) => {
      // clear the dragTile - this will be picked up
      // in the TileDeck which then finishes the drag
      dragTile.value = undefined;
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={{ opacity: isHidden ? 0 : 1 }}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
