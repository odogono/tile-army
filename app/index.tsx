import { createLogger } from '@helpers/log';
import { Rect } from '@shopify/react-native-skia';
import React, { useCallback, useEffect, useRef } from 'react';
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
import { useRenderingTrace } from '../src/helpers/useRenderingTrace';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const log = createLogger('Index');

const ZOOM_FACTOR = 1.2;

const GuideLines = () => (
  <>
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
  </>
);

export const Index = () => {
  const worldCanvasRef = useRef<WorldCanvasRef>(null);

  const handleZoomIn = useCallback(() => {
    worldCanvasRef.current?.setZoom(ZOOM_FACTOR);
  }, []);

  const handleZoomOut = useCallback(() => {
    worldCanvasRef.current?.setZoom(1 / ZOOM_FACTOR);
  }, []);

  const handleReset = useCallback(() => {
    worldCanvasRef.current?.startGame();
  }, []);

  const handleOnReady = useCallback(() => {
    log.debug('[handleOnReady]');
    worldCanvasRef.current?.startGame();
  }, []);

  log.debug('render');

  return (
    <FiberProvider>
      <View style={styles.container}>
        <TileMapStoreProvider
          tileWidth={100}
          tileHeight={100}
          importState={state}
        >
          <WorldCanvas ref={worldCanvasRef} onReady={handleOnReady}>
            {/* <GuideLines /> */}
          </WorldCanvas>

          {/* <DebugDisplay /> */}
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
