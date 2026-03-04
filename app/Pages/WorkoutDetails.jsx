import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutDetails() {
  const router = useRouter();
  const { workout } = useLocalSearchParams();

  const workoutData = useMemo(() => {
    return workout ? JSON.parse(workout) : null;
  }, [workout]);

  if (!workoutData) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Workout not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HERO IMAGE */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e",
          }}
          className="h-[380px] justify-between"
        >
          {/* DARK OVERLAY */}
          <View className="absolute inset-0 bg-black/50" />

          {/* TOP BUTTONS */}
          <View className="flex-row justify-between mt-4 px-5">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-black/70 p-3 rounded-full border border-border"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-black/70 p-3 rounded-full border border-border">
              <Ionicons name="ellipsis-vertical" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* HERO CONTENT */}
          <View className="px-5 pb-10">
            <View className="bg-primary px-4 py-1 rounded-full self-start mb-3">
              <Text className="text-white text-xs font-bold">
                {workoutData.category.toUpperCase()} · {workoutData.goal.toUpperCase()}
              </Text>
            </View>

            <Text className="text-white text-3xl font-extrabold leading-tight">
              {workoutData.category.toUpperCase()} WORKOUT
            </Text>

            <View className="flex-row items-center mt-3 mb-12">
              <Ionicons name="barbell-outline" size={16} color="#ff3c00" />
              <Text className="text-gray-300 text-md ml-2">
                {workoutData.duration_weeks} Weeks · {workoutData.level}
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* CONTENT */}
        <View className="bg-[#0f0f0f] h-full rounded-t-3xl -mt-6 p-5">

          {/* PREMIUM STATS */}
          <View className="flex-row justify-between mb-6">

            <View className="bg-[#141414] border border-border rounded-2xl px-5 py-4 items-center w-[30%]">
              <Ionicons name="person-outline" size={18} color="#ff3c00" />
              <Text className="text-gray-400 text-xs mt-1">Trainer</Text>
              <Text className="text-white font-bold text-sm">
                {workoutData.trainer_name}
              </Text>
            </View>

            <View className="bg-[#141414] border border-border rounded-2xl px-5 py-4 items-center w-[30%]">
              <Ionicons name="fitness-outline" size={18} color="#ff3c00" />
              <Text className="text-gray-400 text-xs mt-1">Level</Text>
              <Text className="text-white font-bold text-sm">
                {workoutData.level}
              </Text>
            </View>

            <View className="bg-[#141414] border border-border rounded-2xl px-5 py-4 items-center w-[30%]">
              <Ionicons name="time-outline" size={18} color="#ff3c00" />
              <Text className="text-gray-400 text-xs mt-1">Duration</Text>
              <Text className="text-white font-bold text-sm">
                {workoutData.duration_weeks}w
              </Text>
            </View>

          </View>

          {/* WEEKLY SCHEDULE */}
          <Text className="text-white text-xl font-bold mb-4">
            Weekly Schedule
          </Text>

          {Object.entries(workoutData.days || {}).map(([day, exercises], index) => (
            <View
              key={index}
              className="bg-[#141414] rounded-2xl p-4 mb-4 border border-border"
            >

              {/* DAY HEADER */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-primary font-bold text-lg">
                  {day}
                </Text>

                <View className="bg-card px-3 py-1 rounded-full border border-border">
                  <Text className="text-gray-400 text-xs">
                    {exercises.length} Exercise
                  </Text>
                </View>
              </View>

              {/* EXERCISES */}
              {exercises.map((ex, i) => (
                <View
                  key={i}
                  className="flex-row justify-between items-center py-2 border-b border-[#222]"
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="barbell-outline"
                      size={16}
                      color="#ff3c00"
                    />
                    <Text className="text-white ml-2">
                      {ex.name}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color="#888"
                    />
                    <Text className="text-gray-400 text-xs ml-1">
                      {ex.time}
                    </Text>
                  </View>
                </View>
              ))}

            </View>
          ))}

          <View className="h-20" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}