import { useContext, useEffect } from 'react';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { useStore } from 'zustand';
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

export const useTileMapStoreSubscription = <T>(
  selector: (state: TileMapState) => T,
  callback: (state: T) => void,
) => {
  const store = useContext(TileMapContext);
  if (!store) {
    throw new Error('useTileMapStore must be used within a TileMapProvider');
  }

  // const useBoundStore = useStore(store, selector);
  // todo - doesn't work
  useEffect(() => store.subscribe(selector), [store, selector, callback]);
};

export const useTileMapStoreActions = () => {
  const result = useTileMapStore(
    (state) => ({
      getSelectedTile: state.getSelectedTile,
      selectTileAtPosition: state.selectTileAtPosition,
      getVisibleTiles: state.getVisibleTiles,
      startGame: state.startGame,
      setViewPosition: state.setViewPosition,
      onGameTouch: state.onGameTouch,
    }),
    shallow,
  );

  return result;
};
