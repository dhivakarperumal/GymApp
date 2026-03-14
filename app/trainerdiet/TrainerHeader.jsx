import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainerHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-[#0f0f0f] px-4 pb-3 flex-row items-center justify-between"
    >
      {/* LOGO */}
      <TouchableOpacity onPress={() => router.push("/(trainers)/dashboard")}>
        <Image
          source={require("../../assets/images/logo_dark.png")}
          className="w-20 h-11"
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* HEADER ICONS */}
      <View className="flex-row items-center">
        <TouchableOpacity
          className="mr-5"
          onPress={() => router.push("/(trainers)/clients")}
        >
          <Ionicons name="people-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          className="mr-5"
          onPress={() => router.push("/(trainers)/earnings")}
        >
          <Ionicons name="wallet-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(trainers)/profile")}
        >
          <View className="w-9 h-9 rounded-full bg-red-600 items-center justify-center">
            <Text className="text-white font-bold">T</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}