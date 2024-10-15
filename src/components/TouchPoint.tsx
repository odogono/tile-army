import {
  FillType,
  Group,
  Path,
  Skia,
  Vector,
} from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import {
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Position } from 'geojson';

export const TouchPoint = ({ pos }: { pos: Position }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const path = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(0, 0, 10);
    path.setFillType(FillType.EvenOdd);
    path.addCircle(0, 0, 5);
    return path;
  }, []);

  const startAnimation = () => {
    scale.value = withSequence(
      withTiming(0.2, { duration: 0 }),
      withTiming(10, { duration: 500 }),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 0 }),
      withTiming(0, { duration: 400 }),
    );
  };

  useEffect(() => {
    startAnimation();
  }, [pos]);

  const matrix = useDerivedValue(() => {
    const m3 = Skia.Matrix();
    if (pos) {
      m3.translate(pos[0], pos[1]);
    }
    m3.scale(scale.value, scale.value);
    return m3;
  }, [pos]);

  const color = useDerivedValue(() => {
    return `rgba(102, 102, 102, ${opacity.value})`;
  });

  if (!pos) {
    return null;
  }

  return (
    <Group matrix={matrix}>
      <Path path={path} color={color} />
    </Group>
  );
};
