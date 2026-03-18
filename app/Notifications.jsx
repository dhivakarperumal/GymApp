import { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "./BackButton";
import Header from "./Header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Notifications() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        loadUserAndMessages();
    }, []);

    const loadUserAndMessages = async () => {
        try {
            const storedUser = await AsyncStorage.getItem("user");
            if (!storedUser) return;

            const parsed = JSON.parse(storedUser);
            const userData = Array.isArray(parsed) ? parsed[0] : parsed;

            const email = userData.email || userData.user_email;
            setUserEmail(email);

            const res = await api.get("/send-message/history");
            const allMessages = Array.isArray(res.data) ? res.data : [];

            const filtered = allMessages.filter((msg) => {
                try {
                    let recipients = msg.recipients_json;

                    if (typeof recipients === "string") {
                        recipients = JSON.parse(recipients);
                    }

                    if (!Array.isArray(recipients)) return false;

                    return recipients.some((r) => {
                        const rEmail = String(r.email || "").toLowerCase().trim();
                        const uEmail = String(email || "").toLowerCase().trim();
                        return rEmail === uEmail && uEmail !== "";
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

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <Header />
            <View className="flex-1 px-5">
                <BackButton />

                <Text className="text-white text-2xl font-bold mt-4 mb-4">
                    Notifications
                </Text>

                {messages.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Ionicons name="mail-open-outline" size={60} color="#555" />
                        <Text className="text-gray-500 mt-4 text-center">
                            No notifications found
                        </Text>
                    </View>
                ) : (
                    <ScrollView>
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