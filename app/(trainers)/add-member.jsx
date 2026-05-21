import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import dayjs from "dayjs";
import api from "../../services/api"; // Corrected API import based on gymApp

const API_ENDPOINT = `/members`;

export default function AddMember() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id;
  const userId = params.user_id;
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [plans, setPlans] = useState([]);
  const [originalPlan, setOriginalPlan] = useState(null);
  const [extensionDays, setExtensionDays] = useState("5");

  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
    age: "",
    height: "",
    weight: "",
    bmi: "",
    plan: "",
    duration: "",
    joinDate: dayjs().format("YYYY-MM-DD"),
    expiryDate: "",
    status: "active",
    photo: "",
    notes: "",
    address: "",
    pt_form_completed: false,
    fingerprintId: Math.floor(1000 + Math.random() * 9000).toString(),
  });

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get("/plans");
        const activePlans = (res.data || []).filter((p) => p.active);
        setPlans(activePlans);
      } catch (err) {
        console.error("Failed to load plans:", err);
      }
    };
    fetchPlans();
  }, []);

  // Fetch Member (Edit) or User (Prefill)
  useEffect(() => {
    if (isEdit) {
      const fetchMember = async () => {
        try {
          const res = await api.get(`${API_ENDPOINT}/${id}`);
          const data = res.data;

          setOriginalPlan(data.plan || null);
          setForm({
            ...data,
            username: data.email ? data.email.split("@")[0] : "",
            password: "", // don't prefill
            height: data.height ? String(data.height) : "",
            weight: data.weight ? String(data.weight) : "",
            bmi: data.bmi ? String(data.bmi) : "",
            dob: (function () {
              if (!data.dob) return "";
              const dStr = String(data.dob);
              if (dStr.includes("0000") || dStr.includes("1899")) return "";
              if (dStr.includes("-") && dStr.split("-")[2]?.length === 4) {
                return `${dStr.split("-")[2]}-${dStr.split("-")[1]}-${dStr.split("-")[0]}`;
              }
              const parsed = dayjs(dStr);
              if (parsed.isValid() && parsed.year() > 1900)
                return parsed.format("YYYY-MM-DD");
              return "";
            })(),
            age: data.age ? String(data.age) : "",
            plan: data.plan || "",
            duration: data.duration != null ? data.duration.toString() : "",
            status: data.status || "active",
            notes: data.notes || "",
            address: data.address || "",
            pt_form_completed: data.pt_form_completed === 1 || data.pt_form_completed === true,
            joinDate: data.join_date
              ? dayjs(data.join_date).format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD"),
            expiryDate: data.expiry_date
              ? dayjs(data.expiry_date).format("YYYY-MM-DD")
              : "",
            fingerprintId:
              data.fingerprint_id ||
              Math.floor(1000 + Math.random() * 9000).toString(),
          });
        } catch {
          Alert.alert("Error", "Failed to load member");
        }
      };
      fetchMember();
    } else if (userId) {
      const fetchUser = async () => {
        try {
          const res = await api.get(`/users/${userId}`);
          const data = res.data;
          setForm((prev) => ({
            ...prev,
            name: data.username || "",
            username: data.username || "",
            phone: data.mobile || "",
            email: data.email || "",
            password: data.mobile || "",
          }));
        } catch {
          console.error("Failed to load user info");
        }
      };
      fetchUser();
    }
  }, [id, isEdit, userId]);

  // Helpers
  const parseDurationValue = (value) => {
    if (value == null || value === "") return null;
    const raw = value.toString().trim().toLowerCase();
    const numberMatch = raw.match(/(\d+(?:\.\d+)?)/);
    const amount = numberMatch ? Number(numberMatch[1]) : NaN;
    if (Number.isNaN(amount)) return null;
    if (raw.includes("year")) return Math.round(amount * 12);
    if (raw.includes("month")) return Math.round(amount);
    if (raw.includes("week")) return Math.ceil((amount * 7) / 30);
    if (raw.includes("day")) return Math.ceil(amount / 30);
    return Number.isFinite(amount) ? Math.round(amount) : null;
  };

  const calculateExpiryDate = (joinDate, duration) => {
    const durationMonths = parseDurationValue(duration);
    if (!joinDate || !durationMonths || durationMonths <= 0) return "";
    return dayjs(joinDate).add(durationMonths, "month").format("YYYY-MM-DD");
  };

  // Effects for calculated fields
  useEffect(() => {
    if (form.dob) {
      const calculatedAge = dayjs().diff(dayjs(form.dob), "year");
      setForm((prev) => ({
        ...prev,
        age: calculatedAge >= 0 ? calculatedAge.toString() : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, age: "" }));
    }
  }, [form.dob]);

  useEffect(() => {
    if (form.height && form.weight) {
      const h = Number(form.height) / 100;
      const w = Number(form.weight);
      if (h > 0) {
        const bmi = (w / (h * h)).toFixed(1);
        setForm((prev) => ({ ...prev, bmi }));
      }
    }
  }, [form.height, form.weight]);

  useEffect(() => {
    const durationMonths = parseDurationValue(form.duration);
    if (form.joinDate && durationMonths && durationMonths > 0) {
      const calculatedExpiry = calculateExpiryDate(form.joinDate, durationMonths);
      setForm((prev) => ({ ...prev, expiryDate: calculatedExpiry }));
    }
  }, [form.joinDate, form.duration]);

  // Input Handlers
  const handleChange = (name, value) => {
    if (name === "email") {
      const uname = value.split("@")[0];
      setForm((prev) => ({ ...prev, email: value, username: uname }));
    } else if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({
        ...prev,
        phone: numericValue,
        password: numericValue,
      }));
    } else if (name === "duration") {
      const expiryDate = calculateExpiryDate(form.joinDate, value);
      setForm((prev) => ({ ...prev, duration: value, expiryDate }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Image Picker
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setForm((prev) => ({
          ...prev,
          photo: `data:image/jpeg;base64,${result.assets[0].base64}`,
        }));
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleExtend = () => {
    const days = Number(extensionDays) || 0;
    const newExpiry = dayjs(form.expiryDate || dayjs())
      .add(days, "day")
      .format("YYYY-MM-DD");
    setForm((prev) => ({ ...prev, expiryDate: newExpiry }));
    Alert.alert("Success", `Extended by ${days} days`);
  };

  // Submit
  const handleSubmit = async () => {
    if (!form.name.trim()) return Alert.alert("Error", "Name is required");
    if (!form.phone || form.phone.length !== 10)
      return Alert.alert("Error", "A valid 10-digit phone number is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email))
      return Alert.alert("Error", "Please enter a valid email address");

    setLoading(true);
    try {
      // Only send fields the backend expects — avoid leaking raw DB fields
      // (join_date, expiry_date, updated_at, etc.) that come from the fetch spread.
      // MySQL DATE columns require NULL (not "") for empty values.
      const payload = {
        name: form.name,
        username: form.username,
        phone: form.phone,
        email: form.email,
        gender: form.gender || null,
        dob: form.dob ? dayjs(form.dob).format("YYYY-MM-DD") : null,
        age: form.age ? Number(form.age) : null,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        bmi: form.bmi ? Number(form.bmi) : null,
        plan: form.plan || null,
        duration: form.duration ? Number(form.duration) : null,
        joinDate: form.joinDate || null,
        expiryDate: form.expiryDate || null,
        status: form.status || "active",
        photo: form.photo || null,
        notes: form.notes || null,
        address: form.address || null,
        pt_form_completed: form.pt_form_completed ? 1 : 0,
        fingerprintId: form.fingerprintId || null,
        ...(isEdit ? {} : { password: form.password }),
      };

      const res = isEdit
        ? await api.put(`${API_ENDPOINT}/${id}`, payload)
        : await api.post(API_ENDPOINT, payload);

      Alert.alert("Success", isEdit ? "Member updated ✅" : "Member added 💪");
      router.back();
    } catch (err) {
      console.error("handleSubmit error:", err?.response?.data || err?.message || err);
      Alert.alert(
        "Error",
        err.response?.data?.message || err.response?.data?.error || err.message || "Server error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Update Member" : "Add Member"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              placeholderTextColor="#555"
              value={form.name}
              onChangeText={(v) => handleChange("name", v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username (Auto-generated)</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="username"
              placeholderTextColor="#555"
              value={form.username}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#555"
              keyboardType="phone-pad"
              maxLength={10}
              value={form.phone}
              onChangeText={(v) => handleChange("phone", v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. john@example.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#555"
              value={form.dob}
              onChangeText={(v) => handleChange("dob", v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={form.age}
              onChangeText={(v) => handleChange("age", v)}
            />
          </View>

          {!isEdit && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password (Same as Mobile)</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, styles.inputDisabled]}
                  placeholder="Password"
                  placeholderTextColor="#555"
                  secureTextEntry={!showPassword}
                  value={form.password}
                  editable={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.gender}
                onValueChange={(v) => handleChange("gender", v)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Select Gender" value="" color="#888" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 175"
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={form.height}
                onChangeText={(v) => handleChange("height", v)}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 70"
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={form.weight}
                onChangeText={(v) => handleChange("weight", v)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>BMI (Auto-calculated)</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="BMI"
              placeholderTextColor="#555"
              value={form.bmi}
              editable={false}
            />
          </View>

          <View style={[styles.inputGroup, styles.switchGroup]}>
            <Text style={styles.label}>PT Form Completed</Text>
            <Switch
              value={form.pt_form_completed}
              onValueChange={(v) => handleChange("pt_form_completed", v)}
              trackColor={{ false: "#333", true: "#e11d1d" }}
              thumbColor={form.pt_form_completed ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fingerprint ID</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="e.g. 1001"
                placeholderTextColor="#555"
                value={form.fingerprintId}
                onChangeText={(v) => handleChange("fingerprintId", v)}
              />
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() =>
                  handleChange(
                    "fingerprintId",
                    Math.floor(1000 + Math.random() * 9000).toString()
                  )
                }
              >
                <Text style={styles.btnSecondaryText}>Generate</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#555"
              value={form.joinDate}
              onChangeText={(v) => handleChange("joinDate", v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Plan{" "}
              {isEdit && originalPlan && form.plan && originalPlan !== form.plan && (
                <Text style={styles.badgeText}>(Changed)</Text>
              )}
            </Text>
            {isEdit && originalPlan && (
              <Text style={styles.subLabel}>Current: {originalPlan}</Text>
            )}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.plan}
                onValueChange={(val) => {
                  const selectedPlan = plans.find((p) => p.name === val);
                  let newDuration = form.duration;
                  if (selectedPlan) {
                    newDuration =
                      selectedPlan.duration ||
                      selectedPlan.duration_months ||
                      form.duration;
                  }
                  const newDurationMonths =
                    parseDurationValue(newDuration) ??
                    parseDurationValue(form.duration);
                  const newExpiryDate = calculateExpiryDate(
                    form.joinDate,
                    newDurationMonths
                  );

                  setForm((prev) => ({
                    ...prev,
                    plan: val,
                    duration: newDurationMonths
                      ? newDurationMonths.toString()
                      : prev.duration,
                    expiryDate: newExpiryDate,
                  }));
                }}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Select Plan" value="" color="#888" />
                {plans.map((p) => (
                  <Picker.Item
                    key={p.id}
                    label={`${p.name} - ${p.duration || p.duration_months || "?"}m - ₹${p.finalPrice || p.final_price || p.price}`}
                    value={p.name}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (Months)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={form.duration}
              onChangeText={(v) => handleChange("duration", v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expiry Date</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#555"
                value={form.expiryDate}
                onChangeText={(v) => handleChange("expiryDate", v)}
              />
              <View style={[styles.row, { marginLeft: 8 }]}>
                <TextInput
                  style={[styles.input, { width: 60, marginRight: 8, textAlign: "center" }]}
                  placeholder="Days"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  value={extensionDays}
                  onChangeText={setExtensionDays}
                />
                <TouchableOpacity style={styles.btnSecondary} onPress={handleExtend}>
                  <Text style={styles.btnSecondaryText}>Extend</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.status}
                onValueChange={(v) => handleChange("status", v)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Active" value="active" />
                <Picker.Item label="Inactive" value="inactive" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Home Address</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="Enter full address"
              placeholderTextColor="#555"
              multiline
              value={form.address}
              onChangeText={(v) => handleChange("address", v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="Health conditions, goals, etc."
              placeholderTextColor="#555"
              multiline
              value={form.notes}
              onChangeText={(v) => handleChange("notes", v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Photo</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={24} color="#fff" />
              <Text style={styles.imagePickerText}>Select Image</Text>
            </TouchableOpacity>
            {!!form.photo && (
              <Image source={{ uri: form.photo }} style={styles.previewImg} />
            )}
          </View>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>
                {isEdit ? "Update Member" : "Add Member"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  backBtn: {
    marginRight: 14,
    padding: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#222",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "600",
  },
  subLabel: {
    color: "#e11d1d",
    fontSize: 11,
    marginBottom: 6,
  },
  badgeText: {
    color: "#e11d1d",
    fontSize: 11,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
  },
  inputDisabled: {
    backgroundColor: "#111",
    color: "#777",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
  },
  pickerContainer: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    color: "#fff",
    height: 50,
  },
  pickerItem: {
    color: "#fff",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  btnSecondary: {
    backgroundColor: "#e11d1d",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: "#e11d1d",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#e11d1d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  imagePickerText: {
    color: "#fff",
    fontSize: 15,
  },
  previewImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#e11d1d",
  },
});
