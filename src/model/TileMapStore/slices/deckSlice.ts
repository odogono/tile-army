import { makeMutable } from 'react-native-reanimated';
import { StateCreator } from 'zustand';
import { Mutable, Position } from '@types';
import { createTile, Tile } from '@model/Tile';
import { getRandomColour } from '@model/state';

export type DeckSliceProps = {
  isDragging: Mutable<boolean>;
  dragPosition: Mutable<Position>;
  dragScale: Mutable<number>;
  dragTile: Mutable<Tile | undefined>;
  dragTargetTile: Mutable<Tile | undefined>;

  deckTiles: Tile[];
};

export type DeckSliceActions = {
  initialiseDeck: () => void;
  removeTileFromDeck: (tile: Tile) => void;
  insertTileIntoDeck: (tile: Tile) => void;
  createDeckTile: () => Tile;
};

export type DeckSlice = DeckSliceProps & DeckSliceActions;

const defaultState: DeckSliceProps = {
  isDragging: makeMutable<boolean>(false),
  dragTile: makeMutable<Tile | undefined>(undefined),
  dragTargetTile: makeMutable<Tile | undefined>(undefined),
  dragPosition: makeMutable<Position>([0, 0]),
  dragScale: makeMutable<number>(1),

  deckTiles: [],
};

let cardCount = 0;

export const createDeckSlice: StateCreator<DeckSlice, [], [], DeckSlice> = (
  set,
  get,
) => ({
  ...defaultState,

  initialiseDeck: () => {
    // create an array of 5 items
    const tiles = Array.from({ length: 5 }, (_, index) =>
      get().createDeckTile(),
    );

    set({ deckTiles: tiles });
  },

  removeTileFromDeck: (tile: Tile) => {
    set((state) => ({
      deckTiles: state.deckTiles.filter((t) => t.id !== tile.id),
    }));
  },

  createDeckTile: () => {
    return createTile({
      id: `deck-${cardCount++}`,
      colour: getRandomColour(),
    });
  },

  insertTileIntoDeck: (tile: Tile) => {
    set((state) => {
      const middleIndex = Math.floor(state.deckTiles.length / 2);
      const newDeckTiles = [
        ...state.deckTiles.slice(0, middleIndex),
        tile,
        ...state.deckTiles.slice(middleIndex),
      ];
      return { deckTiles: newDeckTiles };
    });
  },
});
