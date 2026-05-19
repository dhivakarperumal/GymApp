import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllStaffs } from "../../services/api";
import BackButton from "../BackButton";

export default function Trainers() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStaffs();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>

      {/* HEADER ROW */}
      <View style={{
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
        backgroundColor: "#000", borderBottomWidth: 1, borderBottomColor: "#111",
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <BackButton style={{ marginRight: 12 }} />
          <View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>Elite Trainers</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Certified Professionals</Text>
          </View>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e11d1d", alignItems: "center", justifyContent: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}>
          <Ionicons name="people-outline" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e11d1d"
          />
        }
      >

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
