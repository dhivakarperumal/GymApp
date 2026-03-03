import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function BuyPlan() {
  const { plan } = useLocalSearchParams();
  const selectedPlan = plan ? JSON.parse(plan) : null;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  if (!selectedPlan) {
    return (
      <View className="flex-1 bg-[#0f0f0f] justify-center items-center">
        <Text className="text-white">No Plan Selected</Text>
      </View>
    );
  }

  return (
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

        <View className="bg-[#141414] rounded-[32px] p-7 border border-[#262626]">
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
              className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-[#2a2a2a] focus:border-[#ff3c00]"
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
              className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-[#2a2a2a] focus:border-[#ff3c00]"
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
              className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-[#2a2a2a] focus:border-[#ff3c00]"
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
              className="bg-[#0f0f0f] text-white px-5 py-4 rounded-2xl border border-[#2a2a2a] h-28 focus:border-[#ff3c00]"
              onChangeText={(text) => setForm({ ...form, address: text })}
            />
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-[#262626] mb-6" />

          {/* Premium Pay Button */}
          <TouchableOpacity className="bg-[#ff3c00] py-5 rounded-2xl items-center shadow-2xl active:opacity-80">
            <Text className="text-black font-extrabold text-base tracking-widest">
              PAY ₹{Number(selectedPlan.price).toLocaleString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SELECTED PLAN CARD */}
      <View className="mb-20">
        <View className="absolute -inset-1 bg-[#ff3c00]/10 rounded-3xl blur-xl" />

        <View className="bg-[#161616] rounded-3xl p-7 border border-[#2a2a2a]">
          <Text className="text-[#ff3c00] text-2xl font-bold mb-2">
            {selectedPlan.name}
          </Text>

          <Text className="text-gray-400 mb-5">{selectedPlan.description}</Text>

          <Text className="text-[#ff3c00] text-4xl font-extrabold">
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
                <View className="w-2.5 h-2.5 bg-[#ff3c00] rounded-full mr-3" />
                <Text className="text-gray-300 text-sm">{item}</Text>
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
  );
}
