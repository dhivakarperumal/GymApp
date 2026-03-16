import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import dayjs from "dayjs";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

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
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1000;
};

export default function Attendance() {
  const { user } = useAuth();

  const trainerId = user?.id;

  const [members, setMembers] = useState([]);
  const [attendanceStates, setAttendanceStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [trainerCoords, setTrainerCoords] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [locationVerified, setLocationVerified] = useState(false);

  const date = dayjs().format("YYYY-MM-DD");

  const presentCount = Object.values(attendanceStates).filter(Boolean).length;
  const absentCount = members.length - presentCount;
  const totalCount = members.length;

  const loadAssignedMembers = async () => {
    try {
      const res = await api.get(`/assignments?trainerUserId=${trainerId}`);

      const membersRaw = res.data || [];

      const activeMembers = membersRaw
        .filter((m) => !m.status || m.status === "active")
        .map((m) => ({
          id: m.userId || m.user_id,
          name: m.username || m.user_name,
          email: m.userEmail || m.user_email,
        }));

      setMembers(activeMembers);

      const defaultStates = {};
      activeMembers.forEach((m) => {
        defaultStates[m.id] = true;
      });

      setAttendanceStates(defaultStates);
    } catch (err) {
      console.log("Members error:", err);
    }
  };

  const loadAttendance = async () => {
    try {
      const res = await api.get(
        `/attendance?date=${date}&trainerId=${trainerId}`,
      );

      const data = res.data || [];

      const states = {};

      data.forEach((r) => {
        states[r.member_id] = r.status === "Present";
      });

      setAttendanceStates(states);
    } catch (err) {
      console.log("Attendance load error:", err);
    }
  };

  useEffect(() => {
    if (!trainerId) return;

    const init = async () => {
      await loadAssignedMembers();
      await loadAttendance();
      setLoading(false);
    };

    init();
  }, [trainerId]);

  const toggleMember = (id) => {
    setAttendanceStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAll = (value) => {
    const newStates = {};

    members.forEach((m) => {
      newStates[m.id] = value;
    });

    setAttendanceStates(newStates);
  };

  const verifyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission required", "Location permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      setTrainerCoords({ lat, lng });

      const dist = getDistance(lat, lng, GYM_LOCATION.lat, GYM_LOCATION.lng);

      const isAtGym = dist <= GYM_LOCATION.radius;

      const newStates = {};

      members.forEach((m) => {
        newStates[m.id] = isAtGym;
      });

      setAttendanceStates(newStates);

      setLocationVerified(true);
      setLocationName(isAtGym ? GYM_LOCATION.name : "Outside Gym");

      Alert.alert(
        "Location Verified",
        isAtGym
          ? "Inside Gym — Members marked Present"
          : "Outside Gym — Members marked Absent",
      );
    } catch (err) {
      console.log("Location error", err);
    }
  };

  const handleSubmit = async () => {
    if (!locationVerified) {
      Alert.alert("Verify Location", "Please verify location first");
      return;
    }

    try {
      setSaving(true);

      const promises = members.map((member) => {
        const present = attendanceStates[member.id];

        const payload = {
          memberId: member.id,
          trainerId,
          status: present ? "Present" : "Absent",
          date,
          lat: trainerCoords?.lat,
          lng: trainerCoords?.lng,
          locationName,
        };

        return api.post("/attendance", payload);
      });

      await Promise.all(promises);

      Alert.alert("Success", "Attendance saved successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#ff3c00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-5 pt-12">
      {/* HEADER */}

      <Text className="text-white text-3xl font-bold mb-2">
        Trainer Attendance
      </Text>

      <Text className="text-gray-400 mb-6">
        {dayjs(date).format("DD MMM YYYY")}
      </Text>

      {/* PRESENT / ABSENT STATS */}

      {/* STATS CARDS */}

      <View className="flex-row justify-between mb-6">
        {/* TOTAL */}

        <View className="bg-[#141414] border border-[#262626] rounded-2xl p-4 flex-1 mr-2">
          <View className="flex-row items-center">
            <Ionicons name="people" size={18} color="#3b82f6" />
            <Text className="text-gray-400 ml-2 text-xs">All</Text>
          </View>

          <Text className="text-white text-2xl font-bold mt-2">
            {totalCount}
          </Text>
        </View>

        {/* PRESENT */}

        <View className="bg-[#141414] border border-[#262626] rounded-2xl p-4 flex-1 mx-1">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text className="text-gray-400 ml-2 text-xs">Present</Text>
          </View>

          <Text className="text-white text-2xl font-bold mt-2">
            {presentCount}
          </Text>
        </View>

        {/* ABSENT */}

        <View className="bg-[#141414] border border-[#262626] rounded-2xl p-4 flex-1 ml-2">
          <View className="flex-row items-center">
            <Ionicons name="close-circle" size={18} color="#ef4444" />
            <Text className="text-gray-400 ml-2 text-xs">Absent</Text>
          </View>

          <Text className="text-white text-2xl font-bold mt-2">
            {absentCount}
          </Text>
        </View>
      </View>

      {/* LOCATION CARD */}

      <View className="bg-[#141414] border border-[#262626] rounded-2xl p-5 mb-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="location" size={20} color="#ff3c00" />
            <Text className="text-white ml-2 font-semibold">Gym Location</Text>
          </View>

          <TouchableOpacity
            onPress={verifyLocation}
            className="bg-primary px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold">Verify</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-400 text-xs mt-3">
          {locationVerified ? locationName : "Location not verified"}
        </Text>
      </View>

      {/* SELECT ALL */}

      <TouchableOpacity
        onPress={() => selectAll(true)}
        className="mb-5 flex-row items-center"
      >
        <Ionicons name="checkmark-circle" size={18} color="#ff3c00" />
        <Text className="text-primary ml-2 font-semibold">
          Select All Present
        </Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {members.map((m, i) => {
          const id = m.id;
          const checked = attendanceStates[id];

          return (
            <View
              key={i}
              className="bg-[#141414] rounded-2xl p-4 mb-4 border border-[#262626]"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
                  <Ionicons name="person" size={22} color="white" />
                </View>

                <View className="flex-1">
                  <Text className="text-white font-bold">{m.name}</Text>

                  <Text className="text-gray-400 text-xs">{m.email}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleMember(id)}
                  className={`w-8 h-8 rounded-lg items-center justify-center ${
                    checked ? "bg-green-500" : "bg-[#262626]"
                  }`}
                >
                  {checked && (
                    <Ionicons name="checkmark" size={18} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* SUBMIT BUTTON */}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving}
          className="bg-primary rounded-2xl p-5 mt-6 mb-12 items-center"
        >
          <Text className="text-white text-lg font-bold">
            {saving ? "Saving Attendance..." : "Submit Attendance"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
