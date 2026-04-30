import { Tabs, useRouter, Redirect } from "expo-router";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

function AdminHeader() {
  const router = useRouter();
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const userName = "Dhivakar"; 
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="bg-gray-900">
      <View className="px-4 py-3 bg-gray-900 flex-row items-center justify-between">

      {/* LEFT LOGO */}
      <Text className="text-white text-lg font-bold tracking-wide">
        FIT ADMIN
      </Text>

      {/* RIGHT SIDE ICONS */}
      <View className="flex-row items-center">

        {/* Orders */}
        <TouchableOpacity onPress={() => router.push("/orders")}>
          <Ionicons name="receipt-outline" size={22} color="white" />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          className="ml-4"
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="notifications-outline" size={22} color="white" />
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          className="ml-4 w-8 h-8 rounded-full bg-blue-600 items-center justify-center"
          onPress={() => setShowMenu(!showMenu)}
        >
          <Text className="text-white font-bold">
            {firstLetter}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DROPDOWN MENU */}
      {showMenu && (
        <View className="absolute right-3 top-[95px] bg-white rounded-xl shadow-lg w-40 p-3">

          <TouchableOpacity
            onPress={() => {
              setShowMenu(false);
              router.push("/profile");
            }}
          >
            <Text className="py-2 text-sm">Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowMenu(false);
              router.push("/settings");
            }}
          >
            <Text className="py-2 text-sm">Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowMenu(false);
              router.replace("/(tabs)");
            }}
          >
            <Text className="py-2 text-sm">Back Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              setShowMenu(false);
              await logout();
            }}
          >
            <Text className="py-2 text-sm text-red-500 font-semibold">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      )}
      </View>
    </SafeAreaView>
  );
}

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111827" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // 🔒 Block non-admin users
  if (!user || user.role !== "admin") {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Tabs
      screenOptions={{
        header: () => <AdminHeader />, // 🔥 CALLING CUSTOM HEADER
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="inventory" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="buyplan"
        options={{
          title: "Buy Plan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}