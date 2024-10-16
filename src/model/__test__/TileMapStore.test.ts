import { renderHook } from '@testing-library/react-native';

import { useTileMapStore } from '../TileMapStore';
import { tileFromPosition as tilePos } from '../Tile';

describe('TileMapStore', () => {
  let store: ReturnType<typeof useTileMapStore>['store'];
  let addTiles: ReturnType<typeof useTileMapStore>['addTiles'];
  let getVisibleTiles: ReturnType<typeof useTileMapStore>['getVisibleTiles'];
  let getTile: ReturnType<typeof useTileMapStore>['getTile'];

  beforeEach(() => {
    const { result } = renderHook(() => useTileMapStore());
    store = result.current.store;
    addTiles = result.current.addTiles;
    getVisibleTiles = result.current.getVisibleTiles;
    getTile = result.current.getTile;
  });

  describe.only('addTile', () => {
    it('should add a tile to the store', () => {
      const tile = tilePos([0, 0]);
      addTiles([tile]);

      const retrievedTile = getTile([0, 0]);
      expect(retrievedTile).toBe(tile);
    });

    it('should update adjacency when adding tiles', () => {
      const tile1 = tilePos([0, 0]);
      const tile2 = tilePos([128, 0]);

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

      const visibleTiles = getVisibleTiles([0, 0, 200, 200]);

      expect(visibleTiles).toContain(tile1);
      expect(visibleTiles).toContain(tile2);
      expect(visibleTiles).not.toContain(tile3);
    });

    it('should return an empty array when no tiles are visible', () => {
      const tile = tilePos([0, 0]);
      addTiles([tile]);

      const visibleTiles = getVisibleTiles([1000, 1000, 2000, 2000]);

      expect(visibleTiles).toHaveLength(0);
    });
  });
});
