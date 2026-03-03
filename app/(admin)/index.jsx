import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 p-4">

      <Text className="text-2xl font-bold mb-4">
        Admin Dashboard
      </Text>

      {/* Stats Cards */}
      <View className="flex-row justify-between mb-4">
        <View className="bg-white p-4 rounded-xl w-[48%] shadow">
          <Text className="text-gray-500">Total Users</Text>
          <Text className="text-xl font-bold mt-1">1,240</Text>
        </View>

        <View className="bg-white p-4 rounded-xl w-[48%] shadow">
          <Text className="text-gray-500">Orders</Text>
          <Text className="text-xl font-bold mt-1">320</Text>
        </View>
      </View>

      <View className="bg-white p-4 rounded-xl shadow mb-4">
        <Text className="text-gray-500">Revenue</Text>
        <Text className="text-xl font-bold mt-1">₹ 85,000</Text>
      </View>

      <View className="bg-white p-4 rounded-xl shadow">
        <Text className="text-gray-500">Active Plans</Text>
        <Text className="text-xl font-bold mt-1">180</Text>
      </View>

      </ScrollView>
    </SafeAreaView>
  );
}