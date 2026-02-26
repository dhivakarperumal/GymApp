import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Image, TouchableOpacity } from "react-native";

export default function TabLayout() {
  const userName = "Dhivakar"; // 🔥 get from auth later
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

        headerStyle: {
          backgroundColor: "#0f0f0f",
        },

        headerTitle: "",

        /* 🔥 LEFT LOGO */
        headerLeft: () => (
          <View className="flex-row items-center pl-4">
            <Image
              source={require("../../assets/images/logo_dark.png")} 
              className="w-9 h-9 rounded-full"
              resizeMode="contain"
            />
            <Text className="text-white text-lg font-bold ml-2">
              Q Gym
            </Text>
          </View>
        ),

        /* 🔥 RIGHT SIDE */
        headerRight: () => (
          <View className="flex-row items-center pr-4 gap-4">
            {/* 🔔 Notifications */}
            <TouchableOpacity className="relative">
              <Ionicons name="notifications-outline" size={24} color="#fff" />

              {/* 🔴 Badge */}
              <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                <Text className="text-[10px] text-white">3</Text>
              </View>
            </TouchableOpacity>

            {/* 👤 Profile Initial */}
            <TouchableOpacity className="w-9 h-9 rounded-full bg-orange-500 items-center justify-center">
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