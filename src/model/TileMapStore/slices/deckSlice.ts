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

export type DeckSliceProps = {
  dragPosition: Mutable<Position>;
  dragOffsetPosition: Mutable<Position>;
  dragInitialPosition: Mutable<Position>;
  dragScale: Mutable<number>;
};

export type DeckSliceActions = object;

export type DeckSlice = DeckSliceProps & DeckSliceActions;

const defaultState: DeckSliceProps = {
  dragPosition: makeMutable<Position>([0, 0]),
  dragOffsetPosition: makeMutable<Position>([0, 0]),
  dragInitialPosition: makeMutable<Position>([0, 0]),
  dragScale: makeMutable<number>(1),
};

const log = createLogger('deckSlice');

export const createDeckSlice: StateCreator<DeckSlice, [], [], DeckSlice> = (
  set,
  get,
) => ({
  ...defaultState,
});
