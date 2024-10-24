import {
  Easing,
  makeMutable,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { StateCreator } from 'zustand';
import { createLogger } from '@helpers/log';
import { Mutable, Position } from '@types';

export type ViewSliceProps = {
  mViewPosition: Mutable<Position>;
  mViewScale: Mutable<number>;

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

  cameraToWorld: (position: Position) => Position;
  worldToCamera: (position: Position) => Position;

  setViewScreenDims: (width: number, height: number) => void;
};

export type ViewSlice = ViewSliceProps & ViewSliceActions;

const defaultState: ViewSliceProps = {
  mViewPosition: makeMutable<Position>([0, 0]),
  mViewScale: makeMutable<number>(1),

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

    // set({ viewPosition: position, viewScale: scale });
  },

  setViewScreenDims: (width: number, height: number) =>
    set((state) => ({
      viewWidth: width,
      viewHeight: height,
    })),

  worldToCamera: (position: Position) => {
    const { mViewScale } = get();
    return [position[0] * mViewScale.value, position[1] * mViewScale.value];
  },

  cameraToWorld: (position: Position) => {
    const { mViewScale } = get();
    return [position[0] / mViewScale.value, position[1] / mViewScale.value];
  },

  moveToPosition: (
    position: Position,
    scale: number = defaultState.mViewScale.value,
    options?: MoveToPositionOptions,
  ) => {
    // log.debug('[moveToPosition]', position, scale);
    const { mViewPosition, mViewScale } = get();

    const duration = options?.duration ?? 300;
    const after = options?.after ?? 0;

    mViewPosition.value = withDelay(
      after,
      withTiming(position, {
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
