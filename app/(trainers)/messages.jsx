import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import * as notificationService from "../../services/notificationService";

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("compose");

  /* ─── FETCH ASSIGNED MEMBERS & HISTORY ─── */
  const fetchHistory = async () => {
    try {
      const res = await api.get("/send-message/history");
      setHistory(res.data || []);
    } catch {
      console.log("Failed to fetch message history");
    }
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    if (!isRefresh) setLoading(true);

    try {
      // Load assigned members using the dashboard server-side filter
      const res = await api.get(`/assignments?trainerUserId=${user.id}`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];

      // Deduplicate active/unassigned status members
      const activeData = data.filter(
        (a) => !a.status || (a.status || "").toLowerCase() === "active"
      );

      const uniqueMap = new Map();
      activeData.forEach((a) => {
        const id = String(a.userId || a.user_id);
        if (!uniqueMap.has(id)) {
          uniqueMap.set(id, {
            id,
            name: a.username || a.user_name || "Member",
            email: a.userEmail || a.user_email || "",
            phone: a.userMobile || a.user_mobile || "",
          });
        }
      });

      setMembers(Array.from(uniqueMap.values()));
      await fetchHistory();
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to load members" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  /* ─── FILTER & SELECTION ─── */
  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const selectAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set()); // deselect all
    } else {
      setSelected(new Set(filtered.map((m) => m.id))); // select all filtered
    }
  };

  const selectedMembers = members.filter((m) => selected.has(m.id));

  /* ─── SEND ─── */
  const handleSend = async () => {
    if (!message.trim()) {
      Toast.show({ type: "error", text1: "Please enter a message" });
      return;
    }

    if (selected.size === 0) {
      Toast.show({ type: "error", text1: "Please select at least one member" });
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
      const response = await api.post("/send-message", {
        subject: subject.trim() || `Message from Trainer ${user?.name || user?.username}`,
        message: message.trim(),
        recipients,
      });

      // Send notification
      const recipientCount = selectedMembers.length;
      notificationService.sendMessageNotification(
        recipientCount,
        user?.name || user?.username,
        subject.trim()
      );

      Toast.show({ type: "success", text1: "Message Sent Successfully" });
      setMessage("");
      setSubject("");
      setSelected(new Set());
      setTab("history"); // Auto-switch to history tab after sending
      fetchHistory();
    } catch {
      Toast.show({ type: "error", text1: "Failed to send message" });
    } finally {
      setSending(false);
    }
  };

  /* ─── RENDER HELPER ─── */
  const renderCompose = () => (
    <View style={{ flex: 1 }}>
      {/* Subject */}
      <View style={styles.inputBox}>
        <Ionicons name="text-outline" size={18} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          placeholder="Subject (Optional)"
          placeholderTextColor="#6b7280"
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
        />
      </View>

      {/* Message */}
      <View style={[styles.inputBox, styles.messageBox]}>
        <TextInput
          placeholder="Type your message here..."
          placeholderTextColor="#6b7280"
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />
      </View>

      <Text style={styles.sectionTitle}>Select Recipients</Text>

      {/* Search Members */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          placeholder="Search members..."
          placeholderTextColor="#6b7280"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Select All Toggle */}
      {filtered.length > 0 && (
        <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll}>
          <Ionicons
            name={selected.size === filtered.length ? "checkbox" : "square-outline"}
            size={18}
            color={selected.size === filtered.length ? "#ff3c00" : "#6b7280"}
          />
          <Text style={styles.selectAllText}>
            {selected.size === filtered.length ? "Deselect All" : "Select All"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Members List */}
      {loading ? (
        <ActivityIndicator size="large" color="#ff3c00" style={{ marginTop: 20 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No members found</Text>
      ) : (
        <View style={styles.membersList}>
          {filtered.map((m) => {
            const isSelected = selected.has(m.id);
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => toggle(m.id)}
                activeOpacity={0.7}
                style={[
                  styles.memberCard,
                  isSelected && styles.memberCardSelected,
                ]}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {m.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberEmail}>{m.email || "No email"}</Text>
                </View>
                <View style={styles.checkbox}>
                  {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderHistory = () => (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#ff3c00" style={{ marginTop: 20 }} />
      ) : history.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>No message history found</Text>
        </View>
      ) : (
        history.map((h, i) => (
          <View key={h.id || i} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historySubject}>{h.subject || "No Subject"}</Text>
              <Text style={styles.historyDate}>
                {new Date(h.sent_at || h.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.historyMessage}>{h.message}</Text>
            <View style={styles.historyFooter}>
              <Ionicons name="people" size={12} color="#6b7280" />
              <Text style={styles.historyRecipients}>
                Sent to {Array.isArray(h.recipients) ? h.recipients.length : "multiple"} recipients
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={{ color: "#6b7280", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>Communicate with members</Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "compose" && styles.tabBtnActive]}
          onPress={() => setTab("compose")}
        >
          <Text style={[styles.tabText, tab === "compose" && styles.tabTextActive]}>
            Compose
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "history" && styles.tabBtnActive]}
          onPress={() => setTab("history")}
        >
          <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff3c00" />
          }
        >
          {tab === "compose" ? renderCompose() : renderHistory()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM ACTION BAR (Compose Only) */}
      {tab === "compose" && (
        <View style={styles.bottomBar}>
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionCount}>{selected.size}</Text>
            <Text style={styles.selectionLabel}>Members Selected</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (selected.size === 0 || !message.trim() || sending) && styles.sendBtnDisabled,
            ]}
            disabled={selected.size === 0 || !message.trim() || sending}
            onPress={handleSend}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#fff" />
                <Text style={styles.sendBtnText}>Send</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: { color: "#ffffff", fontSize: 24, fontWeight: "800" },

  /* TABS */
  tabContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#1f1f1f",
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: "#ff3c0020", borderColor: "#ff3c00" },
  tabText: { color: "#6b7280", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#ff3c00" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  /* INPUTS */
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#fff", height: 48, fontSize: 14 },
  messageBox: { alignItems: "flex-start", paddingVertical: 12 },
  textArea: { flex: 1, color: "#fff", height: 100, fontSize: 14 },

  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 12 },

  /* SEARCH */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "#fff", fontSize: 14 },

  /* SELECT ALL */
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
  },
  selectAllText: { color: "#d1d5db", fontSize: 14, fontWeight: "600" },

  /* MEMBERS LIST */
  membersList: { gap: 8 },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  memberCardSelected: { backgroundColor: "#ff3c0015", borderColor: "#ff3c0050" },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberAvatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  memberInfo: { flex: 1 },
  memberName: { color: "#f9fafb", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  memberEmail: { color: "#6b7280", fontSize: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4b5563",
    alignItems: "center",
    justifyContent: "center",
  },

  /* BOTTOM BAR */
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#141414",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#1f1f1f",
  },
  selectionInfo: { flex: 1 },
  selectionCount: { color: "#ff3c00", fontSize: 18, fontWeight: "800" },
  selectionLabel: { color: "#6b7280", fontSize: 11, fontWeight: "500", textTransform: "uppercase" },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff3c00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  sendBtnDisabled: { backgroundColor: "#4b5563" },
  sendBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  /* HISTORY */
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: "#6b7280", fontSize: 14 },
  historyCard: {
    backgroundColor: "#141414",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    marginBottom: 12,
  },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  historySubject: { color: "#fff", fontSize: 15, fontWeight: "700", flex: 1, marginRight: 12 },
  historyDate: { color: "#6b7280", fontSize: 11 },
  historyMessage: { color: "#d1d5db", fontSize: 13, lineHeight: 20, marginBottom: 12 },
  historyFooter: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#1f1f1f" },
  historyRecipients: { color: "#6b7280", fontSize: 11 },
});
