import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { useStatusPolling } from "../hooks/useStatusPolling";
import * as notificationService from "../services/notificationService";
import "./global.css";

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  useNotifications();

  useEffect(() => {
    notificationService.configureNotifications();
    notificationService.registerForPushNotificationsAsync().catch((error) => {
      console.error('Failed to register for push notifications:', error);
    });
  }, []);

  return <>{children}</>;
}

function RootContent() {
  const { user, loading } = useAuth();

  useStatusPolling();

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
        <NotificationWrapper>
          <RootContent />
          <Toast />
        </NotificationWrapper>
      </AuthProvider>
    </SafeAreaProvider>
  );
}