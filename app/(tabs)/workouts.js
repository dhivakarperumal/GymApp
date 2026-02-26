import { View, Text, StyleSheet } from "react-native";

export default function Workouts() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <Text style={styles.item}>Chest</Text>
      <Text style={styles.item}>Back</Text>
      <Text style={styles.item}>Legs</Text>
      <Text style={styles.item}>Shoulder</Text>
      <Text style={styles.item}>Arms</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 16 },
  title: { fontSize: 22, color: "#fff", marginBottom: 20 },
  item: { color: "#ccc", fontSize: 16, marginBottom: 10 },
});