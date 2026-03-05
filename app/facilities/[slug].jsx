import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getAllFacilities } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Header";

const { width } = Dimensions.get("window");

export default function FacilityDetails() {
  const { slug } = useLocalSearchParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacility();
  }, [slug]);

  const fetchFacility = async () => {
    try {
      const data = await getAllFacilities();
      if (Array.isArray(data)) {
        const found = data.find((item) => item.slug === slug);
        setFacility(found || null);
      }
    } catch (err) {
      console.log("Facility detail error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ff3c00" />
      </SafeAreaView>
    );
  }

  if (!facility) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Facility not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Header />
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-black pt-12"
    >
      {/* Hero Image */}
      <View className="px-5 pt-6">
        <Image
          source={{ uri: facility.hero_image }}
          style={{
            width: width - 40,
            height: 280,
            borderRadius: 24,
          }}
          resizeMode="cover"
        />
      </View>

      <View className="px-5 py-8">

        {/* Title */}
        <Text className="text-white text-3xl font-extrabold mb-3">
          {facility.title}
        </Text>

        {/* Short Description */}
        <Text className="text-gray-400 mb-6">
          {facility.short_description}
        </Text>

        {/* Full Description */}
        <Text className="text-gray-300 leading-6 mb-10">
          {facility.description}
        </Text>

        {/* Equipments */}
        {Array.isArray(facility.equipments) &&
          facility.equipments.length > 0 && (
            <View className="mb-10">
              <Text className="text-primary text-lg font-bold mb-5">
                Equipments Available
              </Text>

              {facility.equipments.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center mb-4 bg-[#141414] p-4 rounded-2xl border border-[#262626]"
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#ff3c00"
                    style={{ marginRight: 10 }}
                  />
                  <Text className="text-gray-300">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          )}

        {/* Workouts */}
        {Array.isArray(facility.workouts) &&
          facility.workouts.length > 0 && (
            <View className="mb-10">
              <Text className="text-primary text-lg font-bold mb-5">
                Supported Workouts
              </Text>

              {facility.workouts.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center mb-4 bg-[#141414] p-4 rounded-2xl border border-[#262626]"
                >
                  <Ionicons
                    name="fitness"
                    size={20}
                    color="#ff3c00"
                    style={{ marginRight: 10 }}
                  />
                  <Text className="text-gray-300">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          )}

        {/* Gallery */}
        {Array.isArray(facility.gallery) &&
          facility.gallery.length > 0 && (
            <View className="mb-10">
              <Text className="text-primary text-2xl font-bold mb-5">
                Gallery
              </Text>

              {facility.gallery.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={{
                    width: width - 40,
                    height: 200,
                    borderRadius: 20,
                    marginBottom: 15,
                  }}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

      </View>

      <View className="h-10" />
    </ScrollView>
    </SafeAreaView>
  );
}