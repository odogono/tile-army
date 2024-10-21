import { createLogger } from '@helpers/log';

import { rectToBBox } from '@helpers/geo';

import { tileFromPosition as tilePos } from '@model/Tile';
import {
  createTileMapStore,
  TileMapState,
  TileMapStore,
} from '../../TileMapStore';

const log = createLogger('TileMapStore.test');

describe('GameSlice', () => {
  let store: TileMapStore;
  let addTiles: TileMapState['addTiles'];
  let getTile: TileMapState['getTile'];
  let getVisibleTiles: TileMapState['getVisibleTiles'];
  let selectTileAtPosition: TileMapState['selectTileAtPosition'];
  let getAllTiles: TileMapState['getAllTiles'];
  let startGame: TileMapState['startGame'];
  let onGameTouch: TileMapState['onGameTouch'];
  let focusOnTile: TileMapState['focusOnTile'];

  beforeEach(() => {
    store = createTileMapStore({ tileWidth: 100, tileHeight: 100 });
    addTiles = store.getState().addTiles;
    getTile = store.getState().getTile;
    getVisibleTiles = store.getState().getVisibleTiles;
    selectTileAtPosition = store.getState().selectTileAtPosition;
    getAllTiles = store.getState().getAllTiles;

    startGame = store.getState().startGame;
    onGameTouch = store.getState().onGameTouch;
    focusOnTile = store.getState().focusOnTile;
  });

  describe('startGame', () => {
    it.only('initialise the game', () => {
      startGame();

      const tiles = getAllTiles();

      expect(tiles.length).toEqual(4);

      // log.debug(store.getState());
    });
  });

  describe('onGameTouch', () => {
    it.only('should add a new tile', () => {
      startGame();

      const tiles = getAllTiles();
      expect(tiles.length).toEqual(4);

      onGameTouch([0, 100]);

      const tiles2 = getAllTiles();

      log.table(tiles2);

      expect(tiles2.length).toEqual(5);

      const visibleTiles = getVisibleTiles(
        rectToBBox({ x: -100, y: -100, width: 1000, height: 1000 }),
      );
      log.table(visibleTiles);

      expect(visibleTiles.length).toEqual(5);

      // const tiles3 = getAllTiles();

      // log.table(tiles3);

      // expect(tiles3.length).toEqual(5);
    });
  });
});
