import { TouchPoint } from '@components/TouchPoint';
import { createLogger } from '@helpers/log';
import { useWorldTransform } from '@hooks/useWorldTransform';
import { Canvas, useCanvasRef } from '@shopify/react-native-skia';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

import type { BBox, Dimensions, Position } from '@types';
import { useTileMapStore } from '@model/TileMapStore';
import { Tile } from '@model/Tile';
import { state as initialState } from '@model/state';
import { World } from '@components/World';

export type WorldCanvasRef = {
  setZoom: (zoomFactor: number) => void;
  setPosition: (worldPosition: Position) => void;
  getSelectedTile: () => Tile | undefined;
  selectTileAtPosition: (worldPosition: Position) => Tile | undefined;
  moveToPosition: (worldPosition: Position, targetScale?: number) => void;
};

export type WorldTouchEvent = {
  position: Position;
  world: Position;
  bbox: BBox;
};

export type WorldCanvasProps = {
  children: React.ReactNode;
  onWorldPositionChange: (event: WorldTouchEvent) => void;
  onTouch: (event: WorldTouchEvent) => void;
  onPinch: (event: WorldTouchEvent) => void;
};

const log = createLogger('WorldCanvas');

export const WorldCanvas = forwardRef(
  (
    { children, onWorldPositionChange, onTouch, onPinch }: WorldCanvasProps,
    forwardedRef: React.Ref<WorldCanvasRef>,
  ) => {
    const canvasRef = useCanvasRef();
    const [screenDimensions, setScreenDimensions] = useState<Dimensions>([
      0, 0,
    ]);
    const touchPointPos = useSharedValue<Position>([0, 0]);
    const touchPointVisible = useSharedValue(false);

    const store = useTileMapStore({
      initialState,
      tileWidth: 100,
      tileHeight: 100,
    });

    const {
      bbox,
      position,
      scale,
      matrix,
      screenToWorld,
      calculateZoom,
      cameraToWorld,
      worldToCamera,
    } = useWorldTransform({
      screenWidth: screenDimensions[0],
      screenHeight: screenDimensions[1],
      scale: 1,
    });

    useEffect(() => {
      onWorldPositionChange({
        position: position.value,
        world: cameraToWorld(position.value),
        bbox: bbox.value,
      });
      log.debug('screenDimensions', screenDimensions);
    }, [screenDimensions[0], screenDimensions[1]]);

    useImperativeHandle(forwardedRef, () => ({
      getSelectedTile: () => {
        return store.getSelectedTile();
      },

      setZoom: (zoomFactor: number) => {
        const { position: toPos, scale: toScale } = calculateZoom({
          focalPoint: [screenDimensions[0] / 2, screenDimensions[1] / 2],
          zoomFactor,
        });
        position.value = withTiming(toPos, { duration: 300 });
        scale.value = withTiming(toScale, { duration: 300 }, () => {
          runOnJS(onWorldPositionChange)({
            position: position.value,
            world: cameraToWorld(position.value),
            bbox: bbox.value,
          });
          // runOnJS(updateBBox)(bbox.value);
        });
      },
      moveToPosition: (worldPosition: Position, targetScale?: number) => {
        const onFinish = () => {
          'worklet';
          runOnJS(onWorldPositionChange)({
            position: position.value,
            world: cameraToWorld(position.value),
            bbox: bbox.value,
          });
        };

        if (targetScale !== undefined) {
          scale.value = withTiming(targetScale, { duration: 300 });
        }

        log.debug(
          '[moveToPosition] worldPosition',
          worldPosition,
          worldToCamera(worldPosition),
        );

        position.value = withTiming(
          worldToCamera(worldPosition),
          { duration: 300 },
          onFinish,
        );
      },
      setPosition: (worldPosition: Position) => {
        position.value = worldPosition;
        runOnJS(onWorldPositionChange)({
          position: position.value,
          world: cameraToWorld(position.value),
          bbox: bbox.value,
        });
      },
      selectTileAtPosition: (worldPosition: Position) => {
        store.selectTileAtPosition(worldPosition);
        return store.getSelectedTile();
      },
    }));

    const panGesture = Gesture.Pan().onChange((event) => {
      'worklet';
      // runOnJS(log.debug)('[panGesture] change');
      const [x, y] = position.value;
      position.value = [x - event.changeX, y - event.changeY];

      runOnJS(onWorldPositionChange)({
        position: position.value,
        world: cameraToWorld(position.value),
        bbox: bbox.value,
      });
      // runOnJS(updateBBox)(bbox.value);
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
          {isLayoutValid && (
            <World
              bbox={bbox}
              matrix={matrix}
              store={store}
              screenDimensions={screenDimensions}
            >
              <TouchPoint
                pos={touchPointPos.value}
                isVisible={touchPointVisible}
              />
            </World>
          )}

          {children}
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
