import { View, Text, StyleSheet } from "react-native";

export default function Shop() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop</Text>
      <Text style={styles.item}>Whey Protein</Text>
      <Text style={styles.item}>Creatine</Text>
      <Text style={styles.item}>Gym Gloves</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 16 },
  title: { fontSize: 22, color: "#fff", marginBottom: 20 },
  item: { color: "#ccc", fontSize: 16, marginBottom: 10 },
});