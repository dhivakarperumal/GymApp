import { useState } from "react";
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

const orders = [
  {
    id: "ORD009",
    date: "3/4/2026, 5:12 PM",
    status: "Order Placed",
    step: 1,
    total: 2300,
    product: "T-shirt",
    image:
      "https://images.unsplash.com/photo-1625047509248-ec889cbff17f",
    quantity: 1,
    customer: "Dhanush",
    phone: "9080281344",
    city: "Tirupattur",
  },
];

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);

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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
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

        {/* LINE */}
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* FILTER BUTTON */}
          <TouchableOpacity
            style={{
              backgroundColor: "#e11d1d",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 30,
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="filter" color="white" size={16} />
            <Text style={{ color: "white", marginLeft: 6 }}>Filter</Text>
          </TouchableOpacity>

          {/* ORDER LIST */}
          {orders.map((order) => (
            <TouchableOpacity
              key={order.id}
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
                    Order ID: {order.id}
                  </Text>

                  <Text
                    style={{
                      color: "#aaa",
                      marginTop: 4,
                    }}
                  >
                    {order.date}
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
                    Total: ₹{order.total}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ORDER DETAILS MODAL */}
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
                    Order ID: {selectedOrder.id}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setSelectedOrder(null)}
                  >
                    <Ionicons name="close" color="white" size={24} />
                  </TouchableOpacity>
                </View>

                {/* PRODUCT */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Image
                    source={{ uri: selectedOrder.image }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      marginRight: 12,
                    }}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "white" }}>
                      {selectedOrder.product}
                    </Text>

                    <Text style={{ color: "#aaa", marginTop: 2 }}>
                      Qty: {selectedOrder.quantity} × ₹{selectedOrder.total}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: "#e11d1d",
                      fontWeight: "bold",
                    }}
                  >
                    ₹{selectedOrder.total}
                  </Text>
                </View>

                {/* TOTAL */}
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    marginBottom: 16,
                  }}
                >
                  Total: ₹{selectedOrder.total}
                </Text>

                {/* SHIPPING */}
                <Text
                  style={{
                    color: "#e11d1d",
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Shipping Details
                </Text>

                <Text style={{ color: "white" }}>
                  {selectedOrder.customer}
                </Text>

                <Text style={{ color: "white" }}>
                  {selectedOrder.phone}
                </Text>

                <Text style={{ color: "white", marginBottom: 20 }}>
                  {selectedOrder.city}
                </Text>

                {/* ORDER STATUS */}
                <Text
                  style={{
                    color: "#e11d1d",
                    fontWeight: "600",
                  }}
                >
                  Order Status
                </Text>

                {renderStatus(selectedOrder.step)}
              </Pressable>
            )}
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}