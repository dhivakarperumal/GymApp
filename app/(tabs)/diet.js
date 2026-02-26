import { View, Text, ScrollView } from "react-native";

export default function Diet() {
  return (
    <ScrollView className="flex-1 bg-[#0f0f0f] p-4">
      <Text className="text-white text-2xl mb-5 font-bold">
        Diet Chart 🥗
      </Text>

      {/* 🌅 Morning */}
      <View className="bg-[#1c1c1c] p-4 rounded-xl mb-3">
        <Text className="text-[#ff3c00] text-base mb-1 font-semibold">
          🌅 Morning
        </Text>
        <Text className="text-gray-300">
          Oats + Banana + 5 Almonds
        </Text>
      </View>

      {/* 🍳 Breakfast */}
      <View className="bg-[#1c1c1c] p-4 rounded-xl mb-3">
        <Text className="text-[#ff3c00] text-base mb-1 font-semibold">
          🍳 Breakfast
        </Text>
        <Text className="text-gray-300">
          4 Egg Whites + 2 Brown Bread
        </Text>
      </View>

      {/* 🍛 Lunch */}
      <View className="bg-[#1c1c1c] p-4 rounded-xl mb-3">
        <Text className="text-[#ff3c00] text-base mb-1 font-semibold">
          🍛 Lunch
        </Text>
        <Text className="text-gray-300">
          Rice + Chicken Breast + Vegetables
        </Text>
      </View>

      {/* ☕ Evening */}
      <View className="bg-[#1c1c1c] p-4 rounded-xl mb-3">
        <Text className="text-[#ff3c00] text-base mb-1 font-semibold">
          ☕ Evening
        </Text>
        <Text className="text-gray-300">
          Peanut Butter + Apple
        </Text>
      </View>

      {/* 🍗 Dinner */}
      <View className="bg-[#1c1c1c] p-4 rounded-xl mb-3">
        <Text className="text-[#ff3c00] text-base mb-1 font-semibold">
          🍗 Dinner
        </Text>
        <Text className="text-gray-300">
          2 Chapati + Paneer / Chicken
        </Text>
      </View>

      {/* 🌙 Before Bed */}
      <View className="bg-[#1c1c1c] p-4 rounded-xl mb-3">
        <Text className="text-[#ff3c00] text-base mb-1 font-semibold">
          🌙 Before Bed
        </Text>
        <Text className="text-gray-300">
          1 Glass Milk
        </Text>
      </View>
    </ScrollView>
  );
}