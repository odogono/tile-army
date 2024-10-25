/* eslint-disable react-compiler/react-compiler */
import { useCallback, useRef } from 'react';
import { createLogger } from '@helpers/log';
import { BBox, Position } from '@types';
import {
  makeMutable,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Skia, SkMatrix } from '@shopify/react-native-skia';
import {
  calculateZoom as calculateZoomInternal,
  CalculateZoomProps,
} from '@model/helpers';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';
import { TileMapContext } from './context';
import {
  createTileMapStore,
  importStateToStore,
  type TileMapStore,
  type TileMapStoreProps,
} from '../TileMapStore';

type AdditionalProps = {
  importState: any;
};

type ProviderProps = React.PropsWithChildren<
  Partial<TileMapStoreProps> & AdditionalProps
>;

const log = createLogger('TileMapStoreProvider');

export const TileMapStoreProvider = ({
  children,
  importState: importStateProp,
  ...props
}: ProviderProps) => {
  const storeRef = useRef<TileMapStore>();

  if (!storeRef.current) {
    storeRef.current = createTileMapStore(props);

    if (importStateProp) {
      importStateToStore(storeRef.current, importStateProp);
    }
  }

  const {
    mViewPosition,
    mViewScale,
    mViewMatrix,
    mViewInverseMatrix,
    mViewBBox,
  } = storeRef.current.getState();

  const viewWidth = useStore(storeRef.current, (state) => state.viewWidth);
  const viewHeight = useStore(storeRef.current, (state) => state.viewHeight);

  useAnimatedReaction(
    () => [mViewPosition.value, mViewScale.value] as [Position, number],
    ([position, scale]) => {
      const [x, y] = position;
      const [sx, sy] = [x / scale, y / scale];
      const width = viewWidth / scale;
      const height = viewHeight / scale;
      const hWidth = width / 2;
      const hHeight = height / 2;

      // sw point, then ne point
      mViewBBox.value = [sx - hWidth, sy + hHeight, sx + hWidth, sy - hHeight];
    },
  );

  useAnimatedReaction(
    () => [mViewPosition.value, mViewScale.value] as [Position, number],
    ([position, scale]) => {
      const [x, y] = position;

      // as the matrix is a complex object,
      // we modify rather than reassign
      mViewMatrix.modify((m) => {
        m.identity();

        // Translate to the center of the screen
        m.translate(viewWidth / 2, viewHeight / 2);

        // Apply scale around the current position
        m.translate(-x, -y);
        m.scale(scale, scale);
        return m;
      });

      mViewInverseMatrix.modify((m) => {
        m.identity();

        // Invert the operations in reverse order
        m.scale(1 / scale, 1 / scale);

        m.translate(x, y);

        m.translate(-viewWidth / 2, -viewHeight / 2);

        return m;
      });
    },
  );

  const worldToScreen = useCallback((point: Position): Position => {
    'worklet';
    const [x, y] = point;
    const [a, b, c, d, e, f] = mViewMatrix.value.get();

    const screenX = a * x + b * y + c;
    const screenY = d * x + e * y + f;

    return [screenX, screenY];
  }, []);

  const screenToWorld = useCallback((point: Position): Position => {
    'worklet';
    const [x, y] = point;
    const [a, b, c, d, e, f] = mViewInverseMatrix.value.get();

    const worldX = a * x + b * y + c;
    const worldY = d * x + e * y + f;

    return [worldX, worldY];
  }, []);

  const calculateZoom = useCallback((props: CalculateZoomProps) => {
    'worklet';
    // Convert focal point to world coordinates before scaling
    const worldFocalPoint = screenToWorld(props.focalPoint);
    return calculateZoomInternal({
      ...props,
      worldFocalPoint,
      scale: mViewScale.value,
      position: mViewPosition.value,
    });
  }, []);

  const zoomOnPoint = useCallback(
    (focalPoint: Position, zoomFactor: number) => {
      // const onFinish = () => {
      //   'worklet';
      //   // log.debug('[setZoom] onFinish');
      //   // runOnJS(log.debug)('[setZoom] onFinish');
      //   runOnJS(setViewPosition)(position.value, scale.value);
      // };

      const { position: toPos, scale: toScale } = calculateZoom({
        focalPoint,
        // focalPoint: [screenWidth / 2, screenHeight / 2],
        zoomFactor,
      });
      // log.debug('[setZoom] toPos', toPos);
      mViewPosition.value = withTiming(toPos, { duration: 300 });
      mViewScale.value = withTiming(toScale, { duration: 300 });
    },
    [],
  );

  // log.debug('render', !!storeRef.current);

  return (
    <TileMapContext.Provider
      value={{
        mViewPosition,
        mViewScale,
        mViewBBox,
        store: storeRef.current,
        worldToScreen,
        screenToWorld,
        zoomOnPoint,
      }}
    >
      {children}
    </TileMapContext.Provider>
  );
};
