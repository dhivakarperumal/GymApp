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
    <SafeAreaView className="flex-1 bg-black">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}
      >
        <BackButton style={{ marginTop: 20 }} />
        {/* HEADER */}
        <Text className="text-white text-3xl font-bold mt-7 mb-8">
          My Profile
        </Text>

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

        {/* PT FORM */}
        <View className="bg-[#111] rounded-3xl p-5 mb-6">
          <Text className="text-white text-2xl font-bold mb-3">PT Form</Text>
          <Text className="text-gray-400 mb-5">
            Complete your enquiry and health history. Fitness screening and flexibility fields are read-only for users.
          </Text>

          <Text className="text-orange-400 font-semibold mb-3">Enquiry Form</Text>
          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-gray-400 mb-1">Name</Text>
              <TextInput
                value={enquiryForm.name}
                onChangeText={(text) => updateFormField(setEnquiryForm)("name", text)}
                placeholder="Enter your name"
                placeholderTextColor="#888"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Email</Text>
              <TextInput
                value={enquiryForm.email}
                onChangeText={(text) => updateFormField(setEnquiryForm)("email", text)}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Phone</Text>
              <TextInput
                value={enquiryForm.phone}
                onChangeText={(text) => updateFormField(setEnquiryForm)("phone", text)}
                placeholder="Enter your phone"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Location</Text>
              <TextInput
                value={enquiryForm.location}
                onChangeText={(text) => updateFormField(setEnquiryForm)("location", text)}
                placeholder="Location"
                placeholderTextColor="#888"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-gray-400 mb-1">Height</Text>
                <TextInput
                  value={enquiryForm.height}
                  onChangeText={(text) => updateFormField(setEnquiryForm)("height", text)}
                  placeholder="cm"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 mb-1">Weight</Text>
                <TextInput
                  value={enquiryForm.weight}
                  onChangeText={(text) => updateFormField(setEnquiryForm)("weight", text)}
                  placeholder="kg"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-gray-400 mb-1">BMI</Text>
                <TextInput
                  value={enquiryForm.bmi}
                  onChangeText={(text) => updateFormField(setEnquiryForm)("bmi", text)}
                  placeholder="BMI"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 mb-1">Age</Text>
                <TextInput
                  value={enquiryForm.age}
                  onChangeText={(text) => updateFormField(setEnquiryForm)("age", text)}
                  placeholder="Age"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-gray-400 mb-1">Gender</Text>
                <TextInput
                  value={enquiryForm.gender}
                  onChangeText={(text) => updateFormField(setEnquiryForm)("gender", text)}
                  placeholder="Gender"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 mb-1">Blood Group</Text>
                <TextInput
                  value={enquiryForm.blood_group}
                  onChangeText={(text) => updateFormField(setEnquiryForm)("blood_group", text)}
                  placeholder="Blood Group"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Address</Text>
              <TextInput
                value={enquiryForm.address}
                onChangeText={(text) => updateFormField(setEnquiryForm)("address", text)}
                placeholder="Address"
                placeholderTextColor="#888"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Fitness Goal</Text>
              <TextInput
                value={enquiryForm.fitness_goal}
                onChangeText={(text) => updateFormField(setEnquiryForm)("fitness_goal", text)}
                placeholder="Fitness goal"
                placeholderTextColor="#888"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Subject</Text>
              <TextInput
                value={enquiryForm.subject}
                onChangeText={(text) => updateFormField(setEnquiryForm)("subject", text)}
                placeholder="Subject"
                placeholderTextColor="#888"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Message</Text>
              <TextInput
                value={enquiryForm.message}
                onChangeText={(text) => updateFormField(setEnquiryForm)("message", text)}
                placeholder="Enter message"
                placeholderTextColor="#888"
                multiline
                numberOfLines={3}
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
          </View>

          <Text className="text-orange-400 font-semibold mb-3">Health History</Text>
          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-gray-400 mb-1">Taking medications?</Text>
              <View className="flex-row gap-3">
                {['Yes', 'No'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => updateFormField(setHealthHistory)("medications", option)}
                    className={`px-4 py-3 rounded-xl border ${healthHistory.medications === option ? 'border-orange-500 bg-orange-500/15' : 'border-white/20'}`}
                  >
                    <Text className="text-white">{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-col gap-3">
              <View>
                <Text className="text-gray-400 mb-1">Medication 1</Text>
                <TextInput
                  value={healthHistory.med1}
                  onChangeText={(text) => updateFormField(setHealthHistory)("med1", text)}
                  placeholder="Name"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
              <View>
                <Text className="text-gray-400 mb-1">Dosage / Frequency</Text>
                <TextInput
                  value={healthHistory.dose1}
                  onChangeText={(text) => updateFormField(setHealthHistory)("dose1", text)}
                  placeholder="Dosage"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
              <View>
                <Text className="text-gray-400 mb-1">Reason</Text>
                <TextInput
                  value={healthHistory.reason1}
                  onChangeText={(text) => updateFormField(setHealthHistory)("reason1", text)}
                  placeholder="Reason"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Allergies</Text>
              <TextInput
                value={healthHistory.allergies}
                onChangeText={(text) => updateFormField(setHealthHistory)("allergies", text)}
                placeholder="Allergies"
                placeholderTextColor="#888"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Surgeries / Accidents</Text>
              <TextInput
                value={healthHistory.surgeries1}
                onChangeText={(text) => updateFormField(setHealthHistory)("surgeries1", text)}
                placeholder="Describe any surgeries or accidents"
                placeholderTextColor="#888"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Exercise program</Text>
              <View className="flex-row gap-3">
                {['Yes', 'No'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => updateFormField(setHealthHistory)("exercise_program", option)}
                    className={`px-4 py-3 rounded-xl border ${healthHistory.exercise_program === option ? 'border-orange-500 bg-orange-500/15' : 'border-white/20'}`}
                  >
                    <Text className="text-white">{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-col gap-3">
              <View>
                <Text className="text-gray-400 mb-1">Smoking</Text>
                <TextInput
                  value={healthHistory.smoking}
                  onChangeText={(text) => updateFormField(setHealthHistory)("smoking", text)}
                  placeholder="Smoking"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
              <View>
                <Text className="text-gray-400 mb-1">Alcohol</Text>
                <TextInput
                  value={healthHistory.alcohol}
                  onChangeText={(text) => updateFormField(setHealthHistory)("alcohol", text)}
                  placeholder="Alcohol"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
              <View>
                <Text className="text-gray-400 mb-1">Food preference</Text>
                <TextInput
                  value={healthHistory.food_preference}
                  onChangeText={(text) => updateFormField(setHealthHistory)("food_preference", text)}
                  placeholder="Food preference"
                  placeholderTextColor="#888"
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
            </View>
            <View>
              <Text className="text-gray-400 mb-1">Supplements</Text>
              <TextInput
                value={healthHistory.supplements}
                onChangeText={(text) => updateFormField(setHealthHistory)("supplements", text)}
                placeholder="Supplements"
                placeholderTextColor="#888"
                className="bg-[#1a1a1a] text-white p-4 rounded-xl"
              />
            </View>
          </View>

          <Text className="text-orange-400 font-semibold mb-3">Medical Information</Text>
          <View className="space-y-4 mb-6">
            {['q0','q1','q2','q3','q4','q5','q6','q7'].map((question, index) => (
              <View key={question} className="bg-[#1a1a1a] p-4 rounded-3xl">
                <Text className="text-white mb-3">Question {index + 1}</Text>
                <View className="flex-row gap-3">
                  {['Yes', 'No'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => updateFormField(setMedicalInfo)(question, option)}
                      className={`px-4 py-3 rounded-xl border ${medicalInfo[question] === option ? 'border-orange-500 bg-orange-500/15' : 'border-white/20'}`}
                    >
                      <Text className="text-white">{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            <View className="flex-row flex-wrap gap-3">
              {[
                { label: 'Blood Pressure', field: 'bp' },
                { label: 'Blood Sugar', field: 'sugar' },
                { label: 'Cholesterol', field: 'cholesterol' },
                { label: 'Thyroid', field: 'thyroid' },
                { label: 'Uric Acid', field: 'uric' },
                { label: 'Serum 3D', field: 'serum3d' },
              ].map((item) => (
                <View key={item.field} className="w-1/2">
                  <Text className="text-gray-400 mb-1">{item.label}</Text>
                  <TextInput
                    value={medicalInfo[item.field]}
                    onChangeText={(text) => updateFormField(setMedicalInfo)(item.field, text)}
                    placeholder={item.label}
                    placeholderTextColor="#888"
                    className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                  />
                </View>
              ))}
            </View>
          </View>

          <Text className="text-orange-400 font-semibold mb-3">Fitness Screening (Read-only)</Text>
          <View className="space-y-4 mb-6">
            {[
              { label: 'Height', field: 'height' },
              { label: 'Weight', field: 'weight' },
              { label: 'Resting HR', field: 'resting_hr' },
              { label: 'Fat %', field: 'fat_percentage' },
              { label: 'Fat Level', field: 'fat_level' },
              { label: 'Speed (km)', field: 'speed_km' },
              { label: 'Heart Rate', field: 'heart_rate' },
              { label: 'Push Ups Count', field: 'push_ups_count' },
            ].map((item) => (
              <View key={item.field}>
                <Text className="text-gray-400 mb-1">{item.label}</Text>
                <TextInput
                  value={fitnessData[item.field]}
                  editable={false}
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
            ))}
            <View className="flex-row flex-wrap gap-3">
              {[
                { label: 'Push Ups Level', field: 'push_ups_level' },
                { label: 'Squats Count', field: 'squats_count' },
                { label: 'Squats Level', field: 'squats_level' },
                { label: 'Plank Hold Count', field: 'plank_hold_count' },
                { label: 'Plank Hold Level', field: 'plank_hold_level' },
                { label: 'Shoulder Count', field: 'shoulder_count' },
                { label: 'Shoulder Level', field: 'shoulder_level' },
                { label: 'Biceps Count', field: 'biceps_count' },
                { label: 'Biceps Level', field: 'biceps_level' },
                { label: 'Triceps Count', field: 'triceps_count' },
                { label: 'Triceps Level', field: 'triceps_level' },
                { label: 'Curl Ups Count', field: 'curl_ups_count' },
                { label: 'Curl Ups Level', field: 'curl_ups_level' },
              ].map((item) => (
                <View key={item.field} className="w-1/2">
                  <Text className="text-gray-400 mb-1">{item.label}</Text>
                  <TextInput
                    value={fitnessData[item.field]}
                    editable={false}
                    className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                  />
                </View>
              ))}
            </View>
          </View>

          <Text className="text-orange-400 font-semibold mb-3">Flexibility & Measurements (Read-only)</Text>
          <View className="space-y-4 mb-6">
            {[
              { label: 'Apley Test', field: 'flex_apley_test' },
              { label: 'YMCA Value', field: 'flex_ymca_val' },
              { label: 'YMCA Result', field: 'flex_ymca_test' },
              { label: 'Knee Value', field: 'flex_knee_val' },
              { label: 'Knee Result', field: 'flex_knee_test' },
            ].map((item) => (
              <View key={item.field}>
                <Text className="text-gray-400 mb-1">{item.label}</Text>
                <TextInput
                  value={flexData[item.field]}
                  editable={false}
                  className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                />
              </View>
            ))}
            <View>
              <Text className="text-gray-400 mb-3">Measurements</Text>
              <View className="flex-row flex-wrap gap-3">
                {Object.keys(flexData.measurements[0]).map((field) => (
                  <View key={field} className="w-1/2">
                    <Text className="text-gray-400 mb-1">{field.replace(/_/g, ' ')}</Text>
                    <TextInput
                      value={flexData.measurements[0][field]}
                      editable={false}
                      className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Text className="text-orange-400 font-semibold mb-3">Session Tracker</Text>
          <View className="space-y-4 mb-6">
            {sessions.map((session) => (
              <View key={session.session_no} className="bg-[#1a1a1a] rounded-3xl p-4">
                <Text className="text-white font-semibold mb-3">Session {session.session_no}</Text>
                <View className="mb-3">
                  <Text className="text-gray-400 mb-1">Status</Text>
                  <TextInput
                    value={session.status}
                    editable={false}
                    className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                  />
                </View>
                <View className="mb-3">
                  <Text className="text-gray-400 mb-1">Client Sign</Text>
                  <TextInput
                    value={session.client_sign}
                    editable={false}
                    className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                  />
                </View>
                <View className="mb-3">
                  <Text className="text-gray-400 mb-1">Trainer Sign</Text>
                  <TextInput
                    value={session.trainer_sign}
                    editable={false}
                    className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                  />
                </View>
                <View>
                  <Text className="text-gray-400 mb-1">Approved By</Text>
                  <TextInput
                    value={session.approved_by}
                    editable={false}
                    className="bg-[#1a1a1a] text-white p-4 rounded-xl"
                  />
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={savePTForm}
            className="bg-primary py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-bold">Save PT Form</Text>
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
