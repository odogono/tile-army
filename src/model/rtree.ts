// import RBush from '@turf/geojson-rbush';
import RBush from 'rbush';
import { BBox, Position, Rect } from '@types';
import { Tile } from './Tile';

export class TileRBush extends RBush<Tile> {
  toBBox(tile: Tile) {
    const halfSize = tile.size / 2;
    return {
      minX: tile.position[0] - halfSize,
      minY: tile.position[1] - halfSize,
      maxX: tile.position[0] + halfSize,
      maxY: tile.position[1] + halfSize,
    };
  }
  compareMinX(a: Tile, b: Tile) {
    return a.position[0] - a.size / 2 - (b.position[0] - b.size / 2);
  }
  compareMinY(a: Tile, b: Tile) {
    return a.position[1] - a.size / 2 - (b.position[1] - b.size / 2);
  }

  remove(tile: Tile) {
    return super.remove(tile, (a, b) => {
      return a.id === b.id;
    });
  }
}

export const createRTree = (): TileRBush => {
  return new TileRBush();
};

export const findByBBox = (rtree: TileRBush, bbox: BBox) => {
  return rtree.search({
    minX: bbox[0],
    minY: bbox[3],
    maxX: bbox[2],
    maxY: bbox[1],
  });
};

export const findByRect = (rtree: TileRBush, rect: Rect) => {
  return rtree.search({
    minX: rect.x,
    minY: rect.y,
    maxX: rect.x + rect.width,
    maxY: rect.y + rect.height,
  });
};

export const findByPosition = (rtree: TileRBush, position: Position) => {
  return rtree.search({
    minX: position[0],
    minY: position[1],
    maxX: position[0],
    maxY: position[1],
  });
};
