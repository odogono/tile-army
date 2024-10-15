import { createLogger } from '@helpers/log';
import { Vector } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { create } from 'zustand';

import { Tile } from './Tile';

const log = createLogger('WorldStore');

export type WorldStore = {
  cameraPos: Vector;
  selectedTile: any | null;
  setSelectedTile: (tile: any | null) => void;
};

export const useWorldStore = () => {
  const store = useMemo(
    () =>
      create<WorldStore>((set, get) => ({
        cameraPos: {
          x: 0,
          y: 0,
        },
        selectedTile: null,

        setSelectedTile: (tile) => set({ selectedTile: tile }),
      })),
    [],
  );

  const selectedTile = store((state) => state.selectedTile);

  return { selectedTile, store };
};
