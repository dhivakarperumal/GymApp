import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../services/api";

export default function Orders() {
  const { user } = useAuth();
  const userId = user?.id;

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      if (!userId) return;

      const data = await getUserOrders(userId);

      const userOrders = data.filter((order) => order.user_id === userId);

      setOrders(userOrders);
    } catch (err) {
      console.log("Orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchOrders();
  }, [userId]);

  const renderStatus = (step) => {
    const labels = [
      "Order Placed",
      "Processing",
      "Packing",
      "Out for Delivery",
      "Delivered",
    ];

    return (
      <View style={{ marginTop: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {labels.map((label, index) => {
            const active = index + 1 <= step;

            return (
              <View key={index} style={{ alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: active ? "#e11d1d" : "#444",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {index + 1}
                  </Text>
                </View>

                <Text
                  style={{
                    color: active ? "#e11d1d" : "#777",
                    fontSize: 11,
                    marginTop: 6,
                    textAlign: "center",
                  }}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>

        <View
          style={{
            position: "absolute",
            top: 17,
            left: 18,
            right: 18,
            height: 2,
            backgroundColor: "#333",
          }}
        />
      </View>
    );
  };

  const getStep = (status) => {
    switch (status) {
      case "Order Placed":
        return 1;
      case "Processing":
        return 2;
      case "Packing":
        return 3;
      case "Out for Delivery":
        return 4;
      case "Delivered":
        return 5;
      default:
        return 1;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            My Orders
          </Text>

          {loading && (
            <Text style={{ color: "#aaa" }}>Loading orders...</Text>
          )}

          {!loading && orders.length === 0 && (
            <Text style={{ color: "#aaa" }}>No orders yet</Text>
          )}

          {orders.map((order) => (
            <TouchableOpacity
              key={order.order_id}
              onPress={() => setSelectedOrder(order)}
              style={{
                backgroundColor: "#111",
                borderRadius: 18,
                padding: 18,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#222",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    Order ID: {order.order_id}
                  </Text>

                  <Text style={{ color: "#aaa", marginTop: 4 }}>
                    {new Date(order.created_at).toLocaleString()}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: "#f59e0b", fontWeight: "600" }}>
                    {order.status}
                  </Text>

                  <Text
                    style={{
                      color: "#e11d1d",
                      fontWeight: "bold",
                      marginTop: 4,
                    }}
                  >
                    ₹{order.total}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* MODAL */}
        <Modal transparent visible={!!selectedOrder} animationType="fade">
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.8)",
              justifyContent: "center",
              padding: 20,
            }}
            onPress={() => setSelectedOrder(null)}
          >
            {selectedOrder && (
              <Pressable
                style={{
                  backgroundColor: "#111",
                  borderRadius: 24,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "#222",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#e11d1d",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    Order ID: {selectedOrder.order_id}
                  </Text>

                  <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                    <Ionicons name="close" color="white" size={24} />
                  </TouchableOpacity>
                </View>

                {/* ITEMS */}
                {(selectedOrder.items || []).map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          item.image ||
                          "https://via.placeholder.com/100",
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 12,
                        marginRight: 12,
                      }}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "white" }}>
                        {item.product_name}
                      </Text>

                      <Text style={{ color: "#aaa", marginTop: 2 }}>
                        Qty: {item.qty}
                      </Text>
                    </View>
                  </View>
                ))}

                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    marginBottom: 16,
                  }}
                >
                  Total: ₹{selectedOrder.total}
                </Text>

                <Text
                  style={{
                    color: "#e11d1d",
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Order Status
                </Text>

                {renderStatus(getStep(selectedOrder.status))}
              </Pressable>
            )}
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}