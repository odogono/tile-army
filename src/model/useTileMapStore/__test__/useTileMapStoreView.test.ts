import { act, renderHook } from '@testing-library/react-native';
import {
  useTileMapStoreView,
  UseTileMapStoreViewProps,
} from '../useTileMapStoreView';

const onWorldPositionChange = jest.fn();

describe('useTileMapStoreView', () => {
  const defaultProps: UseTileMapStoreViewProps = {
    screenWidth: 400,
    screenHeight: 800,
    scale: 1,
    onWorldPositionChange,
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTileMapStoreView(defaultProps));

    expect(result.current.scale.value).toBe(1);
    expect(result.current.position.value).toEqual([0, 0]);
  });

  it.skip('should update matrix when scale changes', () => {
    const { result } = renderHook(() => useTileMapStoreView(defaultProps));

    act(() => {
      result.current.scale.value = 2;
    });

    const matrixValues = result.current.matrix.value.get();

    expect(matrixValues[0]).toBe(2); // scale x
    expect(matrixValues[4]).toBe(2); // scale y
  });

  it('should update matrix when translation changes', () => {
    const { result } = renderHook(() => useTileMapStoreView(defaultProps));

    act(() => {
      result.current.position.value = [100, 50];
    });

    const matrixValues = result.current.matrix.value.get();
    expect(matrixValues[6]).toBe(200); // translate x (100 + screenWidth / 2)
    expect(matrixValues[7]).toBe(400); // translate y (50 + screenHeight / 2)
  });

  it.skip('should correctly transform screen coordinates to world coordinates', () => {
    const { result } = renderHook(() => useTileMapStoreView(defaultProps));

    act(() => {
      result.current.scale.value = 2;
      result.current.position.value = [100, 50];
    });

    const worldPoint = result.current.screenToWorld([300, 400]);

    // Expected calculations:
    // x: (300 - 300) / 2 = 0
    // y: (400 - 450) / 2 = -25
    expect(worldPoint).toEqual([0, -25]);
  });

  it('should handle edge cases for screen to world transformation', () => {
    const { result } = renderHook(() => useTileMapStoreView(defaultProps));

    const topLeft = result.current.screenToWorld([0, 0]);
    const bottomRight = result.current.screenToWorld([400, 800]);

    expect(topLeft).toEqual([0, 0]);
    expect(bottomRight).toEqual([400, 800]);
  });
});
