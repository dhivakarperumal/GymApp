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
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import { updateUserApi } from "../services/api";
import BackButton from "./BackButton";
import Header from "./Header";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [editVisible, setEditVisible] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [logoutVisible, setLogoutVisible] = useState(false);
  const { user: authUser } = useAuth();
  const currentUser = authUser || user;
  const currentUserName = currentUser?.username || currentUser?.name || "User";

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    height: "",
    weight: "",
    bmi: "",
    dob: "",
    age: "",
    address: "",
    fitness_goal: "",
    blood_group: "",
    gender: "",
    subject: "",
    message: "",
  });

  const [healthHistory, setHealthHistory] = useState({
    medications: "No",
    med1: "",
    dose1: "",
    reason1: "",
    med2: "",
    dose2: "",
    reason2: "",
    med3: "",
    dose3: "",
    reason3: "",
    allergies: "",
    surgeries1: "",
    surgeries2: "",
    surgeries3: "",
    exercise_program: "No",
    smoking: "",
    alcohol: "",
    food_preference: "",
    supplements: "",
  });

  const [medicalInfo, setMedicalInfo] = useState({
    q0: "No",
    q1: "No",
    q2: "No",
    q3: "No",
    q4: "No",
    q5: "No",
    q6: "No",
    q7: "No",
    bp: "",
    sugar: "",
    cholesterol: "",
    thyroid: "",
    uric: "",
    serum3d: "",
  });

  const [fitnessData] = useState({
    height: "",
    weight: "",
    resting_hr: "",
    fat_percentage: "",
    fat_level: "",
    speed_km: "",
    heart_rate: "",
    push_ups_count: "",
    push_ups_level: "",
    squats_count: "",
    squats_level: "",
    plank_hold_count: "",
    plank_hold_level: "",
    shoulder_count: "",
    shoulder_level: "",
    biceps_count: "",
    biceps_level: "",
    triceps_count: "",
    triceps_level: "",
    curl_ups_count: "",
    curl_ups_level: "",
  });

  const [flexData] = useState({
    flex_apley_test: "",
    flex_ymca_val: "",
    flex_ymca_test: "",
    flex_knee_val: "",
    flex_knee_test: "",
    measurements: [
      {
        date: "",
        height: "",
        weight: "",
        neck: "",
        shoulder: "",
        arm: "",
        chest_normal: "",
        chest_expanded: "",
        waist: "",
        abdomen: "",
        hip: "",
        thigh: "",
        calf: "",
        lat: "",
      },
    ],
  });

  const [sessions, setSessions] = useState([
    {
      session_no: 1,
      date: "",
      workout: "",
      status: "Completed",
      client_sign: currentUserName,
      trainer_sign: currentUserName,
      approved_by: currentUserName,
    },
  ]);

  const updateFormField = (setter) => (field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (currentUser) {
      setEnquiryForm((prev) => ({
        ...prev,
        name: currentUser.username || currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.mobile || prev.phone,
      }));
      setSessions((prev) =>
        prev.map((session) => ({
          ...session,
          client_sign: currentUserName,
          trainer_sign: currentUserName,
          approved_by: currentUserName,
          status: "Completed",
        }))
      );
    }
  }, [currentUser, currentUserName]);

  const savePTForm = () => {
    setSessions((prev) =>
      prev.map((session) => ({
        ...session,
        status: "Completed",
        client_sign: currentUserName,
        trainer_sign: currentUserName,
      }))
    );

    Toast.show({
      type: "success",
      text1: "PT Form saved",
      text2: "Enquiry and health details are up to date.",
    });
  };

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

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile was updated successfully",
      });
    } catch (err) {
      console.log("UPDATE ERROR:", err);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Profile update failed",
      });
    }
  };

  const handleLogout = async () => {
    setLogoutVisible(false);

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    router.replace("/login");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Perform deletion logic here if API exists
            await handleLogout();
          },
        },
      ]
    );
  };

  const userName = user?.username || "User";
  const phone = user?.mobile || "No phone number";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>

      {/* HEADER ROW */}
      <View style={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: "#000",
        borderBottomWidth: 1,
        borderBottomColor: "#111",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Left: Back + Title */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <BackButton style={{ marginRight: 12 }} />
          <View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>My Profile</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Account Settings</Text>
          </View>
        </View>

        {/* Right: Avatar Circle */}
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#e11d1d",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#e11d1d",
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 6,
        }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>{initial}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}
      >

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
            onPress={() => router.push("/pt-form")}
            className="flex-row justify-between items-center py-4 border-b border-[#222]"
          >
            <Text className="text-white">PT Form</Text>
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

          <TouchableOpacity
            onPress={() => router.push("/Notifications")}
            className="flex-row justify-between items-center py-4 border-b border-[#222]"
          >
            <Text className="text-white">Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          onPress={() => setLogoutVisible(true)}
          className="bg-primary py-5 rounded-2xl items-center mb-4"
        >
          <Text className="text-white font-bold text-lg">Logout</Text>
        </TouchableOpacity>

        {/* DELETE ACCOUNT */}
        <TouchableOpacity
          onPress={handleDeleteAccount}
          className="bg-red-600/10 border border-red-600/20 py-5 rounded-2xl items-center"
        >
          <Text className="text-red-500 font-bold text-lg">Delete Account</Text>
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
