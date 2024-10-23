import { makeMutable } from 'react-native-reanimated';

export type Position = number[]; // [number, number]

export type BBox = [number, number, number, number];

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Dimensions = [number, number];

export type Mutable<T> = ReturnType<typeof makeMutable<T>>;

export type WorldTouchEvent = {
  position: Position;
  world: Position;
  bbox: BBox;
};

export type WorldTouchEventCallback = (event: WorldTouchEvent) => void;
