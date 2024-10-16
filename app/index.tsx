import { TileComponent } from '@components/Tile';
import { TouchPoint } from '@components/TouchPoint';
import { createLogger } from '@helpers/log';
import { useWorldTransform } from '@hooks/useWorldTransform';
import {
  Blur,
  Canvas,
  Group,
  LinearGradient,
  Rect,
  RoundedRect,
  Skia,
  SkMatrix,
  useCanvasRef,
} from '@shopify/react-native-skia';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { BBox, Position } from 'geojson';
import { useTileMapStore } from '@model/TileMapStore';
import { Tile } from '@model/Tile';
import { bboxToString } from '@helpers/geo';
import { state as initialState } from '@model/state';
import { World } from '@components/World';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const log = createLogger('Index');

// const WorldGroup = ({
//   children,
//   matrix,
// }: {
//   children: React.ReactNode;
//   matrix: SharedValue<SkMatrix>;
// }) => {
//   return <Group matrix={matrix}>{children}</Group>;
// };

export const Index = () => {
  const canvasRef = useCanvasRef();
  const {
    bbox,
    position,
    scale,
    matrix,
    screenToWorld,
    calculateZoom,
    cameraToWorld,
  } = useWorldTransform({
    screenWidth,
    screenHeight,
    scale: 1,
  });

  const store = useTileMapStore({
    initialState,
    tileWidth: 100,
    tileHeight: 100,
  });

  const touchPointPos = useSharedValue<Position>([0, 0]);

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

  const panGesture = Gesture.Pan().onChange((event) => {
    'worklet';
    const [x, y] = position.value;
    position.value = [x - event.changeX, y - event.changeY];

    runOnJS(updateWorldPosition)(cameraToWorld(position.value));
    runOnJS(updateBBox)(bbox.value);
  });

  const tapGesture = Gesture.Tap()
    .onStart((event) => {
      'worklet';
      const worldPos = screenToWorld([event.x, event.y]);
      touchPointPos.value = worldPos;

      runOnJS(updateTapPosition)([event.x, event.y]);
      runOnJS(updateWorldTapPosition)(worldPos);
    })
    .onEnd((event) => {
      'worklet';

      const worldPos = screenToWorld([event.x, event.y]);
      runOnJS(store.selectTileAtPosition)(worldPos);
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
    .onEnd(() => {
      'worklet';
      runOnJS(updateWorldPosition)(position.value);
    });

  // Combine the existing gestures with the new pinch gesture
  const gesture = Gesture.Simultaneous(panGesture, tapGesture, pinchGesture);

  const handleZoomIn = () => {
    // 'worklet';
    const { position: toPos, scale: toScale } = calculateZoom({
      focalPoint: [screenWidth / 2, screenHeight / 2],
      zoomFactor: 1.5,
    });
    position.value = withTiming(toPos, { duration: 300 });
    scale.value = withTiming(toScale, { duration: 300 }, () => {
      runOnJS(updateBBox)(bbox.value);
    });
  };

  const handleZoomOut = () => {
    // 'worklet';
    const { position: toPos, scale: toScale } = calculateZoom({
      focalPoint: [screenWidth / 2, screenHeight / 2],
      zoomFactor: 1 / 1.5,
    });
    position.value = withTiming(toPos, { duration: 300 });
    scale.value = withTiming(toScale, { duration: 300 }, () => {
      runOnJS(updateBBox)(bbox.value);
    });
  };

  const handleReset = () => {
    const target = [220, 220];
    position.value = withTiming(target, { duration: 300 });
    scale.value = withTiming(1, { duration: 300 }, () => {
      runOnJS(updateBBox)(bbox.value);
    });
  };

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Canvas
          style={styles.canvas}
          ref={canvasRef}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            // setScreenWidth(width);
            // setScreenHeight(height);
          }}
        >
          <World bbox={bbox} matrix={matrix} store={store}>
            <TouchPoint pos={touchPointPos.value} />
          </World>
          {/* <WorldGroup matrix={matrix}>
            <TileComponent position={[220, 220]} colour='#3F3' />
            <TileComponent position={[0, 220]} />
            <TileComponent position={[0, 0]} colour='#FFF' />
            <TouchPoint pos={touchPointPos.value} />
          </WorldGroup> */}
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
        </Canvas>
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
      </View>
    </GestureDetector>
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
    setBBox(bboxToString(bbox));
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
  canvas: {
    flex: 1,
    width: '100%',
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
