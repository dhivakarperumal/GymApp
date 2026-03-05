import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateUserApi } from "../services/api";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [editVisible, setEditVisible] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [logoutVisible, setLogoutVisible] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const userData = Array.isArray(parsed) ? parsed[0] : parsed;

        setUser(userData);
        setName(userData.username || "");
        setMobile(userData.mobile || "");
      }
    };

    loadUser();
  }, []);

  const saveProfile = async () => {
    try {
      await updateUserApi(user.id, {
        username: name,
        mobile: mobile,
      });

      const updatedUser = {
        ...user,
        username: name,
        mobile: mobile,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
      setEditVisible(false);

      Alert.alert("Success", "Profile updated successfully 🎉");
    } catch (err) {
      console.log("UPDATE ERROR:", err);
      Alert.alert("Error", "Profile update failed");
    }
  };

  const handleLogout = async () => {
    setLogoutVisible(false);

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    router.replace("/login");
  };

  const userName = user?.username || "User";
  const phone = user?.mobile || "No phone number";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* HEADER */}
        <Text className="text-white text-3xl font-bold mb-8">My Profile</Text>

        {/* PROFILE CARD */}
        <View className="bg-[#111] rounded-3xl p-6 items-center mb-8">
          <View className="w-28 h-28 rounded-full bg-primary items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">{initial}</Text>
          </View>

          <Text className="text-white text-xl font-semibold">{userName}</Text>

          <Text className="text-gray-400 mt-1">{phone}</Text>

          <Text className="text-gray-500 mt-1 text-xs">Fitness Enthusiast</Text>
        </View>

        {/* OPTIONS */}
        <View className="bg-[#111] rounded-3xl p-5 mb-6">
          <TouchableOpacity
            onPress={() => setEditVisible(true)}
            className="flex-row justify-between items-center py-4 border-b border-[#222]"
          >
            <Text className="text-white">Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/Orders")}
            className="flex-row justify-between items-center py-4 border-b border-[#222]"
          >
            <Text className="text-white">My Orders</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/Address")}
            className="flex-row justify-between items-center py-4 border-b border-[#222]"
          >
            <Text className="text-white">Address</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-4">
            <Text className="text-white">Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          onPress={() => setLogoutVisible(true)}
          className="bg-primary py-5 rounded-2xl items-center"
        >
          <Text className="text-white font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-[#111] rounded-3xl p-6">
            <Text className="text-white text-xl font-bold mb-6">
              Edit Profile
            </Text>

            <Text className="text-gray-400 mb-1">Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="bg-[#1a1a1a] text-white p-4 rounded-xl mb-4"
            />

            <Text className="text-gray-400 mb-1">Mobile Number</Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              className="bg-[#1a1a1a] text-white p-4 rounded-xl mb-6"
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setEditVisible(false)}
                className="bg-gray-700 px-6 py-3 rounded-xl"
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveProfile}
                className="bg-primary px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={logoutVisible}
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: "#1a1a1a",
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: "#333",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Confirm Logout
            </Text>

            <Text
              style={{
                color: "#aaa",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Are you sure you want to logout?
            </Text>

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setLogoutVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#333",
                  padding: 12,
                  borderRadius: 20,
                  marginRight: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  flex: 1,
                  backgroundColor: "#e11d1d",
                  padding: 12,
                  borderRadius: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
