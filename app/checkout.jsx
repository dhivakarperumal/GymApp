import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import Toast from "react-native-toast-message";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

const getQuantityDiscountPercent = (qty) => {
  if (qty >= 20 && qty <= 25) return 10;
  if (qty >= 5 && qty <= 19) return 5;
  return 0;
};

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [orderType, setOrderType] = useState("PICKUP");
  const { buyNow } = useLocalSearchParams();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      if (buyNow) {
        const item = JSON.parse(buyNow);
        setCartItems([item]);
      } else if (userId) {
        await fetchCart();
      }

      // refresh addresses
      if (userId) {
        const res = await api.get(`/addresses/user/${userId}`);
        setSavedAddresses(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.log("Refresh error:", err);
    }

    setRefreshing(false);
  };

  const { user } = useAuth();
  const userId = user?.id;
  const [placing, setPlacing] = useState(false);

  // Check if user came from meal plan (forces restrictions)
  const fromMealPlan = useLocalSearchParams().fromMealPlan === 'true';

  // Check if user came from all products (forces shop pickup and COD only)
  const fromAllProducts = useLocalSearchParams().fromAllProducts === 'true';

  // Check if any item is food category
  const hasFoodItems = cartItems.some(item => item.category === 'Food');

  // For meal plan purchases, force CASH payment and SHOP pickup
  // For all products purchases, also force CASH payment and SHOP pickup
  // For regular purchases with food items, allow user choice
  useEffect(() => {
    if ((fromMealPlan && hasFoodItems) || fromAllProducts) {
      setPaymentMethod("COD");
      setOrderType("PICKUP");
    }
  }, [fromMealPlan, hasFoodItems, fromAllProducts]);
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
  const fetchCart = useCallback(async () => {
    const data = await getCart(userId);
    // console.log("CART DATA 👉", data);
    setCartItems(data);
  }, [userId]);

  useEffect(() => {

    if (buyNow) {
      const item = JSON.parse(buyNow);
      setCartItems([item]);
    } else if (userId) {
      fetchCart();
    }

  }, [userId, buyNow, fetchCart]);

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

  const totalDiscount = cartItems.reduce((sum, item) => {
    const discountPercent = getQuantityDiscountPercent(item.quantity);

    if (!discountPercent) return sum;

    const originalUnitPrice =
      Number(item.price) / (1 - discountPercent / 100);

    const discountAmount =
      (originalUnitPrice - Number(item.price)) * item.quantity;

    return sum + discountAmount;
  }, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const delivery = cartItems.length > 0 ? 0 : 0;
  const total = subtotal + delivery;

  const handleOnlinePayment = () => {
    if (placing) return;

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
      image: "/assets/images/logo.png",
      currency: "INR",
      key: "rzp_test_SGj8n5SyKSE10b",
      amount: total * 100,
      name: "DAP FITNESS STUDIO",
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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const saveCheckoutAddress = async () => {
    try {

      const payload = {
        user_id: userId,
        name: shipping.name,
        phone: shipping.phone,
        email: shipping.email,
        address: orderType === "PICKUP" ? "SHOP PICKUP" : shipping.address,
        city: orderType === "PICKUP" ? "" : shipping.city,
        state: orderType === "PICKUP" ? "" : shipping.state,
        zip: orderType === "PICKUP" ? "" : shipping.zip,
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

  const placeOrder = async (paymentStatus = "pending") => {
    setLoading(true);
    if (placing) return;
    setPlacing(true);
    try {
      if (!cartItems.length) {
        Toast.show({
          type: "error",
          text1: "Cart Empty",
          text2: "Add items before placing order",
        });
        return;
      }

      // When coming from all products, only pickup is allowed
      if (fromAllProducts && orderType !== "PICKUP") {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Only shop pickup is available for products",
        });
        return;
      }

      /* VALIDATE SHIPPING */

      if (orderType === "DELIVERY") {
        // Check each field individually for better error messages
        if (!shipping.name || shipping.name.trim() === "")
          return Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your name" });

        if (!shipping.phone || shipping.phone.trim() === "")
          return Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your phone number" });

        if (!shipping.address || shipping.address.trim() === "")
          return Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your address" });

        if (!shipping.state || shipping.state.trim() === "")
          return Toast.show({ type: "error", text1: "Validation Error", text2: "Please select your state" });
      } else {
        if (!shipping.name || shipping.name.trim() === "")
          return Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your name" });

        if (!shipping.phone || shipping.phone.trim() === "")
          return Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your phone number" });
      }

      await saveCheckoutAddress();
      const orderRes = await generateOrderId();
      const orderId = orderRes.order_id;

      // ✅ Fetch all products IN PARALLEL (was sequential, major slowness fix)
      const products = await Promise.all(
        cartItems.map((item) => getProduct(item.productId))
      );

      // Validate stock in parallel
      const stockUpdates = cartItems.map((item, index) => {
        const product = products[index];
        const variantKey = item.variant || item.weight || `${item.size}-${item.gender}`;
        const stock = { ...(product.stock || {}) };
        const currentQty = stock?.[variantKey]?.qty || 0;
        const newQty = currentQty - item.quantity;

        if (newQty < 0) {
          throw new Error(`${item.name} is out of stock`);
        }

        stock[variantKey].qty = newQty;
        return { productId: product.id, stock };
      });

      // Update all product stocks IN PARALLEL
      await Promise.all(
        stockUpdates.map(({ productId, stock }) =>
          api.put(`/products/${productId}`, { stock })
        )
      );

      const payload = {
        order_id: orderId,
        user_id: userId,
        status: "Order Placed",
        payment_status: paymentStatus,
        total: total,
        order_type: orderType,
        shipping: orderType === "DELIVERY" ? shipping : null,
        pickup: orderType === "PICKUP" ? {
          name: shipping.name,
          phone: shipping.phone,
          email: shipping.email,
        } : null,

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

      await createOrderApi(payload);

      try {
        await AsyncStorage.setItem(
          `order_items_${orderId}`,
          JSON.stringify(payload.items || [])
        );
      } catch (err) {
        console.log("Failed to cache order items", err);
      }

      if (!buyNow) {
        const cart = await getCart(userId);
        // Delete all cart items in parallel
        await Promise.all(cart.map((item) => deleteCartApi(item.id)));
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
      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2: err?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
      setPlacing(false);
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

  // 🔍 Helper to check if all delivery fields are filled
  const areDeliveryFieldsFilled = () => {
    if (orderType === "DELIVERY") {
      return (
        shipping.name?.trim() &&
        shipping.phone?.trim() &&
        shipping.address?.trim() &&
        shipping.state?.trim()
      );
    }
    return shipping.name?.trim() && shipping.phone?.trim();
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff3c00"
          />
        }
      >
        <BackButton style={{ marginBottom: 20 }} />
        <View className="flex-row items-center justify-between mb-8">

          <Text className="text-white text-3xl font-bold">
            Checkout
          </Text>

          {/* <TouchableOpacity
            onPress={() => setShowAddressModal(true)}
            className="bg-red-600 px-4 py-2 rounded-xl"
          >
            <Text className="text-white text-md font-semibold">
              Show Addresses
            </Text>
          </TouchableOpacity> */}

        </View>


        {/* SHIPPING */}

        <Text className="text-white text-lg mb-4">
          {orderType === "DELIVERY" ? "SHIPPING" : "GYM"}
        </Text>

        {/* ⚠️ WARNING BANNER - Show when fields incomplete */}
        {!areDeliveryFieldsFilled() && (
          <View className="mb-6 p-4 rounded-xl bg-red-600/30 border border-red-500 flex-row">
            <Text className="text-xl mr-3">⚠️</Text>
            <View className="flex-1">
              <Text className="font-semibold text-red-400">
                Fill all fields to continue
              </Text>
              <Text className="text-xs text-red-300 mt-1">
                {fromAllProducts ? "Name & Phone are required for shop pickup" :
                  orderType === "DELIVERY"
                    ? "Name, Phone, Address & State are required"
                    : "Name & Phone are required"}
              </Text>
            </View>
          </View>
        )}

        {/* ORDER TYPE */}
        <View className="flex-row mb-6">
          {/* <TouchableOpacity
            onPress={() => setOrderType("DELIVERY")}
            disabled={(fromMealPlan && hasFoodItems) || fromAllProducts}
            className={`flex-1 py-3 rounded-xl border mr-2 ${
              orderType === "DELIVERY"
                ? "bg-red-600 border-red-600"
                : "border-red-500/40"
            } ${((fromMealPlan && hasFoodItems) || fromAllProducts) ? "opacity-50" : ""}`}
          >
            <Text className="text-center text-white">
              Delivery
              {((fromMealPlan && hasFoodItems) || fromAllProducts) ? " (Not available)" : ""}
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            onPress={() => setOrderType("PICKUP")}
            className={`flex-1 py-3 rounded-xl border ml-2 ${orderType === "PICKUP"
              ? "bg-red-600 border-red-600"
              : "border-red-500/40"
              }`}
          >
            <Text className="text-center text-white">
              Gym
              {((fromMealPlan && hasFoodItems) || fromAllProducts) ? " (Required)" : ""}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FORM FIELDS */}
        {orderType === "DELIVERY" ? (
          // DELIVERY FORM
          <>
            {Object.keys(shipping).map((key) => {
              if (key === "state") return null; // we will use dropdown

              return (
                <TextInput
                  key={key}
                  placeholder={fieldLabels[key]}
                  placeholderTextColor="#888"
                  value={shipping[key]}
                  keyboardType={key === "phone" ? "number-pad" : key === "zip" ? "number-pad" : "default"}
                  maxLength={key === "phone" ? 10 : key === "zip" ? 6 : undefined}
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
                    } else if (key === "zip") {
                      const numeric = text.replace(/[^0-9]/g, "");
                      if (numeric.length <= 6) {
                        setShipping({ ...shipping, zip: numeric });
                      }
                    } else {
                      setShipping({ ...shipping, [key]: text });
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
          </>
        ) : (
          // PICKUP FORM
          <>
            {["name", "phone", "email"].map((key) => (
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
                    setShipping({ ...shipping, [key]: text });
                  }
                }}
                className="bg-[#111] text-white p-4 rounded-xl mb-4"
              />
            ))}
          </>
        )}

        <Text className="text-white text-lg mt-6 mb-4">
          Payment Method
        </Text>

        <View className="bg-[#111] p-4 rounded-2xl mb-4 flex-row justify-between">

          {/* COD */}
          <TouchableOpacity
            className="flex-row items-center w-full"
            onPress={() => setPaymentMethod("COD")}
            disabled={(fromMealPlan && hasFoodItems) || fromAllProducts}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 ${paymentMethod === "COD" ? "border-red-500 bg-red-500" : "border-gray-400"
                }`}
            />
            <View className="flex-1">
              <Text className="text-white">Cash on Delivery</Text>
              {((fromMealPlan && hasFoodItems) || fromAllProducts) && (
                <Text className="text-xs text-gray-400">(Required for meal plan items / all products)</Text>
              )}
            </View>
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

          {totalDiscount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-green-400">Bulk Discount</Text>
              <Text className="text-green-400">
                - ₹ {totalDiscount.toFixed(2)}
              </Text>
            </View>
          )}

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
          disabled={loading || placing || !areDeliveryFieldsFilled()}
          onPress={() => {
            if (paymentMethod === "ONLINE") {
              handleOnlinePayment();
            } else {
              placeOrder("pending");
            }
          }}
          className={`py-5 rounded-2xl items-center mt-6 ${placing || !areDeliveryFieldsFilled() ? "bg-red-800" : "bg-red-600"
            }`}
        >
          {placing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {areDeliveryFieldsFilled() ? "Place Order" : "Fill Required Fields"}
            </Text>
          )}
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
                  {/* DELIVERY / PICKUP LABEL */}
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white font-bold">{addr.name}</Text>
                    <Text className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                      {addr.address === "SHOP PICKUP" ? "PICKUP" : "DELIVERY"}
                    </Text>
                  </View>

                  {/* Address only for DELIVERY */}
                  {addr.address !== "SHOP PICKUP" && (
                    <>
                      <Text className="text-gray-400">{addr.address}</Text>
                      <Text className="text-gray-400">
                        {addr.city}, {addr.state} - {addr.zip}
                      </Text>
                      <Text className="text-gray-400">{addr.country}</Text>
                    </>
                  )}

                  <Text className="text-gray-400">📞 {addr.phone}</Text>

                  {/* Show email only for pickup */}
                  {addr.address === "SHOP PICKUP" && addr.email && (
                    <Text className="text-gray-400 mt-1">✉ {addr.email}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
