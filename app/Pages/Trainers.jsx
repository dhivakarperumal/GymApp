import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getAllStaffs } from "../../services/api"; // adjust path
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Header";
import BackButton from "../BackButton";

export default function Trainers() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const data = await getAllStaffs();
        const staffList = data.staff || data;

        // Show only trainers
        const trainersOnly = staffList.filter(
          (item) => item.role?.toLowerCase() === "trainer",
        );

        setStaffs(trainersOnly);
      } catch (error) {
        console.log("Error fetching staffs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-darkBg">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-darkBg px-5"
      >
        <BackButton style={{ marginTop: 20, marginBottom: 20 }} />
        <Text className="text-white text-3xl font-extrabold mb-2">
          Elite Trainers
        </Text>
        <Text className="text-textSecondary mb-8 text-sm tracking-wide">
          Train with certified professionals
        </Text>

        {loading && <ActivityIndicator size="large" color="#ff3c00" />}

        {!loading &&
          staffs.map((trainer) => {
            // ✅ DEFINE imageUri HERE
            const imageUri = trainer.photo
              ? trainer.photo.startsWith("data:image")
                ? trainer.photo
                : `data:image/png;base64,${trainer.photo}`
              : "https://via.placeholder.com/300";

            return (
              <TouchableOpacity
                key={trainer.id}
                // onPress={() =>
                //   router.push({
                //     pathname: "/trainer-details",
                //     params: { id: trainer.id },
                //   })
                // }
                className="mb-6 bg-darkBg rounded-3xl overflow-hidden border border-[#1f1f1f]"
              >
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-60"
                  resizeMode="cover"
                />

                <View className="p-5">
                  <Text className="text-white text-xl font-bold">
                    {trainer.name}
                  </Text>

                  <Text className="text-primary text-sm mt-1">
                    {trainer.department}
                  </Text>

                  <View className="mt-3 flex-row justify-between">
                    <Text className="text-gray-400 text-xs">
                      Shift: {trainer.shift}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {trainer.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
