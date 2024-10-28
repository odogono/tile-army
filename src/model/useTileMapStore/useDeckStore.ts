import { useTileMapStoreState } from './useTileMapStore';

export const useDeckStore = () => {
  return useTileMapStoreState((state) => ({
    isDragging: state.isDragging,
    dragPosition: state.dragPosition,
    dragScale: state.dragScale,
    spatialIndex: state.spatialIndex,
    dragTile: state.dragTile,
    dragTargetTile: state.dragTargetTile,
    deckTiles: state.deckTiles,
    removeTileFromDeck: state.removeTileFromDeck,
  }));
};
