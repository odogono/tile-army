/* eslint-disable react-compiler/react-compiler */
import { FillType, Group, Path, Skia } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import {
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Position } from '@types';

export const TouchPoint = ({
  pos,
  isVisible,
}: {
  pos: SharedValue<Position>;
  isVisible: SharedValue<boolean>;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const path = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(0, 0, 10);
    path.setFillType(FillType.EvenOdd);
    path.addCircle(0, 0, 5);
    return path;
  }, []);

  const matrix = useDerivedValue(() => {
    const m3 = Skia.Matrix();
    const [x, y] = pos.value ?? [0, 0];

    m3.translate(x, y);

    m3.scale(scale.value, scale.value);

    return m3;
  }, [pos]);

  const color = useDerivedValue(() => {
    return `rgba(102, 102, 102, ${opacity.value})`;
  });

  useAnimatedReaction(
    () => isVisible.value,
    (_visible, wasVisible) => {
      if (wasVisible) {
        return;
      }
      scale.value = withSequence(
        withTiming(0.2, { duration: 0 }),
        withTiming(10, { duration: 500 }),
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0, { duration: 400 }, () => {
          isVisible.value = false;
        }),
      );
    },
  );

  return (
    <Group matrix={matrix}>
      <Path path={path} color={color} />
    </Group>
  );
};
