import { BBox, Position, Rect } from '@types';

/**
 * Returns a bounding box for a rectangle.
 *
 * The BBox is the southwest point and the northest point
 *
 * @param rect - The rectangle to convert to a bounding box.
 * @returns The bounding box.
 */
export const rectToBBox = (rect: Rect): BBox => {
  return [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height];
};

export const bboxToRect = (bbox: BBox): Rect => {
  const [minX, minY, maxX, maxY] = bbox;
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const bboxToString = (bbox: BBox) => {
  return `${bbox[0].toFixed(2)}, ${bbox[1].toFixed(2)}, ${bbox[2].toFixed(2)}, ${bbox[3].toFixed(2)}`;
};

export const pointToBBox = (point: Position, size: number = 100): BBox => {
  const halfSize = size / 2;
  return [
    point[0] - halfSize,
    point[1] - halfSize,

    point[0] + halfSize,
    point[1] + halfSize,
  ];
};

export const bboxIntersectsBBox = (bbox1: BBox, bbox2: BBox) => {
  const [minX1, minY1, maxX1, maxY1] = bbox1;
  const [minX2, minY2, maxX2, maxY2] = bbox2;

  return minX1 <= maxX2 && maxX1 >= minX2 && minY1 >= maxY2 && maxY1 <= minY2;
};

export const getBBoxCenter = (bbox: BBox): Position => {
  const [minX, minY, maxX, maxY] = bbox;
  return [(minX + maxX) / 2, (minY + maxY) / 2];
};

export const posSub = (pos1: Position, pos2: Position): Position => {
  return [pos1[0] - pos2[0], pos1[1] - pos2[1]];
};

export const posAdd = (pos1: Position, pos2: Position): Position => {
  return [pos1[0] + pos2[0], pos1[1] + pos2[1]];
};

export const posMul = (pos: Position, multiplier: number): Position => {
  return [pos[0] * multiplier, pos[1] * multiplier];
};

export const posDiv = (pos: Position, divisor: number): Position => {
  return [pos[0] / divisor, pos[1] / divisor];
};

export const posEquals = (
  pos1: Position,
  pos2?: Position | null,
  round: number = 2,
): boolean => {
  if (!pos2) {
    return false;
  }
  return (
    Math.round(pos1[0] * round) === Math.round(pos2[0] * round) &&
    Math.round(pos1[1] * round) === Math.round(pos2[1] * round)
  );
};
