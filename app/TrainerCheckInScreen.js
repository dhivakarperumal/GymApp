import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import dayjs from "dayjs";

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
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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

      // ✅ GO TO DASHBOARD
      router.replace("/(trainers)/dashboard");

    } catch (err) {
      Alert.alert("Error", "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center px-5">
      <Text className="text-white text-3xl font-bold mb-6">
        Trainer Check-In
      </Text>

      <TouchableOpacity
        onPress={handleCheckIn}
        disabled={loading}
        className="bg-primary px-6 py-4 rounded-2xl"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">
            Check In to Continue
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}