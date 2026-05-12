import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import * as notificationService from "../services/notificationService";
import BackButton from "./BackButton";
import Header from "./Header";

export default function TrainerSendMessage() {
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("compose");

  /* FETCH HISTORY */
  const fetchHistory = async () => {
    try {
      const res = await api.get("/send-message/history");
      setHistory(res.data || []);
    } catch {
      console.log("History error");
    }
  };

  /* FETCH ASSIGNED MEMBERS */
  useEffect(() => {
    if (!user?.id) return;

    const fetchMembers = async () => {
      try {
        const res = await api.get(`/assignments?trainerUserId=${user.id}`);
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];

        const mapped = data.map((a) => ({
          id: String(a.userId || a.user_id),
          name: a.username || "Member",
          email: a.userEmail || "",
          phone: a.userMobile || "",
        }));

        const unique = [];
        const ids = new Set();

        mapped.forEach((m) => {
          if (!ids.has(m.id)) {
            ids.add(m.id);
            unique.push(m);
          }
        });

        setMembers(unique);
      } catch (err) {
        Toast.show({ type: "error", text1: "Failed to load members" });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
    fetchHistory();
  }, [user]);

  /* FILTER */
  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  /* SELECT */
  const toggle = (id) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((m) => m.id)));
    }
  };

  const selectedMembers = members.filter((m) => selected.has(m.id));

  /* SEND */
  const handleSend = async () => {
    if (!message.trim()) {
      Toast.show({ type: "error", text1: "Enter message" });
      return;
    }

    if (selected.size === 0) {
      Toast.show({ type: "error", text1: "Select members" });
      return;
    }

    setSending(true);

    const recipients = selectedMembers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
    }));

    try {
      await api.post("/send-message", {
        subject: subject || `Message from Trainer ${user?.username}`,
        message,
        recipients,
      });

      // Send notification
      notificationService.sendMessageNotification(
        selectedMembers.length,
        user?.name || user?.username,
        subject || `Message from Trainer ${user?.username}`
      );

      Toast.show({ type: "success", text1: "Message Sent" });

      setMessage("");
      setSubject("");
      setSelected(new Set());

      fetchHistory();
    } catch {
      Toast.show({ type: "error", text1: "Send failed" });
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Header />

      <View className="flex-1 px-5">
        <BackButton />

        {/* HEADER */}
        <Text className="text-white text-2xl font-bold mt-4">
          Send Message
        </Text>

        {/* TABS */}
        <View className="flex-row mt-4 mb-4">
          <TouchableOpacity
            onPress={() => setTab("compose")}
            className={`flex-1 py-2 rounded-xl mr-2 ${
              tab === "compose" ? "bg-primary" : "bg-[#222]"
            }`}
          >
            <Text className="text-center text-white">Compose</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab("history")}
            className={`flex-1 py-2 rounded-xl ${
              tab === "history" ? "bg-primary" : "bg-[#222]"
            }`}
          >
            <Text className="text-center text-white">History</Text>
          </TouchableOpacity>
        </View>

        {tab === "compose" ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {/* SEARCH */}
            <TextInput
              placeholder="Search members..."
              placeholderTextColor="#777"
              value={search}
              onChangeText={setSearch}
              className="bg-[#111] text-white p-3 rounded-xl mb-3"
            />

            {/* SELECT ALL */}
            <TouchableOpacity
              onPress={selectAll}
              className="bg-[#222] p-3 rounded-xl mb-3"
            >
              <Text className="text-white text-center">
                {selected.size === filtered.length
                  ? "Deselect All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>

            {/* MEMBERS */}
            {loading ? (
              <ActivityIndicator color="red" />
            ) : (
              filtered.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => toggle(m.id)}
                  className={`p-3 rounded-xl mb-2 ${
                    selected.has(m.id) ? "bg-primary/30" : "bg-[#111]"
                  }`}
                >
                  <Text className="text-white">{m.name}</Text>
                  <Text className="text-gray-400 text-xs">{m.email}</Text>
                </TouchableOpacity>
              ))
            )}

            {/* SUBJECT */}
            <TextInput
              placeholder="Subject"
              placeholderTextColor="#777"
              value={subject}
              onChangeText={setSubject}
              className="bg-[#111] text-white p-3 rounded-xl mt-4"
            />

            {/* MESSAGE */}
            <TextInput
              placeholder="Message..."
              placeholderTextColor="#777"
              value={message}
              onChangeText={setMessage}
              multiline
              className="bg-[#111] text-white p-4 rounded-xl mt-3 h-32"
            />

            {/* SEND */}
            <TouchableOpacity
              onPress={handleSend}
              className="bg-primary py-4 rounded-xl mt-4 items-center"
            >
              <Text className="text-white font-bold">
                {sending ? "Sending..." : "Send Message"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView>
            {history.map((h) => (
              <View key={h.id} className="bg-[#111] p-4 rounded-xl mb-3">
                <Text className="text-white font-bold">{h.subject}</Text>
                <Text className="text-gray-400 text-xs">
                  {new Date(h.sent_at).toLocaleString()}
                </Text>
                <Text className="text-gray-300 mt-2">{h.message}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}