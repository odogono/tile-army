import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ControlsProps = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
};

export const Controls = ({ onZoomIn, onZoomOut, onReset }: ControlsProps) => {
  return (
    <View style={styles.zoomButtonsContainer}>
      <TouchableOpacity style={styles.zoomButton} onPress={onReset}>
        <Text style={styles.zoomButtonText}>x</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.zoomButton} onPress={onZoomIn}>
        <Text style={styles.zoomButtonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.zoomButton} onPress={onZoomOut}>
        <Text style={styles.zoomButtonText}>-</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.zoomButton} onPress={onReset}>
        <Text style={styles.zoomButtonText}>S</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  zoomButtonsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    flexDirection: 'column',
    rowGap: 10,
  },
  zoomButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginLeft: 10,
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 'bold',
  },
});
