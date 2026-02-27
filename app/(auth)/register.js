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

const RegisterScreen = () => {
  const router = useRouter();

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
    <View className="flex-1 bg-[#05060c] justify-center px-5">
      <Text className="text-3xl font-bold text-red-500 text-center mb-2">
        Create Account
      </Text>

      <Text className="text-gray-400 text-center mb-6">
        Start your fitness journey 🔥
      </Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor="#6b7280"
        className="border border-white/10 p-3 rounded-lg mb-3 text-white"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Mobile Number"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
        maxLength={10}
        className="border border-white/10 p-3 rounded-lg mb-3 text-white"
        value={mobile}
        onChangeText={(text) => setMobile(text.replace(/\D/g, ""))}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#6b7280"
        className="border border-white/10 p-3 rounded-lg mb-3 text-white"
        value={email}
        onChangeText={setEmail}
      />

      {/* PASSWORD */}
      <View className="relative mb-3">
        <TextInput
          placeholder="Password"
          placeholderTextColor="#6b7280"
          secureTextEntry={!showPassword}
          className="border border-white/10 p-3 rounded-lg text-white pr-12"
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

      {/* CONFIRM PASSWORD */}
      <View className="relative mb-4">
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#6b7280"
          secureTextEntry={!showConfirmPassword}
          className="border border-white/10 p-3 rounded-lg text-white pr-12"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-3"
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        className="bg-red-600 py-3 rounded-lg items-center"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text className="text-center text-gray-400 mt-4">
          Already a member? <Text className="text-red-500">Login</Text>
        </Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

export default RegisterScreen;