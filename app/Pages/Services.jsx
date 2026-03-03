import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { getAllServices } from "../../services/api";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function Services() {
  const [services, setServices] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await getAllServices();
      console.log("SERVICES API:", data);

      if (Array.isArray(data)) {
        setServices(data);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.log("Services fetch error:", err.message);
      setServices([]);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#0a0a0a] px-5 pt-12"
    >
      {/* Header */}
      <Text className="text-white text-3xl font-extrabold mb-2">
        Premium Services
      </Text>
      <Text className="text-gray-500 mb-10 tracking-wide text-sm">
        Train smarter. Train stronger.
      </Text>

      {/* Empty State */}
      {services.length === 0 && (
        <Text className="text-gray-400 text-center mt-10">
          No services available
        </Text>
      )}

      {services.map((service, index) => (
        <TouchableOpacity
          key={service.id || index}
          activeOpacity={0.9}
          onPress={() => router.push(`/services/${service.slug}`)}
          className="mb-10 rounded-3xl overflow-hidden border border-primary"
          style={{
            shadowColor: "#ff3c00",
            shadowOpacity: 0.6,
            shadowRadius: 25,
            elevation: 20,
          }}
        >
          {/* Image */}
          <Image
            source={{ uri: service.hero_image }}
            style={{
              width: width - 40,
              height: 300,
            }}
            resizeMode="cover"
          />

          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Bottom Section */}
          <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/80 border-t border-primary">
            <Text className="text-white text-xl font-bold leading-6">
              {service?.title || "Service"}
            </Text>

            <Text className="text-gray-300 text-xs mt-2 font-bold leading-6">
              {service?.slug || "Service"}
            </Text>

            <TouchableOpacity
              onPress={() => router.push(`/services/${service.slug}`)}
              className="mt-4 self-start bg-primary px-5 py-2 rounded-full"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-xs tracking-wider">
                EXPLORE
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <View className="h-10" />
    </ScrollView>
  );
}
