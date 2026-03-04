import {
  View,
  Text,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import { getUserOrders } from "../services/api";

export default function Orders() {

  const { user } = useAuth();
  const userId = user?.id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {

      if (!userId) return;

      const data = await getUserOrders(userId);

      // filter orders belonging to this user
      const userOrders = data.filter(
        (order) => order.user_id === userId
      );

      setOrders(userOrders);

    } catch (err) {
      console.log("Orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  return (
    <SafeAreaView className="flex-1 bg-black">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >

        <Text className="text-white text-3xl font-bold mb-6">
          My Orders
        </Text>

        {loading && (
          <Text className="text-gray-400">
            Loading orders...
          </Text>
        )}

        {!loading && orders.length === 0 && (
          <Text className="text-gray-400">
            No orders yet
          </Text>
        )}

        {orders.map((order) => (

          <View
            key={order.order_id}
            className="bg-[#111] p-5 rounded-2xl mb-4 border border-[#1f1f1f]"
          >

            {/* ORDER HEADER */}
            <View className="flex-row justify-between">

              <Text className="text-white font-bold">
                {order.order_id}
              </Text>

              <Text className="text-red-500 font-semibold">
                ₹ {order.total}
              </Text>

            </View>

            {/* STATUS */}
            <Text className="text-gray-400 mt-1">
              Status: {order.status}
            </Text>

            {/* DATE */}
            <Text className="text-gray-500 text-xs mt-1">
              {new Date(order.created_at).toLocaleString()}
            </Text>

            {/* ITEMS */}
            <View className="mt-3">

              {(order.items || []).length === 0 && (
                <Text className="text-gray-500 text-sm">
                  No item details
                </Text>
              )}

              {(order.items || []).map((item, index) => (

                <Text
                  key={index}
                  className="text-gray-300"
                >
                  {item.product_name} × {item.qty}
                </Text>

              ))}

            </View>

          </View>

        ))}

      </ScrollView>

    </SafeAreaView>
  );
}