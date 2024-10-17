import { useEffect, useMemo } from 'react';
import { create, StoreApi, UseBoundStore } from 'zustand';
import type { BBox, Position } from '@types';
import { createTile, Tile } from './Tile';
import { createRTree, findByBBox, TileRBush } from './rtree';
import { bboxIntersectsBBox, bboxToRect, pointToBBox } from '../helpers/geo';
import { createLogger } from '../helpers/log';

type Camera = {
  position: Position;

  // the bounding box of the camera in world coordinates
  bbox: BBox;

  // the bounding box of the camera in screen coordinates
  screenBBox: BBox;

  zoom: number;
};

export type UseTileMapStoreReturn = {
  addTiles: (tiles: Tile[]) => void;
  getTile: (position: Position) => Tile | undefined;
  getTileById: (id: string) => Tile | undefined;
  getSelectedTile: () => Tile | undefined;
  getVisibleTiles: (bbox: BBox) => Tile[];
  selectTileAtPosition: (position: Position) => void;
  store: UseBoundStore<StoreApi<TileMapState>>;
};

type TileMapState = {
  tiles: Map<string, Tile>;
  spatialIndex: TileRBush;

  selectedTileId: string | undefined;

  // camera: Camera;

  addTiles: (tiles: Tile[]) => void;

  getTile: (position: Position) => Tile | undefined;

  getTileById: (id: string) => Tile | undefined;

  getSelectedTile: () => Tile | undefined;

  getVisibleTiles: (bbox: BBox) => Tile[];

  selectTileAtPosition: (position: Position) => void;

  // moveCamera: (position: Position) => void;

  // setCamera: (camera: Camera) => void;
};

type TileMapStorePartialState = {
  tiles?: Partial<Tile>[];
};

type UseTileMapStoreProps = {
  initialState: TileMapStorePartialState;
  tileWidth: number;
  tileHeight: number;
};

// const SPATIAL_INDEX_SIZE = 1000;

const TILE_WIDTH = 100;
const TILE_HEIGHT = 100;

const tileToString = (tile: Tile) => `${tile.position[0]},${tile.position[1]}`;

const positionToString = (coord: Position) => `${coord[0]},${coord[1]}`;

const stringToPosition = (str: string): Position => str.split(',').map(Number);

// eslint-disable-next-line no-console
const log = createLogger('TileMapStore');

// Update adjacency (simplified for brevity)
// You may want to adjust this based on your game's rules
const directions: Position[] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

const getSpatialIndexKey = (position: Position) => {
  return 'si-0,0';
  // return `${Math.floor(position[0] / SPATIAL_INDEX_SIZE)},${Math.floor(
  //   position[1] / SPATIAL_INDEX_SIZE,
  // )}`;
};

const getTileBBox = (tile: Tile): BBox => {
  return pointToBBox(tile.position, TILE_WIDTH);
};

export const useTileMapStore = ({
  initialState,
  tileWidth = TILE_WIDTH,
  tileHeight = TILE_HEIGHT,
}: UseTileMapStoreProps): UseTileMapStoreReturn => {
  const store = useMemo(
    () =>
      create<TileMapState>((set, get) => ({
        selectedTileId: undefined,

        tiles: new Map<string, Tile>(),
        spatialIndex: createRTree(),

        addTiles: (tiles: Tile[]) =>
          set((state) => {
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

            for (const tile of tiles.values()) {
              const [tx, ty] = tile.position;

              for (const [dx, dy] of directions) {
                const adjacentX = tx + dx * tileWidth;
                const adjacentY = ty + dy * tileHeight;
                const adjacent = state.tiles.get(
                  positionToString([adjacentX, adjacentY]),
                );
                if (adjacent) {
                  tile.adjacent = [...(tile.adjacent ?? []), adjacent];
                  adjacent.adjacent = [...(adjacent.adjacent ?? []), tile];
                }
              }
            }

            return { ...state, tiles: tilesMap };
          }),

        getTile: (position: Position) =>
          get().tiles.get(positionToString(position)),

        getTileById: (id: string) => get().tiles.get(id),

        getSelectedTile: () => {
          const { selectedTileId } = get();
          if (!selectedTileId) {
            return undefined;
          }
          return get().tiles.get(selectedTileId);
        },

        getVisibleTiles: (bbox: BBox) => {
          const { spatialIndex } = get();

          const visible = findByBBox(spatialIndex, bbox);

          return visible;
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

            const selectedTile = tiles.length === 1 ? tiles[0] : undefined;

            // no new tile selected, and existing tile
            // no new tile selected, and no existing tile
            // new tile selected, and existing tile
            // new tile selected, and no existing tile

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

            // if (tiles.length === 1) {
            //   const tile = tiles[0];
            //   tile.isSelected = !tile.isSelected;
            //   log.debug('selecting tile', tile.id);
            //   newTiles.set(tile.id, tile);
            //   selectedTileId = tile.id;
            // } else {
            //   if (selected) {
            //     log.debug('deselecting tile', selected.id);
            //     selected.isSelected = false;
            //     newTiles.set(selected.id, selected);
            //     selectedTileId = undefined;
            //   }
            // }

            return { ...state, tiles: newTiles, selectedTileId };
          }),

        // moveCamera: (position: Position) =>
        //   set((state) => ({
        //     camera: { ...state.camera, position },
        //   })),

        // setCamera: (camera: Camera) => set({ camera }),
      })),
    [],
  );

  const addTiles = store((state) => state.addTiles);
  const getVisibleTiles = store((state) => state.getVisibleTiles);
  const getTile = store((state) => state.getTile);
  const selectTileAtPosition = store((state) => state.selectTileAtPosition);
  const getTileById = store((state) => state.getTileById);
  const getSelectedTile = store((state) => state.getSelectedTile);

  useEffect(() => {
    const { tiles } = initialState;

    if (tiles) {
      const tilesToAdd = tiles.map((v) => createTile({ ...v }));
      addTiles(tilesToAdd);

      log.debug('added tiles', store.getState().tiles.size);
    }
  }, [initialState]);

  return {
    addTiles,
    store,
    getVisibleTiles,
    getTile,
    getTileById,
    getSelectedTile,
    selectTileAtPosition,
  };
};
