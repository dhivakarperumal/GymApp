import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ScrollView } from "react-native";

const RegisterScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (loading) return;

    // trim once so we send clean values everywhere
    const name = username.trim();
    const mail = email.trim();
    const phone = mobile.trim();

    if (!name) return Toast.show({ type: "error", text1: "Username is required" });
    if (!mail) return Toast.show({ type: "error", text1: "Email is required" });
    if (!phone) return Toast.show({ type: "error", text1: "Mobile number is required" });
    if (phone.length !== 10)
      return Toast.show({ type: "error", text1: "Enter valid 10 digit mobile number" });
    if (password.length < 6)
      return Toast.show({ type: "error", text1: "Password must be at least 6 characters" });
    if (password !== confirmPassword)
      return Toast.show({ type: "error", text1: "Passwords do not match" });

    const payload = {
      username: name,
      email: mail,
      mobile: phone,
      password,
    };

    console.log("register payload", payload);

    setLoading(true);

    try {
      await api.post("/auth/register", payload);

      Toast.show({ type: "success", text1: "Account created successfully" });
      // clear inputs for good measure
      setUsername("");
      setEmail("");
      setMobile("");
      setPassword("");
      setConfirmPassword("");

      router.push("/login"); // ✅ Expo Router navigation
    } catch (err) {
      console.log("registration error", err);
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <View className="flex-1">
              {/* 🔥 HERO IMAGE */}
              <View className="absolute inset-0">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/60" />
              </View>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-14 left-5 bg-black/50 p-3 rounded-full"
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>

              {/* Hero Text */}
              <View className="absolute top-28 left-6 right-10">
                <Text className="text-white text-[56px] font-black leading-[60px] tracking-tight">
                  STAY{"\n"}STRONG.
                </Text>
              </View>

              {/* 🔥 REGISTER CARD */}
              <View
                style={{ paddingBottom: 0}}
                className="absolute bottom-0 w-full bg-black rounded-t-3xl px-6 pt-8 pb-6 h-[65%] flex-col"
              >

                <Text className="text-white text-2xl font-bold text-center">
                  Create Your Account
                </Text>

                {/* SCROLLABLE FORM AREA */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {/* FULL NAME */}
                  <Text className="text-gray-400 text-sm mb-2">FULL NAME</Text>
                  <View className="flex-row items-center bg-gray-200 rounded-full px-4 mb-4">
                    <Ionicons name="person-outline" size={18} color="#6b7280" />
                    <TextInput
                      placeholder="Full Name"
                      placeholderTextColor="#6b7280"
                      value={username}
                      onChangeText={setUsername}
                      className="flex-1 py-5 px-3 text-black"
                    />
                  </View>

                  {/* EMAIL */}
                  <Text className="text-gray-400 text-sm mb-2">EMAIL</Text>
                  <View className="flex-row items-center bg-gray-200 rounded-full px-4 mb-4">
                    <Ionicons name="mail-outline" size={18} color="#6b7280" />
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor="#6b7280"
                      value={email}
                      onChangeText={setEmail}
                      className="flex-1 py-5 px-3 text-black"
                    />
                  </View>

                  {/* PASSWORD */}
                  <Text className="text-gray-400 text-sm mb-2">PASSWORD</Text>
                  <View className="flex-row items-center bg-gray-200 rounded-full px-4 mb-4">
                    <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      className="flex-1 py-5 px-3 text-black"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={18}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* CONFIRM PASSWORD */}
                  <Text className="text-gray-400 text-sm mb-2">CONFIRM PASSWORD</Text>
                  <View className="flex-row items-center bg-gray-200 rounded-full px-4 mb-4">
                    <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
                    <TextInput
                      placeholder="Confirm Password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      className="flex-1 py-5 px-3 text-black"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={18}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                {/* STATIC BUTTON AREA */}
                <View style={{ paddingBottom: 5 }}>
                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    className="bg-red-600 py-5 rounded-full items-center mt-2"
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-lg font-bold">
                        Sign up
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/login")}
                    className="mt-6"
                  >
                    <Text className="text-center text-gray-400">
                      Already have an account,{" "}
                      <Text className="text-red-500 font-semibold">
                        Switch to Login
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
};

export default RegisterScreen;