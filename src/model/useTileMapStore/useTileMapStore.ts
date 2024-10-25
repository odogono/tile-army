import { useContext } from 'react';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { TileMapContext } from './context';
import type { TileMapState } from '../TileMapStore';

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

export const useTileMapViewDims = () => {
  return useTileMapStoreState((state) => ({
    width: state.viewWidth,
    height: state.viewHeight,
    setViewDims: state.setViewScreenDims,
  }));
};
