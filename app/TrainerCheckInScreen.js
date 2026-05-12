import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const GYM_LOCATION = {
  lat: 12.479724,
  lng: 78.573769,
  radius: 1000,
  name: "Tirupattur Gym Main Office",
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
};

export default function TrainerCheckInScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const name =
    (user?.name || user?.username || "Trainer")
      .charAt(0)
      .toUpperCase() +
    (user?.name || user?.username || "Trainer").slice(1);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission required", "Enable location");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      const distance = getDistance(
        lat,
        lng,
        GYM_LOCATION.lat,
        GYM_LOCATION.lng
      );

      if (distance > GYM_LOCATION.radius) {
        Alert.alert("Not at gym", `You are ${Math.round(distance)}m away`);
        return;
      }

      let locationName = GYM_LOCATION.name;

      try {
        const geoRes = await api.get(
          `/attendance/reverse-geocode?lat=${lat}&lng=${lng}`
        );
        if (geoRes.data?.display_name) {
          locationName = geoRes.data.display_name;
        }
      } catch {}

      const payload = {
        memberId: user.id,
        trainerId: user.id,
        status: "Present",
        date: dayjs().format("YYYY-MM-DD"),
        lat,
        lng,
        locationName,
      };

      await api.post("/attendance", payload);

      Alert.alert("Success", "Checked in!");

      router.replace("/(trainers)/dashboard");
    } catch (err) {
      Alert.alert("Error", "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#ff3c00"
        />
      }
    >
      {/* CARD */}
      <View className="bg-[#141414] border border-[#262626] rounded-3xl p-6 relative">
        
        {/* LOGOUT BUTTON */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="absolute top-4 right-4 z-10 p-2"
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>

        {/* ICON */}
        <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-5 self-center">
          <Ionicons name="location" size={30} color="#ff3c00" />
        </View>

        {/* WELCOME */}
        <Text className="text-white text-2xl font-bold text-center">
          Welcome, {name} 👋
        </Text>

        <Text className="text-gray-400 text-center mt-2 mb-6">
          Please check-in to start your day at the gym
        </Text>

        {/* INFO BOX */}
        <View className="bg-black border border-[#262626] rounded-xl p-4 mb-6">
          <Text className="text-gray-400 text-xs mb-1">Gym Location</Text>
          <Text className="text-white font-semibold">
            {GYM_LOCATION.name}
          </Text>
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          onPress={handleCheckIn}
          disabled={loading}
          className={`rounded-2xl py-4 items-center border ${
            loading
              ? "bg-gray-700 border-gray-600"
              : "bg-primary border-red-400"
          }`}
          style={{
            shadowColor: "#ff3c00",
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="log-in-outline" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Check In to Continue
              </Text>
            </View>
          )}
        </TouchableOpacity>

      </View>

      {/* FOOTER TEXT */}
      <Text className="text-gray-500 text-xs text-center mt-6">
        Location access is required for attendance verification
      </Text>
    </ScrollView>
  );
}