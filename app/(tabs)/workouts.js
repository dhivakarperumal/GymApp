import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getTrainerWorkouts, getUserAssignment } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Workouts() {
  const router = useRouter();
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      const data = await getTrainerWorkouts();

      if (!Array.isArray(data)) return;

      const myWorkouts = data.filter(
        (item) => item.member_email === user.email,
      );

      setWorkouts(myWorkouts);
    } catch (err) {
      console.log("Workout fetch error:", err.message);
    }
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-card px-5 pt-12"
    >
      <Text className="text-background text-3xl font-extrabold mb-8">
        Workouts
      </Text>

      {workouts.map((item, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.85}
          className="mb-5"
          onPress={() =>
            router.push({
              pathname: "/Pages/WorkoutDetails",
              params: { workout: JSON.stringify(item) },
            })
          }
        >
          <View className="bg-darkcard rounded-2xl p-5 flex-row items-center justify-between border border-border">
            <View className="flex-row items-center">
              <View className="bg-card p-4 rounded-2xl mr-4 border border-red-500">
                <Ionicons name="fitness-outline" size={22} color="#e11d1d" />
              </View>

              <View>
                <Text className="text-background text-lg font-semibold">
                  {item.category}
                </Text>

                <Text className="text-textSecondary text-xs mt-1">
                  {item.goal}
                </Text>
              </View>
            </View>

            <View className="bg-card p-3 rounded-full border border-border">
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {workouts.length === 0 && (
        <View className="items-center mt-20 px-6">
          {/* BIG ICON */}
          <View className="bg-darkcard w-28 h-28 rounded-full items-center justify-center border border-border mb-6">
            <Ionicons name="barbell-outline" size={50} color="#e11d1d" />
          </View>

          {/* TITLE */}
          <Text className="text-background text-xl font-bold text-center">
            No Workouts Assigned
          </Text>

          {/* SUBTEXT */}
          <Text className="text-textSecondary text-center mt-2 leading-5">
            You don't have any workout plans yet. Subscribe to a plan to unlock
            workouts.
          </Text>

          {/* BUTTON */}
          <TouchableOpacity
            onPress={() => router.push("/Pages/Pricing")}
            className="bg-primary px-8 py-4 rounded-xl mt-8"
          >
            <Text className="text-white font-bold">View Plans</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}
