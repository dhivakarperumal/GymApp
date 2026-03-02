import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

const mockDietData = {
  January: [
    {
      week: "Week 1",
      meals: [
        { name: "Breakfast", value: "Oats + Banana + Almonds" },
        { name: "Lunch", value: "Brown Rice + Chicken + Veggies" },
        { name: "Dinner", value: "Grilled Fish + Salad" },
      ],
    },
    {
      week: "Week 2",
      meals: [
        { name: "Breakfast", value: "Egg Whites + Toast" },
        { name: "Lunch", value: "Quinoa + Paneer + Veggies" },
        { name: "Dinner", value: "Soup + Boiled Eggs" },
      ],
    },
  ],
};

export default function DietChartScreen() {
  const [selectedMonth, setSelectedMonth] = useState("January");

  return (
    <ScrollView
      className="flex-1 bg-[#0f0f0f] px-5 pt-12"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text className="text-white text-3xl font-extrabold mb-6">
        Monthly Diet Plan
      </Text>

      {/* Month Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-8"
      >
        {months.map((month, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedMonth(month)}
            className={`mr-3 px-5 py-2 rounded-full ${
              selectedMonth === month
                ? "bg-red-600"
                : "bg-[#1c1c1c] border border-[#262626]"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedMonth === month
                  ? "text-white"
                  : "text-gray-400"
              }`}
            >
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Weekly Diet Cards */}
      {mockDietData[selectedMonth]?.map((weekItem, index) => (
        <View
          key={index}
          className="bg-[#1c1c1c] rounded-2xl p-5 mb-6 border border-[#262626]"
        >
          {/* Week Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-bold">
              {weekItem.week}
            </Text>

            <View className="bg-black p-2 rounded-full border border-red-500">
              <Ionicons
                name="restaurant-outline"
                size={18}
                color="#ff3c00"
              />
            </View>
          </View>

          {/* Meals */}
          {weekItem.meals.map((meal, i) => (
            <View
              key={i}
              className="bg-black rounded-xl p-4 mb-3 border border-[#2a2a2a]"
            >
              <Text className="text-red-500 text-xs font-semibold mb-1">
                {meal.name}
              </Text>
              <Text className="text-gray-300 text-sm">
                {meal.value}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <View className="h-10" />
    </ScrollView>
  );
}