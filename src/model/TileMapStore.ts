import { useEffect, useMemo } from 'react';
import { create, StoreApi, UseBoundStore } from 'zustand';
import type { BBox, Position } from 'geojson';
import { createTile, Tile } from './Tile';
import { bboxToRect } from '../helpers/geo';
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
  getVisibleTiles: (bbox: BBox) => Tile[];
  store: UseBoundStore<StoreApi<TileMapState>>;
};

type TileMapState = {
  tiles: Map<string, Tile>;

  spatialIndex: Map<string, Tile[]>;

  // camera: Camera;

  addTiles: (tiles: Tile[]) => void;

  getTile: (position: Position) => Tile | undefined;

  getVisibleTiles: (bbox: BBox) => Tile[];
  // moveCamera: (position: Position) => void;

  // setCamera: (camera: Camera) => void;
};

type TileMapStorePartialState = {
  tiles?: Partial<Tile>[];
};

const SPATIAL_CELL_SIZE = 100;

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

export const useTileMapStore = (
  initialState: TileMapStorePartialState = {},
): UseTileMapStoreReturn => {
  const store = useMemo(
    () =>
      create<TileMapState>((set, get) => ({
        tiles: new Map<string, Tile>(),

        spatialIndex: new Map<string, Tile[]>(),

        // camera: {
        //   position: [0, 0],
        //   bbox: [0, 0, 0, 0],
        //   screenBBox: [0, 0, 0, 0],
        //   zoom: 0,
        // },

        addTiles: (tiles: Tile[]) =>
          set((state) => {
            const newTiles = new Map(state.tiles);
            const newSpatialIndex = new Map(state.spatialIndex);

            for (const tile of tiles) {
              const key = tileToString(tile);
              tile.id = key;
              newTiles.set(key, tile);

              const indexKey = positionToString([
                Math.floor(tile.position[0] / SPATIAL_CELL_SIZE),
                Math.floor(tile.position[1] / SPATIAL_CELL_SIZE),
              ]);

              const tilesInCell = newSpatialIndex.get(indexKey) ?? [];
              tilesInCell.push(tile);
              newSpatialIndex.set(indexKey, tilesInCell);
            }

            for (const tile of tiles.values()) {
              for (const [dx, dy] of directions) {
                const adjacentX = tile.position[0] + dx * TILE_WIDTH;
                const adjacentY = tile.position[1] + dy * TILE_HEIGHT;
                const adjacent = newTiles.get(
                  positionToString([adjacentX, adjacentY]),
                );
                if (adjacent) {
                  tile.adjacent = [...(tile.adjacent ?? []), adjacent];
                  adjacent.adjacent = [...(adjacent.adjacent ?? []), tile];
                }
              }
            }

            return {
              ...state,
              tiles: newTiles,
              spatialIndex: newSpatialIndex,
            };
          }),

        getTile: (position: Position) =>
          get().tiles.get(positionToString(position)),

        getVisibleTiles: (bbox: BBox) => {
          const { spatialIndex } = get();
          const visible: Tile[] = [];

          const rect = bboxToRect(bbox);

          const startX = rect.x;
          const startY = rect.y;
          const endX = rect.x + rect.width;
          const endY = rect.y + rect.height;

          const startCellX = Math.floor(startX / SPATIAL_CELL_SIZE);
          const startCellY = Math.floor(startY / SPATIAL_CELL_SIZE);
          const endCellX = Math.floor(endX / SPATIAL_CELL_SIZE);
          const endCellY = Math.floor(endY / SPATIAL_CELL_SIZE);

          for (let cellX = startCellX; cellX <= endCellX; cellX++) {
            for (let cellY = startCellY; cellY <= endCellY; cellY++) {
              const indexKey = positionToString([cellX, cellY]);
              const tilesInCell = spatialIndex.get(indexKey) ?? [];
              for (const tile of tilesInCell) {
                const [x, y] = tile.position;
                if (
                  x < endX &&
                  x + TILE_WIDTH > startX &&
                  y < endY &&
                  y + TILE_HEIGHT > startY
                ) {
                  visible.push(tile);
                }
              }
            }
          }

          return visible;
        },

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

  useEffect(() => {
    const { tiles } = initialState;

    if (tiles) {
      const tilesToAdd = tiles.map((v) => createTile({ ...v }));
      addTiles(tilesToAdd);

      log.debug('added tiles', store.getState().tiles);
    }
  }, [initialState]);

  return {
    addTiles,
    store,
    getVisibleTiles,
    getTile,
  };
};
