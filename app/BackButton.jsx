import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BackButton({ style }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.8}
      className="w-12 h-12 rounded-full justify-center items-center border border-primary"
      style={[
        {
          backgroundColor: "#111111",
          shadowColor: "#e11d1d",
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 8,
        },
        style,
      ]}
    >
      <Ionicons name="arrow-back" size={22} color="#ffffff" />
    </TouchableOpacity>
  );
}