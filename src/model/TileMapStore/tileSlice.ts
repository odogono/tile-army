import { StateCreator } from 'zustand';
import type { BBox, Position } from '@types';
import { createLogger } from '@helpers/log';
import { pointToBBox } from '@helpers/geo';
import { AllDirections, DirectionPositions } from './types';
import { createTile, idFromPosition, Tile, TileType } from '../Tile';
import { createRTree, findByBBox, TileRBush } from '../rtree';

const TILE_WIDTH = 100;
const TILE_HEIGHT = 100;

type TileMap = Map<string, Tile>;

export type TileSliceProps = {
  tiles: TileMap;

  spatialIndex: TileRBush;

  selectedTileId: string | undefined;

  tileWidth: number;
  tileHeight: number;

  hasImported: boolean;
};

export type TileSliceActions = {
  reset: () => void;

  clearTiles: () => void;

  addTiles: (tiles: Tile[]) => void;

  getAllTiles: () => Tile[];

  getTile: (position: Position) => Tile | undefined;

  getTileById: (id: string) => Tile | undefined;

  getTileAtPosition: (position: Position) => Tile | undefined;

  getSelectedTile: () => Tile | undefined;

  getVisibleTiles: (bbox: BBox) => Tile[];

  selectTileAtPosition: (position: Position) => void;

  addOptionTiles: (tile: Tile, directions?: DirectionPositions[]) => void;

  removeTilesOfTypes: (types: TileType[]) => void;

  resetSpatialIndex: (tiles: TileMap) => void;
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

const log = createLogger('TileSlice', []);

export const createTileSlice: StateCreator<TileSlice, [], [], TileSlice> = (
  set,
  get,
) => ({
  ...defaultState,

  reset: () => {
    get().spatialIndex.clear();
    set({ ...defaultState });
  },

  clearTiles: () => {
    get().spatialIndex.clear();
    set({ ...defaultState });
  },

  resetSpatialIndex: (tiles: TileMap) => {
    get().spatialIndex.clear();
    get().spatialIndex.load(Array.from(tiles.values()));
  },

  removeTilesOfTypes: (types: TileType[]) =>
    set((state) => {
      const tiles = Array.from(get().tiles.values());

      const filteredTiles = tiles.filter((tile) => !types.includes(tile.type));

      const idx = get().spatialIndex;
      filteredTiles.forEach((tile) => idx.remove(tile));

      return {
        ...state,
        tiles: new Map(filteredTiles.map((tile) => [tile.id, tile])),
      };
    }),

  addTiles: (tiles: Tile[]) =>
    set((state) => {
      const { tileWidth, tileHeight } = state;

      // log.debug('adding tiles', tiles);

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
      state.resetSpatialIndex(tilesMap);

      for (const tile of tilesMap.values()) {
        const [tx, ty] = tile.position;

        for (const [dx, dy] of AllDirections) {
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

  addOptionTiles: (tile: Tile, directions?: DirectionPositions[]) =>
    set((state) => {
      const { tileWidth, tileHeight } = state;
      const originTile = state.getTileById(tile.id);

      if (!originTile) {
        // log.error('[addOptionTiles] originTile not found', tile.id);
        return state;
      }

      // log.debug('[addOptionTiles] originTile', originTile.id);

      if (!directions || directions.length === 0) {
        directions = AllDirections;
      }

      const newTiles = directions
        .map((direction) => {
          const [dx, dy] = direction;
          const position = [
            originTile.position[0] + dx * tileWidth,
            originTile.position[1] + dy * tileHeight,
          ];
          const id = idFromPosition(position);

          const existingTile = get().getTileById(id);

          if (existingTile) {
            // log.debug('[addOptionTiles] existing tile', existingTile.id);
            return null;
          }

          // log.debug('[addOptionTiles] adding', direction, position);
          return createTile({
            position,
            type: 'option',
          });
        })
        .filter(Boolean) as Tile[];

      const newTilesMap = new Map(state.tiles);

      for (const tile of newTiles) {
        newTilesMap.set(tile.id, tile);
      }

      // state.spatialIndex.clear();
      // state.spatialIndex.load(Array.from(newTilesMap.values()));
      state.resetSpatialIndex(newTilesMap);

      return { ...state, tiles: newTilesMap };
    }),

  getTile: (position: Position) => get().tiles.get(positionToString(position)),

  getTileById: (id: string) => get().tiles.get(id),

  getAllTiles: () => Array.from(get().tiles.values()),

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

  getTileAtPosition: (position: Position) => {
    const [x, y] = position;
    const bbox: BBox = pointToBBox([x, y], 1);
    const tiles = get().getVisibleTiles(bbox);
    return tiles.length >= 1 ? tiles[0] : undefined;
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
