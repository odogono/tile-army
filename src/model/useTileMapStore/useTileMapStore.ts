import { useContext, useEffect } from 'react';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createLogger } from '@helpers/log';
import { TileMapContext } from './context';
import type { TileMapState } from '../TileMapStore';

const log = createLogger('useTileMapStore');

export const useTileMapStore = () => {
  const context = useContext(TileMapContext);

  if (!context) {
    throw new Error('useTileMapStore not ready');
  }

  return context;
};

export const useTileMapStoreState = <T>(
  selector: (state: TileMapState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T => {
  const context = useContext(TileMapContext);
  if (!context) {
    throw new Error('useTileMapStore must be used within a TileMapProvider');
  }
  return useStoreWithEqualityFn(context.store, selector, equalityFn);
};

export const useTileMapStoreSubscription = <T>(
  selector: (state: TileMapState) => T,
  callback: (state: T) => void,
) => {
  const context = useContext(TileMapContext);
  if (!context) {
    throw new Error('useTileMapStore must be used within a TileMapProvider');
  }
  const { store } = context;

  // const useBoundStore = useStore(store, selector);
  // todo - doesn't work
  useEffect(() => store.subscribe(selector), [store, selector, callback]);
};

export const useTileMapViewDims = () => {
  return useTileMapStoreState((state) => ({
    width: state.viewWidth,
    height: state.viewHeight,
    setViewDims: state.setViewScreenDims,
  }));
};
