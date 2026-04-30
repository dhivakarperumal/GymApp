import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const { user } = useAuth();

  if (user) {
    if (user.role === "admin") return <Redirect href="/(admin)" />;
    if (user.role === "trainer") return <Redirect href="/(trainers)" />;
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}