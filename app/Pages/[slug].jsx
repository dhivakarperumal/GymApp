import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getAllServices } from "../../services/api";

const { width } = Dimensions.get("window");

export default function ServiceDetails() {
  const { slug } = useLocalSearchParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, [slug]);

  const fetchService = async () => {
    try {
      const data = await getAllServices();

      if (Array.isArray(data)) {
        const found = data.find((item) => item.slug === slug);
        setService(found || null);
      }
    } catch (err) {
      console.log("Service detail error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0a0a] justify-center items-center">
        <ActivityIndicator size="large" color="#ff3c00" />
      </View>
    );
  }

  if (!service) {
    return (
      <View className="flex-1 bg-[#0a0a0a] justify-center items-center">
        <Text className="text-white">Service not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#0a0a0a]"
    >
      <View className="px-5 pt-10">
        <Image
          source={{ uri: service.hero_image }}
          style={{
            width: width - 40,
            height: 300,
            borderRadius: 24,
          }}
          resizeMode="cover"
        />
      </View>

      {/* Content Section */}
      <View className="px-5 py-8">
        {/* Title */}
        <Text className="text-white text-3xl font-extrabold mb-3">
          {service.title}
        </Text>

        {/* Short Description */}
        <Text className="text-gray-400 mb-6 text-sm tracking-wide">
          {service.short_desc}
        </Text>

        {/* Main Description */}
        <Text className="text-gray-300 leading-6 mb-8">
          {service.description}
        </Text>

        {/* Points Section */}
        {/* Points Section */}
        <View className="mb-10">
          <Text className="text-[#ff3c00] text-lg font-bold mb-6">
            What's Included
          </Text>

          {Array.isArray(service.points) &&
            service.points.map((point, index) => (
              <View
                key={index}
                className="mb-4 rounded-2xl border border-[#262626] bg-[#141414] p-4 flex-row items-center"
                style={{
                  shadowColor: "#ff3c00",
                  shadowOpacity: 0.15,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                {/* Tick Icon */}
                <View className="w-7 h-7 rounded-full bg-[#ff3c00] items-center justify-center mr-4">
                  <Text className="text-black font-bold text-sm">✓</Text>
                </View>

                {/* Text */}
                <Text className="text-gray-300 text-sm flex-1 leading-6">
                  {point}
                </Text>
              </View>
            ))}
        </View>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
}
