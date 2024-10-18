import { StateCreator } from 'zustand';
import { createLogger } from '@helpers/log';
import { Position } from '@types';
import { TileSlice } from './tileSlice';
import { AllDirections, Directions } from './types';
import { createTile } from '../Tile';

export type ViewSliceProps = {
  viewPosition: Position;
  viewScale: number;

  viewMovePosition: Position;
};

export type ViewSliceActions = {
  setViewPosition: (position: Position, scale?: number) => void;

  moveToPosition: (position: Position, scale?: number) => void;
};

export type ViewSlice = ViewSliceProps & ViewSliceActions;

const defaultState: ViewSliceProps = {
  viewPosition: [-1, -1],
  viewScale: 1.4,
  viewMovePosition: [-1, -1],
};

const log = createLogger('viewSlice');

export const createViewSlice: StateCreator<ViewSlice, [], [], ViewSlice> = (
  set,
  get,
) => ({
  ...defaultState,

  setViewPosition: (
    position: Position,
    scale: number = defaultState.viewScale,
  ) => {
    // log.debug('[setViewPosition]', position, scale);
    set({ viewPosition: position, viewScale: scale });
  },

  moveToPosition: (
    position: Position,
    scale: number = defaultState.viewScale,
  ) => {
    set({ viewMovePosition: position, viewScale: scale });
  },
});
