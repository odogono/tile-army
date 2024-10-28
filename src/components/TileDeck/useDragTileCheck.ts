/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-native/no-inline-styles */
import { useCallback } from 'react';

import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useDeckStore, useTileMapStore } from '@model/useTileMapStore';
import { Position } from '@types';
import { findByRect } from '@model/rtree';
import { posAdd, posEquals } from '@helpers/geo';

export const useDragTileCheck = () => {
  const { screenToWorld } = useTileMapStore();
  const { isDragging, dragPosition, dragTargetTile, spatialIndex } =
    useDeckStore();

  const checkForTiles = useCallback(
    (position: Position, lastPosition?: Position | null) => {
      if (posEquals(position, lastPosition, 1)) {
        return;
      }

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
    },
    [],
  );

  useAnimatedReaction(
    () => [isDragging.value, dragPosition.value] as [boolean, Position],
    // isDragging was added, as it turns out that dragPosition alone
    // was not enough to determine whether the drag op is occuring.
    // after than drag had finished, the dragPosition would again show
    // a value.
    // its possible that the above dragTargetTile setting in the JS
    // thread was responsible.
    // it worked on ios simulator, but not android device.
    ([isDragging, position], previous) => {
      if (isDragging) {
        const previousPosition = previous?.[1];
        runOnJS(checkForTiles)(position, previousPosition);
      }
    },
  );
};
