import { StateCreator } from 'zustand';
import { createLogger } from '@helpers/log';
import { Position } from '@types';
import { TileSlice } from './tileSlice';
import { ViewSlice } from './viewSlice';
import { Directions } from '../types';
import { createTile, Tile } from '../../Tile';
import { getRandomColour } from '../../state';

export type GameSliceProps = {
  state: 'menu' | 'playing' | 'paused' | 'gameOver';
};

export type GameSliceActions = {
  startGame: () => void;
  onGameTouch: (position: Position) => void;
  focusOnTile: (tile: Tile) => void;
};

export type GameSlice = GameSliceProps & GameSliceActions;

const defaultState: GameSliceProps = {
  state: 'playing',
};

const log = createLogger('gameSlice');

export const createGameSlice: StateCreator<GameSlice, [], [], GameSlice> = (
  set,
  get,
) => ({
  ...defaultState,

  // setGameState: ( newState: GameSliceProps['state']) => ()
  //   switch (newState) {
  //     case 'menu':
  //       break;
  //     case 'playing':
  //       state.startGame();
  //       break;
  //     case 'paused':
  //       break;
  //     case 'gameOver':
  //       break;
  //   }
  // },

  startGame: () => {
    const { setViewPosition, viewWidth, viewHeight } =
      get() as unknown as ViewSlice;
    const { addTiles, clearTiles } = get() as unknown as TileSlice;

    log.debug('[startGame] viewDims', viewWidth, viewHeight);

    // move to origin
    setViewPosition([0, 0], 1);

    // clear all tiles
    clearTiles();

    // add a first tile
    const tile = createTile({ position: [0, 0], colour: '#FFF' });
    addTiles([tile]);

    get().focusOnTile(tile);

    // // set the option tiles
    // (get() as unknown as TileSlice).addOptionTiles(tile, [
    //   Directions.west,
    //   Directions.south,
    //   Directions.east,
    // ]);
  },

  focusOnTile: (tile: Tile) => {
    const { moveToPosition, worldToCamera } = get() as unknown as ViewSlice;
    (get() as unknown as TileSlice).addOptionTiles(tile, [
      Directions.west,
      Directions.south,
      Directions.east,
    ]);

    const [x, y] = tile.position;

    moveToPosition(worldToCamera([x, y + 100]));
  },

  onGameTouch: (position: Position) => {
    try {
      const { moveToPosition, worldToCamera } = get() as unknown as ViewSlice;
      const { addTiles, getTileAtPosition, removeTilesOfTypes } =
        get() as unknown as TileSlice;

      const tile = getTileAtPosition(position);
      if (!tile) {
        return;
      }

      log.debug('[onGameTouch] tile', tile.id);

      if (tile.type === 'option') {
        // remove all the option tiles
        removeTilesOfTypes([tile.type]);

        // add a new normal tile
        const newTile = createTile({
          position: tile.position,
          colour: getRandomColour(),
        });
        addTiles([newTile]);

        get().focusOnTile(newTile);
      } else {
        const pos = worldToCamera(tile.position);
        moveToPosition(pos);
      }
    } catch (err) {
      log.error('[onGameTouch] error', err);
      log.debug(err.stack);
    }
  },
});
