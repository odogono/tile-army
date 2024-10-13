import { Tile } from '@components/Tile';
import { TouchPoint } from '@components/TouchPoint';
import { createLogger } from '@helpers/log';
import { useWorldTransform } from '@hooks/useWorldTransform';
import {
  Blur,
  Canvas,
  Group,
  LinearGradient,
  RoundedRect,
  Skia,
  SkMatrix,
  useCanvasRef,
  vec,
  Vector,
} from '@shopify/react-native-skia';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

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
  // const translateX = useSharedValue(0);
  // const translateY = useSharedValue(0);
  const { translateX, translateY, scale, matrix, screenToWorld } =
    useWorldTransform({ screenWidth, screenHeight });

  const touchPointPos = useSharedValue<Vector>(vec(0, 0));
  const [tapPosition, setTapPosition] = useState('');
  const [worldTapPosition, setWorldTapPosition] = useState('');

  const updateTapPosition = (pos: Vector) => {
    setTapPosition(`(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`);
  };

  const updateWorldTapPosition = (pos: Vector) => {
    setWorldTapPosition(`(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`);
  };

  useEffect(() => {
    scale.value = 0.5;
  }, [matrix]);

  const panGesture = Gesture.Pan().onChange((event) => {
    'worklet';
    translateX.value += event.changeX;
    translateY.value += event.changeY;
  });

  const tapGesture = Gesture.Tap().onStart((event) => {
    'worklet';
    const worldPos = screenToWorld(vec(event.x, event.y));
    touchPointPos.value = worldPos;

    // log.debug('Tap event', { screenPos: vec(event.x, event.y), worldPos });
    runOnJS(updateTapPosition)(vec(event.x, event.y));
    runOnJS(updateWorldTapPosition)(worldPos);
  });

  const gesture = Gesture.Simultaneous(panGesture, tapGesture);

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Canvas style={styles.canvas} ref={canvasRef}>
          <WorldGroup matrix={matrix}>
            <Tile x={0} y={220} />
            <Tile x={0} y={-220} />
            <Tile x={0} y={0} isSelected />
            <TouchPoint pos={touchPointPos.value} />
          </WorldGroup>
        </Canvas>
        <Text style={styles.positionText}>Local {tapPosition}</Text>
        <Text style={[styles.positionText, styles.worldPositionText]}>
          World {worldTapPosition}
        </Text>
      </View>
    </GestureDetector>
  );
};

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
    top: 150,
  },
});

export default Index;
