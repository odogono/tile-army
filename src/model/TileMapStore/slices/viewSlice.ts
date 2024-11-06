import {
  Easing,
  makeMutable,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Skia, SkMatrix } from '@shopify/react-native-skia';
import { StateCreator } from 'zustand';
import { createLogger } from '@helpers/log';
import { BBox, Mutable, Position } from '@types';
import { posMul } from '@helpers/geo';

export type ViewSliceProps = {
  mViewPosition: Mutable<Position>;
  mViewScale: Mutable<number>;

  mViewMatrix: Mutable<SkMatrix>;
  mViewBBox: Mutable<BBox>;
  mViewInverseMatrix: Mutable<SkMatrix>;

  viewWidth: number;
  viewHeight: number;
};

export type MoveToPositionOptions = {
  duration?: number;
  after?: number;
};

export type ViewSliceActions = {
  setViewPosition: (position: Position, scale?: number) => void;

  moveToPosition: (
    position: Position,
    scale?: number,
    options?: MoveToPositionOptions,
  ) => void;

  convertWorldToScreen: (position: Position) => Position;

  setViewScreenDims: (width: number, height: number) => void;
};

export type ViewSlice = ViewSliceProps & ViewSliceActions;

const defaultState: ViewSliceProps = {
  mViewPosition: makeMutable<Position>([0, 0]),
  mViewScale: makeMutable<number>(1),
  mViewMatrix: makeMutable<SkMatrix>(Skia.Matrix()),
  mViewInverseMatrix: makeMutable<SkMatrix>(Skia.Matrix()),
  mViewBBox: makeMutable<BBox>([0, 0, 0, 0]),
  viewWidth: 0,
  viewHeight: 0,
};

const log = createLogger('viewSlice');

export const createViewSlice: StateCreator<ViewSlice, [], [], ViewSlice> = (
  set,
  get,
) => ({
  ...defaultState,

  setViewPosition: (
    position: Position,
    scale: number = defaultState.mViewScale.value,
  ) => {
    const { mViewPosition, mViewScale } = get();
    mViewPosition.value = position;
    mViewScale.value = scale;
  },

  setViewScreenDims: (width: number, height: number) =>
    set((state) => ({
      viewWidth: width,
      viewHeight: height,
    })),

  convertWorldToScreen: (position: Position) => {
    const { mViewScale } = get();
    return posMul(position, mViewScale.value);
  },

  moveToPosition: (
    position: Position,
    scale: number = defaultState.mViewScale.value,
    options?: MoveToPositionOptions,
  ) => {
    // convert position from world to screen
    // todo: cant yet explain why this works
    // the transformation is just scaling, which should
    // already be handled by mViewMatrix
    const screenPosition = get().convertWorldToScreen(position);

    const { mViewPosition, mViewScale } = get();

    const duration = options?.duration ?? 300;
    const after = options?.after ?? 0;

    mViewPosition.value = withDelay(
      after,
      withTiming(screenPosition, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
    );
    mViewScale.value = withDelay(
      after,
      withTiming(scale, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
    );
  },
});
