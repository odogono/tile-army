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
import { Tile } from '@model/Tile';

const log = createLogger('Tile');

const createTilePath = (width: number, height: number, r: number) => {
  const rX = -(width / 2);
  const rY = -(height / 2);

  const path = Skia.Path.Make();

  path.addRRect(Skia.RRectXY(Skia.XYWHRect(rX, rY, width, height), r, r));

  return path;
};

export const TileComponent = ({
  position,
  isSelected,
  colour = '#60efff',
}: Tile) => {
  const scale = useSharedValue(1);

  const width = 100 - 10;
  const height = 100 - 10;
  const gR = width / 2;

  const path = useMemo(
    () => createTilePath(width, height, 10),
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
    m3.translate(position[0], position[1]);
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
