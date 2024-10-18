import { renderHook } from '@testing-library/react-native';

import { createLogger } from '@helpers/log';
import { rectToBBox } from '@helpers/geo';
import { tileFromPosition as tilePos } from '@model/Tile';
import { createTileMapStore, TileMapStore } from '../TileMapStore';

const log = createLogger('TileMapStore.test');

describe('TileMapStore', () => {
  let store: TileMapStore;
  let addTiles: ReturnType<TileMapStore['prototype']['addTiles']>;
  let getTile: ReturnType<TileMapStore['prototype']['getTile']>;
  let getVisibleTiles: ReturnType<TileMapStore['prototype']['getVisibleTiles']>;
  let selectTileAtPosition: ReturnType<
    TileMapStore['prototype']['selectTileAtPosition']
  >;

  beforeEach(() => {
    store = createTileMapStore({ tileWidth: 100, tileHeight: 100 });
    addTiles = store.getState().addTiles;
    getTile = store.getState().getTile;
    getVisibleTiles = store.getState().getVisibleTiles;
    selectTileAtPosition = store.getState().selectTileAtPosition;
  });

  describe('addTile', () => {
    it('should add a tile to the store', () => {
      const tile = tilePos([0, 0]);
      addTiles([tile]);

      const retrievedTile = getTile([0, 0]);
      expect(retrievedTile).toBe(tile);
    });

    it('should update adjacency when adding tiles', () => {
      const tile1 = tilePos([0, 0]);
      const tile2 = tilePos([0, 100]);

      addTiles([tile1, tile2]);

      expect(tile1.adjacent).toContain(tile2);
      expect(tile2.adjacent).toContain(tile1);
    });
  });

  describe('getTile', () => {
    it('should return undefined for non-existent tile', () => {
      const tile = getTile([100, 100]);
      expect(tile).toBeUndefined();
    });

    it('should return the correct tile', () => {
      const tile = tilePos([256, 256]);
      addTiles([tile]);

      const retrievedTile = getTile([256, 256]);
      expect(retrievedTile).toBe(tile);
    });
  });

  describe('getVisibleTiles', () => {
    it('should return visible tiles within the given bounding box', () => {
      const tile1 = tilePos([0, 0]);
      const tile2 = tilePos([128, 0]);
      const tile3 = tilePos([256, 256]);

      addTiles([tile1, tile2, tile3]);

      const visibleTiles = getVisibleTiles(
        rectToBBox({ x: 0, y: 0, width: 200, height: 200 }),
      );

      expect(visibleTiles).toContain(tile1);
      expect(visibleTiles).toContain(tile2);
      expect(visibleTiles).not.toContain(tile3);
    });

    it('should return an empty array when no tiles are visible', () => {
      const tile = tilePos([0, 0]);
      addTiles([tile]);

      const visibleTiles = getVisibleTiles(
        rectToBBox({ x: 1000, y: 1000, width: 2000, height: 2000 }),
      );

      expect(visibleTiles).toHaveLength(0);
    });
  });

  describe('selectTileAtPosition', () => {
    it('should select the tile at the given position', () => {
      // const tile1 = tilePos([0, 0]);
      // const tile2 = tilePos([0, 100]);
      // const tile3 = tilePos([0, 200]);

      addTiles([tilePos([0, 0])]);

      expect(store.getState().tiles.size).toEqual(1);

      // log.debug(store.getState().tiles);

      selectTileAtPosition([0, 0]);

      const tile = getTile([0, 0]);

      expect(tile?.isSelected).toBe(true);

      expect(store.getState().selectedTileId).toEqual(tile.id);
    });
  });
});
