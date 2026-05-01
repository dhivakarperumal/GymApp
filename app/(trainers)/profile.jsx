import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "https://mygym.qtechx.com/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  /* ---------------- FETCH PROFILE ---------------- */

  useEffect(() => {
    if (!user?.email) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/staff`);
        const json = await res.json();

        const staffList = Array.isArray(json)
          ? json
          : json.data || json.staff || [];

        const trainer = staffList.find(
          (s) => s.email?.toLowerCase() === user.email?.toLowerCase(),
        );

        setProfile(trainer || null);
      } catch (err) {
        console.log("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#ff3b3b" size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="bg-[#111] pt-12 pb-10 px-6 rounded-b-[40px]">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 bg-[#1a1a1a] rounded-full items-center justify-center mb-4 border border-white/10"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <View className="items-center">
          <View className="shadow-lg shadow-black">
            <Image
              source={{
                uri: profile.photo || "https://i.pravatar.cc/200",
              }}
              className="w-32 h-32 rounded-full border-4 border-red-500"
            />
          </View>

          <Text className="text-white text-2xl font-bold mt-4">
            {profile.name}
          </Text>

          <Text className="text-gray-400 mt-1">
            {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)}
          </Text>
        </View>
      </View>

      {/* CONTENT */}

      <View className="px-5 mt-6">
        {/* BASIC INFO */}

        <View className="bg-[#141414] rounded-2xl p-5 mb-5 shadow-lg shadow-black">
          <View className="flex-row items-center mb-4">
            <Ionicons name="person" size={20} color="#ff3b3b" />
            <Text className="text-white text-lg font-semibold ml-2">
              Basic Information
            </Text>
          </View>

          <Text className="text-gray-400 mb-2">
            Employee ID:{" "}
            <Text className="text-white">{profile.employee_id}</Text>
          </Text>

          <Text className="text-gray-400 mb-2">
            Username: <Text className="text-white">{profile.name}</Text>
          </Text>

          <Text className="text-gray-400 mb-2">
            Department: <Text className="text-white">{profile.department}</Text>
          </Text>

          <Text className="text-gray-400 mb-2">
            Gender: <Text className="text-white">{profile.gender}</Text>
          </Text>

          <Text className="text-gray-400">
            Blood Group:{" "}
            <Text className="text-white">{profile.blood_group}</Text>
          </Text>
        </View>

        {/* CONTACT */}

        <View className="bg-[#141414] rounded-2xl p-5 mb-5 shadow-lg shadow-black">
          <View className="flex-row items-center mb-4">
            <Ionicons name="call" size={20} color="#ff3b3b" />
            <Text className="text-white text-lg font-semibold ml-2">
              Contact Details
            </Text>
          </View>

          <Text className="text-gray-400 mb-2">
            Email: <Text className="text-white">{profile.email}</Text>
          </Text>

          <Text className="text-gray-400 mb-2">
            Phone: <Text className="text-white">{profile.phone}</Text>
          </Text>

          <Text className="text-gray-400">
            Address: <Text className="text-white">{profile.address}</Text>
          </Text>
        </View>

        {/* WORK DETAILS */}

        <View className="bg-[#141414] rounded-2xl p-5 mb-5 shadow-lg shadow-black">
          <View className="flex-row items-center mb-4">
            <Ionicons name="briefcase" size={20} color="#ff3b3b" />
            <Text className="text-white text-lg font-semibold ml-2">
              Work Details
            </Text>
          </View>

          <Text className="text-gray-400 mb-2">
            Shift: <Text className="text-white">{profile.shift}</Text>
          </Text>

          <Text className="text-gray-400 mb-2">
            Time In: <Text className="text-white">{profile.time_in}</Text>
          </Text>

          <Text className="text-gray-400 mb-2">
            Time Out: <Text className="text-white">{profile.time_out}</Text>
          </Text>

          <Text className="text-gray-400">
            Salary: <Text className="text-white">₹{profile.salary}</Text>
          </Text>
        </View>

        {/* PERSONAL DETAILS */}

        <View className="bg-[#141414] rounded-2xl p-5 mb-6 shadow-lg shadow-black">
          <View className="flex-row items-center mb-4">
            <Ionicons name="information-circle" size={20} color="#ff3b3b" />
            <Text className="text-white text-lg font-semibold ml-2">
              Personal Details
            </Text>
          </View>

          <Text className="text-gray-400 mb-2">
            DOB:{" "}
            <Text className="text-white">
              {new Date(profile.dob).toLocaleDateString()}
            </Text>
          </Text>

          <Text className="text-gray-400 mb-2">
            Joining Date:{" "}
            <Text className="text-white">
              {new Date(profile.joining_date).toLocaleDateString()}
            </Text>
          </Text>

          <Text className="text-gray-400">
            Status: <Text className="text-green-400">{profile.status}</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/TrainerSendMessage")}
          className="bg-black border border-primary rounded-2xl p-4 flex-row justify-center items-center mb-4"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Send Message</Text>
        </TouchableOpacity>

        {/* LOGOUT BUTTON */}

        <TouchableOpacity
          onPress={() => setLogoutModalVisible(true)}
          className="bg-primary rounded-2xl p-4 flex-row justify-center items-center shadow-lg shadow-red-500/40"
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Logout</Text>
        </TouchableOpacity>
      </View>
      {/* LOGOUT CONFIRM MODAL */}

      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setLogoutModalVisible(false)}
          className="flex-1 justify-center items-center bg-black/60"
        >

          <View className="bg-[#141414] w-[85%] rounded-2xl p-6 border border-[#262626]">

            <View className="items-center mb-3">
              <Ionicons name="log-out-outline" size={40} color="#ef4444" />
            </View>

            <Text className="text-white text-lg font-bold text-center mb-2">
              Logout
            </Text>

            <Text className="text-gray-400 text-center mb-6">
              Are you sure you want to logout?
            </Text>

            <View className="flex-row justify-between">

              {/* Cancel */}
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                className="flex-1 bg-[#262626] py-3 rounded-xl mr-2"
              >
                <Text className="text-center text-white font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Logout */}
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-1 bg-red-600 py-3 rounded-xl ml-2"
              >
                <Text className="text-center text-white font-semibold">
                  Logout
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}
