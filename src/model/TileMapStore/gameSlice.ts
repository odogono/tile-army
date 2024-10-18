import { StateCreator } from 'zustand';
import { createLogger } from '@helpers/log';
import { Position } from '@types';
import { TileSlice } from './tileSlice';
import { AllDirections, Directions } from './types';
import { ViewSlice } from './viewSlice';
import { createTile, Tile } from '../Tile';
import { getRandomColour } from '../state';

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
    log.debug('[startGame]');

    // move to origin
    (get() as unknown as ViewSlice).setViewPosition([0, 0], 1);

    // clear all tiles
    (get() as unknown as TileSlice).clearTiles();

    // add a first tile
    const tile = createTile({ position: [0, 0], colour: '#FFF' });
    (get() as unknown as TileSlice).addTiles([tile]);

    get().focusOnTile(tile);

    // // set the option tiles
    // (get() as unknown as TileSlice).addOptionTiles(tile, [
    //   Directions.west,
    //   Directions.south,
    //   Directions.east,
    // ]);
  },

  focusOnTile: (tile: Tile) => {
    (get() as unknown as TileSlice).addOptionTiles(tile, [
      Directions.west,
      Directions.south,
      Directions.east,
    ]);

    const [x, y] = tile.position;

    (get() as unknown as ViewSlice).moveToPosition([x, y + 100]);
  },

  onGameTouch: (position: Position) => {
    try {
      const tile = (get() as unknown as TileSlice).getTileAtPosition(position);
      if (!tile) {
        return;
      }

      log.debug('[onGameTouch] tile', tile.id);

      if (tile.type === 'option') {
        // remove all the option tiles
        (get() as unknown as TileSlice).removeTilesOfTypes([tile.type]);

        // add a new normal tile
        const newTile = createTile({
          position: tile.position,
          colour: getRandomColour(),
        });
        (get() as unknown as TileSlice).addTiles([newTile]);

        get().focusOnTile(newTile);
      }
    } catch (err) {
      log.error('[onGameTouch] error', err);
      log.debug(err.stack);
    }
  },
});
