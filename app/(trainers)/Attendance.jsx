import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");

  const date = dayjs().format("YYYY-MM-DD");

  const [submittedAttendance, setSubmittedAttendance] = useState({});

  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [trainerAttendanceMarked, setTrainerAttendanceMarked] = useState(false);

  const handleTrainerCheckIn = async () => {
    if (!trainerId) return;

    try {
      setMarkingAttendance(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission required");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = loc.coords.latitude;
      const longitude = loc.coords.longitude;

      setTrainerCoords({ lat: latitude, lng: longitude });

      // ✅ SAME DISTANCE CHECK
      const distance = getDistance(
        latitude,
        longitude,
        GYM_LOCATION.lat,
        GYM_LOCATION.lng
      );

      const isAtGym = distance <= GYM_LOCATION.radius;

      if (!isAtGym) {
        Alert.alert(
          "Not at Gym",
          `You are ${Math.round(distance)}m away from gym`
        );
        return;
      }

      // ✅ OPTIONAL: Reverse Geocode (same as web)
      let locationName = GYM_LOCATION.name;

      try {
        const geoRes = await api.get(
          `/attendance/reverse-geocode?lat=${latitude}&lng=${longitude}`
        );

        if (geoRes.data?.display_name) {
          locationName = geoRes.data.display_name;
        }
      } catch (e) {
        console.log("Geocode fallback used");
      }

      setLocationName(locationName);

      // ✅ SAME PAYLOAD AS WEB
      const payload = {
        memberId: trainerId,   // trainer marking self
        trainerId: trainerId,
        status: "Present",
        date,
        lat: latitude,
        lng: longitude,
        locationName,
      };

      await api.post("/attendance", payload);

      setTrainerAttendanceMarked(true);
      setLocationVerified(true);

      Alert.alert("Success", "Trainer attendance marked successfully");

    } catch (err) {
      console.log("Check-in error:", err);
      Alert.alert("Error", "Failed to mark attendance");
    } finally {
      setMarkingAttendance(false);
    }
  };

  const presentCount =
    Object.values(submittedAttendance).filter(Boolean).length;
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
      setSubmittedAttendance(states);
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

    if (!trainerAttendanceMarked) {
      Alert.alert("Check-in required", "Trainer must check-in first");
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

      setSubmittedAttendance(attendanceStates);
      setEditMode(false);

      Alert.alert("Success", "Attendance saved successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter((m) =>
    (m.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#ff3c00" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <View className="flex-1 px-5 pt-12">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 250 }}
        >
          {/* HEADER */}

          <Text className="text-white text-3xl font-bold mb-2">
            Member's Attendance
          </Text>

          <Text className="text-gray-400 mb-6">
            {dayjs(date).format("DD MMM YYYY")}
          </Text>

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

          <View className="bg-[#141414] border border-[#262626] rounded-2xl p-5 mb-5">
            <View className="flex-row items-center justify-between">

              {/* LEFT */}
              <View className="flex-row items-center">
                <Ionicons name="person-circle" size={22} color="#ff3c00" />
                <Text className="text-white ml-2 font-semibold">
                  Trainer Check-in
                </Text>
              </View>

              {/* BUTTON */}
              <TouchableOpacity
                onPress={handleTrainerCheckIn}
                disabled={markingAttendance}
                className={`px-4 py-2 rounded-xl ${markingAttendance
                  ? "bg-gray-600"
                  : trainerAttendanceMarked
                    ? "bg-green-600"
                    : "bg-primary"
                  }`}
              >
                <Text className="text-white font-semibold">
                  {markingAttendance
                    ? "Checking..."
                    : trainerAttendanceMarked
                      ? "Checked In ✓"
                      : "Check-in"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* STATUS TEXT */}
            <Text className="text-gray-400 text-xs mt-3">
              {trainerAttendanceMarked
                ? `Checked in at ${locationName}`
                : "Trainer not checked in"}
            </Text>
          </View>

          {/* LOCATION CARD */}

          <View className="bg-[#141414] border border-[#262626] rounded-2xl p-5 mb-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#ff3c00" />
                <Text className="text-white ml-2 font-semibold">
                  Gym Location
                </Text>
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
          {submittedAttendance && Object.keys(submittedAttendance).length > 0 && !editMode && (
            <TouchableOpacity
              onPress={() => setEditMode(true)}
              className="bg-primary rounded-xl p-3 mb-4 items-center"
            >
              <Text className="text-white font-bold">Edit Attendance</Text>
            </TouchableOpacity>
          )}

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

          {/* SEARCH BAR */}

          <View className="bg-[#141414] border border-[#262626] rounded-2xl px-4 py-3 mb-5 flex-row items-center">
            <Ionicons name="search" size={18} color="#9ca3af" />

            <TextInput
              placeholder="Search members..."
              placeholderTextColor="#6b7280"
              value={search}
              onChangeText={setSearch}
              className="flex-1 text-white ml-3"
            />

            {search !== "" && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {filteredMembers.map((m, i) => {
            const id = m.id;

            const checked =
              editMode || !submittedAttendance[id]
                ? attendanceStates[id]
                : submittedAttendance[id];

            const isSubmitted = submittedAttendance[id] !== undefined;

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

                  {/* ✅ AFTER SUBMIT → SHOW TEXT */}
                  {!editMode && isSubmitted ? (
                    <Text
                      className={`font-bold ${checked ? "text-green-500" : "text-red-500"
                        }`}
                    >
                      {checked ? "Present" : "Absent"}
                    </Text>
                  ) : (
                    /* ✅ EDIT MODE → SHOW CHECKBOX */
                    <TouchableOpacity
                      onPress={() => toggleMember(id)}
                      className={`w-8 h-8 rounded-lg items-center justify-center ${checked ? "bg-green-500" : "bg-[#262626]"
                        }`}
                    >
                      {checked && (
                        <Ionicons name="checkmark" size={18} color="white" />
                      )}
                    </TouchableOpacity>
                  )}
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
    </KeyboardAvoidingView>
  );
}
