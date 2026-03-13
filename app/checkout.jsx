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
import Header from "./Header";
import BackButton from "./BackButton";

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
    0,
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

      /* VALIDATE SHIPPING */

      if (!shipping.name.trim()) {
        Alert.alert("Validation Error", "Please enter your name");
        return;
      }

      if (!/^[6-9]\d{9}$/.test(shipping.phone)) {
        Alert.alert("Validation Error", "Enter a valid 10 digit phone number");
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(shipping.email)) {
        Alert.alert("Validation Error", "Enter a valid email address");
        return;
      }

      if (!shipping.address.trim()) {
        Alert.alert("Validation Error", "Please enter your address");
        return;
      }

      if (!shipping.city.trim()) {
        Alert.alert("Validation Error", "Please enter your city");
        return;
      }

      if (!shipping.state.trim()) {
        Alert.alert("Validation Error", "Please enter your state");
        return;
      }

      if (!/^\d{6}$/.test(shipping.zip)) {
        Alert.alert("Validation Error", "Enter a valid 6 digit ZIP code");
        return;
      }

      if (!shipping.country.trim()) {
        Alert.alert("Validation Error", "Please enter your country");
        return;
      }

      console.log("STEP 1");

      const orderRes = await generateOrderId();
      const orderId = orderRes.order_id;

      console.log("ORDER ID 👉", orderId);

      console.log("STEP 2");

      for (const item of cartItems) {
        const product = await getProduct(item.productId);
        console.log("PRODUCT 👉", product);
      }

      console.log("STEP 3 - CREATE PAYLOAD");

      const payload = {
        order_id: orderId,
        user_id: userId,
        status: "Order Placed",
        payment_status: "pending",
        total: total,
        order_type: "ONLINE",
        shipping: shipping,

        order_track: [
          {
            status: "Order Placed",
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

      console.log("PAYLOAD 👉", payload);

      console.log("STEP 4");

      await createOrderApi(payload);

      console.log("ORDER CREATED");

      await clearUserCart(userId);

      setCartItems([]);

      Alert.alert("Success", `Order placed! ${orderId}`, [
        {
          text: "View Orders",
          onPress: () => router.push("/Orders"),
        },
      ]);
    } catch (err) {
      console.log("ERROR 👉", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <BackButton style={{ marginBottom: 20 }} />
        <Text className="text-white text-3xl font-bold mb-8">Checkout</Text>

        {/* SHIPPING */}

        <Text className="text-white text-lg mb-4">Shipping Details</Text>

        {Object.keys(shipping).map((key) => (
          <TextInput
            key={key}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            placeholderTextColor="#888"
            value={shipping[key]}
            keyboardType={key === "phone" ? "number-pad" : "default"}
            maxLength={key === "phone" ? 10 : undefined}
            onChangeText={(text) => {
              if (key === "phone") {
                // allow only numbers
                const numeric = text.replace(/[^0-9]/g, "");

                // prevent first digit < 6
                if (numeric.length === 1 && !/[6-9]/.test(numeric)) {
                  return;
                }

                // max 10 digits
                if (numeric.length <= 10) {
                  setShipping({ ...shipping, phone: numeric });
                }
              } else {
                setShipping({ ...shipping, [key]: text });
              }
            }}
            className="bg-[#111] text-white p-4 rounded-xl mb-4"
          />
        ))}

        {/* ORDER SUMMARY */}

        <Text className="text-white text-lg mt-6 mb-4">Order Summary</Text>

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
              <Text className="text-white font-semibold">{item.name}</Text>

              <Text className="text-gray-400">Qty: {item.quantity}</Text>

              {item.size && (
                <Text className="text-gray-400">Size: {item.size}</Text>
              )}

              {item.gender && (
                <Text className="text-gray-400">Gender: {item.gender}</Text>
              )}

              {item.weight && (
                <Text className="text-gray-400">Weight: {item.weight}</Text>
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
          <Text className="text-white font-bold text-lg">Place Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
