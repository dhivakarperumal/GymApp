import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { getDietPlans } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

export default function DietChartScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [diet, setDiet] = useState(null);
  const [title, setTitle] = useState("");

  const fetchDietPlan = async () => {
    try {
      const data = await getDietPlans();

      if (!Array.isArray(data)) return;

      const myDiet = data.find((item) => item.member_email === user.email);

      if (myDiet) {
        setTitle(myDiet.title);
        setDiet(myDiet.days); // store ALL days
      }
    } catch (err) {
      console.log("Diet fetch error:", err);
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
      <Text className="text-white text-3xl font-extrabold mb-2">
        My Diet Plan
      </Text>

      {title && <Text className="text-gray-400 mb-6">{title}</Text>}

      {diet &&
        Object.entries(diet).map(([day, meals]) => (
          <View
            key={day}
            className="bg-[#1c1c1c] rounded-2xl p-5 border border-[#262626] mb-6"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold">{day} Meals</Text>

              <Ionicons name="restaurant-outline" size={18} color="#ff3c00" />
            </View>

            {Object.entries(meals).map(([meal, value]) => (
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
        ))}

      {!diet && (
        <View className="items-center mt-16">
          {/* BIG ICON */}
          <View className="bg-[#1c1c1c] p-6 rounded-full mb-6 border border-[#262626]">
            <Ionicons name="nutrition-outline" size={70} color="#e11d1d" />
          </View>

          <Text className="text-white text-lg font-semibold mb-2">
            No Diet Plan Assigned
          </Text>

          <Text className="text-gray-400 text-center mb-6 px-10">
            Purchase a premium plan to unlock your personalized diet chart
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/Pages/Pricing")}
            className="bg-primary px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">View Pricing Plans</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="h-20" />
    </ScrollView>
  );
}
