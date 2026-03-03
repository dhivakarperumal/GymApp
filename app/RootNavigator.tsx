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

    const segment = segments.length > 0 ? segments[0] : null;

    if (!user) {
      if (segment !== "(auth)") {
        router.replace("/(auth)/login");
      }
      return;
    }

    const roleRoutes: Record<string, string> = {
      admin: "(admin)",
      trainer: "(trainers)",
      user: "(tabs)",
    };

    const allowedGroup = roleRoutes[user.role] || "(tabs)";

    if (segment !== allowedGroup) {
      if (allowedGroup === "(trainers)") {
        router.replace("/(trainers)/dashboard");
      } else {
        router.replace(`/${allowedGroup}`);
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}