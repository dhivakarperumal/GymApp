import { View, Text } from "react-native";

export default function Dashboard() {
  return (
    <View className="flex-1 bg-gray-100 p-4">
      
      <Text className="text-2xl font-bold mb-4">Welcome Trainer 👋</Text>

      <View className="flex-row justify-between">
        <View className="bg-white p-4 rounded-xl w-[48%] shadow">
          <Text className="text-gray-500">Total Clients</Text>
          <Text className="text-2xl font-bold mt-2">24</Text>
        </View>

        <View className="bg-white p-4 rounded-xl w-[48%] shadow">
          <Text className="text-gray-500">Active Plans</Text>
          <Text className="text-2xl font-bold mt-2">18</Text>
        </View>
      </View>

      <View className="bg-white p-4 rounded-xl shadow mt-4">
        <Text className="text-gray-500">Monthly Earnings</Text>
        <Text className="text-2xl font-bold mt-2">₹45,000</Text>
      </View>

    </View>
  );
}