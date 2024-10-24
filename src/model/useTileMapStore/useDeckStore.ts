import { useTileMapStoreState } from './useTileMapStore';

export const useDeckStore = (id: string) => {
  const [
    dragPosition,
    dragOffsetPosition,
    dragInitialPosition,
    dragScale,
    spatialIndex,
    dragTile,
    dragTargetTile,
  ] = useTileMapStoreState((state) => [
    state.dragPosition,
    state.dragOffsetPosition,
    state.dragInitialPosition,
    state.dragScale,
    state.spatialIndex,
    state.dragTile,
    state.dragTargetTile,
  ]);

  return {
    dragTile,
    dragPosition,
    dragOffsetPosition,
    dragInitialPosition,
    dragScale,
    dragTargetTile,
    spatialIndex,
  };
};
