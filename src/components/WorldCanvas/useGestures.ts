/* eslint-disable react-compiler/react-compiler */
import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import type { Position, WorldTouchEventCallback } from '@types';
import { useTileMapStore } from '@model/useTileMapStore';
import { createLogger } from '@helpers/log';

type UseGesturesProps = {
  onTouch?: WorldTouchEventCallback;
  onGameTouch: (worldPosition: Position) => void;
};

const log = createLogger('useGestures');

export const useGestures = ({ onTouch, onGameTouch }: UseGesturesProps) => {
  const touchPointPos = useSharedValue<Position>([0, 0]);
  const touchPointVisible = useSharedValue(false);

  const { mViewPosition, mViewBBox, screenToWorld, zoomOnPoint } =
    useTileMapStore();

  const panGesture = useMemo(
    () =>
      Gesture.Pan().onChange((event) => {
        const [x, y] = mViewPosition.value;
        mViewPosition.value = [x - event.changeX, y - event.changeY];
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
            bbox: mViewBBox.value,
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
