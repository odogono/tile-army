import { Position } from '@types';
import { Tile } from '@model/Tile';

export type WorldCanvasRef = {
  setZoom: (zoomFactor: number) => void;
  setPosition: (worldPosition: Position) => void;
  getSelectedTile: () => Tile | undefined;
  selectTileAtPosition: (worldPosition: Position) => Tile | undefined;
  moveToPosition: (worldPosition: Position, targetScale?: number) => void;
  startGame: () => void;
};
