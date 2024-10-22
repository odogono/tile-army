import { shallow } from 'zustand/shallow';
import { useTileMapStore } from './useTileMapStore';

export const useTileMapStoreActions = () => {
  const result = useTileMapStore(
    (state) => ({
      getSelectedTile: state.getSelectedTile,
      selectTileAtPosition: state.selectTileAtPosition,
      getVisibleTiles: state.getVisibleTiles,
      startGame: state.startGame,
      setViewPosition: state.setViewPosition,
      moveToPosition: state.moveToPosition,
      onGameTouch: state.onGameTouch,
      setViewScreenDims: state.setViewScreenDims,
      getViewScreenDims: state.getViewScreenDims,
    }),
    shallow,
  );

  return result;
};
