// import { useEffect, useState } from "react";
// import { View, Text, TouchableOpacity, ScrollView } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { getTrainerWorkouts, getUserAssignment } from "../../services/api";
// import { useAuth } from "../../context/AuthContext";

// export default function Workouts() {
//   const router = useRouter();
//   const { user } = useAuth();

//   const [workouts, setWorkouts] = useState([]);

//   useEffect(() => {
//     if (user) {
//       fetchWorkouts();
//     }
//   }, [user]);

//   const fetchWorkouts = async () => {
//     try {
//       const data = await getTrainerWorkouts();

//       if (!Array.isArray(data)) return;

//       const myWorkouts = data.filter(
//         (item) => item.member_email === user.email,
//       );

//       setWorkouts(myWorkouts);
//     } catch (err) {
//       console.log("Workout fetch error:", err.message);
//     }
//   };
//   return (
//     <ScrollView
//       showsVerticalScrollIndicator={false}
//       className="flex-1 bg-card px-5 pt-12"
//     >
//       <Text className="text-background text-3xl font-extrabold mb-8">
//         Workouts
//       </Text>

//       {workouts.map((item, index) => (
//         <TouchableOpacity
//           key={index}
//           activeOpacity={0.85}
//           className="mb-5"
//           onPress={() =>
//             router.push({
//               pathname: "/Pages/WorkoutDetails",
//               params: { workout: JSON.stringify(item) },
//             })
//           }
//         >
//           <View className="bg-darkcard rounded-2xl p-5 flex-row items-center justify-between border border-border">
//             <View className="flex-row items-center">
//               <View className="bg-card p-4 rounded-2xl mr-4 border border-red-500">
//                 <Ionicons name="fitness-outline" size={22} color="#e11d1d" />
//               </View>

//               <View>
//                 <Text className="text-background text-lg font-semibold">
//                   Level: {item.level}
//                 </Text>

//                 <Text className="text-textSecondary text-xs mt-1">
//                   Duration: {item.duration_weeks} weeks
//                 </Text>
//               </View>
//             </View>

//             <View className="bg-card p-3 rounded-full border border-border">
//               <Ionicons name="chevron-forward" size={18} color="#888" />
//             </View>
//           </View>
//         </TouchableOpacity>
//       ))}

//       {workouts.length === 0 && (
//         <View className="items-center mt-20 px-6">
//           {/* BIG ICON */}
//           <View className="bg-darkcard w-28 h-28 rounded-full items-center justify-center border border-border mb-6">
//             <Ionicons name="barbell-outline" size={50} color="#e11d1d" />
//           </View>

//           {/* TITLE */}
//           <Text className="text-background text-xl font-bold text-center">
//             No Workouts Assigned
//           </Text>

//           {/* SUBTEXT */}
//           <Text className="text-textSecondary text-center mt-2 leading-5">
//             You don't have any workout plans yet. Subscribe to a plan to unlock
//             workouts.
//           </Text>

//           {/* BUTTON */}
//           <TouchableOpacity
//             onPress={() => router.push("/Pages/Pricing")}
//             className="bg-primary px-8 py-4 rounded-xl mt-8"
//           >
//             <Text className="text-white font-bold">View Plans</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <View className="h-10" />
//     </ScrollView>
//   );
// }

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTrainerWorkouts } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";

export default function Workouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [filter, setFilter] = useState("TODAY");

  const workoutData = workouts[0];

  const getFilteredDays = () => {
    if (!workoutData?.days || !workoutData?.created_at) return [];

    const baseDate = dayjs(workoutData.created_at);
    const today = dayjs();

    return Object.entries(workoutData.days).filter(([day, exercises]) => {
      const originalIndex = Number(day.replace("Day", "")) - 1;
      const date = baseDate.add(originalIndex, "day");

      if (filter === "TODAY") {
        return date.isSame(today, "day");
      }

      if (filter === "WEEK") {
        return date.isAfter(today.subtract(7, "day"));
      }

      return true; // ALL
    });
  };

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

  if (workouts.length === 0) {
    return (
      <ScrollView className="flex-1 bg-card px-5 pt-12">
        <Text className="text-background text-3xl font-extrabold mb-8">
          Workouts
        </Text>

        <View className="items-center mt-20 px-6">
          <View className="bg-darkcard w-28 h-28 rounded-full items-center justify-center border border-border mb-6">
            <Ionicons name="barbell-outline" size={50} color="#e11d1d" />
          </View>

          <Text className="text-background text-xl font-bold text-center">
            No Workouts Assigned
          </Text>

          <Text className="text-textSecondary text-center mt-2 leading-5">
            You don't have any workout plans yet. Subscribe to a plan to unlock
            workouts.
          </Text>
        </View>
      </ScrollView>
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
          className="h-[380px] justify-end"
        >
          <View className="absolute inset-0 bg-black/50" />

          <View className="px-5 pb-10">
            <View className="bg-primary px-4 py-1 rounded-full self-start mb-3">
              <Text className="text-white text-xs font-bold">
                {workoutData.level} · {workoutData.duration_weeks} Weeks
              </Text>
            </View>

            <Text className="text-white text-3xl font-extrabold leading-tight">
              {workoutData.member_name}'s Workout
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
        <View className="bg-[#0f0f0f] rounded-t-3xl -mt-6 p-5">
          {/* STATS */}
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

          <View className="flex-row mb-4">
            {["ALL", "TODAY", "WEEK"].map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  filter === f ? "bg-primary" : "bg-[#222]"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    filter === f ? "text-white" : "text-gray-400"
                  }`}
                >
                  {f === "ALL" ? "All" : f === "TODAY" ? "Today" : "This Week"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {getFilteredDays().map(([day, exercises], index) => {
            const originalIndex = Number(day.replace("Day", "")) - 1;

            const formattedDate = dayjs(workoutData.created_at)
              .add(originalIndex, "day")
              .format("DD-MM-YYYY");

            return (
              <View
                key={index}
                className="bg-[#141414] rounded-2xl p-4 mb-4 border border-border"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-primary font-bold text-lg">
                    {formattedDate}
                  </Text>

                  <View className="bg-card px-3 py-1 rounded-full border border-border">
                    <Text className="text-gray-400 text-sm">
                      {exercises.length} Exercise
                    </Text>
                  </View>
                </View>

                {exercises.map((ex, i) => (
                  <View
                    key={i}
                    className="bg-[#1a1a1a] rounded-xl p-3 mb-2 border border-[#222]"
                  >
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-white font-semibold">
                          {ex.name}
                        </Text>

                        <Text className="text-gray-400 text-md mt-2">
                          {ex.type} · {ex.sets} sets · {ex.count} reps
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color="#888" />
                        <Text className="text-gray-400 text-sm ml-1">
                          {ex.time}
                        </Text>
                      </View>
                    </View>

                    {ex.media && ex.mediaType?.includes("image") && (
                      <Image
                        source={{ uri: ex.media }}
                        style={{
                          width: "100%",
                          height: 150,
                          borderRadius: 12,
                          marginTop: 10,
                        }}
                      />
                    )}
                  </View>
                ))}
              </View>
            );
          })}

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
