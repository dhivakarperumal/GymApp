import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Diet() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0f0f0f] p-4 justify-center">

      <TouchableOpacity
        onPress={() => router.push("/trainerdiet/dietplan")}
        className="bg-red-600 p-5 rounded-xl items-center"
      >
        <Text className="text-white text-lg font-bold">
          All Diet Plans
        </Text>
      </TouchableOpacity>

    </View>
  );
}