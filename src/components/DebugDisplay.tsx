import { StyleSheet, Text, View } from 'react-native';
import { BBox, Position } from '@types';
import { useCallback, useState } from 'react';
import { bboxToString, getBBoxCenter } from '@helpers/geo';

const positionToString = ([x, y]: Position) =>
  `${x.toFixed(2)}, ${y.toFixed(2)}`;

export const useDebugDisplay = () => {
  const [worldPosition, setWorldPosition] = useState('0.00, 0.00');
  const [tapPosition, setTapPosition] = useState('0.00, 0.00');
  const [worldTapPosition, setWorldTapPosition] = useState('0.00, 0.00');
  const [bboxString, setBBox] = useState('0.00, 0.00, 0.00, 0.00');

  const updateWorldPosition = useCallback((pos: Position) => {
    setWorldPosition(positionToString(pos));
  }, []);
  const updateTapPosition = useCallback((pos: Position) => {
    setTapPosition(positionToString(pos));
  }, []);

  const updateWorldTapPosition = useCallback((pos: Position) => {
    setWorldTapPosition(positionToString(pos));
  }, []);

  const updateBBox = useCallback((bbox: BBox) => {
    setBBox(bboxToString(bbox) + ' ~ ' + positionToString(getBBoxCenter(bbox)));
  }, []);

  const DebugDisplay = useCallback(() => {
    return (
      <View style={styles.container}>
        <Text style={styles.positionText}>World {worldPosition}</Text>
        <Text style={styles.positionText}>LocalT {tapPosition}</Text>
        <Text style={styles.positionText}>WorldT {worldTapPosition}</Text>
        <Text style={styles.positionText}>BBox {bboxString}</Text>
      </View>
    );
  }, [bboxString, tapPosition, worldPosition, worldTapPosition]);

  return {
    DebugDisplay,
    bboxString,
    worldPosition,
    tapPosition,
    worldTapPosition,
    updateWorldPosition,
    updateTapPosition,
    updateWorldTapPosition,
    updateBBox,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 12,
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  positionText: {
    color: 'black',
    padding: 4,
    fontSize: 9,
  },
});
