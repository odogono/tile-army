import { useRef } from 'react';
import { createLogger } from '@helpers/log';
import { TileMapContext } from './context';
import { TileMapStoreProps } from '../types';
import {
  createTileMapStore,
  importStateToStore,
  TileMapStore,
} from '../TileMapStore';

type AdditionalProps = {
  importState: any;
};

type ProviderProps = React.PropsWithChildren<
  Partial<TileMapStoreProps> & AdditionalProps
>;

const log = createLogger('TileMapStoreProvider');

export const TileMapStoreProvider = ({
  children,
  importState: importStateProp,
  ...props
}: ProviderProps) => {
  const storeRef = useRef<TileMapStore>();

  if (!storeRef.current) {
    storeRef.current = createTileMapStore(props);

    if (importStateProp) {
      importStateToStore(storeRef.current, importStateProp);
    }
  }

  return (
    <TileMapContext.Provider value={storeRef.current}>
      {children}
    </TileMapContext.Provider>
  );
};
