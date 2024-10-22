import { createLogger } from '@helpers/log';
import {
  Blur,
  DashPathEffect,
  Group,
  Path,
  Rect,
  Skia,
  SkPath,
} from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import {
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Tile } from '@model/Tile';

const log = createLogger('TileComponent', ['debug']);

const createTilePath = (width: number, height: number, r: number) => {
  const rX = -(width / 2);
  const rY = -(height / 2);

  const path = Skia.Path.Make();

  path.addRRect(Skia.RRectXY(Skia.XYWHRect(rX, rY, width, height), r, r));

  return path;
};

type TileComponentProps = Tile & {
  hasShadow?: boolean;
  isAnimated?: boolean;
};

type TileProps = TileComponentProps & {
  path: SkPath;
};

const OptionTile = ({ path }: TileProps) => {
  return (
    <Path path={path} strokeWidth={2} color='#000' style='stroke'>
      <DashPathEffect intervals={[4, 4]} />
    </Path>
  );
};

const StandardTile = ({ path, colour, isSelected, hasShadow }: TileProps) => {
  return (
    <>
      {hasShadow && (
        <Group transform={[{ translateX: -10 }, { translateY: 10 }]}>
          <Path path={path} color='#BBB'>
            <Blur blur={10} />
          </Path>
        </Group>
      )}

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
    </>
  );
};

export const TileComponent = (props: TileComponentProps) => {
  const { position, isAnimated, isSelected, type } = props;

  const scale = useSharedValue(isAnimated ? 0 : 1);

  const width = 100 - 10;
  const height = 100 - 10;

  const path = useMemo(
    () => createTilePath(width, height, 10),
    [width, height],
  );

  useEffect(() => {
    if (!isAnimated) {
      return;
    }
    if (type === 'option') {
      scale.value = withDelay(200, withTiming(1, { duration: 500 }));
    } else {
      scale.value = withTiming(1, { duration: 500 });
    }
  }, []);

  useEffect(() => {
    if (isSelected) {
      scale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
    }
  }, [isSelected]);

  const matrix = useDerivedValue(() => {
    const m3 = Skia.Matrix();
    m3.translate(position[0], position[1]);
    m3.scale(scale.value, scale.value);
    return m3;
  });

  const tileProps = {
    ...props,
    path,
  };

  log.debug(props.id, props.type);
  return (
    <Group matrix={matrix}>
      {type === 'option' ? (
        <OptionTile {...tileProps} />
      ) : (
        <StandardTile {...tileProps} />
      )}
    </Group>
  );
};
