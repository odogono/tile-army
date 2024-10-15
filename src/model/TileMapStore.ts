import { useMemo } from 'react';
import { create } from 'zustand';
import type { BBox, Position } from 'geojson';
import { Tile } from './Tile';

type Camera = {
  position: Position;

  // the bounding box of the camera in world coordinates
  bbox: BBox;

  // the bounding box of the camera in screen coordinates
  screenBBox: BBox;

  zoom: number;
};

type TileMapState = {
  tiles: Map<string, Tile>;

  spatialIndex: Map<string, Tile[]>;

  camera: Camera;

  addTile: (tile: Tile) => void;

  getTile: (position: Position) => Tile | undefined;

  getVisibleTiles: () => Tile[];

  moveCamera: (position: Position) => void;

  setCamera: (camera: Camera) => void;
};

const SPATIAL_CELL_SIZE = 100;

const TILE_WIDTH = 128;
const TILE_HEIGHT = 128;

const positionToString = (coord: Position) => `${coord[0]},${coord[1]}`;

const stringToPosition = (str: string): Position => str.split(',').map(Number);

export const useTileMapStore = () => {
  const store = create<TileMapState>((set, get) => ({
    tiles: new Map<string, Tile>(),

    spatialIndex: new Map<string, Tile[]>(),

    camera: {
      position: [0, 0],
      bbox: [0, 0, 0, 0],
      screenBBox: [0, 0, 0, 0],
      zoom: 0,
    },

    addTile: (tile: Tile) =>
      set((state) => {
        const newTiles = new Map(state.tiles);
        const newSpatialIndex = new Map(state.spatialIndex);

        const key = positionToString([tile.x, tile.y]);
        newTiles.set(key, tile);

        const indexKey = positionToString([
          Math.floor(tile.x / SPATIAL_CELL_SIZE),
          Math.floor(tile.y / SPATIAL_CELL_SIZE),
        ]);

        newSpatialIndex.get(indexKey)!.push(tile);

        // Update adjacency (simplified for brevity)
        // You may want to adjust this based on your game's rules
        const directions: Position[] = [
          [1, 0],
          [0, 1],
          [-1, 0],
          [0, -1],
        ];

        for (const [dx, dy] of directions) {
          const adjacentX = tile.x + dx * TILE_WIDTH;
          const adjacentY = tile.y + dy * TILE_HEIGHT;
          const adjacent = get().getTile([adjacentX, adjacentY]);
          if (adjacent) {
            tile.adjacent = [...(tile.adjacent || []), adjacent];
            adjacent.adjacent = [...(adjacent.adjacent || []), tile];
          }
        }

        return { tiles: newTiles, spatialIndex: newSpatialIndex };
      }),

    getTile: (position: Position) =>
      get().tiles.get(positionToString(position)),

    getVisibleTiles: () => {
      const { camera, spatialIndex } = get();
      const visible: Tile[] = [];

      const startX = camera.position[0] - camera.bbox[2] / 2;
      const startY = camera.position[1] - camera.bbox[3] / 2;
      const endX = camera.position[0] + camera.bbox[2] / 2;
      const endY = camera.position[1] + camera.bbox[3] / 2;

      const startCellX = Math.floor(startX / SPATIAL_CELL_SIZE);
      const startCellY = Math.floor(startY / SPATIAL_CELL_SIZE);
      const endCellX = Math.floor(endX / SPATIAL_CELL_SIZE);
      const endCellY = Math.floor(endY / SPATIAL_CELL_SIZE);

      for (let cellX = startCellX; cellX <= endCellX; cellX++) {
        for (let cellY = startCellY; cellY <= endCellY; cellY++) {
          const indexKey = positionToString([cellX, cellY]);
          const tilesInCell = spatialIndex.get(indexKey) || [];
          for (const tile of tilesInCell) {
            if (
              tile.x < endX &&
              tile.x + TILE_WIDTH > startX &&
              tile.y < endY &&
              tile.y + TILE_HEIGHT > startY
            ) {
              visible.push(tile);
            }
          }
        }
      }

      return visible;
    },

    moveCamera: (position: Position) =>
      set((state) => ({
        camera: { ...state.camera, position },
      })),

    setCamera: (camera: Camera) => set({ camera }),
  }));

  return store;
};
