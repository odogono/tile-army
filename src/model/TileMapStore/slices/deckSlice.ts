import { makeMutable } from 'react-native-reanimated';
import { StateCreator } from 'zustand';
import { createLogger } from '@helpers/log';
import { Mutable, Position, Rect } from '@types';
import { Tile } from '@model/Tile';

export type DeckSliceProps = {
  dragPosition: Mutable<Position>;
  dragOffsetPosition: Mutable<Position>;
  dragInitialPosition: Mutable<Position>;
  dragScale: Mutable<number>;
  dragCursor: Mutable<Rect>;
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
  dragCursor: makeMutable<Rect>({ x: 0, y: 0, width: 0, height: 0 }),
};

const log = createLogger('deckSlice');

export const createDeckSlice: StateCreator<DeckSlice, [], [], DeckSlice> = (
  set,
  get,
) => ({
  ...defaultState,
});
