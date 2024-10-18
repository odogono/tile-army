import { createLogger } from '@helpers/log';
import { Rect } from '@shopify/react-native-skia';
import React, { useCallback, useRef, useState } from 'react';
import { FiberProvider } from 'its-fine';
import { Dimensions, StyleSheet, View } from 'react-native';

import {
  WorldCanvas,
  WorldCanvasRef,
  WorldTouchEvent,
} from '@components/WorldCanvas';
import { TileMapStoreProvider } from '@model/useTileMapStore';
import { state } from '@model/state';
import { useDebugDisplay } from '@components/DebugDisplay';
import { Controls } from '@components/Controls';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const log = createLogger('Index');

export const Index = () => {
  const worldCanvasRef = useRef<WorldCanvasRef>(null);

  const {
    DebugDisplay,
    updateWorldPosition,
    updateTapPosition,
    updateWorldTapPosition,
    updateBBox,
  } = useDebugDisplay();

  const handleZoomIn = useCallback(() => {
    worldCanvasRef.current?.setZoom(1.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    worldCanvasRef.current?.setZoom(1 / 1.5);
  }, []);

  const handleReset = useCallback(() => {
    const tile = worldCanvasRef.current?.getSelectedTile();
    log.debug('[handleReset]', tile);
  }, []);

  const handleTouch = useCallback((event: WorldTouchEvent) => {
    updateTapPosition(event.position);
    updateWorldTapPosition(event.world);
    const tile = worldCanvasRef.current?.selectTileAtPosition(event.world);
    if (tile) {
      log.debug('[handleTouch] selected', tile.id);
      worldCanvasRef.current?.moveToPosition(tile.position);
    }
  }, []);

  const handlePinch = useCallback((event: WorldTouchEvent) => {
    log.debug('[handlePinch]', event);
  }, []);

  const handleWorldPositionChange = useCallback((event: WorldTouchEvent) => {
    updateBBox(event.bbox);
    updateWorldPosition(event.world);
  }, []);

  return (
    <FiberProvider>
      <View style={styles.container}>
        <TileMapStoreProvider
          tileWidth={100}
          tileHeight={100}
          importState={state}
        >
          <WorldCanvas
            ref={worldCanvasRef}
            onTouch={handleTouch}
            onPinch={handlePinch}
            onWorldPositionChange={handleWorldPositionChange}
          >
            <Rect
              x={0}
              y={screenHeight / 2}
              width={screenWidth}
              height={1}
              color='red'
            />
            <Rect
              x={screenWidth / 2}
              y={0}
              width={1}
              height={screenHeight}
              color='red'
            />
          </WorldCanvas>

          <DebugDisplay />
          <Controls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
          />
        </TileMapStoreProvider>
      </View>
    </FiberProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default Index;
