import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { useStatusPolling } from "../hooks/useStatusPolling";
import { configureNotifications, registerDeviceForPushNotifications } from "../services/notificationService";
import "./global.css";

function RootContent() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Configure and register notifications
  useEffect(() => {
    if (!loading) {
      try {
        // Configure notification handler
        configureNotifications();

        // Register for push notifications when user logs in
        if (user?.id) {
          console.log('🔔 [PUSH NOTIFICATIONS] Registering device for user ID:', user.id);
          console.log('📱 [PUSH NOTIFICATIONS] Platform:', require('react-native').Platform.OS);
          registerDeviceForPushNotifications(user.id)
            .then(token => {
              console.log('✅ [PUSH NOTIFICATIONS] Device registered successfully, token:', token ? 'received' : 'none');
            })
            .catch(error => {
              console.warn('❌ [PUSH NOTIFICATIONS] Failed to register device:', error);
            });
        }
      } catch (error) {
        console.warn('❌ [PUSH NOTIFICATIONS] Error in notification setup:', error);
        // Continue even if notification setup fails
      }
    }
  }, [user?.id, loading]);

  // Set up notification listeners
  useNotifications();

  // Enable status polling
  useStatusPolling(!!user?.id);

  useEffect(() => {
    if (loading) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === "(auth)";
    const inAdminGroup = rootSegment === "(admin)";
    const inTrainerGroup = rootSegment === "(trainers)";
    const inTabsGroup = rootSegment === "(tabs)";

    const normalizedRole = String(user?.role || "").toLowerCase();
    const redirectToRoleHome = () => {
      if (normalizedRole === "admin") {
        router.replace("/(admin)");
      } else if (normalizedRole === "trainer") {
        router.replace("/(trainers)/dashboard");
      } else {
        router.replace("/(tabs)");
      }
    };

    if (!user) {
      // 🚫 Not logged in -> Must be in auth group
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else {
      // ✅ Logged in
      if (inAuthGroup || segments.length === 0 || rootSegment === undefined) {
        // Redirect from auth or root to the correct role home
        redirectToRoleHome();
      } else {
        // Protect role-specific areas
        if (normalizedRole === "admin" && (inTabsGroup || inTrainerGroup)) {
          router.replace("/(admin)");
        } else if (normalizedRole === "trainer" && (inTabsGroup || inAdminGroup)) {
          router.replace("/(trainers)/dashboard");
        } else if (normalizedRole !== "admin" && normalizedRole !== "trainer" && inAdminGroup) {
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