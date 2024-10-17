import { Skia } from '@shopify/react-native-skia';
import { useCallback } from 'react';
import {
  clamp,
  runOnJS,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import type { BBox, Position } from 'geojson';
import { WorldTouchEventCallback } from './types';

export type UseWorldTransformProps = {
  screenWidth: number;
  screenHeight: number;
  scale: number;
  onWorldPositionChange: WorldTouchEventCallback;
};

export const useWorldTransform = ({
  screenWidth,
  screenHeight,
  scale: initialScale = 1,
  onWorldPositionChange,
}: UseWorldTransformProps) => {
  const scale = useSharedValue(initialScale);

  // position of the camera in screen coordinates
  const position = useSharedValue<Position>([0, 0]);

  const bbox = useDerivedValue<BBox>(() => {
    const [x, y] = position.value;
    const [sx, sy] = [x / scale.value, y / scale.value];
    const width = screenWidth / scale.value;
    const height = screenHeight / scale.value;
    const hWidth = width / 2;
    const hHeight = height / 2;

    // sw point, then ne point
    return [sx - hWidth, sy + hHeight, sx + hWidth, sy - hHeight];
  }, [position, screenWidth, screenHeight]);

  const matrix = useDerivedValue(() => {
    const [x, y] = position.value;
    const m = Skia.Matrix();

    // Translate to the center of the screen
    m.translate(screenWidth / 2, screenHeight / 2);

    // Apply scale around the current position
    m.translate(-x, -y);
    m.scale(scale.value, scale.value);

    return m;
  }, [scale, screenWidth, screenHeight, position]);

  const inverseMatrix = useDerivedValue(() => {
    const [x, y] = position.value;
    const m = Skia.Matrix();

    // Invert the operations in reverse order
    m.scale(1 / scale.value, 1 / scale.value);
    m.translate(x, y);

    m.translate(-screenWidth / 2, -screenHeight / 2);

    return m;
  }, [scale, screenWidth, screenHeight, position]);

  const worldToScreen = useCallback(
    (point: Position): Position => {
      'worklet';
      const [x, y] = point;
      const m = matrix.value.get();
      const a = m[0],
        b = m[1],
        c = m[2],
        d = m[3],
        e = m[4],
        f = m[5];

      const screenX = a * x + b * y + c;
      const screenY = d * x + e * y + f;

      return [screenX, screenY];
    },
    [matrix],
  );

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

  const screenToWorldMap = (points: Position[]) => {
    'worklet';
    const m = inverseMatrix.value.get();
    const a = m[0],
      b = m[1],
      c = m[2],
      d = m[3],
      e = m[4],
      f = m[5];

    return points.map((point) => {
      const [x, y] = point;
      const worldX = a * x + b * y + c;
      const worldY = d * x + e * y + f;
      return [worldX, worldY];
    });
  };

  const worldToCamera = (point: Position) => {
    // 'worklet';
    const [x, y] = point;
    return [x * scale.value, y * scale.value];
  };

  const cameraToWorld = (point: Position) => {
    'worklet';
    const [x, y] = point;
    return [x / scale.value, y / scale.value];
  };

  const calculateZoom = useCallback((props: CalculateZoomProps) => {
    'worklet';
    // Convert focal point to world coordinates before scaling
    const worldFocalPoint = screenToWorld(props.focalPoint);
    return calculateZoomInternal({
      ...props,
      worldFocalPoint,
      scale: scale.value,
      position: position.value,
    });
  }, []);

  const notifyWorldPositionChange = useCallback((_pos: Position) => {
    onWorldPositionChange({
      position: position.value,
      world: cameraToWorld(position.value),
      bbox: bbox.value,
    });
  }, []);

  // whenever the position changes, call the onWorldPositionChange callback
  useDerivedValue(() => {
    // important that the position.value is referenced, otherwise
    // the callback will not be called
    runOnJS(notifyWorldPositionChange)(position.value);
  });

  return {
    bbox,
    matrix,
    inverseMatrix,
    scale,
    position,
    screenToWorld,
    worldToCamera,
    cameraToWorld,
    calculateZoom,
  };
};

type CalculateZoomProps = {
  focalPoint: Position;
  worldFocalPoint?: Position;
  zoomFactor?: number;
  toScale?: number | undefined;
  scale?: number;
  position?: Position;
};

const calculateZoomInternal = ({
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
