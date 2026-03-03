import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  // 🔒 Block non-admin users
  if (!user || user.role !== "admin") {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}