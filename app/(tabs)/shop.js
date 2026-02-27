import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { serviceList } from "../../services/api";

export default function Shop() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

 useEffect(() => {
  const loadServices = async () => {
    try {
      const data = await serviceList();
      setServices(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  loadServices();
}, []);

  return (
    <ScrollView className="flex-1 bg-[#0f0f0f] p-4">
      <Text className="text-white text-2xl mb-5 font-bold">Shop</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ff3c00" />
      ) : services.length === 0 ? (
        <Text className="text-gray-400">No services available</Text>
      ) : (
        services.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.push(`/shop/${item.serviceId}`)}
            className="bg-[#1c1c1c] p-4 rounded-xl mb-3 flex-row items-center justify-between"
          >
            {/* LEFT */}
            <View className="flex-row items-center gap-3 flex-1">
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  className="w-12 h-12 rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="cube-outline" size={22} color="#ff3c00" />
              )}

              <View className="flex-1">
                <Text className="text-white text-base font-semibold">
                  {item.title}
                </Text>

                {item.shortDesc ? (
                  <Text className="text-gray-400 text-xs mt-1">
                    {item.shortDesc}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* RIGHT ICON */}
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}