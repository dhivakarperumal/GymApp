import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator, Image, Keyboard, KeyboardAvoidingView,
    Platform, Text,
    TextInput,
    TouchableOpacity, TouchableWithoutFeedback, View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const LoginScreen = () => {
  const router = useRouter();
  const { login: contextLogin } = useAuth();
  const insets = useSafeAreaInsets();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Role redirect
  const redirectByRole = (role) => {
    const normalizedRole = String(role || "").toLowerCase();
    if (normalizedRole === "admin") {
      router.replace("/(admin)");
    } else if (normalizedRole === "trainer") {
      router.replace("/(trainers)/dashboard");
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleLogin = async () => {
    if (loading) return;

    const id = identifier.trim();
    const pass = password.trim();

    if (!id)
      return Toast.show({ type: "error", text1: "Email or Username required" });

    if (!pass) return Toast.show({ type: "error", text1: "Password required" });

    const payload = { identifier: id, password: pass };
    console.log("login payload", payload);

    setLoading(true);

    try {
      const res = await api.post("/auth/login", payload);

      const userData = res?.data?.user;
      const token = res?.data?.token;

      if (!userData || !token) {
        throw new Error("Invalid server response");
      }

      // ✅ Save in AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      // ✅ Update AuthContext
      contextLogin(userData, token);

      // clear fields
      setIdentifier("");
      setPassword("");

      Toast.show({ type: "success", text1: "Login successful" });

      redirectByRole(userData.role);
    } catch (err) {
      console.log("login error", err);
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || err.message || "Login failed",
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
            {/* 🔥 HERO IMAGE */}
            <View className="flex-1">
              <View className="absolute inset-0">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c",
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/60" />
              </View>

              {/* Back Button */}
              <TouchableOpacity className="absolute top-14 left-5 bg-black/50 p-3 rounded-full">
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>

              {/* Hero Text */}
              <View className="absolute top-32 left-6 right-10">
                <Text className="text-white text-[56px] font-black leading-[60px] tracking-tight">
                  TRAIN{"\n"}HARD.
                </Text>

                <Text className="text-gray-300 mt-4 text-[16px] font-medium leading-6">
                  Your transformation starts{"\n"}today.
                </Text>
              </View>

              {/* 🔥 LOGIN CARD */}
              <View
                style={{ paddingBottom: 5 }}
                className="absolute bottom-0 w-full bg-black rounded-t-3xl px-6 pt-8 pb-6 min-h-[50%]"
              >
                <Text className="text-white text-2xl font-bold text-center">
                  Welcome Back, Leo
                </Text>

                <Text className="text-gray-400 text-center mt-1 mb-6">
                  Sign in to continue your streak
                </Text>

                {/* EMAIL */}
                <Text className="text-gray-400 text-sm mb-2">EMAIL</Text>
                <View className="flex-row items-center bg-gray-200 rounded-full px-4 mb-4">
                  <Ionicons name="mail-outline" size={18} color="#6b7280" />
                  <TextInput
                    placeholder="Email or Username"
                    placeholderTextColor="#6b7280"
                    value={identifier}
                    onChangeText={setIdentifier}
                    className="flex-1 py-5 px-3 text-black"
                    autoCapitalize="none"
                  />
                </View>

                {/* PASSWORD */}
                <Text className="text-gray-400 text-sm mb-2">PASSWORD</Text>
                <View className="flex-row items-center bg-gray-200 rounded-full px-4 mb-2">
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

                {/* Forgot Password */}
                <TouchableOpacity className="items-end mb-6">
                  <Text className="text-primary text-sm">Forgot Password?</Text>
                </TouchableOpacity>

                {/* LOGIN BUTTON */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                  className="bg-primary py-4 rounded-full items-center"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-lg font-bold">Login</Text>
                  )}
                </TouchableOpacity>

                {/* SIGN UP */}
                <TouchableOpacity
                  onPress={() => router.push("/register")}
                  className="mt-6"
                >
                  <Text className="text-center text-gray-400">
                    Don’t have an account?{" "}
                    <Text className="text-primary font-semibold">Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
};

export default LoginScreen;
