import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function More() {
  return (
    <View className="flex-1 bg-[#0f0f0f] p-4">
      <Text className="text-white text-2xl mb-5 font-bold">
        More
      </Text>

      {/* 👤 Profile */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="person-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>

      {/* 📦 My Orders */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="bag-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">My Orders</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>

      {/* 🏋️ Membership */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="fitness-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Membership</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>

      {/* ⚙️ Settings */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="settings-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>
    </View>
  );
}