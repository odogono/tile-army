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

  const [isDragging, dragTargetTile, mViewMatrix, mViewBBox] =
    useTileMapStoreState((state) => [
      state.isDragging,
      state.dragTargetTile,
      state.mViewMatrix,
      state.mViewBBox,
    ]);

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

      const adjustedVisible = visible.map((t) => ({
        ...t,
        isSelected: t.id === dragTargetId,
      }));

      if (ids !== visibleTilesRef.current) {
        visibleTilesRef.current = ids;
        setVisibleTiles(adjustedVisible);
      }
    },
    [getVisibleTiles, visibleTiles],
  );

  // when the bbox changes, update the visible tiles
  useAnimatedReaction(
    () =>
      [mViewBBox.value, isDragging.value, dragTargetTile.value] as [
        BBox,
        boolean,
        Tile | undefined,
      ],
    ([bbox, isDragging, dragTargetTile]) => {
      runOnJS(updateVisibleTiles)(
        bbox,
        isDragging ? dragTargetTile?.id : undefined,
      );
    },
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
