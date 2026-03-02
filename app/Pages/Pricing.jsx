import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { getAllPlans } from "../../services/api";
import React, { useEffect, useState } from "react";

export default function Pricing() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getAllPlans(); // no token if public
      console.log("PLANS API:", data);

      // ensure array
      if (Array.isArray(data)) {
        setPlans(data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.log("Plans fetch error:", err.message);
      setPlans([]);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#0f0f0f] px-5 pt-12"
    >
      {/* Header */}
      <Text className="text-white text-3xl font-extrabold mb-2">
        Membership Plans
      </Text>
      <Text className="text-gray-400 mb-10">
        Choose the perfect plan for your fitness journey
      </Text>

      {plans.length === 0 && (
        <Text className="text-gray-400 text-center mt-10">
          No plans available
        </Text>
      )}

      {plans.map((plan, index) => (
        <View key={plan.id || index} className="mb-8">
          {/* Glow Layer */}
          <View className="absolute -inset-1 bg-[#ff3c00]/10 rounded-3xl blur-xl" />

          {/* Card */}
          <View className="bg-[#161616] rounded-3xl p-7 border border-[#2a2a2a]">
            {/* Plan Name */}
            <Text className="text-white text-2xl font-bold mb-2">
              {plan?.name}
            </Text>

            {/* Description */}
            <Text className="text-gray-400 text-sm mb-4">
              {plan?.description}
            </Text>

            {/* Price Section */}
            <View className="mb-6">
              <Text className="text-[#ff3c00] text-5xl font-extrabold">
                ₹{Number(plan?.price || 0).toLocaleString()}
              </Text>

              <Text className="text-gray-400 mt-1 text-base">
                / {plan?.duration}
              </Text>

              {/* Discount */}
              {plan?.discount && Number(plan.discount) > 0 && (
                <Text className="text-green-400 text-sm mt-2">
                  {plan.discount}% OFF
                </Text>
              )}
            </View>

            {/* Trainer Status */}
            <View className="mb-6">
              {plan?.trainer_included === 1 ? (
                <View className="bg-green-600/20 px-4 py-1.5 rounded-full self-start">
                  <Text className="text-green-400 text-xs font-semibold">
                    Trainer Included
                  </Text>
                </View>
              ) : (
                <View className="bg-[#222] px-4 py-1.5 rounded-full self-start border border-[#333]">
                  <Text className="text-gray-400 text-xs font-semibold">
                    Trainer Not Included
                  </Text>
                </View>
              )}
            </View>

            {/* Facilities (From DB) */}
            <View className="mb-8">
              {Array.isArray(plan?.facilities) &&
                plan.facilities.map((facility, i) => (
                  <View key={i} className="flex-row items-center mb-3">
                    <View className="w-2.5 h-2.5 bg-[#ff3c00] rounded-full mr-3" />
                    <Text className="text-gray-300 text-sm tracking-wide">
                      {facility}
                    </Text>
                  </View>
                ))}
            </View>

            {/* Button */}
            <TouchableOpacity className="bg-[#ff3c00] py-4 rounded-2xl items-center shadow-xl">
              <Text className="text-black font-bold text-base tracking-wide">
                Choose Plan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View className="h-10" />
    </ScrollView>
  );
}
