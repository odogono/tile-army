import { clamp } from 'react-native-reanimated';
import type { BBox, Mutable, Position } from '@types';

export type CalculateZoomProps = {
  focalPoint: Position;
  worldFocalPoint?: Position;
  zoomFactor?: number;
  toScale?: number | undefined;
  scale?: number;
  position?: Position;
};

export const calculateZoom = ({
  worldFocalPoint,
  zoomFactor,
  toScale,
  scale,
  position,
}: CalculateZoomProps) => {
  const oldScale = scale!;
  const newScale = toScale ?? clamp(scale! * zoomFactor!, 0.1, 5);

  // Convert focal point to world coordinates before scaling
  const scaleDiff = newScale / oldScale;

  // Calculate the new position to keep the focal point stationary
  let posX = worldFocalPoint![0] - position![0];
  let posY = worldFocalPoint![1] - position![1];
  posX = worldFocalPoint![0] - posX;
  posY = worldFocalPoint![1] - posY;
  posX = posX * scaleDiff;
  posY = posY * scaleDiff;
  const pos = [posX, posY];
  return { position: pos, scale: newScale };
};
