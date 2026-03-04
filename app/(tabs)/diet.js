import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { getDietPlans, getUserAssignment } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function DietChartScreen() {

  const { user } = useAuth();

  const [diet, setDiet] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDietPlan = async () => {
    try {

      // 1️⃣ Get assignments
      const assignments = await getUserAssignment();

      console.log("ASSIGNMENTS 👉", assignments);
      console.log("USER 👉", user);

      // 2️⃣ Find logged user's assignment
      const myAssignment = assignments.find(
        (item) => item.userEmail === user.email
      );

      if (!myAssignment) {
        setLoading(false);
        return;
      }

      // 3️⃣ Get trainerId from assignment
      const trainerId = myAssignment.trainerId;

      // 4️⃣ Fetch diet plans for that trainer
      const dietPlans = await getDietPlans(trainerId);

      console.log("DIET API 👉", dietPlans);

      // 5️⃣ Find diet for the assigned member
      const myDiet = dietPlans.find(
        (item) => item.member_id === myAssignment.userId
      );

      if (myDiet) {
        setTitle(myDiet.title);
        setDiet(myDiet.days.Day1);
      }

      setLoading(false);

    } catch (err) {
      console.log("Diet fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDietPlan();
    }
  }, [user]);

  return (
    <ScrollView
      className="flex-1 bg-[#0f0f0f] px-5 pt-12"
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <Text className="text-white text-3xl font-extrabold mb-2">
        My Diet Plan
      </Text>

      {/* Loading */}
      {loading && (
        <Text className="text-gray-400 mt-4">
          Loading diet plan...
        </Text>
      )}

      {/* Title */}
      {title && (
        <Text className="text-gray-400 mb-6">
          {title}
        </Text>
      )}

      {/* Diet */}
      {diet && (
        <View className="bg-[#1c1c1c] rounded-2xl p-5 border border-[#262626]">

          <View className="flex-row items-center justify-between mb-4">

            <Text className="text-white text-lg font-bold">
              Day 1 Meals
            </Text>

            <View className="bg-black p-2 rounded-full border border-red-500">
              <Ionicons
                name="restaurant-outline"
                size={18}
                color="#ff3c00"
              />
            </View>

          </View>

          {Object.entries(diet).map(([meal, value]) => (

            <View
              key={meal}
              className="bg-black rounded-xl p-4 mb-3 border border-[#2a2a2a]"
            >

              <Text className="text-red-500 text-xs font-semibold mb-1">
                {meal}
              </Text>

              <Text className="text-gray-300 text-sm">
                {value.food} ({value.quantity})
              </Text>

              <Text className="text-gray-500 text-xs mt-1">
                {value.calories} calories
              </Text>

            </View>

          ))}

        </View>
      )}

      {/* No Diet */}
      {!diet && !loading && (
        <Text className="text-gray-400 mt-4">
          No diet plan assigned
        </Text>
      )}

      <View className="h-20" />

    </ScrollView>
  );
}