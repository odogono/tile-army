import { createContext } from 'react';
import type { BBox, Mutable, Position } from '@types';
import { TileMapStore } from '../TileMapStore';

export type TileMapContextType = {
  store: TileMapStore;
  mViewPosition: Mutable<Position>;
  mViewScale: Mutable<number>;
  mViewBBox: Mutable<BBox>;

  screenToWorld: (point: Position) => Position;

  zoomOnPoint: (
    focalPoint: Position,
    zoomFactor: number,
    duration?: number,
  ) => void;
  worldToScreen: (point: Position) => Position;
};

export const TileMapContext = createContext<TileMapContextType | null>(null);
