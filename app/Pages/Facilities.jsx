import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAllFacilities } from "../../services/api";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Header";
import BackButton from "../BackButton";

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
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
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <BackButton style={{ marginTop: 20, marginBottom: 20 }} />
        {/* Header */}
        <Text className="text-white text-3xl font-extrabold mb-2">
          Our Facilities
        </Text>
        <Text className="text-gray-400 mb-8">
          Train in world-class premium workout zones
        </Text>

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
