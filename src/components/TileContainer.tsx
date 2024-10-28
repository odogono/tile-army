import { TileComponent } from '@components/TileComponent';
import { Group } from '@shopify/react-native-skia';
import React, { useCallback, useRef, useState } from 'react';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { BBox } from '@types';
import { createLogger } from '@helpers/log';
import { Tile } from '@model/Tile';
import {
  useTileMapStoreActions,
  useTileMapStoreState,
} from '@model/useTileMapStore';

export type TileContainerProps = React.PropsWithChildren<object>;

const log = createLogger('TileContainer');

export const TileContainer = ({ children }: TileContainerProps) => {
  const { getVisibleTiles } = useTileMapStoreActions();

  const dragTargetTile = useTileMapStoreState((state) => state.dragTargetTile);
  const mViewMatrix = useTileMapStoreState((state) => state.mViewMatrix);
  const mViewBBox = useTileMapStoreState((state) => state.mViewBBox);

  const visibleTilesRef = useRef<string>('');
  const [visibleTiles, setVisibleTiles] = useState<Tile[]>([]);

  const updateVisibleTiles = useCallback(
    (bbox: BBox, dragTargetId: string | undefined) => {
      const visible = getVisibleTiles(bbox);

      // adjusting the ids to include the selected tile
      // will cause the re-render to animate the tile
      const ids = visible
        .map((t) => {
          return t.id === dragTargetId ? `${t.id}-selected` : t.id;
        })
        .join('|');

      const adjustedVisible = visible.map((t) => {
        if (t.id === dragTargetId) {
          return { ...t, isSelected: true };
        }
        return t;
      });

      if (ids !== visibleTilesRef.current) {
        // log.debug('[updateVisibleTiles]', ids, dragTargetId);
        visibleTilesRef.current = ids;
        setVisibleTiles(adjustedVisible);
      }
    },
    [getVisibleTiles, visibleTiles],
  );

  // when the bbox changes, update the visible tiles
  useAnimatedReaction(
    () => [mViewBBox.value, dragTargetTile.value],
    () =>
      runOnJS(updateVisibleTiles)(mViewBBox.value, dragTargetTile.value?.id),
  );

  return (
    <Group matrix={mViewMatrix}>
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
