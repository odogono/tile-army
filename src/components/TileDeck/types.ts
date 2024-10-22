import { SharedValue } from 'react-native-reanimated';
import { Position } from '@types';

// Define the type for the tile data
export type TileData = {
  id: string;
  colour: string;
  // Add other properties your Tile component needs
};

export type AltDragItem = {
  position: SharedValue<Position>;
  offsetPosition: SharedValue<Position>;
  initialPosition: SharedValue<Position>;
  scale: SharedValue<number>;
  distance: SharedValue<number>;
};
