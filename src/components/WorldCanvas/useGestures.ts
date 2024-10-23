import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, SharedValue, useSharedValue } from 'react-native-reanimated';

import type { BBox, Position } from '@types';
import { WorldTouchEventCallback } from '@model/useTileMapStore';
import { createLogger } from '@helpers/log';

type UseGesturesProps = {
  bbox: SharedValue<BBox>;
  position: SharedValue<Position>;
  screenToWorld: (point: Position) => Position;
  onTouch?: WorldTouchEventCallback;
  onGameTouch: (worldPosition: Position) => void;
  zoomOnPoint: (focalPoint: Position, scale: number) => void;
};

const log = createLogger('useGestures');

export const useGestures = ({
  bbox,
  position,
  screenToWorld,
  onTouch,
  onGameTouch,
  zoomOnPoint,
}: UseGesturesProps) => {
  const touchPointPos = useSharedValue<Position>([0, 0]);
  const touchPointVisible = useSharedValue(false);

  const panGesture = useMemo(
    () =>
      Gesture.Pan().onChange((event) => {
        'worklet';
        // runOnJS(log.debug)('[panGesture] change');
        const [x, y] = position.value;
        position.value = [x - event.changeX, y - event.changeY];
      }),
    [],
  );

  const tapGesture = useMemo(
    () =>
      Gesture.Tap().onEnd((event) => {
        'worklet';
        runOnJS(log.debug)('[tapGesture] end');
        const worldPos = screenToWorld([event.x, event.y]);

        touchPointPos.value = worldPos;
        touchPointVisible.value = true;

        onTouch &&
          runOnJS(onTouch)({
            position: [event.x, event.y],
            world: worldPos,
            bbox: bbox.value,
          });

        runOnJS(onGameTouch)(worldPos);
      }),
    [],
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          'worklet';

          zoomOnPoint([event.focalX, event.focalY], event.scale);
        })
        .onEnd((event) => {}),
    [],
  );

  // Combine the existing gestures with the new pinch gesture
  const gesture = useMemo(
    () => Gesture.Simultaneous(tapGesture, panGesture, pinchGesture),
    [tapGesture, panGesture, pinchGesture],
  );

  return gesture;
};