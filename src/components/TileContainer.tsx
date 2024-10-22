import { TileComponent } from '@components/TileComponent';
import { Group, SkMatrix } from '@shopify/react-native-skia';
import React, { useCallback, useRef, useState } from 'react';
import { runOnJS, SharedValue, useDerivedValue } from 'react-native-reanimated';
import { BBox, Dimensions, Position } from '@types';
import { createLogger } from '@helpers/log';
import { Tile } from '@model/Tile';
import { useTileMapStoreActions } from '@model/useTileMapStore';

export type TileContainerProps = React.PropsWithChildren<{
  bbox: SharedValue<BBox>;
  matrix: SharedValue<SkMatrix>;
  position: SharedValue<Position>;
}>;

const log = createLogger('TileContainer');

export const TileContainer = ({
  bbox,
  children,
  matrix,
}: TileContainerProps) => {
  const { getVisibleTiles } = useTileMapStoreActions();

  const visibleTilesRef = useRef<string>('');
  const [visibleTiles, setVisibleTiles] = useState<Tile[]>([]);
  // const tiles = store.store((state) => state.tiles);

  const updateVisibleTiles = useCallback(
    (bbox: BBox) => {
      const visible = getVisibleTiles(bbox);
      const ids = visible.map((t) => t.id).join(',');
      if (ids !== visibleTilesRef.current) {
        visibleTilesRef.current = ids;
        setVisibleTiles(visible);
      }
    },
    [getVisibleTiles, visibleTiles],
  );

  // when the bbox changes, update the visible tiles
  useDerivedValue(() => {
    runOnJS(updateVisibleTiles)(bbox.value);
  });

  // useRenderingTrace('TileContainer', {
  //   getVisibleTiles,
  //   updateVisibleTiles,
  //   visibleTiles,
  //   // stateViewPosition,
  // });

  // log.debug('render', visibleTiles.length);

  return (
    <Group matrix={matrix}>
      {visibleTiles.map((tile) => (
        <TileComponent
          key={`${tile.id}-${tile.type}`}
          {...tile}
          isAnimated
          hasShadow
        />
      ))}
      {children}
    </Group>
  );
};
