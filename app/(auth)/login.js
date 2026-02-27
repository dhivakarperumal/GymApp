import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const LoginScreen = () => {
  const router = useRouter();
  const { login: contextLogin } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Role redirect
  const redirectByRole = (role) => {
    if (role === "admin") router.replace("/admin");
    else if (role === "trainer") router.replace("/trainer");
    else router.replace("/");
  };

  const handleLogin = async () => {
    if (loading) return;

    const id = identifier.trim();
    const pass = password.trim();

    if (!id)
      return Toast.show({ type: "error", text1: "Email or Username required" });

    if (!pass)
      return Toast.show({ type: "error", text1: "Password required" });

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
        text1:
          err?.response?.data?.message ||
          err.message ||
          "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center px-5">

      <Text className="text-3xl font-bold text-white text-center mb-2">
        Member Login
      </Text>

      <Text className="text-gray-400 text-center mb-6">
        Enter your credentials to continue
      </Text>

      {/* EMAIL / USERNAME */}
      <TextInput
        placeholder="Email or Username"
        placeholderTextColor="#6b7280"
        className="border border-gray-700 bg-gray-900 text-white p-3 rounded-lg mb-3"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />

      {/* PASSWORD */}
      <View className="relative mb-4">
        <TextInput
          placeholder="Password"
          placeholderTextColor="#6b7280"
          secureTextEntry={!showPassword}
          className="border border-gray-700 bg-gray-900 text-white p-3 rounded-lg pr-12"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3"
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* LOGIN BUTTON */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="bg-red-600 py-3 rounded-lg items-center"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold">Login</Text>
        )}
      </TouchableOpacity>

      {/* REGISTER LINK */}
      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text className="text-center text-gray-400 mt-4">
          New member? <Text className="text-red-500">Join Now</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;