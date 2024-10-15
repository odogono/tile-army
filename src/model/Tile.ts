export type Tile = {
  id: string;
  x: number;
  y: number;
  type: 'grass' | 'water' | 'mountain' | 'forest';

  adjacent: Tile[] | null;

  isSelected?: boolean;
};
