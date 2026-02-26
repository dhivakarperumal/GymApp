import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function Diet() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Diet Chart 🥗</Text>

      <View style={styles.card}>
        <Text style={styles.meal}>🌅 Morning</Text>
        <Text style={styles.text}>Oats + Banana + 5 Almonds</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.meal}>🍳 Breakfast</Text>
        <Text style={styles.text}>4 Egg Whites + 2 Brown Bread</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.meal}>🍛 Lunch</Text>
        <Text style={styles.text}>Rice + Chicken Breast + Vegetables</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.meal}>☕ Evening</Text>
        <Text style={styles.text}>Peanut Butter + Apple</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.meal}>🍗 Dinner</Text>
        <Text style={styles.text}>2 Chapati + Paneer / Chicken</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.meal}>🌙 Before Bed</Text>
        <Text style={styles.text}>1 Glass Milk</Text>
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
    marginBottom: 12,
  },
  meal: { color: "#ff3c00", fontSize: 16, marginBottom: 5 },
  text: { color: "#ccc" },
});