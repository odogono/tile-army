import {
  Easing,
  makeMutable,
  SharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StateCreator } from 'zustand';
import { createLogger } from '@helpers/log';
import { BBox, Position } from '@types';

type Mutable<T> = ReturnType<typeof makeMutable<T>>;

export type ViewSliceProps = {
  mViewBBox: SharedValue<BBox>;

  mViewPosition: Mutable<Position>;
  mViewScale: Mutable<number>;

  viewScreenWidth: number;
  viewScreenHeight: number;
};

export type ViewSliceActions = {
  setViewPosition: (position: Position, scale?: number) => void;

  moveToPosition: (position: Position, scale?: number) => void;

  cameraToWorld: (position: Position) => Position;
  worldToCamera: (position: Position) => Position;
};

export type ViewSlice = ViewSliceProps & ViewSliceActions;

const defaultState: ViewSliceProps = {
  mViewPosition: makeMutable<Position>([0, 0]),
  mViewScale: makeMutable<number>(1),
  mViewBBox: makeMutable<BBox>([0, 0, 0, 0]),

  viewScreenWidth: 0,
  viewScreenHeight: 0,
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
    log.debug('[setViewPosition]', position, scale);
    const { mViewPosition, mViewScale } = get();
    mViewPosition.value = position;
    mViewScale.value = scale;

    // set({ viewPosition: position, viewScale: scale });
  },

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
  ) => {
    log.debug('[moveToPosition]', position, scale);
    const { mViewPosition, mViewScale } = get();

    const duration = 300;

    mViewPosition.value = withTiming(position, {
      duration,
      easing: Easing.inOut(Easing.ease),
    });
    mViewScale.value = withTiming(scale, {
      duration,
      easing: Easing.inOut(Easing.ease),
    });
  },
});
