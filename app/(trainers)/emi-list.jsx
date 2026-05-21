// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";

// export default function EMIList() {
//   const router = useRouter();

//   return (
//     <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={22} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>EMI List</Text>
//       </View>
//       <View style={styles.container}>
//         <Ionicons name="card-outline" size={64} color="#3b82f6" style={{ marginBottom: 16 }} />
//         <Text style={styles.text}>EMI List Coming Soon...</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#0a0a0a" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 10,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#1a1a1a",
//   },
//   backBtn: {
//     marginRight: 14,
//     padding: 8,
//     backgroundColor: "#1a1a1a",
//     borderRadius: 12,
//   },
//   headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   text: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// });


// EMIListScreen.js

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
} from "react-native";


import Toast from "react-native-toast-message";

import api from "../../services/api";

import {
  Eye,
  CreditCard,
  Search,
  X,
} from "lucide-react-native";



const parseDecimal = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const EMIList = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedMembership, setSelectedMembership] = useState(null);

  const [updateAmount, setUpdateAmount] = useState("");

  const [paymentMode, setPaymentMode] = useState("");

  const [viewingDetails, setViewingDetails] = useState(null);

  useEffect(() => {
    fetchEMI();
  }, []);

  const fetchEMI = async () => {
    try {
      setLoading(true);

      const response = await api.get("/memberships");

      const emiOnly = response.data.filter(
        (m) => m.paymentMode === "emi"
      );

      setMemberships(emiOnly);
    } catch (error) {
      console.log(error);

      Toast.show({
        type: "error",
        text1: "Failed to load EMI data",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEMIs = memberships.filter((m) =>
    (m.userName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleUpdatePayment = async () => {
    if (!selectedMembership) return;

    const amount = parseDecimal(updateAmount);

    if (amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Enter valid amount",
      });
      return;
    }

    try {
      await api.put(`/memberships/${selectedMembership.id}`, {
        secondPaymentPaid:
          parseDecimal(selectedMembership.secondPaymentPaid) +
          amount,

        paymentId: paymentMode,

        paymentStatus: "Paid",
      });

      Toast.show({
        type: "success",
        text1: "Payment Updated",
      });

      setSelectedMembership(null);

      setUpdateAmount("");

      setPaymentMode("");

      fetchEMI();
    } catch (error) {
      console.log(error);

      Toast.show({
        type: "error",
        text1: "Update Failed",
      });
    }
  };

  const renderItem = ({ item, index }) => {
    const totalPrice = parseDecimal(item.price);

    const paid = parseDecimal(item.pricePaid);

    const second = parseDecimal(item.secondPaymentPaid);

    const remaining = totalPrice - paid - second;

    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.name}>
              {item.userName}
            </Text>

            <Text style={styles.plan}>
              {item.planName}
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.paymentStatus || "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>
              Total
            </Text>

            <Text style={styles.priceValue}>
              ₹{totalPrice}
            </Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>
              Paid
            </Text>

            <Text style={styles.green}>
              ₹{paid + second}
            </Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>
              Remaining
            </Text>

            <Text style={styles.orange}>
              ₹{remaining}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => setViewingDetails(item)}
          >
            <Eye size={18} color="#38bdf8" />

            <Text style={styles.viewText}>
              Details
            </Text>
          </TouchableOpacity>

          {remaining > 0 && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => {
                setSelectedMembership(item);

                setUpdateAmount(
                  remaining.toFixed(2)
                );
              }}
            >
              <CreditCard
                size={18}
                color="white"
              />

              <Text style={styles.payText}>
                Pay ₹{remaining}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        EMI Payments
      </Text>

      <View style={styles.searchContainer}>
        <Search
          size={18}
          color="#94a3b8"
        />

        <TextInput
          placeholder="Search member..."
          placeholderTextColor="#64748b"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#f97316"
        />
      ) : (
        <FlatList
          data={filteredEMIs}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* PAYMENT MODAL */}

      <Modal
        visible={!!selectedMembership}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() =>
                setSelectedMembership(null)
              }
            >
              <X color="white" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              Update Payment
            </Text>

            <TextInput
              value={updateAmount}
              onChangeText={setUpdateAmount}
              keyboardType="numeric"
              placeholder="Amount"
              placeholderTextColor="#64748b"
              style={styles.input}
            />

            <TextInput
              value={paymentMode}
              onChangeText={setPaymentMode}
              placeholder="UPI / Cash / Card"
              placeholderTextColor="#64748b"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleUpdatePayment}
            >
              <Text style={styles.saveText}>
                Save Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DETAILS MODAL */}

      <Modal
        visible={!!viewingDetails}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.detailsModal}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() =>
                setViewingDetails(null)
              }
            >
              <X color="white" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              EMI Details
            </Text>

            {viewingDetails && (
              <>
                <Text style={styles.detailText}>
                  Member:
                  {viewingDetails.userName}
                </Text>

                <Text style={styles.detailText}>
                  Plan:
                  {viewingDetails.planName}
                </Text>

                <Text style={styles.detailText}>
                  Duration:
                  {viewingDetails.duration}
                </Text>

                <Text style={styles.detailText}>
                  Initial Payment:
                  ₹
                  {viewingDetails.pricePaid}
                </Text>

                <Text style={styles.detailText}>
                  Second Payment:
                  ₹
                  {viewingDetails.secondPaymentPaid}
                </Text>

                <Text style={styles.detailText}>
                  Status:
                  {viewingDetails.status}
                </Text>

                <Text style={styles.detailText}>
                  Payment Status:
                  {
                    viewingDetails.paymentStatus
                  }
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

export default EMIList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 15,
  },

  header: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  searchInput: {
    flex: 1,
    color: "white",
    padding: 12,
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  plan: {
    color: "#94a3b8",
    marginTop: 4,
  },

  badge: {
    backgroundColor: "#f97316",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 50,
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  priceBox: {
    alignItems: "center",
  },

  priceLabel: {
    color: "#94a3b8",
    marginBottom: 5,
  },

  priceValue: {
    color: "white",
    fontWeight: "bold",
  },

  green: {
    color: "#22c55e",
    fontWeight: "bold",
  },

  orange: {
    color: "#f97316",
    fontWeight: "bold",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
  },

  viewBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#38bdf8",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  viewText: {
    color: "#38bdf8",
    fontWeight: "bold",
  },

  payBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  payText: {
    color: "white",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#0f172a",
    borderRadius: 25,
    padding: 20,
  },

  detailsModal: {
    backgroundColor: "#0f172a",
    borderRadius: 25,
    padding: 20,
    maxHeight: "90%",
  },

  modalTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#1e293b",
    color: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  saveBtn: {
    backgroundColor: "#f97316",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },

  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },

  detailText: {
    color: "white",
    marginBottom: 15,
    fontSize: 16,
  },
});