import { BBox, Position } from 'geojson';
import {
  bboxIntersectsBBox,
  bboxToRect,
  pointToBBox,
  rectToBBox,
} from '../geo';

describe('Geo helpers', () => {
  describe('rectToBBox', () => {
    it('should convert a rectangle to a bounding box', () => {
      const rect = { x: 10, y: 20, width: 30, height: 40 };
      const expectedBBox = [10, 60, 40, 20];
      expect(rectToBBox(rect)).toEqual(expectedBBox);
    });

    it('should handle negative coordinates', () => {
      const rect = { x: -10, y: -20, width: 30, height: 40 };
      const expectedBBox = [-10, 20, 20, -20];
      expect(rectToBBox(rect)).toEqual(expectedBBox);
    });
  });

  describe('bboxToRect', () => {
    it('should convert a bounding box to a rectangle', () => {
      const bbox: BBox = [10, 60, 40, 20];
      const expectedRect = { x: 10, y: 20, width: 30, height: 40 };
      expect(bboxToRect(bbox)).toEqual(expectedRect);
    });

    it('should handle negative coordinates', () => {
      const bbox: BBox = [-10, 20, 20, -20];
      const expectedRect = { x: -10, y: -20, width: 30, height: 40 };
      expect(bboxToRect(bbox)).toEqual(expectedRect);
    });
  });

  describe('pointToBBox', () => {
    it('should convert a point to a bounding box', () => {
      const point: Position = [10, 20];
      const expectedBBox: BBox = [5, 25, 15, 15];
      expect(pointToBBox(point, 10)).toEqual(expectedBBox);
    });
  });

  describe('bboxIntersectsBBox', () => {
    it('should return true if the bounding boxes intersect', () => {
      const bbox1: BBox = rectToBBox({ x: 0, y: 0, width: 10, height: 10 });
      const bbox2: BBox = rectToBBox({ x: 5, y: 5, width: 10, height: 10 });

      expect(bboxIntersectsBBox(bbox1, bbox2)).toBe(true);
    });

    it('should return false if the bounding boxes do not intersect', () => {
      const bbox1: BBox = rectToBBox({ x: 0, y: 0, width: 10, height: 10 });
      const bbox2: BBox = rectToBBox({ x: 15, y: 15, width: 10, height: 10 });
      expect(bboxIntersectsBBox(bbox1, bbox2)).toBe(false);
    });
  });
});
