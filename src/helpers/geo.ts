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
  return [rect.x, rect.y + rect.height, rect.x + rect.width, rect.y];
};

export const bboxToRect = (bbox: BBox): Rect => {
  return {
    x: bbox[0],
    y: bbox[3],
    width: bbox[2] - bbox[0],
    height: bbox[1] - bbox[3],
  };
};

export const bboxToString = (bbox: BBox) => {
  return `${bbox[0].toFixed(2)}, ${bbox[1].toFixed(2)}, ${bbox[2].toFixed(2)}, ${bbox[3].toFixed(2)}`;
};

export const pointToBBox = (point: Position, size: number = 100): BBox => {
  const halfSize = size / 2;
  return [
    // sw
    point[0] - halfSize,
    point[1] + halfSize,
    // ne
    point[0] + halfSize,
    point[1] - halfSize,
  ];
};

export const bboxIntersectsBBox = (bbox1: BBox, bbox2: BBox) => {
  const [west1, south1, east1, north1] = bbox1;
  const [west2, south2, east2, north2] = bbox2;

  return (
    west1 <= east2 && east1 >= west2 && south1 >= north2 && north1 <= south2
  );
};

export const getBBoxCenter = (bbox: BBox): Position => {
  const [west, south, east, north] = bbox;
  return [(west + east) / 2, (south + north) / 2];
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
