import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import "./global.css";

function RootContent() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === "(auth)";
    const inAdminGroup = rootSegment === "(admin)";
    const inTrainerGroup = rootSegment === "(trainers)";
    const inTabsGroup = rootSegment === "(tabs)";

    if (!user) {
      // 🚫 Not logged in -> Must be in auth group
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else {
      // ✅ Logged in
      if (inAuthGroup) {
        // Redirect to role home if they try to access login/register while logged in
        if (user.role === "admin") router.replace("/(admin)");
        else if (user.role === "trainer") router.replace("/(trainers)/dashboard");
        else router.replace("/(tabs)");
      } else {
        // Protect roles
        if (user.role === "admin" && (inTabsGroup || inTrainerGroup)) {
           // Admin can go anywhere? Usually yes, but let's keep them in admin for consistency
           // router.replace("/(admin)"); 
        } else if (user.role === "trainer" && (inTabsGroup || inAdminGroup)) {
           router.replace("/(trainers)/dashboard");
        } else if (user.role === "member" && (inAdminGroup || inTrainerGroup)) {
           router.replace("/(tabs)");
        }
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootContent />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}