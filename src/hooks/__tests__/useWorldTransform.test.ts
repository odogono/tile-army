import { vec, Vector } from '@shopify/react-native-skia';
import { renderHook, act } from '@testing-library/react-native';

import { Matrix3 } from '../../helpers/Matrix3';
import {
  useWorldTransform,
  UseWorldTransformProps,
} from '../useWorldTransform';

describe('useWorldTransform', () => {
  const defaultProps: UseWorldTransformProps = {
    screenWidth: 400,
    screenHeight: 800,
  };

  it('basic sanity check', () => {
    const m = new Matrix3();
    m.translate(100, 200);
    m.scale(2, 2);

    const inv = new Matrix3();
    inv.scale(1 / 2, 1 / 2);
    inv.translate(-100, -200);

    const project = (matrix: Matrix3, point: Vector) => {
      const { x, y } = point;
      const m = matrix.get();
      const a = m[0],
        b = m[1],
        c = m[2],
        d = m[3],
        e = m[4],
        f = m[5];

      return vec(a * x + b * y + c, d * x + e * y + f);
    };

    const v = vec(0, 0);

    expect(project(m, v)).toEqual(vec(100, 200));

    expect(project(inv, vec(100, 200))).toEqual(vec(0, 0));
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWorldTransform(defaultProps));

    expect(result.current.scale.value).toBe(1);
    expect(result.current.translateX.value).toBe(0);
    expect(result.current.translateY.value).toBe(0);
  });

  it.skip('should update matrix when scale changes', () => {
    const { result } = renderHook(() => useWorldTransform(defaultProps));

    act(() => {
      result.current.scale.value = 2;
    });

    const matrixValues = result.current.matrix.value.get();

    expect(matrixValues[0]).toBe(2); // scale x
    expect(matrixValues[4]).toBe(2); // scale y
  });

  it('should update matrix when translation changes', () => {
    const { result } = renderHook(() => useWorldTransform(defaultProps));

    act(() => {
      result.current.translateX.value = 100;
      result.current.translateY.value = 50;
    });

    const matrixValues = result.current.matrix.value.get();
    expect(matrixValues[6]).toBe(200); // translate x (100 + screenWidth / 2)
    expect(matrixValues[7]).toBe(400); // translate y (50 + screenHeight / 2)
  });

  it.skip('should correctly transform screen coordinates to world coordinates', () => {
    const { result } = renderHook(() => useWorldTransform(defaultProps));

    act(() => {
      result.current.scale.value = 2;
      result.current.translateX.value = 100;
      result.current.translateY.value = 50;
    });

    const screenPoint = vec(300, 400);
    const worldPoint = result.current.screenToWorld(screenPoint);

    // Expected calculations:
    // x: (300 - 300) / 2 = 0
    // y: (400 - 450) / 2 = -25
    expect(worldPoint.x).toBeCloseTo(0);
    expect(worldPoint.y).toBeCloseTo(-25);
  });

  it('should handle edge cases for screen to world transformation', () => {
    const { result } = renderHook(() => useWorldTransform(defaultProps));

    const topLeft = result.current.screenToWorld(vec(0, 0));
    const bottomRight = result.current.screenToWorld(vec(400, 800));

    expect(topLeft.x).toBeCloseTo(-200);
    expect(topLeft.y).toBeCloseTo(-400);
    expect(bottomRight.x).toBeCloseTo(200);
    expect(bottomRight.y).toBeCloseTo(400);
  });
});
