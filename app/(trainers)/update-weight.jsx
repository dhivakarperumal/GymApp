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
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Dropdown } from "react-native-element-dropdown";

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

    const getBmiStatus = (bmi) => {
        const val = parseFloat(bmi);
        if (!val) return { label: "N/A", color: "#6b7280" }; // text-gray-500
        if (val < 18.5) return { label: "Underweight", color: "#60a5fa" }; // text-blue-400
        if (val >= 18.5 && val <= 24.9) return { label: "Normal", color: "#4ade80" }; // text-green-400
        if (val >= 25 && val <= 29.9) return { label: "Overweight", color: "#fb923c" }; // text-orange-400
        return { label: "Obese", color: "#ef4444" }; // text-red-500
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
            style={{ flex: 1, backgroundColor: "#000" }}
        >
            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, marginTop: 8 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginRight: 16, borderWidth: 1, borderColor: "#222" }}>
                        <Ionicons name="scale-outline" size={24} color="#e11d1d" />
                    </View>
                    <View>
                        <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>Body Metrics</Text>
                        <Text style={{ color: '#e11d1d', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4, fontWeight: 'bold' }}>Update Member Stats</Text>
                    </View>
                </View>

            {/* MEMBER LIST */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
                    <ActivityIndicator size="large" color="#e11d1d" />
                    <Text style={{ color: '#9ca3af', marginTop: 16, fontSize: 14, fontWeight: '600' }}>Loading members...</Text>
                </View>
            ) : (
                <View style={{ backgroundColor: '#111', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1a1a1a', marginBottom: 24, shadowColor: 'rgba(0,0,0,0.5)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 4, elevation: 6 }}>
                    <Text style={{ color: '#e11d1d', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Select Member</Text>
                    <Dropdown
                    style={{ backgroundColor: "#111", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 16, marginBottom: 16 }}

                    containerStyle={{
                        backgroundColor: "#111",
                        borderRadius: 12,
                    }}

                    itemContainerStyle={{
                        backgroundColor: "#111",
                    }}

                    activeColor="#222" // ✅ no more white selection

                    placeholderStyle={{ color: "#aaa" }}
                    selectedTextStyle={{ color: "white" }}

                    inputSearchStyle={{
                        color: "black",
                        backgroundColor: "white",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                    }}

                    iconStyle={{ tintColor: "white" }}

                    data={members}
                    search
                    maxHeight={400}

                    labelField="name"
                    valueField="id"

                    placeholder="Select Member"
                    searchPlaceholder="Search member..."

                    value={selectedMember?.id}

                    onChange={(item) => selectMember(item)}

                    renderItem={(item) => {
                        const isSelected = selectedMember?.id === item.id;

                        return (
                            <View
                                style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: isSelected ? "#222" : "transparent"
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: "bold",
                                        color: isSelected ? "white" : "white"
                                    }}
                                >
                                    {item.name || "No Name"}
                                </Text>

                                <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                                    {item.phone || "No Phone"}
                                </Text>
                            </View>
                        );
                    }}
                />
                </View>
            )}

            {/* FORM */}
            {selectedMember && (
                <View style={{ backgroundColor: '#111', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1a1a1a', marginBottom: 32, shadowColor: 'rgba(0,0,0,0.5)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 4, elevation: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 20 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                            <Ionicons name="person" size={20} color="#e11d1d" />
                        </View>
                        <View>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{selectedMember.name}</Text>
                            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>{selectedMember.phone}</Text>
                        </View>
                    </View>

                    {/* WEIGHT */}
                    <Text style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 'bold', marginLeft: 4 }}>Current Weight</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#222', borderRadius: 16, marginBottom: 20, paddingHorizontal: 16, height: 56 }}>
                        <Ionicons name="fitness-outline" size={20} color="#888" style={{ marginRight: 12 }} />
                        <TextInput
                            placeholder="e.g. 75"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            style={{ flex: 1, color: "white", fontWeight: "600", fontSize: 18 }}
                            value={measurements.weight}
                            onChangeText={(v) => handleChange("weight", v)}
                        />
                        <Text style={{ color: '#555', fontWeight: 'bold', fontSize: 14 }}>KG</Text>
                    </View>

                    {/* HEIGHT */}
                    <Text style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 'bold', marginLeft: 4 }}>Current Height</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#222', borderRadius: 16, marginBottom: 24, paddingHorizontal: 16, height: 56 }}>
                        <Ionicons name="resize-outline" size={20} color="#888" style={{ marginRight: 12 }} />
                        <TextInput
                            placeholder="e.g. 175"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            style={{ flex: 1, color: "white", fontWeight: "600", fontSize: 18 }}
                            value={measurements.height}
                            onChangeText={(v) => handleChange("height", v)}
                        />
                        <Text style={{ color: '#555', fontWeight: 'bold', fontSize: 14 }}>CM</Text>
                    </View>

                    {/* BMI */}
                    <View style={{ backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#222', padding: 20, borderRadius: 16, marginBottom: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontWeight: 'bold' }}>Calculated BMI</Text>
                            <Text style={{ color: 'white', fontSize: 30, fontWeight: '900' }}>
                                {measurements.bmi || "0.0"}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, borderColor: '#333' }}>
                            <Text style={{ color: getBmiStatus(measurements.bmi).color, fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                                {getBmiStatus(measurements.bmi).label}
                            </Text>
                        </View>
                    </View>

                    {/* SAVE BUTTON */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={submitting}
                        style={{
                            backgroundColor: "#e11d1d", padding: 16, borderRadius: 16,
                            flexDirection: "row", alignItems: "center", justifyContent: "center",
                            shadowColor: "#e11d1d", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6
                        }}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={{ color: "white", fontWeight: "900", fontSize: 18, marginRight: 8, textTransform: "uppercase", letterSpacing: 1 }}>Save Stats</Text>
                                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
            <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}