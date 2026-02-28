import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const workouts = [
  { name: "Chest", icon: "fitness-outline" },
  { name: "Back", icon: "body-outline" },
  { name: "Legs", icon: "walk-outline" },
  { name: "Shoulder", icon: "barbell-outline" },
  { name: "Arms", icon: "hand-left-outline" },
];

export default function Workouts() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#0f0f0f] px-5 pt-12"
    >
      {/* Title */}
      <Text className="text-white text-3xl font-extrabold mb-8">
        Workouts
      </Text>

      {workouts.map((item, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.85}
          className="mb-5"
        >
          <View className="bg-[#1c1c1c] rounded-2xl p-5 flex-row items-center justify-between border border-[#262626]">
            
            {/* Left Section */}
            <View className="flex-row items-center">
              
              {/* Icon Circle */}
              <View className="bg-black p-4 rounded-2xl mr-4 border border-red-500">
                <Ionicons
                  name={item.icon}
                  size={22}
                  color="#ff3c00"
                />
              </View>

              {/* Text */}
              <View>
                <Text className="text-white text-lg font-semibold">
                  {item.name}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  Strength & Conditioning
                </Text>
              </View>
            </View>

            {/* Right Arrow */}
            <View className="bg-black p-3 rounded-full border border-[#2a2a2a]">
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#888"
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View className="h-10" />
    </ScrollView>
  );
}