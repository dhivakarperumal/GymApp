import { View, Text, ScrollView } from "react-native";

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-[#0f0f0f] p-4">
      <Text className="text-white text-2xl mb-5 font-bold">
        Welcome 💪
      </Text>

      {/* 🏋️ Workout Card */}
      <View className="bg-[#1c1c1c] p-4 rounded-xl mb-4">
        <Text className="text-[#ff3c00] text-lg mb-1 font-semibold">
          Today Workout
        </Text>
        <Text className="text-gray-300">
          Chest & Triceps
        </Text>
      </View>

      {/* 🛒 Featured Products */}
      <View className="bg-[#1c1c1c] p-4 rounded-xl mb-4">
        <Text className="text-[#ff3c00] text-lg mb-1 font-semibold">
          Featured Products
        </Text>
        <Text className="text-gray-300">
          Protein • Gloves • Shaker
        </Text>
      </View>
    </ScrollView>
  );
}