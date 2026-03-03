import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function AdminDashboard() {
  const router = useRouter();

  const goHome = () => {
    router.replace("/(tabs)"); // ✅ change this if needed
  };

  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-8">
        Admin Dashboard 👑
      </Text>

      <TouchableOpacity
        onPress={goHome}
        className="bg-red-600 px-8 py-4 rounded-full"
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-bold">
          Go To Home
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}