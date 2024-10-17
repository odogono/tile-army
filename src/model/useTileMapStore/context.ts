import { createContext } from 'react';
import { TileMapStore } from '../TileMapStore';

export const TileMapContext = createContext<TileMapStore | null>(null);
