/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-native/no-inline-styles */
import { useCallback } from 'react';

import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useDeckStore, useTileMapStore } from '@model/useTileMapStore';
import { Position } from '@types';
import { findByRect } from '@model/rtree';
import { posAdd } from '@helpers/geo';

export const useDragTileCheck = () => {
  const { screenToWorld } = useTileMapStore();
  const { dragPosition, dragTile, dragTargetTile, spatialIndex } =
    useDeckStore();

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
};
