import { Tile } from '@components/Tile';
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
  clamp,
  runOnJS,
  SharedValue,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import CameraMatrix from '@components/CameraMatrix';

import type { Position } from 'geojson';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const log = createLogger('Index');

const WorldGroup = ({
  children,
  matrix,
}: {
  children: React.ReactNode;
  matrix: SharedValue<SkMatrix>;
}) => {
  return <Group matrix={matrix}>{children}</Group>;
};

export const Index = () => {
  const canvasRef = useCanvasRef();
  const {
    position,
    scale,
    matrix,
    screenToWorld,
    calculateZoom,
    cameraToWorld,
  } = useWorldTransform({
    screenWidth,
    screenHeight,
  });

  const touchPointPos = useSharedValue<Position>([0, 0]);

  const {
    worldPosition,
    tapPosition,
    worldTapPosition,
    updateWorldPosition,
    updateTapPosition,
    updateWorldTapPosition,
  } = usePositionText();

  const panGesture = Gesture.Pan().onChange((event) => {
    'worklet';
    const [x, y] = position.value;
    position.value = [x - event.changeX, y - event.changeY];

    runOnJS(updateWorldPosition)(cameraToWorld(position.value));
  });

  const tapGesture = Gesture.Tap().onStart((event) => {
    'worklet';
    const worldPos = screenToWorld([event.x, event.y]);
    touchPointPos.value = worldPos;

    runOnJS(updateTapPosition)([event.x, event.y]);
    runOnJS(updateWorldTapPosition)(worldPos);
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
    scale.value = withTiming(toScale, { duration: 300 });
  };

  const handleZoomOut = () => {
    // 'worklet';
    const { position: toPos, scale: toScale } = calculateZoom({
      focalPoint: [screenWidth / 2, screenHeight / 2],
      zoomFactor: 1 / 1.5,
    });
    position.value = withTiming(toPos, { duration: 300 });
    scale.value = withTiming(toScale, { duration: 300 });
  };

  const handleReset = () => {
    const target = [220, 220];
    position.value = withTiming(target, { duration: 300 });
    scale.value = withTiming(1, { duration: 300 });
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
          <WorldGroup matrix={matrix}>
            <Tile x={220} y={220} colour='#3F3' />
            <Tile x={0} y={220} />
            <Tile x={0} y={0} colour='#FFF' />
            <TouchPoint pos={touchPointPos.value} />
          </WorldGroup>
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

  const updateWorldPosition = (pos: Position) => {
    setWorldPosition(positionToString(pos));
  };
  const updateTapPosition = (pos: Position) => {
    setTapPosition(positionToString(pos));
  };

  const updateWorldTapPosition = (pos: Position) => {
    setWorldTapPosition(positionToString(pos));
  };

  return {
    worldPosition,
    tapPosition,
    worldTapPosition,
    updateWorldPosition,
    updateTapPosition,
    updateWorldTapPosition,
  };
};
const positionToString = ([x, y]: Position) =>
  `${x.toFixed(2)}, ${y.toFixed(2)}`;

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
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  worldPositionText: {
    top: 100,
  },
  localTapPositionText: {
    top: 150,
  },
  worldTapPositionText: {
    top: 200,
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
