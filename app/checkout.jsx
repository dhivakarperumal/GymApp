import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

import {
  getCart,
  getProduct,
  updateProductStock,
  generateOrderId,
  createOrderApi,
  clearUserCart,
} from "../services/api";

export default function Checkout() {

  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();

  const { user } = useAuth();
  const userId = user?.id;

  

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  /* FETCH CART */
  const fetchCart = async () => {
    const data = await getCart(userId);
    console.log("CART DATA 👉", data);
    setCartItems(data);
  };

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  /* PRICE CALCULATION */

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const delivery = cartItems.length > 0 ? 99 : 0;
  const total = subtotal + delivery;



  /* PLACE ORDER */

  const placeOrder = async () => {
    try {

      if (!cartItems.length) {
        Alert.alert("Cart empty", "Add items before placing order");
        return;
      }

      for (const key in shipping) {
        if (!shipping[key]) {
          Alert.alert("Error", `Fill ${key}`);
          return;
        }
      }

      const orderRes = await generateOrderId();
      const orderId = orderRes.order_id;

      /* CHECK STOCK */

      for (const item of cartItems) {

        const product = await getProduct(item.productId);

        let variant =
          product.category === "Food"
            ? item.weight
            : `${item.size}-${item.gender}`;

        const stock = product.stock?.[variant]?.qty || 0;

        if (stock < item.quantity) {
          Alert.alert("Stock Error", `${product.name} out of stock`);
          return;
        }
      }

      /* CREATE ORDER */

      const payload = {
        order_id: orderId,
        user_id: userId,
        status: "orderPlaced",
        payment_status: "pending",
        total: total,
        order_type: "ONLINE",
        shipping: shipping,
        order_track: [
          {
            status: "orderPlaced",
            time: new Date().toISOString(),
          },
        ],
        items: cartItems.map((item) => ({
          product_id: item.productId,
          product_name: item.name,
          price: item.price,
          qty: item.quantity,
          size: item.size || null,
          color: item.gender || null,
          weight: item.weight || null,
          image: item.images?.[0] || null,
        })),
      };

      await createOrderApi(payload);

      /* UPDATE STOCK */

      for (const item of cartItems) {

        const product = await getProduct(item.productId);

        const variant =
          product.category === "Food"
            ? item.weight
            : `${item.size}-${item.gender}`;

        const stock = product.stock?.[variant]?.qty || 0;

        const updatedStock = {
          ...product.stock,
          [variant]: {
            ...product.stock[variant],
            qty: stock - item.quantity,
          },
        };

        await updateProductStock(item.productId, updatedStock);
      }

      /* CLEAR CART */

      await clearUserCart(userId);
      setCartItems([]);

      Alert.alert("Success", `Order placed! ${orderId}`, [
        {
          text: "View Orders",
          onPress: () => router.push("/orders"),
        },
      ]);

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Order failed");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >

        <Text className="text-white text-3xl font-bold mb-8">
          Checkout
        </Text>

        {/* SHIPPING */}

        <Text className="text-white text-lg mb-4">
          Shipping Details
        </Text>

        {Object.keys(shipping).map((key) => (
          <TextInput
            key={key}
            placeholder={key}
            placeholderTextColor="#888"
            value={shipping[key]}
            onChangeText={(text) =>
              setShipping({ ...shipping, [key]: text })
            }
            className="bg-[#111] text-white p-4 rounded-xl mb-4"
          />
        ))}

        {/* ORDER SUMMARY */}

        <Text className="text-white text-lg mt-6 mb-4">
          Order Summary
        </Text>

        {cartItems.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center mb-4 bg-[#111] p-4 rounded-2xl"
          >

            <Image
              source={{ uri: item.images?.[0] }}
              className="w-16 h-16 rounded-xl"
            />

            <View className="flex-1 ml-4">

              <Text className="text-white font-semibold">
                {item.name}
              </Text>

              <Text className="text-gray-400">
                Qty: {item.quantity}
              </Text>

              {item.size && (
                <Text className="text-gray-400">
                  Size: {item.size}
                </Text>
              )}

              {item.gender && (
                <Text className="text-gray-400">
                  Gender: {item.gender}
                </Text>
              )}

              {item.weight && (
                <Text className="text-gray-400">
                  Weight: {item.weight}
                </Text>
              )}

            </View>

            <Text className="text-white font-bold">
              ₹ {item.price * item.quantity}
            </Text>

          </View>
        ))}

        {/* BILL */}

        <View className="bg-[#111] p-5 rounded-2xl mt-4">

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Subtotal</Text>
            <Text className="text-white">₹ {subtotal}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Delivery</Text>
            <Text className="text-white">₹ {delivery}</Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-white font-bold">Total</Text>
            <Text className="text-red-500 font-bold">₹ {total}</Text>
          </View>

        </View>

        {/* PLACE ORDER */}

        <TouchableOpacity
          onPress={placeOrder}
          className="bg-red-600 py-5 rounded-2xl items-center mt-6"
        >
          <Text className="text-white font-bold text-lg">
            Place Order
          </Text>
        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
}