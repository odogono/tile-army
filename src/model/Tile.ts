import type { Position } from '@types';

export type Tile = {
  id: string;

  position: Position;

  size: number;

  adjacent?: Tile[] | null;

  isSelected?: boolean;

  isSelectable?: boolean;

  colour?: string;

  type: TileType;
};

export type TileType = 'option' | 'normal';

export type TileStored = Tile & {
  id: string;
};

export const createTile = (props: Partial<Tile>): Tile => {
  const [x, y] = props.position ?? [0, 0];

  return {
    id: idFromPosition([x, y]),
    position: [x, y],
    size: 100,
    adjacent: null,
    colour: '#FFF',
    type: 'normal',
    ...props,
  };
};

export const tileFromPosition = (pos: Position) =>
  createTile({ position: pos });

export const idFromPosition = (pos: Position) => `${pos[0]},${pos[1]}`;
