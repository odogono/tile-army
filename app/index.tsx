import { createLogger } from '@helpers/log';
import { Rect } from '@shopify/react-native-skia';
import React, { useRef, useState } from 'react';
import { FiberProvider } from 'its-fine';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { BBox, Position } from 'geojson';
import { bboxToString, getBBoxCenter } from '@helpers/geo';
import {
  WorldCanvas,
  WorldCanvasRef,
  WorldTouchEvent,
} from '@components/WorldCanvas';
import { TileMapStoreProvider } from '@model/useTileMapStore';
import { state } from '@model/state';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const log = createLogger('Index');

export const Index = () => {
  const worldCanvasRef = useRef<WorldCanvasRef>(null);

  const {
    bboxString,
    worldPosition,
    tapPosition,
    worldTapPosition,
    updateWorldPosition,
    updateTapPosition,
    updateWorldTapPosition,
    updateBBox,
  } = usePositionText();

  const handleZoomIn = () => {
    worldCanvasRef.current?.setZoom(1.5);
  };

  const handleZoomOut = () => {
    worldCanvasRef.current?.setZoom(1 / 1.5);
  };

  const handleReset = () => {
    const tile = worldCanvasRef.current?.getSelectedTile();
    log.debug('[handleReset]', tile);
  };

  const handleTouch = (event: WorldTouchEvent) => {
    // log.debug('[handleTouch]', event);

    updateTapPosition(event.position);
    updateWorldTapPosition(event.world);
    const tile = worldCanvasRef.current?.selectTileAtPosition(event.world);
    if (tile) {
      log.debug('[handleTouch] selected', tile.id);
      worldCanvasRef.current?.moveToPosition(tile.position);
    }
  };

  const handlePinch = (event: WorldTouchEvent) => {
    log.debug('[handlePinch]', event);
  };

  const handleWorldPositionChange = (event: WorldTouchEvent) => {
    // log.debug('[handleWorldPositionChange]', event);
    updateBBox(event.bbox);
    updateWorldPosition(event.world);
  };

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
          <Text style={[styles.positionText, styles.worldPositionText]}>
            World {worldPosition}
          </Text>
          <Text style={[styles.positionText, styles.localTapPositionText]}>
            LocalT {tapPosition}
          </Text>
          <Text style={[styles.positionText, styles.worldTapPositionText]}>
            WorldT {worldTapPosition}
          </Text>
          <Text style={[styles.positionText, styles.bboxText]}>
            BBox {bboxString}
          </Text>
          <View style={styles.zoomButtonsContainer}>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <Text style={styles.zoomButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleReset}>
              <Text style={styles.zoomButtonText}>R</Text>
            </TouchableOpacity>
          </View>
        </TileMapStoreProvider>
      </View>
    </FiberProvider>
  );
};

const usePositionText = () => {
  const [worldPosition, setWorldPosition] = useState('0.00, 0.00');
  const [tapPosition, setTapPosition] = useState('0.00, 0.00');
  const [worldTapPosition, setWorldTapPosition] = useState('0.00, 0.00');
  const [bboxString, setBBox] = useState('0.00, 0.00, 0.00, 0.00');

  const updateWorldPosition = (pos: Position) => {
    setWorldPosition(positionToString(pos));
  };
  const updateTapPosition = (pos: Position) => {
    setTapPosition(positionToString(pos));
  };

  const updateWorldTapPosition = (pos: Position) => {
    setWorldTapPosition(positionToString(pos));
  };

  const updateBBox = (bbox: BBox) => {
    setBBox(bboxToString(bbox) + ' ~ ' + positionToString(getBBoxCenter(bbox)));
  };

  return {
    bboxString,
    worldPosition,
    tapPosition,
    worldTapPosition,
    updateWorldPosition,
    updateTapPosition,
    updateWorldTapPosition,
    updateBBox,
  };
};
const positionToString = ([x, y]: Position) =>
  `${x.toFixed(2)}, ${y.toFixed(2)}`;

const textTop = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  positionText: {
    position: 'absolute',
    top: 100,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: 8,
    fontSize: 9,
  },
  worldPositionText: {
    top: textTop,
  },
  localTapPositionText: {
    top: textTop + 30,
  },
  worldTapPositionText: {
    top: textTop + 60,
  },
  bboxText: {
    top: textTop + 90,
  },
  zoomButtonsContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    flexDirection: 'column',
    rowGap: 10,
  },
  zoomButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginLeft: 10,
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Index;
