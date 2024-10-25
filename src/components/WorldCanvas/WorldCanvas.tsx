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

import type { Position } from '@types';
import { TileContainer } from '@components/TileContainer';
import { useContextBridge } from 'its-fine';
import {
  useTileMapStore,
  useTileMapStoreActions,
  useTileMapViewDims,
} from '@model/useTileMapStore';
import { TileDeck } from '@components/TileDeck';
import { Tile } from '@model/Tile';
import { TouchPoint } from '@components/TouchPoint';
import { WorldCanvasRef } from './types';
import { useGestures } from './useGestures';

export type WorldCanvasProps = React.PropsWithChildren<{
  onReady?: () => void;
}>;

const log = createLogger('WorldCanvas');

export const WorldCanvas = forwardRef(
  (
    { children, onReady }: WorldCanvasProps,
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
      setViewPosition: setPosition,
      onGameTouch,
      gameHandleTileDragEnd,
    } = useTileMapStoreActions();

    const { zoomOnPoint } = useTileMapStore();

    const { gesture, touchPointPos, touchPointVisible } = useGestures({
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
      setPosition,
      selectTileAtPosition: (worldPosition: Position) => {
        selectTileAtPosition(worldPosition);
        return getSelectedTile();
      },

      startGame: () => {
        // setViewPosition([0, 0], 1);
        startGame();
      },
    }));

    const handleDragOver = useCallback(
      (draggedTile: Tile, targetTile: Tile) => {
        log.debug('[handleDragOver]', draggedTile.id, 'on to', targetTile.id);

        return false;
      },
      [],
    );

    const handleDragEnd = useCallback(
      (draggedTile: Tile, targetTile?: Tile) => {
        log.debug('[handleDragEnd]', draggedTile.id, 'on to', targetTile?.id);

        return gameHandleTileDragEnd(draggedTile, targetTile);
        // return false;
      },
      [],
    );

    useEffect(() => {
      if (viewWidth > 0 && viewHeight > 0) {
        onReady?.();
      }
    }, [onReady, viewWidth, viewHeight]);

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
              setViewDims(width, height);
            }}
          >
            <ContextBridge>
              <TileContainer>
                <TouchPoint pos={touchPointPos} isVisible={touchPointVisible} />
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
