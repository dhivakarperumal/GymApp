import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const segment = segments[0];

    // 🔐 Not logged in
    if (!user) {
      if (segment !== "(auth)") {
        router.replace("/(auth)/login");
      }
      return;
    }

    // 🔒 Logged in
    const roleRoutes: Record<string, string> = {
      admin: "/(admin)",
      trainer: "/(trainers)/dashboard",
      user: "/(tabs)",
    };

    const correctPath = roleRoutes[user.role] || "/(tabs)";

    const protectedGroups = ["(admin)", "(trainers)", "(tabs)"];

    if (protectedGroups.includes(segment) && `/${segment}` !== correctPath) {
      router.replace(correctPath);
    }

  }, [loading, user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}