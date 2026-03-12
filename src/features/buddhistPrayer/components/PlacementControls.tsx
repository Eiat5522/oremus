import { Pressable, StyleSheet, Text, View } from 'react-native';

export const PlacementControls = ({
  onRotateLeft,
  onRotateRight,
  onScaleUp,
  onScaleDown,
  onReset,
}: {
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onScaleUp: () => void;
  onScaleDown: () => void;
  onReset: () => void;
}) => (
  <View style={styles.wrap}>
    <Control onPress={onRotateLeft} label="Rotate -" />
    <Control onPress={onRotateRight} label="Rotate +" />
    <Control onPress={onScaleDown} label="Scale -" />
    <Control onPress={onScaleUp} label="Scale +" />
    <Control onPress={onReset} label="Reset" />
  </View>
);

const Control = ({ onPress, label }: { onPress: () => void; label: string }) => (
  <Pressable style={styles.control} onPress={onPress}>
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 12,
  },
  control: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(224,185,110,0.3)',
  },
  label: { color: '#F5EBD7', fontSize: 12, fontWeight: '600' },
});
