import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function TrainerPayments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bottom sheet state
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/memberships");
        const membershipsData = res.data;
        
        if (Array.isArray(membershipsData)) {
          const loggedInTrainerName = (user?.username || user?.name || "").toLowerCase().trim();
          
          const filtered = membershipsData.filter(m => {
            const referredByLower = (m.referredBy || "").toLowerCase().trim();
            return referredByLower && (
              referredByLower === loggedInTrainerName ||
              referredByLower.includes(loggedInTrainerName) ||
              loggedInTrainerName.includes(referredByLower)
            );
          });
          
          setPayments(filtered.reverse());
        }
      } catch (error) {
        console.error("Failed to load payments", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPayments();
    }
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "--" : d.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return "-";
    const end = new Date(endDate);
    const today = new Date();
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Expired";
    if (diff === 0) return "Last Day";
    return `${diff} days`;
  };

  const renderItem = ({ item }) => {
    const totalAmount = Number(item.price || item.totalPrice || item.planPrice || item.pricePaid || 0);
    const totalPaid = Number(item.pricePaid || 0) + Number(item.secondPaymentPaid || 0);
    const balance = Math.max(0, totalAmount - totalPaid);

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => setSelectedPayment(item)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.memberName}>{item.userName || item.username || "Member"}</Text>
            <Text style={styles.planName}>{item.planName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="call" size={12} color="#888" style={{ marginRight: 4 }} />
              <Text style={{ color: '#aaa', fontSize: 12 }}>{item.userPhone || item.mobile || "No Mobile"}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Ionicons name="mail" size={12} color="#888" style={{ marginRight: 4 }} />
              <Text style={{ color: '#aaa', fontSize: 12 }} numberOfLines={1} ellipsizeMode="tail">{item.userEmail || "No Email"}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.paymentStatus === 'Paid' ? '#10b98120' : item.paymentStatus === 'Partial' ? '#f59e0b20' : '#ef444420' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.paymentStatus === 'Paid' ? '#10b981' : item.paymentStatus === 'Partial' ? '#f59e0b' : '#ef4444' }
            ]}>{item.paymentStatus || "Paid"}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Paid</Text>
            <Text style={styles.detailValueSuccess}>₹{totalPaid}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Balance</Text>
            <Text style={[styles.detailValue, balance > 0 && { color: '#ef4444' }]}>₹{balance}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(item.paymentDate || item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const BottomSheet = () => {
    if (!selectedPayment) return null;

    const item = selectedPayment;
    const totalAmount = Number(item.price || item.totalPrice || item.planPrice || item.pricePaid || 0);
    const initialPaid = Number(item.pricePaid || 0);
    const secondPaid = Number(item.secondPaymentPaid || 0);
    const totalPaid = initialPaid + secondPaid;
    const balance = Math.max(0, totalAmount - totalPaid);
    
    const remainingDaysStr = getRemainingDays(item.endDate);
    const isExpired = remainingDaysStr === "Expired";

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedPayment}
        onRequestClose={() => setSelectedPayment(null)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity 
            style={styles.bottomSheetDismiss} 
            activeOpacity={1} 
            onPress={() => setSelectedPayment(null)}
          />
          
          <View style={[styles.bottomSheetContainer, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.bottomSheetHandle} />
            
            <View style={styles.bsHeader}>
              <View>
                <Text style={styles.bsTitle}>{item.userName || item.username || "Member"}</Text>
                <Text style={styles.bsSubtitle}>{item.userEmail || "No Email"} • {item.userPhone || item.mobile || "No Mobile"}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPayment(null)} style={styles.bsCloseBtn}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              
              {/* PLAN INFO */}
              <View style={styles.bsSection}>
                <Text style={styles.bsSectionTitle}>Plan Details</Text>
                <View style={styles.bsCard}>
                  <View style={styles.bsRow}>
                    <Text style={styles.bsLabel}>Plan Name</Text>
                    <Text style={styles.bsVal}>{item.planName}</Text>
                  </View>
                  <View style={styles.bsRow}>
                    <Text style={styles.bsLabel}>Duration</Text>
                    <Text style={styles.bsVal}>{item.duration}</Text>
                  </View>
                  <View style={styles.bsRow}>
                    <Text style={styles.bsLabel}>Start Date</Text>
                    <Text style={styles.bsVal}>{formatDate(item.startDate)}</Text>
                  </View>
                  <View style={styles.bsRow}>
                    <Text style={styles.bsLabel}>End Date</Text>
                    <Text style={styles.bsVal}>{formatDate(item.endDate)}</Text>
                  </View>
                  <View style={[styles.bsRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={styles.bsLabel}>Remaining</Text>
                    <Text style={[styles.bsVal, { color: isExpired ? '#ef4444' : '#10b981' }]}>{remainingDaysStr}</Text>
                  </View>
                </View>
              </View>

              {/* PAYMENT INFO */}
              <View style={styles.bsSection}>
                <Text style={styles.bsSectionTitle}>Payment Details</Text>
                <View style={styles.bsCard}>
                  <View style={styles.bsRow}>
                    <Text style={styles.bsLabel}>Total Plan Price</Text>
                    <Text style={styles.bsVal}>₹{totalAmount}</Text>
                  </View>
                  <View style={styles.bsRow}>
                    <Text style={styles.bsLabel}>Initial Amount Paid</Text>
                    <Text style={[styles.bsVal, { color: '#10b981' }]}>₹{initialPaid}</Text>
                  </View>
                  {secondPaid > 0 && (
                    <View style={styles.bsRow}>
                      <Text style={styles.bsLabel}>Second Payment</Text>
                      <Text style={[styles.bsVal, { color: '#3b82f6' }]}>₹{secondPaid}</Text>
                    </View>
                  )}
                  {balance > 0 && (
                    <View style={styles.bsRow}>
                      <Text style={styles.bsLabel}>Balance Due</Text>
                      <Text style={[styles.bsVal, { color: '#ef4444' }]}>₹{balance}</Text>
                    </View>
                  )}
                  <View style={styles.bsRow}>
                    <Text style={styles.bsLabel}>Total Paid</Text>
                    <Text style={[styles.bsVal, { fontSize: 16, color: '#f97316' }]}>₹{totalPaid}</Text>
                  </View>
                  <View style={styles.bsRow}>
                    <Text style={styles.bsLabel}>Payment Mode</Text>
                    <Text style={styles.bsVal}>{(item.paymentMode || "Cash").toUpperCase()}</Text>
                  </View>
                  <View style={[styles.bsRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={styles.bsLabel}>Payment Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.paymentStatus === 'Paid' ? '#10b98120' : item.paymentStatus === 'Partial' ? '#f59e0b20' : '#ef444420' }]}>
                      <Text style={[styles.statusText, { color: item.paymentStatus === 'Paid' ? '#10b981' : item.paymentStatus === 'Partial' ? '#f59e0b' : '#ef4444' }]}>
                        {item.paymentStatus || "Paid"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Payments</Text>
          <Text style={styles.headerSubtitle}>Collected by you</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cash-outline" size={60} color="#333" />
          <Text style={styles.emptyText}>No payments collected yet</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Sheet Modal */}
      <BottomSheet />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#f97316",
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600'
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888",
    marginTop: 12,
  },
  emptyText: {
    color: "#666",
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#262626",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  memberName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  planName: {
    color: "#888",
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: 'uppercase'
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#262626",
  },
  detailItem: {
    alignItems: "flex-start",
  },
  detailLabel: {
    color: "#666",
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: '700'
  },
  detailValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  detailValueSuccess: {
    color: "#10b981",
    fontSize: 15,
    fontWeight: "bold",
  },

  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  bottomSheetDismiss: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: "#151515",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#262626",
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#333",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  bsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  bsTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bsSubtitle: {
    color: "#888",
    fontSize: 13,
  },
  bsCloseBtn: {
    padding: 4,
    backgroundColor: "#222",
    borderRadius: 20,
  },
  bsSection: {
    marginBottom: 24,
  },
  bsSectionTitle: {
    color: "#f97316",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  bsCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  bsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  bsLabel: {
    color: "#888",
    fontSize: 14,
  },
  bsVal: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
