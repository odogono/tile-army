import { createLogger } from '@helpers/log';
import { Canvas, useCanvasRef } from '@shopify/react-native-skia';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import type { Dimensions, Position } from '@types';
import { TileContainer } from '@components/TileContainer';
import { useContextBridge } from 'its-fine';
import {
  useTileMapStoreActions,
  useTileMapStoreView,
  WorldTouchEventCallback,
} from '@model/useTileMapStore';
import { WorldCanvasRef } from './types';
import { useRenderingTrace } from '../../helpers/useRenderingTrace';

export type WorldCanvasProps = React.PropsWithChildren<{
  onWorldPositionChange?: WorldTouchEventCallback;
  onTouch?: WorldTouchEventCallback;
  onPinch?: WorldTouchEventCallback;
}>;

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

    const {
      getSelectedTile,
      selectTileAtPosition,
      startGame,
      moveToPosition,
      onGameTouch,
    } = useTileMapStoreActions();

    const { bbox, position, scale, matrix, screenToWorld, zoomOnPoint } =
      useTileMapStoreView({
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
        zoomOnPoint(
          [screenDimensions[0] / 2, screenDimensions[1] / 2],
          zoomFactor,
        );
      },
      moveToPosition,
      setPosition: (worldPosition: Position) => {
        position.value = worldPosition;
      },
      selectTileAtPosition: (worldPosition: Position) => {
        selectTileAtPosition(worldPosition);
        return getSelectedTile();
      },

      startGame: () => {
        // setViewPosition([0, 0], 1);
        startGame();
      },
    }));

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
        Gesture.Tap()
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

    const isLayoutValid = screenDimensions[0] > 0 && screenDimensions[1] > 0;

    // useRenderingTrace('WorldCanvas', {
    //   position,
    //   scale,
    //   matrix,
    //   screenDimensions,
    //   bbox,
    //   isLayoutValid,
    //   gesture,
    //   tapGesture,
    //   panGesture,
    //   pinchGesture,
    //   getSelectedTile,
    //   selectTileAtPosition,
    //   startGame,
    //   setViewPosition,
    //   children,
    //   onWorldPositionChange,
    //   onTouch,
    //   onPinch,
    //   screenToWorld,
    //   zoomOnPoint,
    //   worldToCamera,
    //   ContextBridge,
    //   canvasRef,
    // });

    log.debug('render');

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
                position={position}
                scale={scale}
                bbox={bbox}
                matrix={matrix}
                screenDimensions={screenDimensions}
              >
                {/* <TouchPoint
                  pos={touchPointPos.value}
                  isVisible={touchPointVisible}
                /> */}
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
