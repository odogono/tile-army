import { runOnJS, useDerivedValue } from 'react-native-reanimated';
import { createLogger } from '@helpers/log';
import { Position } from '@types';
import { useTileMapStore } from './useTileMapStore';
import { useTileMapStoreView } from './useTileMapStoreView';
import { findByPosition } from '../rtree';
// import { screenToWorld } from '../WorldCanvas/utils';

const log = createLogger('useDeckStore');

export const useDeckStore = () => {
  const [
    dragPosition,
    dragOffsetPosition,
    dragInitialPosition,
    dragScale,
    spatialIndex,
  ] = useTileMapStore((state) => [
    state.dragPosition,
    state.dragOffsetPosition,
    state.dragInitialPosition,
    state.dragScale,
    state.spatialIndex,
  ]);

  // const { screenToWorld } = useTileMapStoreView();

  const checkForTiles = (position: Position) => {
    // runOnJS(log.debug)('[useDeckStore] spatialIndex', spatialIndex.value);

    const worldPosition = position;

    // need to convert to world coords

    const tiles = findByPosition(spatialIndex, worldPosition);

    if (tiles.length > 0) {
      log.debug('tiles', tiles.length);
    }
  };

  useDerivedValue(() => {
    // runOnJS(log.debug)('[useDeckStore] dragPosition', dragPosition.value);

    // const minX = dragPosition.value[0];
    // const minY = dragPosition.value[1];

    runOnJS(checkForTiles)(dragPosition.value);
    // const tiles = spatialIndex.search(rect);

    // runOnJS(log.debug)('[useDeckStore] tiles', tiles);
  });

  return {
    dragPosition,
    dragOffsetPosition,
    dragInitialPosition,
    dragScale,
  };
};
