import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ImageBackground,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllFacilities } from "../../services/api";
import BackButton from "../BackButton";

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const data = await getAllFacilities();
      if (Array.isArray(data)) {
        setFacilities(data);
      } else {
        setFacilities([]);
      }
    } catch (err) {
      console.log("Facilities fetch error:", err.message);
      setFacilities([]);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFacilities();
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
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>Our Facilities</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Premium Workout Zones</Text>
          </View>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e11d1d", alignItems: "center", justifyContent: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}>
          <Ionicons name="barbell-outline" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e11d1d"
          />
        }
      >

        {facilities.length === 0 && (
          <Text className="text-gray-400 text-center mt-10">
            No facilities available
          </Text>
        )}

        {facilities.map((item, index) => (
          <View
            key={item.id || index}
            className="mb-10 rounded-3xl overflow-hidden border border-border"
            style={{
              shadowColor: "#ff3c00",
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <ImageBackground
              source={{ uri: item.hero_image }}
              className="h-72 justify-end"
            >
              {/* Premium Gradient */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.85)"]}
                locations={[0, 0.5, 1]}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "70%",
                }}
              />

              <View className="p-6">
                <Text className="text-white text-2xl font-extrabold mb-3">
                  {item.title}
                </Text>

                <Text className="text-gray-300 text-base mb-6">
                  {item.short_description}
                </Text>

                <TouchableOpacity
                  onPress={() => router.push(`/facilities/${item.slug}`)}
                  className="flex-row items-center"
                >
                  <Text className="text-primary font-semibold mr-2 tracking-wide">
                    VIEW DETAILS
                  </Text>
                  <View className="border border-primary p-2 ml-3 rounded-full">
                    <Ionicons name="arrow-forward" size={18} color="#e11d1d" />
                  </View>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
