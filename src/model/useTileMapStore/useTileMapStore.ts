import { useContext } from 'react';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { createLogger } from '@helpers/log';
import { TileMapContext } from './context';
import type { TileMapState } from '../TileMapStore';

const log = createLogger('useTileMapStore');

export const useTileMapStore = <T>(
  selector: (state: TileMapState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T => {
  const store = useContext(TileMapContext);
  if (!store) {
    throw new Error('useTileMapStore must be used within a TileMapProvider');
  }
  return useStoreWithEqualityFn(store, selector, equalityFn);
};

export const useTileMapStoreActions = () => {
  const result = useTileMapStore(
    (state) => ({
      getSelectedTile: state.getSelectedTile,
      selectTileAtPosition: state.selectTileAtPosition,
      getVisibleTiles: state.getVisibleTiles,
    }),
    shallow,
  );

  return result;
};
