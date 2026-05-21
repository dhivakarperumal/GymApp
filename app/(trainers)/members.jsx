import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import dayjs from "dayjs";

export default function TrainerMembers() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | expired

  const fetchMembers = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/assignments?trainerUserId=${user.id}`);
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Deduplicate by userId
      const seen = new Set();
      const unique = [];
      for (const a of raw) {
        const uid = String(a.userId || a.user_id || "");
        if (uid && !seen.has(uid)) {
          seen.add(uid);
          unique.push(a);
        }
      }
      setMembers(unique);
      setFiltered(unique);
    } catch (err) {
      console.log("Fetch members error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Apply search + filter
  useEffect(() => {
    let result = [...members];

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (m) =>
          (m.username || m.user_name || "").toLowerCase().includes(s) ||
          (m.userEmail || m.user_email || "").toLowerCase().includes(s) ||
          (m.userMobile || m.user_mobile || "").includes(s)
      );
    }

    if (filterStatus === "active") {
      result = result.filter(
        (m) => !m.status || m.status.toLowerCase() === "active"
      );
    } else if (filterStatus === "expired") {
      result = result.filter(
        (m) => m.status && m.status.toLowerCase() !== "active"
      );
    }

    setFiltered(result);
  }, [search, filterStatus, members]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const getName = (m) => m.username || m.user_name || "Member";
  const getEmail = (m) => m.userEmail || m.user_email || "—";
  const getMobile = (m) => m.userMobile || m.user_mobile || "—";
  const getPlan = (m) => m.planName || m.plan_name || "—";
  const getStatus = (m) => m.status || "active";
  const isActive = (m) => !m.status || m.status.toLowerCase() === "active";

  const formatDate = (val) => {
    if (!val) return "—";
    const d = dayjs(val);
    return d.isValid() ? d.format("DD MMM YYYY") : "—";
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const diff = dayjs(endDate).startOf("day").diff(dayjs().startOf("day"), "day");
    return diff;
  };

  /* ─── Avatar ─── */
  const Avatar = ({ name, size = 48 }) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>
        {(name || "?").charAt(0).toUpperCase()}
      </Text>
    </View>
  );

  /* ─── Member Card ─── */
  const MemberCard = ({ item }) => {
    const days = getRemainingDays(item.planEndDate || item.plan_end_date);
    const active = isActive(item);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setSelectedMember(item)}
      >
        <View style={styles.cardRow}>
          <Avatar name={getName(item)} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.memberName} numberOfLines={1}>
              {getName(item)}
            </Text>
            <Text style={styles.memberSub} numberOfLines={1}>
              {getEmail(item)}
            </Text>
            <View style={styles.inlineRow}>
              <Ionicons name="call" size={11} color="#666" />
              <Text style={styles.memberSub2}> {getMobile(item)}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: active ? "#10b98115" : "#ef444415" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: active ? "#10b981" : "#ef4444" },
              ]}
            >
              {active ? "Active" : "Expired"}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Plan</Text>
            <Text style={styles.footerVal}>{getPlan(item)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Start</Text>
            <Text style={styles.footerVal}>
              {formatDate(item.planStartDate || item.plan_start_date)}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Remaining</Text>
            <Text
              style={[
                styles.footerVal,
                {
                  color:
                    days === null
                      ? "#888"
                      : days <= 0
                      ? "#ef4444"
                      : days <= 5
                      ? "#f59e0b"
                      : "#10b981",
                },
              ]}
            >
              {days === null
                ? "—"
                : days <= 0
                ? "Expired"
                : `${days}d`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ptBtn}
            onPress={() =>
              router.push({
                pathname: "/(trainers)/pt-form",
                params: { member_id: item.gymMemberId || item.userId || item.user_id },
              })
            }
          >
            <Ionicons name="document-text-outline" size={14} color="#f97316" />
            <Text style={styles.ptBtnText}>PT</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  /* ─── Detail Modal ─── */
  const DetailModal = () => {
    if (!selectedMember) return null;
    const m = selectedMember;
    const days = getRemainingDays(m.planEndDate || m.plan_end_date);

    const Row = ({ label, value, valueColor }) => (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>
          {value || "—"}
        </Text>
      </View>
    );

    return (
      <Modal
        animationType="slide"
        transparent
        visible={!!selectedMember}
        onRequestClose={() => setSelectedMember(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setSelectedMember(null)}
          />
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Avatar name={getName(m)} size={56} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.modalName}>{getName(m)}</Text>
                <Text style={styles.modalSub}>{getEmail(m)}</Text>
                <Text style={styles.modalSub}>{getMobile(m)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedMember(null)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Plan */}
              <Text style={styles.sectionTitle}>Membership</Text>
              <View style={styles.detailCard}>
                <Row label="Plan" value={getPlan(m)} />
                <Row label="Start" value={formatDate(m.planStartDate || m.plan_start_date)} />
                <Row label="End" value={formatDate(m.planEndDate || m.plan_end_date)} />
                <Row
                  label="Remaining"
                  value={
                    days === null ? "—" : days <= 0 ? "Expired" : `${days} days`
                  }
                  valueColor={
                    days === null
                      ? "#888"
                      : days <= 0
                      ? "#ef4444"
                      : days <= 5
                      ? "#f59e0b"
                      : "#10b981"
                  }
                />
                <Row label="Status" value={getStatus(m)} />
              </View>

              {/* Actions */}
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#f59e0b15" }]}
                  onPress={() => {
                    setSelectedMember(null);
                    router.push({
                      pathname: "/(trainers)/add-member",
                      params: m.gymMemberId ? { id: m.gymMemberId } : { user_id: m.userId },
                    });
                  }}
                >
                  <Ionicons name="pencil-outline" size={22} color="#f59e0b" />
                  <Text style={[styles.actionText, { color: "#f59e0b" }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#10b98115" }]}
                  onPress={() => {
                    setSelectedMember(null);
                    router.push({
                      pathname: "/(trainers)/buy-plan",
                      params: m.gymMemberId
                        ? { member_id: m.gymMemberId }
                        : { user_id: m.userId },
                    });
                  }}
                >
                  <Ionicons name="card-outline" size={22} color="#10b981" />
                  <Text style={[styles.actionText, { color: "#10b981" }]}>Update Plan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#f9731615" }]}
                  onPress={() => {
                    setSelectedMember(null);
                    router.push({
                      pathname: "/(trainers)/pt-form",
                      params: { member_id: m.gymMemberId || m.userId || m.user_id },
                    });
                  }}
                >
                  <Ionicons name="document-text-outline" size={22} color="#f97316" />
                  <Text style={[styles.actionText, { color: "#f97316" }]}>PT Form</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.actionsRow, { marginTop: 10 }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#3b82f615" }]}
                  onPress={() => {
                    setSelectedMember(null);
                    router.push("/(trainers)/Attendance");
                  }}
                >
                  <Ionicons name="calendar-outline" size={22} color="#3b82f6" />
                  <Text style={[styles.actionText, { color: "#3b82f6" }]}>Attendance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#8b5cf615" }]}
                  onPress={() => {
                    setSelectedMember(null);
                    router.push("/(trainers)/session-tracking");
                  }}
                >
                  <Ionicons name="analytics-outline" size={22} color="#8b5cf6" />
                  <Text style={[styles.actionText, { color: "#8b5cf6" }]}>Sessions</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e11d1d" />
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Members</Text>
          <Text style={styles.headerSub}>
            {filtered.length} of {members.length} assigned
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#666" />
        <TextInput
          placeholder="Search by name, email, mobile..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "expired", label: "Expired" },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilterStatus(f.key)}
            style={[
              styles.filterTab,
              filterStatus === f.key && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === f.key && styles.filterTabTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={52} color="#333" />
          <Text style={styles.emptyText}>No members found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) =>
            String(item.userId || item.user_id || i)
          }
          renderItem={({ item }) => <MemberCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e11d1d"
              colors={["#e11d1d"]}
            />
          }
        />
      )}

      {/* Detail Modal */}
      <DetailModal />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push("/(trainers)/add-member")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#888", marginTop: 12, fontSize: 14 },
  emptyText: { color: "#555", marginTop: 16, fontSize: 16 },

  /* Header */
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
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  headerSub: { color: "#e11d1d", fontSize: 12, marginTop: 2, fontWeight: "600" },

  /* Search */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
  },

  /* Filter */
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
  },
  filterTabActive: {
    backgroundColor: "#e11d1d15",
    borderColor: "#e11d1d40",
  },
  filterTabText: { color: "#666", fontSize: 12, fontWeight: "600" },
  filterTabTextActive: { color: "#e11d1d" },

  /* List */
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  /* Card */
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  cardRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    backgroundColor: "#e11d1d",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  memberName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  memberSub: { color: "#888", fontSize: 12, marginTop: 1 },
  memberSub2: { color: "#666", fontSize: 11 },
  inlineRow: { flexDirection: "row", alignItems: "center", marginTop: 1 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  cardDivider: {
    height: 1,
    backgroundColor: "#1d1d1d",
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerItem: { alignItems: "flex-start" },
  footerLabel: {
    color: "#555",
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 2,
  },
  footerVal: { color: "#ccc", fontSize: 12, fontWeight: "600" },
  ptBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9731615",
    borderWidth: 1,
    borderColor: "#f9731630",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  ptBtnText: { color: "#f97316", fontSize: 11, fontWeight: "700" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#111",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "85%",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#222",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  modalName: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  modalSub: { color: "#888", fontSize: 12, marginTop: 2 },
  closeBtn: {
    padding: 6,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
  },
  sectionTitle: {
    color: "#e11d1d",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: "#0d0d0d",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1d1d1d",
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  detailLabel: { color: "#666", fontSize: 13 },
  detailValue: { color: "#ddd", fontSize: 13, fontWeight: "600" },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  actionText: { fontSize: 11, fontWeight: "700" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e11d1d",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#e11d1d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
