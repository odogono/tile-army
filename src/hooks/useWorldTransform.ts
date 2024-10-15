import { Skia, vec, Vector } from '@shopify/react-native-skia';
import { useCallback } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import type { Position } from 'geojson';

export type UseWorldTransformProps = {
  screenWidth: number;
  screenHeight: number;
};

export const useWorldTransform = ({
  screenWidth,
  screenHeight,
}: UseWorldTransformProps) => {
  const scale = useSharedValue(1);
  const position = useSharedValue<Position>([0, 0]);

  const matrix = useDerivedValue(() => {
    const [x, y] = position.value;
    const m = Skia.Matrix();

    // Translate to the center of the screen
    m.translate(screenWidth / 2, screenHeight / 2);

    // Apply scale around the current position
    m.translate(x, y);
    m.scale(scale.value, scale.value);

    return m;
  }, [scale, screenWidth, screenHeight, position]);

  const inverseMatrix = useDerivedValue(() => {
    const [x, y] = position.value;
    const m = Skia.Matrix();

    // Invert the operations in reverse order
    m.scale(1 / scale.value, 1 / scale.value);
    m.translate(-x, -y);

    m.translate(-screenWidth / 2, -screenHeight / 2);

    return m;
  }, [scale, screenWidth, screenHeight, position]);

  const screenToWorld = useCallback(
    (point: Position): Position => {
      'worklet';
      const [x, y] = point;
      const m = inverseMatrix.value.get();
      const a = m[0],
        b = m[1],
        c = m[2],
        d = m[3],
        e = m[4],
        f = m[5];

      const worldX = a * x + b * y + c;
      const worldY = d * x + e * y + f;

      return [worldX, worldY];
    },
    [inverseMatrix],
  );

  return {
    matrix,
    inverseMatrix,
    scale,
    position,
    screenToWorld,
  };
};
