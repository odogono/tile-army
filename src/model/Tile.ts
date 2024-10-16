import type { Position } from '@types';

export type Tile = {
  id: string;

  position: Position;

  size: number;

  adjacent?: Tile[] | null;

  isSelected?: boolean;

  colour?: string;
};

export type TileStored = Tile & {
  id: string;
};

export const createTile = (props: Partial<Tile>): Tile => {
  const [x, y] = props.position ?? [0, 0];

  return {
    id: `${x},${y}`,
    position: [x, y],
    size: 100,
    adjacent: null,
    colour: '#FFF',
    ...props,
  };
};

export const tileFromPosition = (pos: Position) =>
  createTile({ position: pos });
