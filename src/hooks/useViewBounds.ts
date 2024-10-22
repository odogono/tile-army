import { useLayoutEffect, useState } from 'react';
import { View } from 'react-native';

export const useViewBounds = (ref: React.RefObject<View>) => {
  const [bounds, setBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useLayoutEffect(() => {
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      setBounds({ x, y, width, height });
    });
  }, []);

  return bounds;
};
