import { View, Text, ScrollView, TouchableOpacity } from "react-native";

const plans = [
  {
    name: "Functional Training",
    price: 36999,
    duration: "1 Year",
    trainer: false,
    features: [
      "Functional Circuits",
      "Core Training",
      "Fat Burn Sessions",
      "Mobility Exercises",
    ],
  },
  {
    name: "Strength Training",
    price: 11499,
    duration: "6 Months",
    trainer: false,
    popular: true,
    features: [
      "Compound Lifts",
      "Strength Cycles",
      "Form Correction",
      "Performance Tracking",
    ],
  },
  {
    name: "Weight Loss Training",
    price: 7999,
    duration: "3 Months",
    trainer: true,
    features: [
      "Cardio & HIIT",
      "Fat Loss Program",
      "Diet Guidance",
      "Progress Tracking",
    ],
  },
];

export default function Pricing() {
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

      {plans.map((plan, index) => (
        <View key={index} className="mb-8">

          {/* Glow Layer */}
          <View className="absolute -inset-1 bg-[#ff3c00]/10 rounded-3xl blur-xl" />

          {/* Card */}
          <View className="bg-[#161616] rounded-3xl p-7 border border-[#2a2a2a]">

            {/* Popular Badge */}
            {plan.popular && (
              <View className="self-end bg-[#ff3c00] px-5 py-1.5 rounded-full mb-4 shadow-lg">
                <Text className="text-black text-xs font-bold tracking-wider">
                  MOST POPULAR
                </Text>
              </View>
            )}

            {/* Plan Name */}
            <Text className="text-white text-2xl font-bold mb-4">
              {plan.name}
            </Text>

            {/* Price Section */}
            <View className="mb-6">
              <Text className="text-[#ff3c00] text-5xl font-extrabold">
                ₹{plan.price.toLocaleString()}
              </Text>
              <Text className="text-gray-400 mt-1 text-base">
                / {plan.duration}
              </Text>
            </View>

            {/* Trainer Status */}
            <View className="mb-6">
              {plan.trainer ? (
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

            {/* Features */}
            <View className="mb-8">
              {plan.features.map((feature, i) => (
                <View key={i} className="flex-row items-center mb-3">
                  <View className="w-2.5 h-2.5 bg-[#ff3c00] rounded-full mr-3" />
                  <Text className="text-gray-300 text-sm tracking-wide">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* Premium Button */}
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