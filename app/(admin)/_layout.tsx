import { Tabs, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

function AdminHeader() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const userName = user?.username || "Admin"; 
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={{ backgroundColor: "#111827" }}>
      <View style={{ px: 16, py: 12, backgroundColor: "#111827", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 }}>
        {/* LEFT LOGO */}
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", letterSpacing: 0.5 }}>
          FIT ADMIN
        </Text>

        {/* RIGHT SIDE ICONS */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Orders */}
          <TouchableOpacity onPress={() => router.push("/orders")} style={{ padding: 4 }}>
            <Ionicons name="receipt-outline" size={22} color="white" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={{ marginLeft: 16, padding: 4 }}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color="white" />
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            style={{ marginLeft: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" }}
            onPress={() => setShowMenu(!showMenu)}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {firstLetter}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DROPDOWN MENU */}
        {showMenu && (
          <View style={{ 
            position: "absolute", 
            right: 12, 
            top: 60, 
            backgroundColor: "white", 
            borderRadius: 12, 
            padding: 12, 
            width: 160, 
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 5,
            zIndex: 1000
          }}>
            <TouchableOpacity onPress={() => { setShowMenu(false); router.push("/profile"); }} style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 14 }}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setShowMenu(false); router.push("/settings"); }} style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 14 }}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setShowMenu(false); router.replace("/(tabs)"); }} style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 14 }}>Back Home</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={async () => { setShowMenu(false); await logout(); }} style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 14, color: "#ef4444", fontWeight: "bold" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function AdminLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111827" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        header: () => <AdminHeader />,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="products" options={{ title: "Products", tabBarIcon: ({ color, size }) => <MaterialIcons name="inventory" size={size} color={color} /> }} />
      <Tabs.Screen name="buyplan" options={{ title: "Buy Plan", tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="workouts" options={{ title: "Workouts", tabBarIcon: ({ color, size }) => <Feather name="activity" size={size} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}