import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import { setPasswordApi } from "../services/api";
import BackButton from "./BackButton";

export default function SetPassword() {
  const { user } = useAuth();
  const userId = user?.id;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({ type: "error", text1: "Password must be at least 6 characters" });
      return;
    }

    if (!userId) {
      Toast.show({ type: "error", text1: "Unable to identify user" });
      return;
    }

    setLoading(true);
    try {
      await setPasswordApi({ userId, oldPassword, newPassword });
      Toast.show({ type: "success", text1: "Password updated successfully" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.message || "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
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
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <BackButton style={{ marginRight: 12 }} />
          <View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>Set Password</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Account Security</Text>
          </View>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e11d1d", alignItems: "center", justifyContent: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}>
          <Ionicons name="lock-closed-outline" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={{ backgroundColor: "#111", borderRadius: 24, padding: 24, gap: 18 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Change Password</Text>

          <View>
            <Text style={{ color: "#9ca3af", marginBottom: 8 }}>Old Password</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter current password"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showOldPassword}
                style={{
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#1f2937",
                }}
              />
              <TouchableOpacity
                onPress={() => setShowOldPassword((v) => !v)}
                style={{ position: "absolute", right: 16, top: 18 }}
              >
                <Ionicons name={showOldPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={{ color: "#9ca3af", marginBottom: 8 }}>New Password</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showNewPassword}
                style={{
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#1f2937",
                }}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword((v) => !v)}
                style={{ position: "absolute", right: 16, top: 18 }}
              >
                <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={{ color: "#9ca3af", marginBottom: 8 }}>Confirm Password</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showConfirmPassword}
                style={{
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#1f2937",
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((v) => !v)}
                style={{ position: "absolute", right: 16, top: 18 }}
              >
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#6b7280" : "#e11d1d",
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", textTransform: "uppercase" }}>
              {loading ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
