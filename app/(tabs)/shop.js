import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Shop() {
  return (
    <ScrollView className="flex-1 bg-[#0f0f0f] p-4">
      <Text className="text-white text-2xl mb-5 font-bold">
        Shop
      </Text>

      {/* 🥤 Whey Protein */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="barbell-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Whey Protein</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>

      {/* ⚡ Creatine */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="flash-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Creatine</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>

      {/* 🧤 Gym Gloves */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="hand-left-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Gym Gloves</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>
    </ScrollView>
  );
}