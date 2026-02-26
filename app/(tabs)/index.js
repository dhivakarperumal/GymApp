import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome 💪</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today Workout</Text>
        <Text style={styles.text}>Chest & Triceps</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Featured Products</Text>
        <Text style={styles.text}>Protein • Gloves • Shaker</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 16 },
  title: { fontSize: 22, color: "#fff", marginBottom: 20 },
  card: {
    backgroundColor: "#1c1c1c",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardTitle: { color: "#ff3c00", fontSize: 18, marginBottom: 6 },
  text: { color: "#ccc" },
});