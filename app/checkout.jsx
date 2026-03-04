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

      /* 1️⃣ VALIDATE SHIPPING */

      for (const key in shipping) {
        if (!shipping[key]) {
          Alert.alert("Error", `Fill ${key}`);
          return;
        }
      }

      /* 2️⃣ GENERATE ORDER ID */


      const orderRes = await generateOrderId();
      console.log("ORDER RESPONSE 👉", orderRes);

      const orderId = orderRes.order_id;

      /* 3️⃣ CHECK STOCK + UPDATE STOCK */

      for (const item of cartItems) {

        const product = await getProduct(item.productId);

        let variant = "";

        if (product.category === "Food") {
          variant = item.weight;
        } else {
          variant = `${item.size}-${item.gender}`;
        }

        const stock = product.stock?.[variant]?.qty || 0;

        if (stock < item.quantity) {
          Alert.alert("Stock Error", `${product.name} out of stock`);
          return;
        }

        const updatedStock = {
          ...product.stock,
          [variant]: {
            ...product.stock[variant],
            qty: stock - item.quantity,
          },
        };

        await updateProductStock(item.productId, updatedStock);
      }

      /* 4️⃣ CREATE ORDER PAYLOAD */

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

        items: cartItems.map((item) => {

          if (item.weight) {
            return {
              product_id: item.productId,
              product_name: item.name,
              price: item.price,
              qty: item.quantity,
              weight: item.weight,
              image: item.images?.[0],
            };
          }

          return {
            product_id: item.productId,
            product_name: item.name,
            price: item.price,
            qty: item.quantity,
            size: item.size,
            color: item.gender,
            image: item.images?.[0],
          };

        }),
      };

      /* 5️⃣ CREATE ORDER */
      console.log("ORDER PAYLOAD 👉", payload);

      await createOrderApi(payload);

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