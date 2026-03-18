import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { getAllServices } from "../../services/api";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Header";
import BackButton from "../BackButton";

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
      // console.log("SERVICES API:", data);
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Services fetch error:", err.message);
      setServices([]);
    }
  };

  // ✅ FINAL IMAGE FIX
  const getImageUrl = (service) => {
    const img = service?.hero_image || service?.heroImage;

    if (!img) return null;

    // already base64
    if (img.startsWith("data:image")) return img;

    // raw base64
    if (img.length > 1000 && !img.startsWith("http")) {
      return `data:image/jpeg;base64,${img}`;
    }

    // full URL
    if (img.startsWith("http")) return img;

    // relative path
    const base = "https://mygym.qtechx.com";
    return `${base}/${img}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-[#0a0a0a] px-5"
      >
        <BackButton style={{ marginTop: 20, marginBottom: 20 }} />

        {/* Header */}
        <Text className="text-white text-3xl font-extrabold mb-2">
          Premium Services
        </Text>
        <Text className="text-gray-500 mb-10 tracking-wide text-sm">
          Train smarter. Train stronger.
        </Text>

        {services.length === 0 && (
          <Text className="text-gray-400 text-center mt-10">
            No services available
          </Text>
        )}

        {services.map((service, index) => {
          const imageUrl = getImageUrl(service);

          return (
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
              {/* ✅ IMAGE */}
              <Image
                source={
                  imageUrl
                    ? { uri: imageUrl }
                    : require("../../assets/images/logo_dark.png") 
                }
                style={{
                  width: width - 40,
                  height: 300,
                }}
                contentFit="cover"
                transition={300}
                onError={(e) => {
                  console.log("❌ IMAGE ERROR:", e);
                }}
              />

              {/* Overlay */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />

              {/* Bottom Content */}
              <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/80 border-t border-primary">
                <Text className="text-white text-xl font-bold leading-6">
                  {service?.title || "Service"}
                </Text>

                <Text className="text-gray-300 text-xs mt-2 font-bold leading-6">
                  {service?.slug || "Service"}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    router.push(`/services/${service.slug}`)
                  }
                  className="mt-4 self-start bg-primary px-5 py-2 rounded-full"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-semibold text-xs tracking-wider">
                    EXPLORE
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}