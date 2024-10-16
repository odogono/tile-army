import { TileComponent } from '@components/Tile';
import { Group, SkMatrix } from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import { runOnJS, SharedValue, useDerivedValue } from 'react-native-reanimated';
import { UseTileMapStoreReturn } from '@model/TileMapStore';
import { BBox } from 'geojson';
import { createLogger } from '@helpers/log';
import { bboxToRect } from '@helpers/geo';

export type WorldProps = {
  children: React.ReactNode;
  matrix: SharedValue<SkMatrix>;
  store: UseTileMapStoreReturn;
  bbox: SharedValue<BBox>;
};

const log = createLogger('World');

export const World = ({ bbox, children, matrix, store }: WorldProps) => {
  const { getVisibleTiles } = store;
  const tiles = store.store((state) => state.tiles);

  // const visibleTiles = useDerivedValue(() => {
  //   return runOnJS(getVisibleTiles)(bbox.value);

  //   // return getVisibleTiles(bbox.value);
  // }, [bbox, getVisibleTiles]);

  const visibleTiles = useMemo(() => {
    const tiles = getVisibleTiles(bbox.value);
    // log.debug('visibleTiles', bboxToRect(bbox.value), tiles.length);
    // log.debug('visibleTiles', store.store.getState());
    return tiles;
  }, [bbox.value, getVisibleTiles]);

  useEffect(() => {
    //   const visibleTiles = getVisibleTiles(bbox.value);
    log.debug('tiles', visibleTiles.length);
  }, [bbox, tiles]);

  return (
    <Group matrix={matrix}>
      {visibleTiles.map((tile) => (
        <TileComponent key={tile.id} {...tile} />
      ))}
      {children}
    </Group>
  );
};
