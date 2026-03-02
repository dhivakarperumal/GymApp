import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../context/AuthContext";
import "./global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}