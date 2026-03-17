import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import RazorpayCheckout from "react-native-razorpay";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

import api from "../services/api";

import {
  createOrderApi,
  deleteCartApi,
  generateOrderId,
  getCart,
  getProduct
} from "../services/api";
import BackButton from "./BackButton";
import Header from "./Header";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const { buyNow } = useLocalSearchParams();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

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

  useEffect(() => {
    if (!userId) return;

    const fetchAddresses = async () => {
      try {
        const res = await api.get(`/addresses/user/${userId}`);
        setSavedAddresses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log("Address fetch failed", err);
      }
    };

    fetchAddresses();
  }, [userId]);

  /* PRICE CALCULATION */

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const delivery = cartItems.length > 0 ? 0 : 0;
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
      name: "Arnold Gym",
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

  const saveCheckoutAddress = async () => {
    try {

      const payload = {
        user_id: userId,
        name: shipping.name,
        phone: shipping.phone,
        email: shipping.email,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: shipping.country,
      };

      await api.post("/addresses", payload);

    } catch (err) {

      // ignore duplicate address error
      if (!err?.response?.data?.message?.includes("exists")) {
        console.log("Address save error:", err);
      }

    }
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

      /* VALIDATE SHIPPING */

      if (!shipping.name.trim()) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter your name",
        });
        return;
      }

      if (!/^[6-9]\d{9}$/.test(shipping.phone)) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Enter a valid 10 digit phone number",
        });
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(shipping.email)) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Enter a valid email address",
        });
        return;
      }

      if (!shipping.address.trim()) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter your city",
        });
        return;
      }

      if (!shipping.city.trim()) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter your city",
        });
        return;
      }

      if (!shipping.state.trim()) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter your state",
        });
        return;
      }

      if (!/^\d{6}$/.test(shipping.zip)) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Enter a valid 6 digit ZIP code",
        });
        return;
      }

      if (!shipping.country.trim()) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter your country",
        });
        return;
      }

      // console.log("STEP 1");
      await saveCheckoutAddress();
      const orderRes = await generateOrderId();
      const orderId = orderRes.order_id;

      // console.log("ORDER ID 👉", orderId);

      // console.log("STEP 2");

      for (const item of cartItems) {
        const product = await getProduct(item.productId);

        const variantKey =
          item.variant ||
          item.weight ||
          `${item.size}-${item.gender}`;

        const stock = { ...(product.stock || {}) };

        const currentQty = stock?.[variantKey]?.qty || 0;

        const newQty = currentQty - item.quantity;

        if (newQty < 0) {
          Toast.show({
            type: "error",
            text1: "Stock Error",
            text2: `${item.name} is out of stock`,
          });
          return;
        }

        stock[variantKey].qty = newQty;

        await api.put(`/products/${product.id}`, { stock });
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

      // Store ordered items locally so we can show them later even if the API doesn't return them
      try {
        await AsyncStorage.setItem(
          `order_items_${orderId}`,
          JSON.stringify(payload.items || [])
        );
      } catch (err) {
        console.log("Failed to cache order items", err);
      }

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

  const selectAddress = (addr) => {

    setShipping({
      name: addr.name,
      phone: addr.phone,
      email: addr.email || "",
      address: addr.address,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country || "India",
    });

    setSelectedAddressId(addr.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <BackButton style={{ marginBottom: 20 }} />
        <View className="flex-row items-center justify-between mb-8">

          <Text className="text-white text-3xl font-bold">
            Checkout
          </Text>

          <TouchableOpacity
            onPress={() => setShowAddressModal(true)}
            className="bg-red-600 px-4 py-2 rounded-xl"
          >
            <Text className="text-white text-md font-semibold">
              Show Addresses
            </Text>
          </TouchableOpacity>

        </View>


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
                  setShipping({ ...shipping, [key]: text })
                    ;
                }
              }}
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
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-black/80 justify-end">

          <View className="bg-[#111] p-5 rounded-t-3xl max-h-[70%]">

            <View className="flex-row justify-between items-center mb-4">

              <Text className="text-white text-xl font-bold">
                Select Address
              </Text>

              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

            </View>

            <ScrollView>
              {savedAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => {
                    selectAddress(addr); // ✅ already fills form
                    setShowAddressModal(false); // close popup
                  }}
                  className={`p-4 rounded-xl mb-3 border ${selectedAddressId === addr.id
                    ? "border-red-500 bg-[#1a1a1a]"
                    : "border-gray-700 bg-[#111]"
                    }`}
                >
                  <Text className="text-white font-bold">{addr.name}</Text>
                  <Text className="text-gray-400">{addr.address}</Text>
                  <Text className="text-gray-400">
                    {addr.city}, {addr.state} - {addr.zip}
                  </Text>
                  <Text className="text-gray-400">
                    {addr.country}
                  </Text>

                  <Text className="text-gray-400">
                    {addr.email}
                  </Text>
                  <Text className="text-gray-400">{addr.phone}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
