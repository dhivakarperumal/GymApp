import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import './global.css';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

function RootStack() {
  const { loading } = useAuth();

  if (loading) return null; 

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#0f0f0f" }}
        edges={["top"]}
      >
    <AuthProvider>
      <RootStack />
      <Toast />
    </AuthProvider>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}