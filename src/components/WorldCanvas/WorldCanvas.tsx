import { TouchPoint } from '@components/TouchPoint';
import { createLogger } from '@helpers/log';
import { useWorldTransform } from '@components/WorldCanvas/useWorldTransform';
import { Canvas, useCanvasRef } from '@shopify/react-native-skia';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

import type { Dimensions, Position } from '@types';
import { TileContainer } from '@components/TileContainer';
import { useContextBridge } from 'its-fine';
import { useTileMapStoreActions } from '@model/useTileMapStore';
import type { WorldTouchEventCallback } from './types';
import { WorldCanvasRef } from './types';

export type WorldCanvasProps = {
  children: React.ReactNode;
  onWorldPositionChange: WorldTouchEventCallback;
  onTouch: WorldTouchEventCallback;
  onPinch: WorldTouchEventCallback;
};

const log = createLogger('WorldCanvas');

export const WorldCanvas = forwardRef(
  (
    { children, onWorldPositionChange, onTouch, onPinch }: WorldCanvasProps,
    forwardedRef: React.Ref<WorldCanvasRef>,
  ) => {
    const ContextBridge = useContextBridge();
    const canvasRef = useCanvasRef();
    const [screenDimensions, setScreenDimensions] = useState<Dimensions>([
      0, 0,
    ]);
    const touchPointPos = useSharedValue<Position>([0, 0]);
    const touchPointVisible = useSharedValue(false);

    const { getSelectedTile, selectTileAtPosition } = useTileMapStoreActions();

    const {
      bbox,
      position,
      scale,
      matrix,
      screenToWorld,
      calculateZoom,
      worldToCamera,
    } = useWorldTransform({
      screenWidth: screenDimensions[0],
      screenHeight: screenDimensions[1],
      scale: 1,
      onWorldPositionChange,
    });

    useImperativeHandle(forwardedRef, () => ({
      getSelectedTile: () => {
        return getSelectedTile();
      },

      setZoom: (zoomFactor: number) => {
        const { position: toPos, scale: toScale } = calculateZoom({
          focalPoint: [screenDimensions[0] / 2, screenDimensions[1] / 2],
          zoomFactor,
        });
        position.value = withTiming(toPos, { duration: 300 });
        scale.value = withTiming(toScale, { duration: 300 });
      },
      moveToPosition: (worldPosition: Position, targetScale?: number) => {
        if (targetScale !== undefined) {
          scale.value = withTiming(targetScale, { duration: 300 });
        }

        log.debug(
          '[moveToPosition] worldPosition',
          worldPosition,
          worldToCamera(worldPosition),
        );

        position.value = withTiming(worldToCamera(worldPosition), {
          duration: 300,
        });
      },
      setPosition: (worldPosition: Position) => {
        position.value = worldPosition;
      },
      selectTileAtPosition: (worldPosition: Position) => {
        selectTileAtPosition(worldPosition);
        return getSelectedTile();
      },
    }));

    const panGesture = Gesture.Pan().onChange((event) => {
      'worklet';
      // runOnJS(log.debug)('[panGesture] change');
      const [x, y] = position.value;
      position.value = [x - event.changeX, y - event.changeY];
    });

    const tapGesture = Gesture.Tap()
      .onStart((event) => {
        'worklet';
        runOnJS(log.debug)('[tapGesture] start');
      })
      .onEnd((event) => {
        'worklet';
        runOnJS(log.debug)('[tapGesture] end');
        const worldPos = screenToWorld([event.x, event.y]);

        touchPointPos.value = worldPos;
        touchPointVisible.value = true;

        runOnJS(onTouch)({
          position: [event.x, event.y],
          world: worldPos,
          bbox: bbox.value,
        });
      });

    const pinchGesture = Gesture.Pinch()
      .onUpdate((event) => {
        'worklet';
        const { position: toPos, scale: toScale } = calculateZoom({
          focalPoint: [event.focalX, event.focalY],
          zoomFactor: event.scale,
        });
        position.value = withTiming(toPos, { duration: 300 });
        scale.value = withTiming(toScale, { duration: 300 });
      })
      .onEnd((event) => {
        'worklet';
        // runOnJS(updateWorldPosition)(position.value);
        const focalPosition = [event.focalX, event.focalY];

        runOnJS(onPinch)({
          position: focalPosition,
          world: position.value,
          bbox: bbox.value,
        });
      });

    // Combine the existing gestures with the new pinch gesture
    const gesture = Gesture.Simultaneous(tapGesture, panGesture, pinchGesture);

    const isLayoutValid = screenDimensions[0] > 0 && screenDimensions[1] > 0;

    // the use of ContextBridge is because Canvas runs in a different fiber
    // and doesn't receive context as a result
    // see:
    // https://shopify.github.io/react-native-skia/docs/canvas/contexts/
    return (
      <GestureDetector gesture={gesture}>
        <Canvas
          style={styles.canvas}
          ref={canvasRef}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setScreenDimensions([width, height]);
          }}
        >
          <ContextBridge>
            {isLayoutValid && (
              <TileContainer
                bbox={bbox}
                matrix={matrix}
                screenDimensions={screenDimensions}
              >
                <TouchPoint
                  pos={touchPointPos.value}
                  isVisible={touchPointVisible}
                />
              </TileContainer>
            )}

            {children}
          </ContextBridge>
        </Canvas>
      </GestureDetector>
    );
  },
);

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%',
  },
});
