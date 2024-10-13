import {
  FillType,
  Group,
  Path,
  Skia,
  Vector,
} from '@shopify/react-native-skia';
import { useMemo, useEffect } from 'react';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

export const TouchPoint = ({ pos }: { pos: Vector }) => {
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
      withTiming(0.5, { duration: 0 }),
      withTiming(20, { duration: 1000 }),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 0 }),
      withTiming(0, { duration: 500 }),
    );
  };

  useEffect(() => {
    startAnimation();
  }, [pos]);

  const matrix = useDerivedValue(() => {
    const m3 = Skia.Matrix();
    if (pos) {
      m3.translate(pos.x, pos.y);
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
