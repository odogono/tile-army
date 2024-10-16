import { BBox } from 'geojson';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

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
  return `${bbox[0].toFixed(2)}, ${bbox[3].toFixed(2)}, ${bbox[2].toFixed(2)}, ${bbox[1].toFixed(2)}`;
};
