import type { Position } from 'geojson';

export type Tile = {
  id: string;

  position: Position;

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
    adjacent: null,
    colour: '#FFF',
    ...props,
  };
};

export const tileFromPosition = (pos: Position) =>
  createTile({ position: pos });
