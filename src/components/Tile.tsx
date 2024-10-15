import { createLogger } from '@helpers/log';
import {
  Blur,
  Canvas,
  DashPathEffect,
  Group,
  LinearGradient,
  Path,
  RoundedRect,
  Skia,
  useCanvasRef,
  vec,
} from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import Animated, {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const log = createLogger('Tile');

export type TileProps = {
  x: number;
  y: number;
  isSelected?: boolean;
  colour?: string;
};

const createTilePath = (width: number, height: number, r: number) => {
  const rX = -(width / 2);
  const rY = -(height / 2);

  const path = Skia.Path.Make();

  path.addRRect(Skia.RRectXY(Skia.XYWHRect(rX, rY, width, height), r, r));

  return path;
};

export const Tile = ({ x, y, isSelected, colour = '#60efff' }: TileProps) => {
  const scale = useSharedValue(1);

  const width = 200;
  const height = 200;
  const gR = width / 2;

  const path = useMemo(
    () => createTilePath(width, height, 20),
    [width, height],
  );

  useEffect(() => {
    if (isSelected) {
      scale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
    } else {
      scale.value = 1;
    }
  }, [isSelected]);

  const matrix = useDerivedValue(() => {
    const m3 = Skia.Matrix();
    m3.translate(x, y);
    m3.scale(scale.value, scale.value);
    return m3;
  });

  return (
    <Group matrix={matrix}>
      <Group transform={[{ translateX: -10 }, { translateY: 10 }]}>
        <Path path={path} color='#BBB'>
          <Blur blur={10} />
        </Path>
      </Group>

      <Path path={path} color={colour}>
        {/* <LinearGradient
          start={vec(2 * gR, 0)}
          end={vec(4 * gR, 4 * gR)}
          colors={['lightblue', colour ]}
        /> */}
      </Path>
      {isSelected && (
        <Path path={path} strokeWidth={2} color='#000' style='stroke'>
          <DashPathEffect intervals={[4, 4]} />
        </Path>
      )}
    </Group>
  );
};
