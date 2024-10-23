import { shallow } from 'zustand/shallow';
import { useTileMapStoreState } from './useTileMapStore';

export const useTileMapStoreActions = () => {
  const result = useTileMapStoreState(
    (state) => ({
      getSelectedTile: state.getSelectedTile,
      selectTileAtPosition: state.selectTileAtPosition,
      getVisibleTiles: state.getVisibleTiles,
      startGame: state.startGame,
      setViewPosition: state.setViewPosition,
      moveToPosition: state.moveToPosition,
      onGameTouch: state.onGameTouch,
      setViewScreenDims: state.setViewScreenDims,
    }),
    shallow,
  );

  return result;
};
