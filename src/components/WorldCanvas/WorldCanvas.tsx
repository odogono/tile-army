/* eslint-disable react-compiler/react-compiler */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from 'react';
import { createLogger } from '@helpers/log';
import { Canvas, useCanvasRef } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import type { Position, WorldTouchEventCallback } from '@types';
import { TileContainer } from '@components/TileContainer';
import { useContextBridge } from 'its-fine';
import {
  useTileMapStore,
  useTileMapStoreActions,
  useTileMapViewDims,
} from '@model/useTileMapStore';
import { TileDeck } from '@components/TileDeck';
import { Tile } from '@model/Tile';
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

    const {
      setViewDims,
      width: viewWidth,
      height: viewHeight,
    } = useTileMapViewDims();

    const {
      getSelectedTile,
      selectTileAtPosition,
      startGame,
      moveToPosition,
      onGameTouch,
    } = useTileMapStoreActions();

    const { bbox, position, zoomOnPoint } = useTileMapStore();

    const gesture = useGestures({
      onTouch,
      onGameTouch,
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

    const handleDragOver = useCallback((tile: Tile) => {
      log.debug('[handleDragOver]', tile);
    }, []);

    const handleDragEnd = useCallback((tile: Tile) => {
      log.debug('[handleDragEnd]', tile);
    }, []);

    // const isLayoutValid = viewWidth > 0 && viewHeight > 0;

    useEffect(() => {
      if (viewWidth > 0 && viewHeight > 0) {
        onReady?.();
      }
    }, [onReady, viewWidth, viewHeight]);

    log.debug('render', { viewWidth, viewHeight }, bbox.value);

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
              log.debug('onLayout', { width, height });
              setViewDims(width, height);
            }}
          >
            <ContextBridge>
              <TileContainer>
                {/* <TouchPoint
                  pos={touchPointPos.value}
                  isVisible={touchPointVisible}
                /> */}
              </TileContainer>

              {children}
            </ContextBridge>
          </Canvas>
        </GestureDetector>
        <TileDeck onDragOver={handleDragOver} onDragEnd={handleDragEnd} />
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
