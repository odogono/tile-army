import { Matrix3 as mockMatrix3 } from './src/helpers/Matrix3';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    Matrix: () => new mockMatrix3(),
  },
  vec: (x, y) => ({ x, y }),
}));
