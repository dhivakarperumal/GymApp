import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const workouts = [
  { name: "Chest", icon: "fitness-outline" },
  { name: "Back", icon: "body-outline" },
  { name: "Legs", icon: "walk-outline" },
  { name: "Shoulder", icon: "barbell-outline" },
  { name: "Arms", icon: "hand-left-outline" },
];

export default function Workouts() {

  const router = useRouter(); 

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-card px-5 pt-12"
    >
      {/* Title */}
      <Text className="text-background text-3xl font-extrabold mb-8">
        Workouts
      </Text>

      {workouts.map((item, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.85}
          className="mb-5"
          onPress={() => router.push("/Pages/WorkoutDetails")}
        >
          <View className="bg-darkcard rounded-2xl p-5 flex-row items-center justify-between border border-border">
            
            {/* Left Section */}
            <View className="flex-row items-center">
              
              {/* Icon Circle */}
              <View className="bg-card p-4 rounded-2xl mr-4 border border-red-500">
                <Ionicons
                  name={item.icon}
                  size={22}
                  color="#e11d1d"
                />
              </View>

              {/* Text */}
              <View>
                <Text className="text-background text-lg font-semibold">
                  {item.name}
                </Text>
                <Text className="text-textSecondary text-xs mt-1">
                  Strength & Conditioning
                </Text>
              </View>
            </View>

            {/* Right Arrow */}
            <View className="bg-card p-3 rounded-full border border-border">
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