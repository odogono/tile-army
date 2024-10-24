import { StateCreator } from 'zustand';
import { createLogger } from '@helpers/log';
import { Position } from '@types';
import { delay } from '@helpers/delay';
import { DeckSlice } from './deckSlice';
import { TileSlice } from './tileSlice';
import { ViewSlice } from './viewSlice';
import { Directions } from '../types';
import { createTile, Tile } from '../../Tile';

export type GameSliceProps = {
  state: 'menu' | 'playing' | 'paused' | 'gameOver';
};

export type GameSliceActions = {
  startGame: () => void;
  onGameTouch: (position: Position) => void;
  focusOnTile: (tile: Tile) => void;
  gameHandleTileDragEnd: (droppedTile: Tile, targetTile?: Tile) => boolean;
  gameHandleTileDropAllowed: (droppedTile: Tile, targetTile?: Tile) => boolean;
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
    const { initialiseDeck } = get() as unknown as DeckSlice;

    log.debug('[startGame] viewDims', viewWidth, viewHeight);

    // move to origin
    setViewPosition([0, 0], 1);

    // clear all tiles
    clearTiles();

    // add a first tile
    const tile = createTile({ position: [0, 0], colour: '#FFF' });
    addTiles([tile]);

    get().focusOnTile(tile);

    // set up the deck
    initialiseDeck();

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

    moveToPosition(worldToCamera([x, y + 100]), 1, { after: 400 });
  },

  gameHandleTileDropAllowed: (droppedTile: Tile, targetTile?: Tile) => {
    log.debug('[handleTileDropAllowed]', targetTile?.id, droppedTile.id);

    if (targetTile?.type !== 'option') {
      return false;
    }

    return true;
  },

  gameHandleTileDragEnd: (droppedTile: Tile, targetTile?: Tile) => {
    const { addTiles, removeTilesOfTypes } = get() as unknown as TileSlice;
    const { removeTileFromDeck } = get() as unknown as DeckSlice;

    log.debug('[handleTileDragEnd]', targetTile?.id, droppedTile.id);

    if (targetTile?.type !== 'option') {
      return false;
    }

    // remove the tile from the deck
    removeTileFromDeck(droppedTile);

    // remove the option tile
    removeTilesOfTypes(['option']);

    // add a new normal tile
    const newTile = createTile({
      ...droppedTile,
      position: targetTile.position,
    });
    addTiles([newTile]);

    get().focusOnTile(newTile);

    const { insertTileIntoDeck, createDeckTile, deckTiles } =
      get() as unknown as DeckSlice;

    if (deckTiles.length === 0) {
      for (let ii = 0; ii < 5; ii++) {
        delay(() => {
          const tile = createDeckTile();
          insertTileIntoDeck(tile);
        }, 200 * ii);
      }
    }

    return true;
  },

  onGameTouch: (position: Position) => {
    // const { moveToPosition, worldToCamera } = get() as unknown as ViewSlice;
    const { getTileAtPosition } = get() as unknown as TileSlice;

    const tile = getTileAtPosition(position);
    if (!tile) {
      return;
    }

    log.debug('[onGameTouch] tile', tile.id);

    // disabled now that the tiledeck is used

    // if (tile.type === 'option') {
    //   // remove all the option tiles
    //   removeTilesOfTypes([tile.type]);

    //   // add a new normal tile
    //   const newTile = createTile({
    //     position: tile.position,
    //     colour: getRandomColour(),
    //   });
    //   addTiles([newTile]);

    //   get().focusOnTile(newTile);
    // } else {
    //   const pos = worldToCamera(tile.position);
    //   moveToPosition(pos);
    // }
  },
});
