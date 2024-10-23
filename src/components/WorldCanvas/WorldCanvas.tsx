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
import { runOnJS, SharedValue, useSharedValue } from 'react-native-reanimated';

import type { BBox, Dimensions, Position } from '@types';
import { TileContainer } from '@components/TileContainer';
import { useContextBridge } from 'its-fine';
import {
  useTileMapStoreActions,
  useTileMapStoreView,
  WorldTouchEventCallback,
} from '@model/useTileMapStore';
import { useRenderingTrace } from '@helpers/useRenderingTrace';
import { TileDeck } from '@components/TileDeck';
import { WorldCanvasRef } from './types';
import { useGestures } from './useGestures';

export type WorldCanvasProps = React.PropsWithChildren<{
  onTouch?: WorldTouchEventCallback;
  onPinch?: WorldTouchEventCallback;
  onReady?: () => void;
}>;

const log = createLogger('WorldCanvas');

export const WorldCanvas = forwardRef(
  (
    { children, onTouch, onPinch, onReady }: WorldCanvasProps,
    forwardedRef: React.Ref<WorldCanvasRef>,
  ) => {
    const ContextBridge = useContextBridge();
    const canvasRef = useCanvasRef();

    const { setViewScreenDims, getViewScreenDims } = useTileMapStoreActions();
    const { width: viewWidth, height: viewHeight } = getViewScreenDims();

    const {
      getSelectedTile,
      selectTileAtPosition,
      startGame,
      moveToPosition,
      onGameTouch,
    } = useTileMapStoreActions();

    const { bbox, position, matrix, screenToWorld, zoomOnPoint } =
      useTileMapStoreView();

    const gesture = useGestures({
      bbox,
      position,
      screenToWorld,
      onTouch,
      onGameTouch,
      zoomOnPoint,
    });

    useImperativeHandle(forwardedRef, () => ({
      getSelectedTile: () => {
        return getSelectedTile();
      },
      setZoom: (zoomFactor: number) => {
        zoomOnPoint([viewWidth / 2, viewHeight / 2], zoomFactor);
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

    const isLayoutValid = viewWidth > 0 && viewHeight > 0;

    log.debug('render');

    // the use of ContextBridge is because Canvas runs in a different fiber
    // and doesn't receive context as a result
    // see:
    // https://shopify.github.io/react-native-skia/docs/canvas/contexts/
    return (
      <>
        <GestureDetector gesture={gesture}>
          <Canvas
            style={styles.canvas}
            ref={canvasRef}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setViewScreenDims(width, height);
              onReady && onReady();
            }}
          >
            <ContextBridge>
              {isLayoutValid && (
                <TileContainer position={position} bbox={bbox} matrix={matrix}>
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
        <TileDeck />
      </>
    );
  },
);

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%',
  },
});
