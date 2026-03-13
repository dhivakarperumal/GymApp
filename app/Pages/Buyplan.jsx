import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import RazorpayCheckout from "react-native-razorpay";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Header";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import BackButton from "../BackButton";

export default function BuyPlan() {
  const { plan } = useLocalSearchParams();
  const TEST_MODE = false;
  const selectedPlan = plan ? JSON.parse(plan) : null;

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    startDate: today,
    endDate: "",
  });

  const [user, setUser] = useState(null); // Assuming user data is stored locally

  /* ================= PAGE PROTECTION ================= */
  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        Toast.show({
          type: "error",
          text1: "Login Required",
          text2: "Please login to purchase a plan",
        });
        router.push("/login");
      }
    };
    checkUser();

    if (!selectedPlan) {
      router.push("/pricing");
    }
  }, [selectedPlan]);

  /* ================= FETCH USER PROFILE ================= */
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`/users/${user.id}`);
        if (res.data) {
          setForm((prev) => ({
            ...prev,
            phone: res.data.mobile || "",
            name: res.data.username || prev.name,
            email: user.email || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchUserProfile();
  }, [user]);

  /* ================= CALCULATE END DATE ================= */
  const getDaysFromDuration = (duration) => {
    const number = parseInt(duration);
    return number * 30; // Assuming duration is in months
  };

  useEffect(() => {
    if (!selectedPlan) return;

    const days = getDaysFromDuration(selectedPlan.duration);
    const start = new Date(form.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days);

    setForm((prev) => ({
      ...prev,
      endDate: end.toISOString().split("T")[0],
    }));
  }, [form.startDate, selectedPlan]);

  const validateForm = () => {
    if (!form.name.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Full name is required",
      });
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone",
        text2: "Enter valid 10-digit phone number",
      });
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Enter valid email address",
      });
      return false;
    }

    if (!form.address.trim()) {
      Toast.show({
        type: "error",
        text1: "Address Required",
        text2: "Please enter your address",
      });
      return false;
    }

    return true;
  };

  const handlePayment = () => {
    if (!validateForm()) return;

    const options = {
      description: selectedPlan.name,
      image: "https://yourgymlogo.com/logo.png",
      currency: "INR",
      key: "rzp_test_SGj8n5SyKSE10b",
      amount: Number(selectedPlan.price) * 100,
      name: "Arnold Gym",
      prefill: {
        email: form.email,
        contact: form.phone,
        name: form.name,
      },
      theme: { color: "#ff3c00" },
    };

    RazorpayCheckout.open(options)
      .then(async (data) => {
        // SUCCESS
        Toast.show({
          type: "success",
          text1: "Payment Successful",
          text2: `Payment ID: ${data.razorpay_payment_id}`,
        });

        // Save to backend
        try {
          await api.post("/memberships", {
            userId: user.id,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            pricePaid: Number(selectedPlan.price),
            duration: selectedPlan.duration,
            startDate: form.startDate,
            endDate: form.endDate,
            paymentId: data.razorpay_payment_id,
            status: "active",
          });

          // Navigate to home with details
          router.push({
            pathname: "/",
            params: {
              planDetails: JSON.stringify({
                ...selectedPlan,
                startDate: form.startDate,
                endDate: form.endDate,
                paymentId: data.razorpay_payment_id,
              }),
            },
          });
        } catch (err) {
          console.error("Plan save error:", err);
          Toast.show({
            type: "error",
            text1: "Save Failed",
            text2: "Payment successful but plan saving failed",
          });
        }
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Payment Failed",
          text2: error.description || "Payment cancelled",
        });
      });
  };

  //   const handlePayment = async () => {
  //   if (!validateForm()) return;

  //   // TEST MODE (skip Razorpay)
  //   if (TEST_MODE) {
  //     try {
  //       const fakePaymentId = "TEST_PAY_" + Date.now();

  //       await api.post("/memberships", {
  //         userId: user.id,
  //         planId: selectedPlan.id,
  //         planName: selectedPlan.name,
  //         pricePaid: Number(selectedPlan.price),
  //         duration: selectedPlan.duration,
  //         startDate: form.startDate,
  //         endDate: form.endDate,
  //         paymentId: fakePaymentId,
  //         status: "active",
  //       });

  //       Alert.alert("Test Purchase Successful 🎉");

  //       router.push({
  //         pathname: "/",
  //         params: {
  //           planDetails: JSON.stringify({
  //             ...selectedPlan,
  //             startDate: form.startDate,
  //             endDate: form.endDate,
  //             paymentId: fakePaymentId,
  //           }),
  //         },
  //       });
  //     } catch (err) {
  //       console.log("Test purchase error:", err);
  //       Alert.alert("Error", "Failed to save plan");
  //     }

  //     return;
  //   }

  //   // REAL PAYMENT (Razorpay)
  //   const options = {
  //     description: selectedPlan.name,
  //     image: "https://yourgymlogo.com/logo.png",
  //     currency: "INR",
  //     key: "rzp_test_SGj8n5SyKSE10b",
  //     amount: Number(selectedPlan.price) * 100,
  //     name: "Arnold Gym",
  //     prefill: {
  //       email: form.email,
  //       contact: form.phone,
  //       name: form.name,
  //     },
  //     theme: { color: "#ff3c00" },
  //   };

  //   RazorpayCheckout.open(options)
  //     .then(async (data) => {
  //       await api.post("/memberships", {
  //         userId: user.id,
  //         planId: selectedPlan.id,
  //         planName: selectedPlan.name,
  //         pricePaid: Number(selectedPlan.price),
  //         duration: selectedPlan.duration,
  //         startDate: form.startDate,
  //         endDate: form.endDate,
  //         paymentId: data.razorpay_payment_id,
  //         status: "active",
  //       });

  //       Alert.alert("Payment Successful 🎉");

  //       router.push("/home");
  //     })
  //     .catch((error) => {
  //       Alert.alert("Payment Failed", error.description);
  //     });
  // };

  if (!selectedPlan) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f0f0f] justify-center items-center">
        <Text className="text-white">No Plan Selected</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-[#0f0f0f] px-5"
      >
        <BackButton style={{ marginTop: 20, marginBottom: 20 }} />
        {/* Header */}
        <Text className="text-white text-3xl font-extrabold mb-8">
          Buy Membership Plan
        </Text>

        {/* FORM CARD */}
        <View className="mb-12">
          {/* Premium Glow */}
          <View className="absolute -inset-1 bg-[#ff3c00]/40 rounded-[32px] blur-2xl" />

          <View className="bg-[#141414] rounded-[32px] p-7 border border-border">
            <Text className="text-gray-100 text-base mb-8 tracking-wide">
              Complete your enrollment details
            </Text>

            {/* Name */}
            <View className="mb-5">
              <Text className="text-gray-200 text-xs mb-2 tracking-widest">
                FULL NAME
              </Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#888"
                className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-border focus:border-primary"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>

            {/* Phone */}
            <View className="mb-5">
              <Text className="text-gray-200 text-xs mb-2 tracking-widest">
                PHONE NUMBER
              </Text>
              <TextInput
                placeholder="Enter phone number"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-border focus:border-primary"
                value={form.phone}
                maxLength={10}
                onChangeText={(text) => {
                  const value = text.replace(/\D/g, "");
                  setForm({ ...form, phone: value });
                }}
              />
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="text-gray-200 text-xs mb-2 tracking-widest">
                EMAIL ADDRESS
              </Text>
              <TextInput
                placeholder="Enter email address"
                placeholderTextColor="#888"
                keyboardType="email-address"
                className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-border focus:border-primary"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
              />
            </View>

            {/* Address */}
            <View className="mb-5">
              <Text className="text-gray-200 text-xs mb-2 tracking-widest">
                ADDRESS
              </Text>
              <TextInput
                placeholder="Enter your address"
                placeholderTextColor="#888"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-border h-28 focus:border-primary"
                value={form.address}
                onChangeText={(text) => setForm({ ...form, address: text })}
              />
            </View>

            {/* Start Date */}
            <View className="mb-5">
              <Text className="text-gray-200 text-xs mb-2 tracking-widest">
                START DATE
              </Text>
              <TextInput
                placeholder="Start Date"
                placeholderTextColor="#888"
                className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-border focus:border-primary"
                value={form.startDate}
                onChangeText={(text) => setForm({ ...form, startDate: text })}
              />
            </View>

            {/* End Date */}
            <View className="mb-8">
              <Text className="text-gray-200 text-xs mb-2 tracking-widest">
                END DATE
              </Text>
              <TextInput
                placeholder="End Date"
                placeholderTextColor="#888"
                className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-border focus:border-primary"
                value={form.endDate}
                editable={false}
              />
            </View>

            {/* Divider */}
            <View className="h-[1px] bg-[#262626] mb-6" />

            {/* Premium Pay Button */}
            <TouchableOpacity
              onPress={handlePayment}
              className="bg-primary py-5 rounded-2xl items-center shadow-2xl active:opacity-80"
            >
              <Text className="text-white font-extrabold text-xl tracking-widest">
                PAY ₹{Number(selectedPlan.price).toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SELECTED PLAN CARD */}
        <View className="mb-20">
          <View className="absolute -inset-1 bg-[#ff3c00]/10 rounded-3xl blur-xl" />

          <View className="bg-[#161616] rounded-3xl p-7 border border-primary">
            <Text className="text-primary text-2xl font-bold mb-2">
              {selectedPlan.name}
            </Text>

            <Text className="text-gray-400 mb-5">
              {selectedPlan.description}
            </Text>

            <Text className="text-primary text-4xl font-extrabold">
              ₹{Number(selectedPlan.price).toLocaleString()}
            </Text>

            <Text className="text-gray-400 mt-1 mb-6">
              / {selectedPlan.duration}
            </Text>

            {/* Trainer Status */}
            {selectedPlan.trainer_included === 1 ? (
              <View className="bg-green-600/20 px-4 py-1.5 rounded-full self-start mb-6">
                <Text className="text-green-400 text-xs font-semibold">
                  Trainer Included
                </Text>
              </View>
            ) : (
              <View className="bg-[#222] px-4 py-1.5 rounded-full self-start border border-[#333] mb-6">
                <Text className="text-gray-400 text-xs font-semibold">
                  Trainer Not Included
                </Text>
              </View>
            )}

            {/* Facilities */}
            {Array.isArray(selectedPlan.facilities) &&
              selectedPlan.facilities.map((item, i) => (
                <View key={i} className="flex-row items-center mb-3">
                  <View className="w-2.5 h-2.5 bg-primary rounded-full mr-3" />
                  <Text className="text-gray-300 text-sm">{item}</Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}