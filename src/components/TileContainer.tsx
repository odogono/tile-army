import { TileComponent } from '@components/Tile';
import { Group, SkMatrix } from '@shopify/react-native-skia';
import React, { useCallback, useState } from 'react';
import { runOnJS, SharedValue, useDerivedValue } from 'react-native-reanimated';
import { BBox, Dimensions } from '@types';
import { createLogger } from '@helpers/log';
import { Tile } from '@model/Tile';
import { useTileMapStoreActions } from '@model/useTileMapStore';

export type TileContainerProps = {
  children: React.ReactNode;
  matrix: SharedValue<SkMatrix>;
  bbox: SharedValue<BBox>;
  screenDimensions: Dimensions;
};

const log = createLogger('TileContainer');

export const TileContainer = ({
  bbox,
  children,
  matrix,
  screenDimensions,
}: TileContainerProps) => {
  const { getVisibleTiles } = useTileMapStoreActions();

  const [visibleTiles, setVisibleTiles] = useState<Tile[]>([]);
  // const tiles = store.store((state) => state.tiles);

  const updateVisibleTiles = useCallback(
    (bbox: BBox) => {
      const visible = getVisibleTiles(bbox);
      // log.debug('visible', visible.length, bbox);
      setVisibleTiles(visible);
    },
    [getVisibleTiles],
  );

  // when the bbox changes, update the visible tiles
  useDerivedValue(() => {
    runOnJS(updateVisibleTiles)(bbox.value);
  });

  return (
    <Group matrix={matrix}>
      {visibleTiles.map((tile) => (
        <TileComponent key={tile.id} {...tile} />
      ))}
      {children}
    </Group>
  );
};
