import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  /* 🔥 LOAD USER */
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        router.replace("/login"); // not logged in
      } else {
        setUser(JSON.parse(storedUser));
      }
    };

    loadUser();
  }, []);

  /* 🔥 LOGOUT */
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          router.replace("/login");
        },
      },
    ]);
  };

  const userName = user?.username || "U";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#ff3c00",
        tabBarStyle: {
          backgroundColor: "#0f0f0f",
          borderTopColor: "#222",
        },
        headerStyle: { backgroundColor: "#0f0f0f" },
        headerTitle: "",

        /* 🔥 LEFT LOGO */
        headerLeft: () => (
          <View className="flex-row items-center pl-4">
            <Image
              source={require("../../assets/images/logo_dark.png")}
              className="w-12 h-12 rounded-full"
              resizeMode="contain"
            />
          </View>
        ),

        /* 🔥 RIGHT SIDE */
        headerRight: () => (
          <View className="flex-row items-center pr-4 gap-4">
            {/* 🛒 Cart */}
            <TouchableOpacity onPress={() => router.push("/shop")}>
              <Ionicons name="cart-outline" size={24} color="#fff" />
            </TouchableOpacity>

            {/* 🔔 Notifications */}
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>

            {/* 👤 Profile Initial (CLICK → LOGOUT) */}
            <TouchableOpacity
              onPress={handleLogout}
              className="w-9 h-9 rounded-full bg-[#ff3c00] items-center justify-center"
            >
              <Text className="text-white font-bold">{initial}</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="diet"
        options={{
          title: "Diet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
