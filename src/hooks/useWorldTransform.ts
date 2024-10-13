import { Skia, Vector, vec } from '@shopify/react-native-skia';
import { useCallback } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

export type UseWorldTransformProps = {
  screenWidth: number;
  screenHeight: number;
};

export const useWorldTransform = ({
  screenWidth,
  screenHeight,
}: UseWorldTransformProps) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const matrix = useDerivedValue(() => {
    // const scale = 0.5;
    const m = Skia.Matrix();
    m.translate(translateX.value, translateY.value);
    m.translate(screenWidth / 2, screenHeight / 2);
    m.scale(scale.value, scale.value);
    return m;
  }, [scale, screenWidth, screenHeight, translateX, translateY]);

  const inverseMatrix = useDerivedValue(() => {
    // const scale = 0.5;
    const m = Skia.Matrix();

    m.scale(1 / scale.value, 1 / scale.value);
    m.translate(-screenWidth / 2, -screenHeight / 2);
    m.translate(-translateX.value, -translateY.value);

    return m;
  }, [scale, screenWidth, screenHeight, translateX, translateY]);

  // const applyMatrix = (matrix: SkMatrix, points: Vector[]) => {
  //   const [a, b, c, d, e, f] = matrix.get();

  //   return points.map((p) => {
  //     const x = a * p.x + c * p.y + e;
  //     const y = b * p.x + d * p.y + f;

  //     return vec(x, y);
  //   });
  // };

  const screenToWorld = useCallback(
    (point: Vector): Vector => {
      'worklet';
      const { x, y } = point;
      const m = inverseMatrix.value.get();
      const a = m[0],
        b = m[1],
        c = m[2],
        d = m[3],
        e = m[4],
        f = m[5];

      const worldX = a * x + b * y + c;
      const worldY = d * x + e * y + f;

      return vec(worldX, worldY);
    },
    [inverseMatrix],
  );

  return {
    matrix,
    inverseMatrix,
    scale,
    translateX,
    translateY,
    screenToWorld,
  };
};
