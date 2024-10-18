import type { Position } from '@types';

export const Directions: Record<string, Position> = {
  north: [0, -1],
  east: [1, 0],
  south: [0, 1],
  west: [-1, 0],
} as const;

// export type Direction = keyof typeof DirectionMap;

export type DirectionPositions = (typeof Directions)[keyof typeof Directions];

export type Directions = keyof typeof Directions;

export const a = Directions.north;

export const AllDirections = Object.values(Directions);

// export const directions: Position[] = [
//   [1, 0],
//   [0, 1],
//   [-1, 0],
//   [0, -1],
// ];
