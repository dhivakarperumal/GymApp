import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

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

  const userName = user?.username || "User";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* HEADER */}
        <Text className="text-white text-3xl font-bold mb-8">
          My Profile
        </Text>

        {/* PROFILE CARD */}
        <View className="bg-[#111] rounded-3xl p-6 items-center mb-8">
          {/* AVATAR */}
          <View className="w-28 h-28 rounded-full bg-[#ff3c00] items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">
              {initial}
            </Text>
          </View>

          <Text className="text-white text-xl font-semibold">
            {userName}
          </Text>

          <Text className="text-gray-400 mt-1">
            Fitness Enthusiast 💪
          </Text>
        </View>

        {/* OPTIONS SECTION */}
        <View className="bg-[#111] rounded-3xl p-5 mb-6">
          <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-[#222]">
            <Text className="text-white">Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-[#222]">
            <Text className="text-white">My Orders</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-4">
            <Text className="text-white">Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-600 py-5 rounded-2xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}