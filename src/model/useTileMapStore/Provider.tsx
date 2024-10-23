/* eslint-disable react-compiler/react-compiler */
import { useCallback, useEffect, useRef } from 'react';
import { createLogger } from '@helpers/log';
import { BBox, Position } from '@types';
import { useDerivedValue, withTiming } from 'react-native-reanimated';
import { Skia } from '@shopify/react-native-skia';
import {
  calculateZoom as calculateZoomInternal,
  CalculateZoomProps,
} from '@model/helpers';
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

  const { mViewPosition, mViewScale, viewScreenWidth, viewScreenHeight } =
    storeRef.current.getState();

  const bbox = useDerivedValue<BBox>(() => {
    const [x, y] = mViewPosition.value;
    const [sx, sy] = [x / mViewScale.value, y / mViewScale.value];
    const width = viewScreenWidth / mViewScale.value;
    const height = viewScreenHeight / mViewScale.value;
    const hWidth = width / 2;
    const hHeight = height / 2;

    // sw point, then ne point
    return [sx - hWidth, sy + hHeight, sx + hWidth, sy - hHeight];
  });

  const matrix = useDerivedValue(() => {
    const [x, y] = mViewPosition.value;
    const m = Skia.Matrix();

    // Translate to the center of the screen
    m.translate(viewScreenWidth / 2, viewScreenHeight / 2);

    // Apply scale around the current position
    m.translate(-x, -y);
    m.scale(mViewScale.value, mViewScale.value);

    return m;
  });

  const inverseMatrix = useDerivedValue(() => {
    const [x, y] = mViewPosition.value;
    const m = Skia.Matrix();

    // Invert the operations in reverse order
    m.scale(1 / mViewScale.value, 1 / mViewScale.value);
    m.translate(x, y);

    m.translate(-viewScreenWidth / 2, -viewScreenHeight / 2);

    return m;
  });

  const worldToScreen = useCallback(
    (point: Position): Position => {
      'worklet';
      const [x, y] = point;
      const m = matrix.value.get();
      const a = m[0],
        b = m[1],
        c = m[2],
        d = m[3],
        e = m[4],
        f = m[5];

      const screenX = a * x + b * y + c;
      const screenY = d * x + e * y + f;

      return [screenX, screenY];
    },
    [matrix],
  );

  const screenToWorld = useCallback(
    (point: Position): Position => {
      'worklet';
      const [x, y] = point;
      const m = inverseMatrix.value.get();
      const a = m[0],
        b = m[1],
        c = m[2],
        d = m[3],
        e = m[4],
        f = m[5];

      const worldX = a * x + b * y + c;
      const worldY = d * x + e * y + f;

      return [worldX, worldY];
    },
    [inverseMatrix],
  );

  const screenToWorldMap = useCallback((points: Position[]) => {
    'worklet';
    const m = inverseMatrix.value.get();
    const a = m[0],
      b = m[1],
      c = m[2],
      d = m[3],
      e = m[4],
      f = m[5];

    return points.map((point) => {
      const [x, y] = point;
      const worldX = a * x + b * y + c;
      const worldY = d * x + e * y + f;
      return [worldX, worldY];
    });
  }, []);

  const worldToCamera = useCallback(
    (point: Position) => {
      // 'worklet';
      const [x, y] = point;
      return [x * mViewScale.value, y * mViewScale.value];
    },
    [mViewScale],
  );

  const cameraToWorld = useCallback((point: Position) => {
    'worklet';
    const [x, y] = point;
    return [x / mViewScale.value, y / mViewScale.value];
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
    [viewScreenWidth, viewScreenHeight],
  );

  // log.debug('render', !!storeRef.current);

  return (
    <TileMapContext.Provider
      value={{
        position: mViewPosition,
        scale: mViewScale,
        store: storeRef.current,
        bbox,
        matrix,
        inverseMatrix,
        worldToScreen,
        screenToWorld,
        screenToWorldMap,
        worldToCamera,
        cameraToWorld,
        zoomOnPoint,
      }}
    >
      {children}
    </TileMapContext.Provider>
  );
};
