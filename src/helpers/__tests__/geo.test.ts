import { BBox } from 'geojson';
import { bboxToRect, rectToBBox } from '../geo';

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
});
