import { makeMutable } from 'react-native-reanimated';
import { StateCreator } from 'zustand';
import { Mutable, Position } from '@types';
import { Tile } from '@model/Tile';

export type DeckSliceProps = {
  dragPosition: Mutable<Position>;
  dragOffsetPosition: Mutable<Position>;
  dragInitialPosition: Mutable<Position>;
  dragScale: Mutable<number>;
  dragTile: Mutable<Tile | undefined>;
  dragTargetTile: Mutable<Tile | undefined>;
};

export type DeckSliceActions = object;

export type DeckSlice = DeckSliceProps & DeckSliceActions;

const defaultState: DeckSliceProps = {
  dragTile: makeMutable<Tile | undefined>(undefined),
  dragTargetTile: makeMutable<Tile | undefined>(undefined),
  dragPosition: makeMutable<Position>([0, 0]),
  dragOffsetPosition: makeMutable<Position>([0, 0]),
  dragInitialPosition: makeMutable<Position>([0, 0]),
  dragScale: makeMutable<number>(1),
};

export const createDeckSlice: StateCreator<DeckSlice, [], [], DeckSlice> = (
  set,
  get,
) => ({
  ...defaultState,
});
