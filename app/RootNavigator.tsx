import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }

  // 🔐 Not logged in
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
      </Stack>
    );
  }

  // 🔒 Logged in - Admin
  if (user.role === "admin") {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(admin)" />
      </Stack>
    );
  }

  // 🔒 Logged in - Trainer
  if (user.role === "trainer") {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(trainers)" />
      </Stack>
    );
  }

  // 🔒 Logged in - Normal user
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}