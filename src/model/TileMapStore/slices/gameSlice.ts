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
  _set,
  get,
) => ({
  ...defaultState,

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
  },

  focusOnTile: (tile: Tile) => {
    const { moveToPosition } = get() as unknown as ViewSlice;

    const [x, y] = tile.position;

    moveToPosition([x, y + 100], 1, { after: 400 });

    delay(
      () =>
        (get() as unknown as TileSlice).addOptionTiles(tile, [
          Directions.west,
          Directions.south,
          Directions.east,
        ]),
      450,
    );
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
    const { moveToPosition } = get() as unknown as ViewSlice;
    const { getTileAtPosition } = get() as unknown as TileSlice;

    const tile = getTileAtPosition(position);
    if (!tile) {
      return;
    }

    if (tile.type !== 'option') {
      moveToPosition(tile.position);
    }
  },
});
