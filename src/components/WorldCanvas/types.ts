import { BBox, Position } from '@types';
import { Tile } from '@model/Tile';

export type WorldCanvasRef = {
  setZoom: (zoomFactor: number) => void;
  setPosition: (worldPosition: Position) => void;
  getSelectedTile: () => Tile | undefined;
  selectTileAtPosition: (worldPosition: Position) => Tile | undefined;
  moveToPosition: (worldPosition: Position, targetScale?: number) => void;
  startGame: () => void;
};

export type WorldTouchEvent = {
  position: Position;
  world: Position;
  bbox: BBox;
};

export type WorldTouchEventCallback = (event: WorldTouchEvent) => void;
