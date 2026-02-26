import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Workouts() {
  return (
    <ScrollView className="flex-1 bg-[#0f0f0f] p-4">
      <Text className="text-white text-2xl mb-5 font-bold">
        Workouts
      </Text>

      {/* 🟥 Chest */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="fitness-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Chest</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>

      {/* 🟦 Back */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="body-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Back</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>

      {/* 🟩 Legs */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="walk-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Legs</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>

      {/* 🟨 Shoulder */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="barbell-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Shoulder</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>

      {/* 🟪 Arms */}
      <TouchableOpacity className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="hand-left-outline" size={20} color="#ff3c00" />
          <Text className="text-gray-300 text-base">Arms</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </TouchableOpacity>
    </ScrollView>
  );
}