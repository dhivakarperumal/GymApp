import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import RazorpayCheckout from "react-native-razorpay";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BuyPlan() {
  const { plan } = useLocalSearchParams();
  const selectedPlan = plan ? JSON.parse(plan) : null;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      Alert.alert("Validation Error", "Enter valid 10-digit phone number");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      Alert.alert("Validation Error", "Enter valid email address");
      return false;
    }

    if (!form.address.trim()) {
      Alert.alert("Validation Error", "Address is required");
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
      name: "Your Gym Name",
      prefill: {
        email: form.email,
        contact: form.phone,
        name: form.name,
      },
      theme: { color: "#ff3c00" },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        // SUCCESS
        Alert.alert(
          "Payment Successful 🎉",
          `Payment ID: ${data.razorpay_payment_id}`,
        );
      })
      .catch((error) => {
        Alert.alert("Payment Failed", error.description);
      });
  };

  if (!selectedPlan) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f0f0f] justify-center items-center">
        <Text className="text-white">No Plan Selected</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]">
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#0f0f0f] px-5 pt-12"
    >
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
              onChangeText={(text) => setForm({ ...form, phone: text })}
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
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
          </View>

          {/* Address */}
          <View className="mb-8">
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
              onChangeText={(text) => setForm({ ...form, address: text })}
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

          <Text className="text-gray-400 mb-5">{selectedPlan.description}</Text>

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
