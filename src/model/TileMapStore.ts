import { create } from 'zustand';
import type { BBox, Position } from '@types';
import { createLogger } from '@helpers/log';
import { pointToBBox } from '@helpers/geo';
import { createTile, Tile } from './Tile';
import { createRTree, findByBBox } from './rtree';
import type { TileMapState, TileMapStoreProps } from './types';

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

const defaultState: TileMapStoreProps = {
  hasImported: false,

  selectedTileId: undefined,

  tiles: new Map<string, Tile>(),
  spatialIndex: createRTree(),

  tileWidth: TILE_WIDTH,
  tileHeight: TILE_HEIGHT,
};

export type TileMapStore = ReturnType<typeof createTileMapStore>;

export const createTileMapStore = (
  initialState: Partial<TileMapStoreProps>,
) => {
  return create<TileMapState>()(
    // persist(
    (set, get) => ({
      ...defaultState,
      ...initialState,

      reset: () => {
        get().spatialIndex.clear();
        set({ ...defaultState, ...initialState });
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
    }),
    // ,{
    //   name: 'tile-map-store',
    //   storage: customStorage,
    //   skipHydration: true,
    // },
    // ),
  );
};

// const clog = createLogger('customStorage');

// // Custom storage object
// const customStorage = {
//   getItem: (key: string) => {
//     clog.debug('[getItem]', key);

//     const str = customStorage.storage[key];
//     if (!str) {
//       return null;
//     }
//     const existingValue = JSON.parse(str);

//     const tiles = new Map<string, Tile>();

//     const tilesArray = existingValue.state.tiles.map((d: Tile) =>
//       createTile(d),
//     );

//     for (const tile of tilesArray) {
//       tiles.set(tile.id, tile);
//     }

//     const spatialIndex = createRTree();
//     spatialIndex.load(tilesArray);

//     return {
//       ...existingValue,
//       state: {
//         ...existingValue.state,
//         tiles,
//         spatialIndex,
//       },
//     };
//   },
//   setItem: (key: string, value: StorageValue<TileMapState>) => {
//     // clog.debug('setting item', key, value);

//     const tiles = Array.from(value.state.tiles.values()).map((tile) => {
//       return { ...tile, adjacent: null };
//     });

//     clog.debug('[setItem]the tiles are', tiles);

//     const stringified = JSON.stringify({
//       ...value,
//       state: {
//         ...value.state,
//         tiles,
//         spatialIndex: undefined,
//       },
//     });

//     clog.debug('[setItem] stringified', stringified);

//     customStorage.storage[key] = stringified;
//   },
//   removeItem: (key: string) => {
//     clog.debug('[remoteItem]', key);
//     customStorage.storage[key] = undefined;
//   },
//   storage: {} as Record<string, any>,
// };

export const importStateToStore = (store: TileMapStore, state: any) => {
  const { tiles } = state;

  if (tiles) {
    const tilesToAdd = tiles.map((v: any) => createTile({ ...v }));
    store.getState().addTiles(tilesToAdd);
    store.setState({ hasImported: true });
  }
};
