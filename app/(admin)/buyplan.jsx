import { View, Text, TouchableOpacity } from "react-native";

export default function BuyPlan() {
  return (
    <View className="flex-1 bg-gray-100 p-4">

      <Text className="text-2xl font-bold mb-4">
        Subscription Plans
      </Text>

      <View className="bg-white p-5 rounded-xl shadow mb-4">
        <Text className="text-lg font-semibold">Basic Plan</Text>
        <Text className="text-gray-500 mt-1">₹499 / month</Text>

        <TouchableOpacity className="mt-3 bg-blue-600 py-2 rounded-lg items-center">
          <Text className="text-white font-semibold">
            Manage Plan
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white p-5 rounded-xl shadow">
        <Text className="text-lg font-semibold">Premium Plan</Text>
        <Text className="text-gray-500 mt-1">₹999 / month</Text>

        <TouchableOpacity className="mt-3 bg-blue-600 py-2 rounded-lg items-center">
          <Text className="text-white font-semibold">
            Manage Plan
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}