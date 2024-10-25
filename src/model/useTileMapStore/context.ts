import { createContext } from 'react';
import type { BBox, Mutable, Position } from '@types';
import { SkMatrix } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';
import { TileMapStore } from '../TileMapStore';

export type TileMapContextType = {
  store: TileMapStore;
  // bbox: Readonly<SharedValue<BBox>>;
  // matrix: Readonly<SharedValue<SkMatrix>>;
  // inverseMatrix: Readonly<SharedValue<SkMatrix>>;
  mViewPosition: Mutable<Position>;
  mViewScale: Mutable<number>;
  mViewBBox: Mutable<BBox>;
  screenToWorld: (point: Position) => Position;
  // worldToCamera: (point: Position) => Position;
  // cameraToWorld: (point: Position) => Position;
  zoomOnPoint: (focalPoint: Position, zoomFactor: number) => void;
  worldToScreen: (point: Position) => Position;
  // screenToWorldMap: (points: Position[]) => Position[];
};

export const TileMapContext = createContext<TileMapContextType | null>(null);
