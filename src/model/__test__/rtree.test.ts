import { BBox } from '@types';
import { createRTree, findByBBox, findByPosition, findByRect } from '../rtree';
import { createTile } from '../Tile';

describe('RTree', () => {
  let rtree: ReturnType<typeof createRTree>;

  beforeEach(() => {
    rtree = createRTree();
  });

  it('should be able to insert a tile', () => {
    const tile = createTile({ position: [0, 0] });

    rtree.insert(tile);

    expect(rtree.all().length).toBe(1);
    expect(rtree.all()[0]).toBe(tile);

    rtree.insert(createTile({ position: [0, 100] }));

    expect(
      findByRect(rtree, { x: 0, y: 0, width: 10, height: 49 }).length,
    ).toBe(1);

    expect(findByPosition(rtree, [0, 0]).length).toBe(1);
    expect(findByPosition(rtree, [0, 100]).length).toBe(1);
    expect(findByPosition(rtree, [0, 50]).length).toBe(2);
    expect(findByPosition(rtree, [0, -49]).length).toBe(1);
    expect(findByPosition(rtree, [0, -51]).length).toBe(0);

    // console.log('---');

    rtree.remove(tile);

    expect(rtree.all().length).toBe(1);
  });

  it('should find tiles by rectangle', () => {
    const tile1 = createTile({ position: [0, 0] });
    const tile2 = createTile({ position: [50, 50] });
    const tile3 = createTile({ position: [100, 100] });

    rtree.insert(tile1);
    rtree.insert(tile2);
    rtree.insert(tile3);

    const result1 = findByRect(rtree, {
      x: -25,
      y: -25,
      width: 100,
      height: 100,
    });
    expect(result1.length).toBe(3);
    expect(result1).toContain(tile1);
    expect(result1).toContain(tile2);

    const result2 = findByRect(rtree, { x: 75, y: 75, width: 50, height: 50 });
    expect(result2.length).toBe(2);
    expect(result2).toContain(tile3);

    const result3 = findByRect(rtree, {
      x: -100,
      y: -100,
      width: 300,
      height: 300,
    });
    expect(result3.length).toBe(3);
  });

  it('should find tiles by bounding box', () => {
    const tile1 = createTile({ position: [0, 0] });
    const tile2 = createTile({ position: [50, 50] });
    const tile3 = createTile({ position: [100, 100] });

    rtree.insert(tile1);
    rtree.insert(tile2);
    rtree.insert(tile3);

    const bbox1: BBox = [-25, 75, 75, -25];
    const result1 = findByBBox(rtree, bbox1);
    expect(result1.length).toBe(3);
    expect(result1).toContain(tile1);
    expect(result1).toContain(tile2);

    const bbox2: BBox = [75, 125, 125, 75];
    const result2 = findByBBox(rtree, bbox2);
    expect(result2.length).toBe(2);
    expect(result2).toContain(tile3);

    const bbox3: BBox = [-100, 200, 200, -100];
    const result3 = findByBBox(rtree, bbox3);
    expect(result3.length).toBe(3);
  });

  it('should remove tiles correctly', () => {
    const tile1 = createTile({ position: [0, 0] });
    const tile2 = createTile({ position: [50, 50] });

    rtree.insert(tile1);
    rtree.insert(tile2);

    expect(rtree.all().length).toBe(2);

    rtree.remove(tile1);
    expect(rtree.all().length).toBe(1);
    expect(rtree.all()[0]).toBe(tile2);

    const result = findByPosition(rtree, [0, 0]);
    expect(result.length).toBe(1);
  });

  it('should handle tiles with different sizes', () => {
    const tile1 = createTile({ position: [0, 0], size: 50 });
    const tile2 = createTile({ position: [100, 100], size: 200 });

    rtree.insert(tile1);
    rtree.insert(tile2);

    const result1 = findByPosition(rtree, [0, 0]);
    expect(result1.length).toBe(2);
    expect(result1[0]).toBe(tile1);

    const result2 = findByPosition(rtree, [100, 100]);
    expect(result2.length).toBe(1);
    expect(result2[0]).toBe(tile2);

    const result3 = findByPosition(rtree, [199, 199]);
    expect(result3.length).toBe(1);
    expect(result3[0]).toBe(tile2);

    const result4 = findByPosition(rtree, [200, 200]);
    expect(result4.length).toBe(1);
  });
});
