import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../services/api";
import BackButton from "./BackButton";

export default function Orders() {
  const { user } = useAuth();
  const userId = user?.id;

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      if (!userId) return;

      const data = await getUserOrders(userId);

      // console.log("ORDERS DATA 👉", data);   // ADD THIS

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!selectedOrder) return;

    // Prefer items returned by the API, fallback to cached items stored at order time.
    if (Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0) {
      setSelectedOrderItems(selectedOrder.items);
      return;
    }

    const loadCachedItems = async () => {
      try {
        const cached = await AsyncStorage.getItem(
          `order_items_${selectedOrder.order_id}`
        );
        if (cached) {
          setSelectedOrderItems(JSON.parse(cached));
        }
      } catch (err) {
        console.log("Failed to load cached order items", err);
      }
    };

    loadCachedItems();
  }, [selectedOrder]);

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
            zIndex: -1,
          }}
        />
      </View>
    );
  };

  const normalizeStatus = (status) => {
    if (!status) return "Order Placed";

    const key = status.toLowerCase().replace(/\s/g, "");

    const map = {
      orderplaced: "Order Placed",
      ordered: "Order Placed",
      orderplace: "Order Placed",

      processing: "Processing",
      procceing: "Processing",

      packing: "Packing",
      paking: "Packing",
      packed: "Packing",

      shipped: "Out for Delivery",

      outfordelivery: "Out for Delivery",
      outofdelivery: "Out for Delivery",
      outdelivery: "Out for Delivery",

      delivered: "Delivered",

      cancelled: "Cancelled",
      canceled: "Cancelled",
    };

    return map[key] || "Order Placed";
  };

  const getStep = (status) => {
    const normalized = normalizeStatus(status);

    switch (normalized) {
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
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>My Orders</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Order History</Text>
          </View>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e11d1d", alignItems: "center", justifyContent: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}>
          <Ionicons name="receipt-outline" size={20} color="#fff" />
        </View>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e11d1d" />
          }
        >


          {loading && <Text style={{ color: "#aaa" }}>Loading orders...</Text>}

          {!loading && orders.length === 0 && (
            <Text style={{ color: "#aaa" }}>No orders yet</Text>
          )}

          {orders.map((order) => (
            <TouchableOpacity
              key={order.order_id}
              onPress={() => {
                setSelectedOrder(order);
              }}
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
                    {normalizeStatus(order.status)}
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
              backgroundColor: "rgba(0,0,0,0.85)",
              justifyContent: "center",
              padding: 16,
            }}
            onPress={() => {
              setSelectedOrder(null);
              setSelectedOrderItems([]);
            }}
          >
            {selectedOrder && (
              <Pressable
                style={{
                  backgroundColor: "#111",
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: "#222",
                  maxHeight: "85%",
                  padding: 20,
                }}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* HEADER */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
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
                      Order #{selectedOrder.order_id}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedOrder(null);
                        setSelectedOrderItems([]);
                      }}
                    >
                      <Ionicons name="close" size={22} color="white" />
                    </TouchableOpacity>
                  </View>

                  {/* ORDER INFO */}
                  <View style={{ marginBottom: 18 }}>
                    <Text style={{ color: "#aaa", fontSize: 12 }}>
                      Ordered On:{" "}
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </Text>

                    <Text style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
                      Payment Method: {selectedOrder.payment_method}
                    </Text>

                    <Text style={{ color: "#aaa", fontSize: 12 }}>
                      Payment Status: {selectedOrder.payment_status}
                    </Text>

                    <Text style={{ color: "#aaa", fontSize: 12 }}>
                      Order Type: {selectedOrder.order_type}
                    </Text>
                  </View>

                  {/* DIVIDER */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#222",
                      marginBottom: 16,
                    }}
                  />

                  {/* ITEMS */}
                  {/* ORDERED PRODUCTS */}
                  {selectedOrderItems.length > 0 ? (
                    <>
                      <Text
                        style={{
                          color: "#e11d1d",
                          fontWeight: "600",
                          marginBottom: 10,
                        }}
                      >
                        Ordered Products
                      </Text>

                      {selectedOrderItems.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 14,
                            backgroundColor: "#1a1a1a",
                            padding: 10,
                            borderRadius: 12,
                          }}
                        >
                          <Image
                            source={{
                              uri: item.image?.startsWith("data:image")
                                ? item.image
                                : `data:image/png;base64,${item.image}`,
                            }}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 12,
                              marginRight: 12,
                            }}
                          />

                          <View style={{ flex: 1 }}>
                            <Text style={{ color: "white", fontWeight: "600" }}>
                              {item.product_name || item.name}
                            </Text>

                            <Text style={{ color: "#aaa", fontSize: 12 }}>
                              Qty: {item.qty || item.quantity}
                            </Text>

                            <Text style={{ color: "#aaa", fontSize: 12 }}>
                              Price: ₹{item.price}
                            </Text>

                            {item.size && (
                              <Text style={{ color: "#aaa", fontSize: 12 }}>
                                Size: {item.size}
                              </Text>
                            )}

                            {item.weight && (
                              <Text style={{ color: "#aaa", fontSize: 12 }}>
                                Weight: {item.weight}
                              </Text>
                            )}

                            {(item.color || item.gender) && (
                              <Text style={{ color: "#aaa", fontSize: 12 }}>
                                Gender: {item.color || item.gender}
                              </Text>
                            )}
                          </View>

                          <Text style={{ color: "#e11d1d", fontWeight: "600" }}>
                            ₹{Number(item.price) * (item.qty || item.quantity)}
                          </Text>
                        </View>
                      ))}
                    </>
                  ) : (
                    <Text style={{ color: "#aaa", marginBottom: 12 }}>
                      Product details not available for this order.
                    </Text>
                  )}

                  {/* SHIPPING / PICKUP DETAILS */}
                  {(() => {
                    const isPickupOrder =
                      selectedOrder.order_type?.toUpperCase() === "PICKUP";
                    const shipping =
                      selectedOrder.shipping &&
                      (typeof selectedOrder.shipping === "string"
                        ? JSON.parse(selectedOrder.shipping)
                        : selectedOrder.shipping);
                    const pickup =
                      selectedOrder.pickup &&
                      (typeof selectedOrder.pickup === "string"
                        ? JSON.parse(selectedOrder.pickup)
                        : selectedOrder.pickup);

                    if (!shipping && !pickup && !isPickupOrder) return null;

                    const detailsLabel = isPickupOrder
                      ? "Pickup Details"
                      : "Shipping Details";
                    const details = isPickupOrder ? pickup || shipping : shipping;

                    if (!details) return null;

                    return (
                      <>
                        <View
                          style={{
                            height: 1,
                            backgroundColor: "#222",
                            marginVertical: 16,
                          }}
                        />

                        <Text
                          style={{
                            color: "#e11d1d",
                            fontWeight: "600",
                            marginBottom: 8,
                          }}
                        >
                          {detailsLabel}
                        </Text>

                        <Text style={{ color: "#aaa", fontSize: 12 }}>
                          <Text style={{ fontWeight: "bold", color: "#fff" }}>Name: </Text>
                          {details.name}
                        </Text>

                        <Text style={{ color: "#aaa", fontSize: 12 }}>
                          <Text style={{ fontWeight: "bold", color: "#fff" }}>Phone: </Text>
                          {details.phone}
                        </Text>

                        {details.email ? (
                          <Text style={{ color: "#aaa", fontSize: 12 }}>
                            <Text style={{ fontWeight: "bold", color: "#fff" }}>Email: </Text>
                            {details.email}
                          </Text>
                        ) : null}

                        {isPickupOrder ? null : (
                          <>
                            <Text style={{ color: "#aaa", fontSize: 12 }}>
                              Address: {details.address}
                            </Text>

                            <Text style={{ color: "#aaa", fontSize: 12 }}>
                              {details.city}, {details.state} {details.zip}
                            </Text>

                            <Text style={{ color: "#aaa", fontSize: 12 }}>
                              {details.country}
                            </Text>
                          </>
                        )}
                      </>
                    );
                  })()}

                  {/* TOTAL */}
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ color: "#aaa" }}>Total</Text>

                    <Text
                      style={{
                        color: "#e11d1d",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      ₹{selectedOrder.total}
                    </Text>
                  </View>

                  {/* ORDER STATUS */}
                  <Text
                    style={{
                      color: "#e11d1d",
                      fontWeight: "600",
                      marginTop: 20,
                      marginBottom: 8,
                    }}
                  >
                    Order Status
                  </Text>

                  {renderStatus(getStep(normalizeStatus(selectedOrder.status)))}
                </ScrollView>
              </Pressable>
            )}
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
