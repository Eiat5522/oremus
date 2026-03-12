import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';

export const GoldButton = ({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <Pressable onPress={onPress} disabled={disabled} style={styles.wrap}>
    <LinearGradient
      colors={disabled ? ['#6A5A3C', '#675A40'] : ['#E0B96E', '#C89B4B']}
      style={styles.button}
    >
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  </Pressable>
);

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  button: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  label: { color: '#2B1D10', fontWeight: '700', fontSize: 15 },
});
