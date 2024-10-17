import type { BBox, Position } from '@types';
import { Tile } from './Tile';
import { TileRBush } from './rtree';

export type TileMapStoreProps = {
  tiles: Map<string, Tile>;

  spatialIndex: TileRBush;

  selectedTileId: string | undefined;

  tileWidth: number;
  tileHeight: number;

  hasImported: boolean;
};

export type TileMapStoreActions = {
  reset: () => void;

  addTiles: (tiles: Tile[]) => void;

  getTile: (position: Position) => Tile | undefined;

  getTileById: (id: string) => Tile | undefined;

  getSelectedTile: () => Tile | undefined;

  getVisibleTiles: (bbox: BBox) => Tile[];

  selectTileAtPosition: (position: Position) => void;
};

export type TileMapState = TileMapStoreProps & TileMapStoreActions;
