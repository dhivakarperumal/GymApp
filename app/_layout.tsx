import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import './global.css'

function RootStack() {
  const { loading } = useAuth();

  if (loading) return null; 

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
      <Toast />
    </AuthProvider>
  );
}