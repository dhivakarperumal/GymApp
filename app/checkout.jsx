import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";

import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import RazorpayCheckout from "react-native-razorpay";

import api from "../services/api";

import {
  getCart,
  getProduct,
  updateProductStock,
  generateOrderId,
  createOrderApi,
  clearUserCart,
  deleteCartApi,
} from "../services/api";
import Header from "./Header";
import BackButton from "./BackButton";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const { buyNow } = useLocalSearchParams();

  const { user } = useAuth();
  const userId = user?.id;
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];

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
    // console.log("CART DATA 👉", data);
    setCartItems(data);
  };

  useEffect(() => {

    if (buyNow) {
      const item = JSON.parse(buyNow);
      setCartItems([item]);
    } else if (userId) {
      fetchCart();
    }

  }, [userId, buyNow]);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}`);

        if (res.data) {
          setShipping((prev) => ({
            ...prev,
            name: res.data.username || "",
            phone: res.data.mobile || "",
            email: res.data.email || "",
          }));
        }
      } catch (err) {
        console.log("User fetch failed", err);
      }
    };

    fetchUserProfile();
  }, [userId]);

  /* PRICE CALCULATION */

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const delivery = cartItems.length > 0 ? 99 : 0;
  const total = subtotal + delivery;

  const handleOnlinePayment = () => {

    if (!shipping.name || !shipping.phone || !shipping.address) {
      Toast.show({
        type: "error",
        text1: "Missing Details",
        text2: "Please fill shipping details",
      });
      return;
    }

    const options = {
      description: "Order Payment",
      image: "https://yourlogo.com/logo.png",
      currency: "INR",
      key: "rzp_test_SGj8n5SyKSE10b",
      amount: total * 100,
      name: "Your Store Name",
      prefill: {
        email: shipping.email,
        contact: shipping.phone,
        name: shipping.name,
      },
      theme: { color: "#ef4444" },
    };

    RazorpayCheckout.open(options)
      .then(async (data) => {

        await placeOrder("paid");

        Toast.show({
          type: "success",
          text1: "Payment Successful",
          text2: `Payment ID: ${data.razorpay_payment_id}`,
        });
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Payment Failed",
          text2: error?.description || "Payment cancelled",
        });
      });
  };

  /* PLACE ORDER */

  const placeOrder = async (paymentStatus = "pending") => {
    try {
      if (!cartItems.length) {
        Toast.show({
          type: "error",
          text1: "Cart Empty",
          text2: "Add items before placing order",
        });
        return;
      }

      // console.log("STEP 1");

      const orderRes = await generateOrderId();
      const orderId = orderRes.order_id;

      // console.log("ORDER ID 👉", orderId);

      // console.log("STEP 2");

      for (const item of cartItems) {
        const product = await getProduct(item.productId);
        // console.log("PRODUCT 👉", product);
      }

      // console.log("STEP 3 - CREATE PAYLOAD");

      const payload = {
        order_id: orderId,
        user_id: userId,
        status: "Order Placed",
        payment_status: paymentStatus,
        total: total,
        order_type: paymentMethod,
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

      // console.log("PAYLOAD 👉", payload);

      // console.log("STEP 4");

      await createOrderApi(payload);

      // console.log("ORDER CREATED");

      if (!buyNow) {
        const cart = await getCart(userId);

        for (const item of cart) {
          await deleteCartApi(item.id);
        }
      }

      setCartItems([]);

      Toast.show({
        type: "success",
        text1: "Order Placed",
        text2: `Order ID: ${orderId}`,
      });

      setTimeout(() => {
        router.replace("/Orders");
      }, 1200);

      if (!buyNow) {
        const cart = await getCart(userId);

        for (const item of cart) {
          await deleteCartApi(item.id);
        }
      }

    } catch (err) {
      console.log("ERROR 👉", err);
    }
  };

  const fieldLabels = {
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    address: "Address",
    city: "City",
    zip: "Zip Code",
    country: "Country",
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

        {Object.keys(shipping).map((key) => {
          if (key === "state") return null; // we will use dropdown

          return (
            <TextInput
              key={key}
              placeholder={fieldLabels[key]}
              placeholderTextColor="#888"
              value={shipping[key]}
              onChangeText={(text) =>
                setShipping({ ...shipping, [key]: text })
              }
              className="bg-[#111] text-white p-4 rounded-xl mb-4"
            />
          );
        })}

        <Text className="text-white mb-2">State</Text>

        <View className="bg-[#111] rounded-xl mb-4">
          <Picker
            selectedValue={shipping.state}
            dropdownIconColor="white"
            style={{ color: "white" }}
            onValueChange={(value) =>
              setShipping({ ...shipping, state: value })
            }
          >
            <Picker.Item label="Select State" value="" />

            {states.map((state) => (
              <Picker.Item key={state} label={state} value={state} />
            ))}
          </Picker>
        </View>

        <Text className="text-white text-lg mt-6 mb-4">
          Payment Method
        </Text>

        <View className="bg-[#111] p-4 rounded-2xl mb-4">

          {/* ONLINE PAYMENT */}
          <TouchableOpacity
            className="flex-row items-center mb-3"
            onPress={() => setPaymentMethod("ONLINE")}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 ${paymentMethod === "ONLINE" ? "border-red-500 bg-red-500" : "border-gray-400"
                }`}
            />
            <Text className="text-white">Online Payment (Razorpay)</Text>
          </TouchableOpacity>

          {/* COD */}
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setPaymentMethod("COD")}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 ${paymentMethod === "COD" ? "border-red-500 bg-red-500" : "border-gray-400"
                }`}
            />
            <Text className="text-white">Cash on Delivery</Text>
          </TouchableOpacity>

        </View>

        {/* ORDER SUMMARY */}

        <Text className="text-white text-lg mt-6 mb-4">Order Summary</Text>

        {cartItems.map((item, index) => (
          <View
            key={item.id || item.productId || index}
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
          onPress={() => {
            if (paymentMethod === "ONLINE") {
              handleOnlinePayment();
            } else {
              placeOrder("pending");
            }
          }}
          className="bg-red-600 py-5 rounded-2xl items-center mt-6"
        >
          <Text className="text-white font-bold text-lg">Place Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
