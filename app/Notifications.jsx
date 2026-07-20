import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import BackButton from "./BackButton";

export default function Notifications() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [totalMessages, setTotalMessages] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        loadUserAndMessages();
    }, [user]);

    const loadUserAndMessages = async () => {
        try {
            if (!user) return;

            const userData = user;
            const email = userData.email || userData.user_email || userData.userEmail || "";
            const userId = userData.id || userData.userId || userData.user_id || null;
            const memberId = userData.memberId || userData.member_id || null;

            setUserEmail(email);

            const res = await api.get("/send-message/history");
            const allMessages = Array.isArray(res.data) ? res.data : [];
            setTotalMessages(allMessages.length);

            const filtered = allMessages.filter((msg) => {
                // Direct match by top-level recipient fields (ignore msg.userId as it often represents sender_id)
                if (userId && Number(msg.recipient_id) === Number(userId)) return true;
                if (memberId && Number(msg.recipient_member_id) === Number(memberId)) return true;

                try {
                    let recipients = msg.recipients_json;
                    if (typeof recipients === "string") {
                        recipients = JSON.parse(recipients);
                    }

                    if (!Array.isArray(recipients)) return false;

                    return recipients.some((r) => {
                        const recipientUserId = Number(r.userId || r.u_id || r.user_id || r.id || 0);
                        const recipientMemberId = Number(r.memberId || r.member_id || 0);
                        const recipientEmail = String(r.email || r.user_email || r.userEmail || "").toLowerCase().trim();
                        const normalizedEmail = String(email || "").toLowerCase().trim();

                        if (userId && recipientUserId === Number(userId)) return true;
                        if (memberId && recipientMemberId === Number(memberId)) return true;
                        return normalizedEmail !== "" && recipientEmail === normalizedEmail;
                    });
                } catch {
                    return false;
                }
            });

            setMessages(filtered);
        } catch (err) {
            console.log("ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserAndMessages();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
            {/* HEADER ROW */}
            <View style={{
                paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
                backgroundColor: "#000", borderBottomWidth: 1, borderBottomColor: "#111",
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            }}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <BackButton style={{ marginRight: 12 }} />
                    <View>
                        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>Notifications</Text>
                        <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Recent Updates</Text>
                        <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
                            Showing {messages.length} of {totalMessages} total messages
                        </Text>
                    </View>
                </View>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e11d1d", alignItems: "center", justifyContent: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}>
                    <Ionicons name="notifications-outline" size={20} color="#fff" />
                </View>
            </View>

            <View className="flex-1 px-5 pt-4">

                {messages.length === 0 ? (
                    <View className="flex-1 justify-center items-center px-4">
                        <Ionicons name="mail-open-outline" size={60} color="#555" />
                        <Text className="text-gray-500 mt-4 text-center">
                            No notifications found for {userEmail || "this account"}.
                        </Text>
                        <Text className="text-gray-500 mt-2 text-center text-xs">
                            {totalMessages} total system messages checked.
                        </Text>
                    </View>
                ) : (
                    <ScrollView refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e11d1d" />
                    }>
                        {messages.map((msg) => (
                            <TouchableOpacity
                                key={msg.id}
                                onPress={() => setSelectedMessage(msg)}
                                className="bg-[#111] p-4 rounded-xl mb-3"
                            >
                                <Text className="text-white font-semibold">
                                    {msg.subject}
                                </Text>

                                <Text className="text-gray-400 text-xs mt-1">
                                    {new Date(msg.sent_at).toLocaleString()}
                                </Text>

                                <Text className="text-gray-300 mt-2" numberOfLines={1}>
                                    {msg.message}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* MODAL */}
                <Modal visible={!!selectedMessage} transparent animationType="fade">
                    <View className="flex-1 bg-black/80 justify-center px-5">
                        <View className="bg-[#111] rounded-2xl p-5">
                            <Text className="text-white text-lg font-bold mb-2">
                                {selectedMessage?.subject}
                            </Text>

                            <Text className="text-gray-300 mb-4">
                                {selectedMessage?.message}
                            </Text>

                            <Text className="text-gray-500 text-xs mb-4">
                                {selectedMessage &&
                                    new Date(selectedMessage.sent_at).toLocaleString()}
                            </Text>

                            <TouchableOpacity
                                onPress={() => setSelectedMessage(null)}
                                className="bg-primary py-3 rounded-xl items-center"
                            >
                                <Text className="text-white font-semibold">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}