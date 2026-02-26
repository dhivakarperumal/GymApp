import { View, Text, StyleSheet } from "react-native";

export default function More() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.item}>Profile</Text>
      <Text style={styles.item}>My Orders</Text>
      <Text style={styles.item}>Membership</Text>
      <Text style={styles.item}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 16 },
  title: { fontSize: 22, color: "#fff", marginBottom: 20 },
  item: { color: "#ccc", fontSize: 16, marginBottom: 10 },
});