/* eslint-disable react-compiler/react-compiler */
import { runOnJS, useDerivedValue } from 'react-native-reanimated';
import { createLogger } from '@helpers/log';
import { Position } from '@types';
import { useTileMapStore, useTileMapStoreState } from './useTileMapStore';
import { findByRect } from '../rtree';
// import { screenToWorld } from '../WorldCanvas/utils';

const log = createLogger('useDeckStore');

export const useDeckStore = () => {
  const [
    dragPosition,
    dragOffsetPosition,
    dragInitialPosition,
    dragScale,
    dragCursor,
    spatialIndex,
  ] = useTileMapStoreState((state) => [
    state.dragPosition,
    state.dragOffsetPosition,
    state.dragInitialPosition,
    state.dragScale,
    state.dragCursor,
    state.spatialIndex,
  ]);

  const { screenToWorld } = useTileMapStore();

  const checkForTiles = (position: Position) => {
    const adjustedPosition = [position[0] + 50, position[1] + 50];

    const worldPosition = screenToWorld(adjustedPosition);

    const rect = {
      x: worldPosition[0],
      y: worldPosition[1],
      width: 5,
      height: 5,
    };

    dragCursor.value = rect;

    const tiles = findByRect(spatialIndex, rect);

    if (tiles.length > 0) {
      log.debug('tiles', tiles.length);
    }
  };

  useDerivedValue(() => {
    runOnJS(checkForTiles)(dragPosition.value);
  });

  return {
    dragPosition,
    dragOffsetPosition,
    dragInitialPosition,
    dragScale,
    dragCursor,
  };
};
