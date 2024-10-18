import { createStore } from 'zustand';
import { createLogger } from '@helpers/log';
import { createGameSlice, GameSlice, GameSliceProps } from './gameSlice';
import { createTileSlice, TileSlice, TileSliceProps } from './tileSlice';
import { createViewSlice, ViewSlice, ViewSliceProps } from './viewSlice';
import { createTile } from '../Tile';

// eslint-disable-next-line no-console
const log = createLogger('TileMapStore');

// https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#slices-pattern

export type TileMapState = TileSlice & GameSlice & ViewSlice;

export type TileMapStoreProps = TileSliceProps &
  GameSliceProps &
  ViewSliceProps;

export type TileMapStore = ReturnType<typeof createTileMapStore>;

export const createTileMapStore = (
  initialState: Partial<TileMapStoreProps>,
) => {
  // this creates a vanilla store, since it is destined to be used with a context
  return createStore<TileMapState>()(
    // persist(

    (...args) => ({
      // ...defaultState,

      ...createTileSlice(...args),

      ...createGameSlice(...args),

      ...createViewSlice(...args),

      ...initialState,
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
