import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../../services/api";

const parseDecimal = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const EMIList = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  
  const [filterType, setFilterType] = useState("Pending");
  const [customRange, setCustomRange] = useState({ start: null, end: null });
  const [datePickerConfig, setDatePickerConfig] = useState({ show: false, field: null });
  
  const [viewingDetails, setViewingDetails] = useState(null);

  useEffect(() => {
    fetchEMI();
  }, []);

  const fetchEMI = async () => {
    try {
      setLoading(true);
      const response = await api.get("/memberships");
      const emiOnly = response.data.filter((m) => m.paymentMode === "emi");
      setMemberships(emiOnly);
    } catch (error) {
      console.log(error);
      Toast.show({ type: "error", text1: "Failed to load EMI data" });
    } finally {
      setLoading(false);
    }
  };

  const filteredEMIs = memberships.filter((m) => {
    const matchesSearch = (m.userName || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const totalPrice = parseDecimal(m.price);
    const paid = parseDecimal(m.pricePaid);
    const second = parseDecimal(m.secondPaymentPaid);
    const remaining = totalPrice - paid - second;
    const isPaid = remaining <= 0;

    if (filterType === "Paid" && !isPaid) return false;
    if (filterType === "Pending" && isPaid) return false;
    if (filterType === "Custom" && customRange.start && customRange.end) {
      const itemDate = dayjs(m.startDate || m.createdAt || m.created_at);
      const start = dayjs(customRange.start).startOf("day");
      const end = dayjs(customRange.end).endOf("day");
      if (itemDate.isBefore(start) || itemDate.isAfter(end)) return false;
    }

    return true;
  });

  const handleUpdatePayment = async () => {
    if (!selectedMembership) return;
    const amount = parseDecimal(updateAmount);
    if (amount <= 0) {
      Toast.show({ type: "error", text1: "Enter valid amount" });
      return;
    }
    try {
      await api.put(`/memberships/${selectedMembership.id}`, {
        secondPaymentPaid: parseDecimal(selectedMembership.secondPaymentPaid) + amount,
        paymentId: paymentMode,
        paymentStatus: "Paid", 
      });
      Toast.show({ type: "success", text1: "Payment Updated" });
      setSelectedMembership(null);
      setUpdateAmount("");
      setPaymentMode("Cash");
      fetchEMI();
    } catch (error) {
      console.log(error);
      Toast.show({ type: "error", text1: "Update Failed" });
    }
  };

  const renderItem = ({ item }) => {
    const totalPrice = parseDecimal(item.price);
    const paid = parseDecimal(item.pricePaid);
    const second = parseDecimal(item.secondPaymentPaid);
    const remaining = totalPrice - paid - second;
    const isPaid = remaining <= 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.userName || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.name}>{item.userName}</Text>
            <Text style={styles.plan}>{item.planName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isPaid ? "#10b98115" : "#f9731615" }]}>
            <Text style={[styles.statusText, { color: isPaid ? "#10b981" : "#f97316" }]}>
              {isPaid ? "Paid" : "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.priceContainer}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>₹{totalPrice}</Text>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Paid</Text>
            <Text style={[styles.priceValue, { color: "#10b981" }]}>₹{paid + second}</Text>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Remaining</Text>
            <Text style={[styles.priceValue, { color: isPaid ? "#888" : "#f97316" }]}>₹{remaining}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.viewBtn} onPress={() => setViewingDetails(item)}>
            <Ionicons name="eye-outline" size={16} color="#3b82f6" />
            <Text style={styles.viewText}>Details</Text>
          </TouchableOpacity>

          {remaining > 0 && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => {
                setSelectedMembership(item);
                setUpdateAmount(remaining.toFixed(2));
              }}
            >
              <Ionicons name="card-outline" size={16} color="#fff" />
              <Text style={styles.payText}>Pay ₹{remaining}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const DetailRow = ({ label, value, valueColor }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>{value || "—"}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>EMI List</Text>
          <Text style={styles.headerSub}>Manage pending payments</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Search member name..."
          placeholderTextColor="#555"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm("")}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 42, marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
           {["Pending", "Paid", "All", "Custom"].map(type => (
            <TouchableOpacity 
               key={type} 
               style={[styles.filterChip, filterType === type && styles.filterChipActive]}
               onPress={() => setFilterType(type)}
            >
               <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>
                  {type}
               </Text>
              </TouchableOpacity>
           ))}
        </ScrollView>
      </View>

      {filterType === "Custom" && (
        <View style={styles.customRangeRow}>
          <TouchableOpacity style={styles.datePickerBtn} onPress={() => setDatePickerConfig({ show: true, field: "start" })}>
             <Ionicons name="calendar-outline" size={16} color={customRange.start ? "#fff" : "#666"} />
             <Text style={[styles.datePickerText, { color: customRange.start ? "#fff" : "#666" }]}>
               {customRange.start ? dayjs(customRange.start).format("DD MMM YYYY") : "Start Date"}
             </Text>
          </TouchableOpacity>
          <Text style={{color: '#444'}}>to</Text>
          <TouchableOpacity style={styles.datePickerBtn} onPress={() => setDatePickerConfig({ show: true, field: "end" })}>
             <Ionicons name="calendar-outline" size={16} color={customRange.end ? "#fff" : "#666"} />
             <Text style={[styles.datePickerText, { color: customRange.end ? "#fff" : "#666" }]}>
               {customRange.end ? dayjs(customRange.end).format("DD MMM YYYY") : "End Date"}
             </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading EMIs...</Text>
        </View>
      ) : filteredEMIs.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="wallet-outline" size={52} color="#333" />
          <Text style={styles.emptyText}>No EMI records found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEMIs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* UPDATE PAYMENT MODAL */}
      <Modal visible={!!selectedMembership} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setSelectedMembership(null)} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: '100%' }}>
            <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 24 }]}>
              <View style={styles.handle} />
              
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Update Payment</Text>
                  <Text style={styles.modalSub}>{selectedMembership?.userName}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedMembership(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#888" />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Amount to Pay (₹)</Text>
                <TextInput
                  value={String(updateAmount)}
                  onChangeText={setUpdateAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#555"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Payment Mode</Text>
                <TextInput
                  value={paymentMode}
                  onChangeText={setPaymentMode}
                  placeholder="e.g., Cash, UPI, Card"
                  placeholderTextColor="#555"
                  style={styles.input}
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleUpdatePayment}>
                <Text style={styles.submitText}>Save Payment</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal visible={!!viewingDetails} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setViewingDetails(null)} />
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 24, maxHeight: "85%" }]}>
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarTextLarge}>
                  {(viewingDetails?.userName || "?").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.modalTitle}>{viewingDetails?.userName}</Text>
                <Text style={styles.modalSub}>{viewingDetails?.planName}</Text>
              </View>
              <TouchableOpacity onPress={() => setViewingDetails(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <View style={styles.detailCard}>
                <DetailRow label="Total Price" value={`₹${parseDecimal(viewingDetails?.price)}`} />
                <DetailRow label="Initial Paid" value={`₹${parseDecimal(viewingDetails?.pricePaid)}`} valueColor="#10b981" />
                <DetailRow label="Second Paid" value={`₹${parseDecimal(viewingDetails?.secondPaymentPaid)}`} valueColor="#10b981" />
                <DetailRow 
                  label="Remaining" 
                  value={`₹${parseDecimal(viewingDetails?.price) - parseDecimal(viewingDetails?.pricePaid) - parseDecimal(viewingDetails?.secondPaymentPaid)}`} 
                  valueColor="#f97316" 
                />
                <DetailRow label="Duration" value={viewingDetails?.duration} />
                <DetailRow label="Payment Status" value={viewingDetails?.paymentStatus || "Pending"} />
                <DetailRow label="Start Date" value={viewingDetails?.startDate ? dayjs(viewingDetails.startDate).format("DD MMM YYYY") : "—"} />
                <DetailRow label="End Date" value={viewingDetails?.endDate ? dayjs(viewingDetails.endDate).format("DD MMM YYYY") : "—"} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Toast />

      {datePickerConfig.show && (
        <DateTimePicker
          value={customRange[datePickerConfig.field] ? new Date(customRange[datePickerConfig.field]) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setDatePickerConfig({ show: false, field: null });
            if (event.type === "set" && selectedDate) {
              setCustomRange((prev) => ({
                ...prev,
                [datePickerConfig.field]: selectedDate,
              }));
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default EMIList;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#888", marginTop: 12, fontSize: 14 },
  emptyText: { color: "#555", marginTop: 16, fontSize: 16 },

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
  headerSub: { color: "#f97316", fontSize: 12, marginTop: 2, fontWeight: "600" },

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

  filterScroll: { paddingHorizontal: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: "#f9731620",
    borderColor: "#f97316",
  },
  filterChipText: { color: "#888", fontSize: 13, fontWeight: "600" },
  filterChipTextActive: { color: "#f97316" },
  
  customRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  datePickerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
    gap: 8,
  },
  datePickerText: { fontSize: 13, fontWeight: "600" },

  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 },

  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  cardHeaderInfo: { flex: 1, marginLeft: 12 },
  name: { color: "#fff", fontSize: 16, fontWeight: "700" },
  plan: { color: "#888", fontSize: 12, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  cardDivider: {
    height: 1,
    backgroundColor: "#1d1d1d",
    marginVertical: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#0a0a0a",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1d1d1d",
  },
  priceBox: { alignItems: "center", flex: 1 },
  priceLabel: { color: "#666", fontSize: 10, textTransform: "uppercase", fontWeight: "700", marginBottom: 4 },
  priceValue: { color: "#ccc", fontSize: 14, fontWeight: "bold" },
  actionRow: { flexDirection: "row", gap: 10 },
  viewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f615",
    borderWidth: 1,
    borderColor: "#3b82f630",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  viewText: { color: "#3b82f6", fontSize: 13, fontWeight: "700" },
  payBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  payText: { color: "#fff", fontSize: 13, fontWeight: "700" },

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
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20, justifyContent: "space-between" },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  modalSub: { color: "#888", fontSize: 12, marginTop: 2 },
  closeBtn: {
    padding: 6,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
  },
  avatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextLarge: { color: "#fff", fontWeight: "bold", fontSize: 22 },

  sectionTitle: {
    color: "#f97316",
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  detailLabel: { color: "#666", fontSize: 13 },
  detailValue: { color: "#ddd", fontSize: 13, fontWeight: "600" },

  label: { color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 8, fontWeight: "700" },
  fieldGroup: { marginBottom: 16 },
  input: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: "#f97316",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "white", fontSize: 15, fontWeight: "bold", letterSpacing: 0.5 },
});