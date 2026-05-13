import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/workouts");
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      <ActivityIndicator size="large" color="#e11d1d" />
    </View>
  );
}
