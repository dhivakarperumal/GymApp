import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { getDietPlans } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function DietChartScreen() {

  const { user } = useAuth();

  const [diet, setDiet] = useState(null);
  const [title, setTitle] = useState("");

  const fetchDietPlan = async () => {
    try {

      console.log("🔹 USER 👉", user);

      const data = await getDietPlans(); // fetch all diets

      console.log("🔹 DIETS 👉", data);

      if (!Array.isArray(data)) return;

      const myDiet = data.find(
        (item) => item.member_email === user.email
      );

      console.log("🔹 MATCHED DIET 👉", myDiet);

      if (myDiet) {

        setTitle(myDiet.title);
        setDiet(myDiet.days.Day1);

      }

    } catch (err) {

      console.log("❌ Diet fetch error:", err);

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

      {title && (
        <Text className="text-gray-400 mb-6">
          {title}
        </Text>
      )}

      {diet && (
        <View className="bg-[#1c1c1c] rounded-2xl p-5 border border-[#262626]">

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-bold">
              Day 1 Meals
            </Text>

            <Ionicons
              name="restaurant-outline"
              size={18}
              color="#ff3c00"
            />
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

      {!diet && (
        <Text className="text-gray-400 mt-5">
          No diet plan assigned
        </Text>
      )}

      <View className="h-20" />

    </ScrollView>
  );
}