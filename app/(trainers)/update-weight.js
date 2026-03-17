import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function UpdateWeight() {
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [measurements, setMeasurements] = useState({
    weight: "",
    height: "",
    bmi: "",
  });

  useEffect(() => {
    if (user?.id) fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/assignments?trainerUserId=${user.id}`);
      const data =
        Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.assignments || [];

      const list = data.map((m) => ({
        id: m.userId || m.user_id || m.id,
        gmId: m.gymMemberId || m.gm_id || m.id,
        name: m.username || m.user_name || "Member",
        phone: m.userMobile || m.user_mobile || "",
      }));

      setMembers(list);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "";
    const h = height / 100;
    return (weight / (h * h)).toFixed(1);
  };

  const handleChange = (field, value) => {
    const updated = { ...measurements, [field]: value };

    if (field === "weight" || field === "height") {
      updated.bmi = calculateBMI(
        field === "weight" ? Number(value) : Number(measurements.weight),
        field === "height" ? Number(value) : Number(measurements.height)
      );
    }

    setMeasurements(updated);
  };

  const selectMember = async (member) => {
    setSelectedMember(member);

    try {
      const res = await api.get(`/members/${member.gmId}`);
      const data = res.data;

      setMeasurements({
        weight: data.weight?.toString() || "",
        height: data.height?.toString() || "",
        bmi: data.bmi?.toString() || "",
      });
    } catch (err) {
      Alert.alert("Error", "Failed to fetch member data");
    }
  };

  const handleSave = async () => {
    if (!selectedMember) return;

    try {
      setSubmitting(true);

      const fullRes = await api.get(`/members/${selectedMember.gmId}`);

      const payload = {
        ...fullRes.data,
        weight: Number(measurements.weight),
        height: Number(measurements.height),
        bmi: Number(measurements.bmi),
      };

      await api.put(`/members/${selectedMember.gmId}`, payload);

      Alert.alert("Success", "Updated successfully 🚀");

      setSelectedMember(null);
      setMeasurements({ weight: "", height: "", bmi: "" });
    } catch (err) {
      Alert.alert("Error", "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black p-4"
    >
      <Text className="text-white text-xl font-bold mb-4">
        Update Weight
      </Text>

      {/* SEARCH */}
      <TextInput
        placeholder="Search..."
        placeholderTextColor="#666"
        className="bg-[#111] text-white p-3 rounded-lg mb-4"
        value={search}
        onChangeText={setSearch}
      />

      {/* MEMBER LIST */}
      {loading ? (
        <ActivityIndicator color="red" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          style={{ maxHeight: 200 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selectMember(item)}
              className={`p-3 mb-2 rounded-lg ${
                selectedMember?.id === item.id
                  ? "bg-red-600"
                  : "bg-[#111]"
              }`}
            >
              <Text className="text-white font-bold">{item.name}</Text>
              <Text className="text-gray-400 text-xs">{item.phone}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FORM */}
      {selectedMember && (
        <View className="mt-6 bg-[#111] p-4 rounded-xl">
          <Text className="text-white font-bold mb-3">
            {selectedMember.name}
          </Text>

          {/* WEIGHT */}
          <TextInput
            placeholder="Weight (kg)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            className="bg-black text-white p-3 rounded-lg mb-3"
            value={measurements.weight}
            onChangeText={(v) => handleChange("weight", v)}
          />

          {/* HEIGHT */}
          <TextInput
            placeholder="Height (cm)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            className="bg-black text-white p-3 rounded-lg mb-3"
            value={measurements.height}
            onChangeText={(v) => handleChange("height", v)}
          />

          {/* BMI */}
          <View className="bg-black p-3 rounded-lg mb-4">
            <Text className="text-gray-400 text-xs">BMI</Text>
            <Text className="text-red-500 text-xl font-bold">
              {measurements.bmi || "0.0"}
            </Text>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={submitting}
            className="bg-red-600 p-4 rounded-xl items-center"
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}