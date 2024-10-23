import { TileComponent } from '@components/TileComponent';
import { Group, mix, Rect, SkMatrix } from '@shopify/react-native-skia';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BBox, Dimensions, Position } from '@types';
import { createLogger } from '@helpers/log';
import { Tile } from '@model/Tile';
import {
  useTileMapStore,
  useTileMapStoreActions,
  useTileMapStoreState,
} from '@model/useTileMapStore';

export type TileContainerProps = React.PropsWithChildren<object>;

const log = createLogger('TileContainer');

export const TileContainer = ({ children }: TileContainerProps) => {
  const { bbox, matrix } = useTileMapStore();
  const { getVisibleTiles } = useTileMapStoreActions();
  const dragCursor = useTileMapStoreState((state) => state.dragCursor);
  const dragTargetTile = useTileMapStoreState((state) => state.dragTargetTile);
  const [dragTargetId, setDragTargetId] = useState<string | undefined>();

  const visibleTilesRef = useRef<string>('');
  const [visibleTiles, setVisibleTiles] = useState<Tile[]>([]);

  const updateVisibleTiles = useCallback(
    (bbox: BBox) => {
      const visible = getVisibleTiles(bbox);

      // adjusting the ids to include the selected tile
      // will cause the re-render to animate the tile
      const ids = visible
        .map((t) => {
          return t.id === dragTargetId ? `${t.id}-selected` : t.id;
        })
        .join(',');

      const adjustedVisible = visible.map((t) => {
        if (t.id === dragTargetId) {
          return { ...t, isSelected: true };
        }
        return t;
      });

      if (ids !== visibleTilesRef.current) {
        log.debug('[updateVisibleTiles]', ids, dragTargetId);
        visibleTilesRef.current = ids;
        setVisibleTiles(adjustedVisible);
      }
    },
    [getVisibleTiles, visibleTiles, dragTargetId],
  );

  // when the bbox changes, update the visible tiles
  useDerivedValue(() => {
    runOnJS(updateVisibleTiles)(bbox.value);
    runOnJS(setDragTargetId)(dragTargetTile.value?.id);
  });

  // useRenderingTrace('TileContainer', {
  //   getVisibleTiles,
  //   updateVisibleTiles,
  //   visibleTiles,
  //   // stateViewPosition,
  // });

  log.debug('render?', visibleTiles.length);
  log.debug('dragTargetTile', dragTargetId);

  // const cursorStyle = useAnimatedStyle(() => ({
  //   position: 'absolute',
  //   left: dragCursor.value[0],
  //   top: dragCursor.value[1],
  // }));

  const x = useDerivedValue(() => {
    return dragCursor.value.x;
  });
  const y = useDerivedValue(() => {
    return dragCursor.value.y;
  });

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
      <Rect
        x={x}
        y={y}
        width={dragCursor.value.width}
        height={dragCursor.value.height}
        color='red'
        strokeWidth={1}
      />
    </Group>
  );
};
