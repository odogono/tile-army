import { StateCreator } from 'zustand';
import type { BBox, Position } from '@types';
import { createLogger } from '@helpers/log';
import { pointToBBox } from '@helpers/geo';
import { createTile, Tile } from '../Tile';
import { createRTree, findByBBox, TileRBush } from '../rtree';
import type { TileMapState, TileMapStoreProps } from '../types';

const TILE_WIDTH = 100;
const TILE_HEIGHT = 100;

const directions: Position[] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

export type TileSliceProps = {
  tiles: Map<string, Tile>;

  spatialIndex: TileRBush;

  selectedTileId: string | undefined;

  tileWidth: number;
  tileHeight: number;

  hasImported: boolean;
};

export type TileSliceActions = {
  reset: () => void;

  addTiles: (tiles: Tile[]) => void;

  getTile: (position: Position) => Tile | undefined;

  getTileById: (id: string) => Tile | undefined;

  getSelectedTile: () => Tile | undefined;

  getVisibleTiles: (bbox: BBox) => Tile[];

  selectTileAtPosition: (position: Position) => void;
};

export type TileSlice = TileSliceProps & TileSliceActions;

const defaultState: TileSliceProps = {
  hasImported: false,

  selectedTileId: undefined,

  tiles: new Map<string, Tile>(),
  spatialIndex: createRTree(),

  tileWidth: TILE_WIDTH,
  tileHeight: TILE_HEIGHT,
};

const tileToString = (tile: Tile) => `${tile.position[0]},${tile.position[1]}`;

const positionToString = (coord: Position) => `${coord[0]},${coord[1]}`;

export const createTileSlice: StateCreator<TileSlice, [], [], TileSlice> = (
  set,
  get,
) => ({
  ...defaultState,

  reset: () => {
    get().spatialIndex.clear();
    set({ ...defaultState });
  },

  addTiles: (tiles: Tile[]) =>
    set((state) => {
      const { tileWidth, tileHeight } = state;
      // log.debug('adding tiles', state.tiles);
      const tilesMap = new Map(state.tiles);

      for (const tile of tiles) {
        const key = tileToString(tile);
        tile.id = key;
        tilesMap.set(key, tile);
      }
      // faster than inserting one by one
      // we don't follow recommended practice of
      // creating a new tree for each update
      // as the spatialIndex is private to the store
      state.spatialIndex.load(tiles);

      for (const tile of tilesMap.values()) {
        const [tx, ty] = tile.position;

        for (const [dx, dy] of directions) {
          const adjacentX = tx + dx * tileWidth;
          const adjacentY = ty + dy * tileHeight;
          const adjacentId = positionToString([adjacentX, adjacentY]);
          const adjacent = tilesMap.get(adjacentId);
          if (adjacent) {
            tile.adjacent = [...(tile.adjacent ?? []), adjacent];
            adjacent.adjacent = [...(adjacent.adjacent ?? []), tile];
          }
        }
      }

      return { ...state, tiles: tilesMap };
    }),

  getTile: (position: Position) => get().tiles.get(positionToString(position)),

  getTileById: (id: string) => get().tiles.get(id),

  getSelectedTile: () => {
    const { selectedTileId } = get();
    if (!selectedTileId) {
      return undefined;
    }
    return get().tiles.get(selectedTileId);
  },

  getVisibleTiles: (bbox: BBox) => {
    return findByBBox(get().spatialIndex, bbox);
  },

  selectTileAtPosition: (position: Position) =>
    set((state) => {
      // get the tiles that fall in the position
      const [x, y] = position;
      const bbox: BBox = pointToBBox([x, y], 1);
      const tiles = state.getVisibleTiles(bbox);
      const newTiles = new Map(state.tiles);
      let selectedTileId = state.selectedTileId;
      const existingTile = selectedTileId
        ? state.tiles.get(selectedTileId)
        : undefined;

      const selectedTile = tiles.length >= 1 ? tiles[0] : undefined;

      if (selectedTile) {
        selectedTileId = selectedTile.id;
        selectedTile.isSelected = !selectedTile.isSelected;
        newTiles.set(selectedTile.id, selectedTile);

        if (existingTile && existingTile.id !== selectedTile.id) {
          existingTile.isSelected = false;
          newTiles.set(existingTile.id, existingTile);
        }
      } else if (existingTile) {
        existingTile.isSelected = false;
        newTiles.set(existingTile.id, existingTile);
        selectedTileId = undefined;
      }

      return { ...state, tiles: newTiles, selectedTileId };
    }),
});
