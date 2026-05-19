import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllServices } from "../../services/api";
import BackButton from "../BackButton";

const { width } = Dimensions.get("window");

export default function Services() {
  const [services, setServices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
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
    const base = "https://dapfitt.com";
    return `${base}/${img}`;
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
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>Premium Services</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Train Smarter. Train Stronger.</Text>
          </View>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e11d1d", alignItems: "center", justifyContent: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}>
          <Ionicons name="flash-outline" size={20} color="#fff" />
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