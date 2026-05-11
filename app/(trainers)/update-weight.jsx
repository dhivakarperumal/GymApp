import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function UpdateWeight() {
    const { user } = useAuth();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

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
        setIsModalVisible(true);

        try {
            const res = await api.get(`/members/${member.gmId}`);
            const data = res.data;

            setMeasurements({
                weight: data.weight?.toString() || "",
                height: data.height?.toString() || "",
                bmi: data.bmi?.toString() || "",
            });
        } catch (err) {
            console.log("Error fetching member data:", err);
            // Default to empty if fetch fails
            setMeasurements({ weight: "", height: "", bmi: "" });
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

            setIsModalVisible(false);
            setSelectedMember(null);
            setMeasurements({ weight: "", height: "", bmi: "" });
            fetchMembers(); // Refresh list if needed
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
        <View style={{ flex: 1, backgroundColor: "#000" }}>
            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginRight: 16, borderWidth: 1, borderColor: "#222" }}>
                        <Ionicons name="scale-outline" size={24} color="#e11d1d" />
                    </View>
                    <View>
                        <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>Body Metrics</Text>
                        <Text style={{ color: '#e11d1d', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4, fontWeight: 'bold' }}>Update Member Stats</Text>
                    </View>
                </View>

                {/* SEARCH BOX (Compact) */}
                <View style={{ backgroundColor: '#0d0d0d', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#222' }}>
                    <Ionicons name="search-outline" size={16} color="#444" />
                    <TextInput
                        placeholder="Search members..."
                        placeholderTextColor="#444"
                        value={search}
                        onChangeText={setSearch}
                        style={{ flex: 1, color: 'white', marginLeft: 10, fontSize: 14, height: 32 }}
                    />
                </View>

                {/* MEMBER LIST */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
                        <ActivityIndicator size="large" color="#e11d1d" />
                        <Text style={{ color: '#9ca3af', marginTop: 16, fontSize: 14, fontWeight: '600' }}>Loading members...</Text>
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <Ionicons name="people-outline" size={48} color="#222" />
                        <Text style={{ color: '#444', marginTop: 16 }}>No members found</Text>
                    </View>
                ) : (
                    filtered.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => selectMember(item)}
                            activeOpacity={0.85}
                            style={{
                                backgroundColor: '#141414',
                                borderRadius: 24,
                                padding: 20,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: '#262626',
                                flexDirection: 'row',
                                alignItems: 'center',
                                shadowColor: "#ff3c00",
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.1,
                                shadowRadius: 20,
                                elevation: 5,
                            }}
                        >
                            {/* Avatar with Glow */}
                            <View style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: '#1a1a1a',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 16,
                                borderWidth: 1,
                                borderColor: '#333',
                                position: 'relative'
                            }}>
                                <View style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 28,
                                    backgroundColor: '#e11d1d',
                                    opacity: 0.1,
                                }} />
                                <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>{item.name.charAt(0).toUpperCase()}</Text>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'white', fontWeight: '800', fontSize: 18, letterSpacing: -0.5 }}>{item.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Ionicons name="call-outline" size={12} color="#666" style={{ marginRight: 4 }} />
                                    <Text style={{ color: '#666', fontSize: 13, fontWeight: '500' }}>{item.phone || "No Phone"}</Text>
                                </View>
                            </View>

                            <View style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: '#1a1a1a',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: '#262626'
                            }}>
                                <Ionicons name="arrow-forward" size={20} color="#e11d1d" />
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ─── UPDATE WEIGHT MODAL (Bottom Sheet Style) ─── */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.95)' }}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1, width: '100%' }}
                    >
                        <View style={{
                            backgroundColor: '#111',
                            borderTopLeftRadius: 32,
                            borderTopRightRadius: 32,
                            paddingHorizontal: 20,
                            paddingTop: 18,
                            paddingBottom: 12,
                            borderWidth: 1,
                            borderColor: '#222',
                            height: '42%',
                        }}>
                            {/* Modal Header */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <View>
                                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Update Metrics</Text>
                                    <Text style={{ color: '#e11d1d', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>{selectedMember?.name}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ backgroundColor: '#222', padding: 8, borderRadius: 12 }}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            {/* WEIGHT */}
                            <Text style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 'bold', marginLeft: 4 }}>Current Weight (KG)</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#222', borderRadius: 16, marginBottom: 20, paddingHorizontal: 16, height: 56 }}>
                                <Ionicons name="fitness-outline" size={20} color="#444" style={{ marginRight: 12 }} />
                                <TextInput
                                    placeholder="e.g. 75"
                                    placeholderTextColor="#333"
                                    keyboardType="numeric"
                                    style={{ flex: 1, color: "white", fontWeight: "600", fontSize: 18 }}
                                    value={measurements.weight}
                                    onChangeText={(v) => handleChange("weight", v)}
                                />
                            </View>

                            {/* HEIGHT */}
                            <Text style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 'bold', marginLeft: 4 }}>Current Height (CM)</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d0d0d', borderWidth: 1, borderColor: '#222', borderRadius: 16, marginBottom: 20, paddingHorizontal: 16, height: 56 }}>
                                <Ionicons name="resize-outline" size={20} color="#444" style={{ marginRight: 12 }} />
                                <TextInput
                                    placeholder="e.g. 175"
                                    placeholderTextColor="#333"
                                    keyboardType="numeric"
                                    style={{ flex: 1, color: "white", fontWeight: "600", fontSize: 18 }}
                                    value={measurements.height}
                                    onChangeText={(v) => handleChange("height", v)}
                                />
                            </View>

                            {/* BMI RESULT */}
                            <View style={{ backgroundColor: '#1a1a1a', padding: 20, borderRadius: 20, marginBottom: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#262626' }}>
                                <View>
                                    <Text style={{ color: '#666', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', marginBottom: 4 }}>Body Mass Index</Text>
                                    <Text style={{ color: 'white', fontSize: 32, fontWeight: '900' }}>{measurements.bmi || "0.0"}</Text>
                                </View>
                                <View style={{ backgroundColor: '#000', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#333' }}>
                                    <Text style={{ color: getBmiStatus(measurements.bmi).color, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' }}>
                                        {getBmiStatus(measurements.bmi).label}
                                    </Text>
                                </View>
                            </View>

                            {/* SAVE BUTTON */}
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={submitting}
                                style={{
                                    backgroundColor: "#e11d1d", padding: 18, borderRadius: 20,
                                    flexDirection: "row", alignItems: "center", justifyContent: "center",
                                    shadowColor: "#e11d1d", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8
                                }}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={{ color: "white", fontWeight: "900", fontSize: 18, marginRight: 8, textTransform: "uppercase", letterSpacing: 1 }}>Save Changes</Text>
                                        <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}