import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100 p-4 items-center">
      
      <View className="w-24 h-24 rounded-full bg-green-500 items-center justify-center mb-4">
        <Text className="text-white text-3xl font-bold">T</Text>
      </View>

      <Text className="text-xl font-bold">Trainer Name</Text>
      <Text className="text-gray-500 mb-6">trainer@email.com</Text>

      <TouchableOpacity
        onPress={() => router.replace("/")}
        className="bg-red-500 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>

    </View>
  );
}