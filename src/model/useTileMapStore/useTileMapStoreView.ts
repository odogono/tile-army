import { Skia } from '@shopify/react-native-skia';
import { useCallback } from 'react';
import {
  clamp,
  runOnJS,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import type { BBox, Position } from '@types';
import { useTileMapStore } from './useTileMapStore';

export type WorldTouchEvent = {
  position: Position;
  world: Position;
  bbox: BBox;
};

export type WorldTouchEventCallback = (event: WorldTouchEvent) => void;

export type UseTileMapStoreViewProps = {
  screenWidth: number;
  screenHeight: number;
  scale: number;
  onWorldPositionChange?: WorldTouchEventCallback;
};

export const useTileMapStoreView = ({
  screenWidth,
  screenHeight,
  onWorldPositionChange,
}: UseTileMapStoreViewProps) => {
  const [mViewPosition, mViewScale] = useTileMapStore((state) => [
    state.mViewPosition,
    state.mViewScale,
  ]);

  const bbox = useDerivedValue<BBox>(() => {
    const [x, y] = mViewPosition.value;
    const [sx, sy] = [x / mViewScale.value, y / mViewScale.value];
    const width = screenWidth / mViewScale.value;
    const height = screenHeight / mViewScale.value;
    const hWidth = width / 2;
    const hHeight = height / 2;

    // sw point, then ne point
    return [sx - hWidth, sy + hHeight, sx + hWidth, sy - hHeight];
  });

  const matrix = useDerivedValue(() => {
    const [x, y] = mViewPosition.value;
    const m = Skia.Matrix();

    // Translate to the center of the screen
    m.translate(screenWidth / 2, screenHeight / 2);

    // Apply scale around the current position
    m.translate(-x, -y);
    m.scale(mViewScale.value, mViewScale.value);

    return m;
  });

  const inverseMatrix = useDerivedValue(() => {
    const [x, y] = mViewPosition.value;
    const m = Skia.Matrix();

    // Invert the operations in reverse order
    m.scale(1 / mViewScale.value, 1 / mViewScale.value);
    m.translate(x, y);

    m.translate(-screenWidth / 2, -screenHeight / 2);

    return m;
  });

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

  const screenToWorldMap = useCallback((points: Position[]) => {
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
  }, []);

  const worldToCamera = useCallback(
    (point: Position) => {
      // 'worklet';
      const [x, y] = point;
      return [x * mViewScale.value, y * mViewScale.value];
    },
    [mViewScale],
  );

  const cameraToWorld = useCallback((point: Position) => {
    'worklet';
    const [x, y] = point;
    return [x / mViewScale.value, y / mViewScale.value];
  }, []);

  const calculateZoom = useCallback((props: CalculateZoomProps) => {
    'worklet';
    // Convert focal point to world coordinates before scaling
    const worldFocalPoint = screenToWorld(props.focalPoint);
    return calculateZoomInternal({
      ...props,
      worldFocalPoint,
      scale: mViewScale.value,
      position: mViewPosition.value,
    });
  }, []);

  const zoomOnPoint = useCallback(
    (focalPoint: Position, zoomFactor: number) => {
      // const onFinish = () => {
      //   'worklet';
      //   // log.debug('[setZoom] onFinish');
      //   // runOnJS(log.debug)('[setZoom] onFinish');
      //   runOnJS(setViewPosition)(position.value, scale.value);
      // };

      const { position: toPos, scale: toScale } = calculateZoom({
        focalPoint,
        // focalPoint: [screenWidth / 2, screenHeight / 2],
        zoomFactor,
      });
      // log.debug('[setZoom] toPos', toPos);
      mViewPosition.value = withTiming(toPos, { duration: 300 });
      mViewScale.value = withTiming(toScale, { duration: 300 });
    },
    [screenWidth, screenHeight],
  );

  const notifyWorldPositionChange = useCallback(
    (_pos: Position) => {
      onWorldPositionChange?.({
        position: mViewPosition.value,
        world: cameraToWorld(mViewPosition.value),
        bbox: bbox.value,
      });
    },
    [onWorldPositionChange],
  );

  // whenever the position changes, call the onWorldPositionChange callback
  useDerivedValue(() => {
    // important that the position.value is referenced, otherwise
    // the callback will not be called
    runOnJS(notifyWorldPositionChange)(mViewPosition.value);
  });

  return {
    bbox,
    matrix,
    inverseMatrix,
    scale: mViewScale,
    position: mViewPosition,
    screenToWorld,
    worldToCamera,
    cameraToWorld,
    zoomOnPoint,
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
