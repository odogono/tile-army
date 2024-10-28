import React from 'react';
import { Rect } from '@shopify/react-native-skia';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Guidelines = () => (
  <>
    <Rect
      x={0}
      y={screenHeight / 2}
      width={screenWidth}
      height={1}
      color='red'
    />
    <Rect
      x={screenWidth / 2}
      y={0}
      width={1}
      height={screenHeight}
      color='red'
    />
  </>
);
