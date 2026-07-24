import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getMembershipField = (membership, primaryKey, secondaryKey) => {
  if (!membership) return null;
  return membership[primaryKey] ?? membership[secondaryKey] ?? null;
};

const getMembershipDisplayValue = (membership, fallback) => {
  if (!membership) return fallback;
  return membership.planName || membership.plan_name || fallback;
};

const getMembershipDuration = (membership) => {
  return getMembershipField(membership, "duration", "planDuration") || "-";
};

const getMembershipTotal = (membership) => {
  return Number(getMembershipField(membership, "price", "plan_price")) || 0;
};

const getMembershipPaid = (membership) => {
  const pricePaid = Number(getMembershipField(membership, "pricePaid", "price_paid")) || 0;
  const secondPaid = Number(getMembershipField(membership, "secondPaymentPaid", "second_payment_paid")) || 0;
  return pricePaid + secondPaid;
};

const getMembershipRemaining = (membership) => {
  const total = getMembershipTotal(membership);
  const paid = getMembershipPaid(membership);
  return Math.max(0, total - paid);
};

const getMembershipPaymentEntries = (membership) => {
  if (!membership) return [];
  const entries = [];
  
  const initialPaid = Number(getMembershipField(membership, "pricePaid", "price_paid")) || 0;
  if (initialPaid > 0) {
    entries.push({
      amount: initialPaid,
      collectedAt: getMembershipField(membership, "createdAt", "created_at"),
      collectedBy: getMembershipField(membership, "collectedBy", "collected_by") || "Admin",
      paymentId: getMembershipField(membership, "paymentId", "payment_id"),
    });
  }

  const secondPaid = Number(getMembershipField(membership, "secondPaymentPaid", "second_payment_paid")) || 0;
  if (secondPaid > 0) {
    entries.push({
      amount: secondPaid,
      collectedAt: getMembershipField(membership, "secondPaymentDate", "second_payment_date"),
      collectedBy: getMembershipField(membership, "collectedBy", "collected_by") || "Admin",
      paymentId: getMembershipField(membership, "secondPaymentId", "second_payment_id") || "Cash",
    });
  }

  return entries.sort((a, b) => new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime());
};

export default function EmiDetails() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(storedUser);
        const userData = Array.isArray(parsed) ? parsed[0] : parsed;
        setUser(userData);

        const membershipsRes = await api.get(`/memberships/user/${userData.id}`);
        const mShips = Array.isArray(membershipsRes?.data) ? membershipsRes.data : [];
        
        setPlans(mShips);
      } catch (err) {
        console.error("Failed to fetch EMI details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activePlans = plans || [];
  const activeCount = activePlans.filter((m) => String(m.status).toLowerCase() === "active").length;
  const totalRemaining = activePlans.reduce((sum, m) => sum + getMembershipRemaining(m), 0);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between p-4 border-b border-white/10 bg-black/95">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-xl bg-gray-800/50"
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">EMI Details</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View className="bg-gray-900/50 border border-white/10 rounded-3xl p-6 mb-6">
          <Text className="text-2xl font-bold uppercase text-white mb-2">EMI Details</Text>
          <Text className="text-sm text-gray-400 mb-6">
            Review your membership EMI schedule, plan summary, total amount paid and remaining dues.
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <View className="rounded-2xl bg-black/50 border border-white/10 px-4 py-3 mb-3 w-[48%]">
              <Text className="text-[10px] uppercase tracking-widest text-blue-300">Total Plans</Text>
              <Text className="text-white font-semibold mt-2">{activePlans.length}</Text>
            </View>
            <View className="rounded-2xl bg-black/50 border border-white/10 px-4 py-3 mb-3 w-[48%]">
              <Text className="text-[10px] uppercase tracking-widest text-blue-300">Active Plans</Text>
              <Text className="text-white font-semibold mt-2">{activeCount}</Text>
            </View>
            <View className="rounded-2xl bg-black/50 border border-white/10 px-4 py-3 w-full">
              <Text className="text-[10px] uppercase tracking-widest text-blue-300">Pending Dues</Text>
              <Text className="text-white font-semibold mt-2">{formatCurrency(totalRemaining)}</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : activePlans.length === 0 ? (
          <View className="bg-gray-900/50 p-8 rounded-3xl border border-white/10 items-center mt-4">
            <Text className="text-gray-400 text-center">
              No EMI membership records found for your account.
            </Text>
          </View>
        ) : (
          <View className="space-y-6">
            {activePlans.map((membership, index) => {
              const planName = getMembershipDisplayValue(membership, "Unknown Plan");
              const duration = getMembershipDuration(membership);
              const totalAmount = getMembershipTotal(membership);
              const remainingAmount = getMembershipRemaining(membership);
              const dues = getMembershipPaymentEntries(membership);
              const status = getMembershipField(membership, "status") || "-";
              const paymentStatus = getMembershipField(membership, "paymentStatus", "payment_status") || "-";
              const paymentMode = getMembershipField(membership, "paymentMode", "payment_mode") || "-";
              const startDate = getMembershipField(membership, "startDate", "start_date");
              const endDate = getMembershipField(membership, "endDate", "end_date");
              const createdAt = getMembershipField(membership, "createdAt", "created_at");
              const membershipId = membership.id || membership.membershipId || index;

              const dueDate = new Date(createdAt);
              if (!Number.isNaN(dueDate.getTime())) {
                dueDate.setDate(dueDate.getDate() + 30);
              }

              return (
                <View key={membershipId} className="rounded-3xl border border-white/10 bg-gray-900/50 p-6 mb-6">
                  <View className="flex-row justify-between items-start border-b border-white/10 pb-4 mb-6">
                    <View className="flex-1">
                      <Text className="text-xs uppercase tracking-widest text-gray-500">Plan</Text>
                      <Text className="text-xl font-bold text-white mt-1">{planName}</Text>
                      <Text className="text-sm text-gray-400 mt-1">{duration !== "-" ? `${duration} month${duration === 1 ? "" : "s"}` : "Duration not set"}</Text>
                    </View>
                    <View className="items-end ml-4">
                      <View className={`px-3 py-1 rounded-full border ${String(status).toLowerCase() === "active" ? "bg-green-500/10 border-green-500/20" : "bg-gray-500/10 border-white/10"}`}>
                        <Text className={`text-[10px] font-semibold uppercase ${String(status).toLowerCase() === "active" ? "text-green-400" : "text-gray-300"}`}>{status}</Text>
                      </View>
                      <Text className="text-[10px] text-gray-400 mt-2">Created {formatDate(createdAt)}</Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap justify-between mb-6">
                    <View className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 w-[48%] mb-3">
                      <Text className="text-[10px] uppercase tracking-widest text-blue-300">Total Amount</Text>
                      <Text className="text-white font-semibold mt-2">{formatCurrency(totalAmount)}</Text>
                    </View>
                    <View className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 w-[48%] mb-3">
                      <Text className="text-[10px] uppercase tracking-widest text-blue-300">Initial Paid</Text>
                      <Text className="text-white font-semibold mt-2">{formatCurrency(getMembershipField(membership, "pricePaid", "price_paid") || 0)}</Text>
                    </View>
                    <View className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 w-[48%] mb-3">
                      <Text className="text-[10px] uppercase tracking-widest text-blue-300">Second Paid</Text>
                      <Text className="text-white font-semibold mt-2">{formatCurrency(getMembershipField(membership, "secondPaymentPaid", "second_payment_paid") || 0)}</Text>
                    </View>
                    <View className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 w-[48%] mb-3">
                      <Text className="text-[10px] uppercase tracking-widest text-blue-300">Remaining</Text>
                      <Text className="text-white font-semibold mt-2">{formatCurrency(remainingAmount)}</Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap justify-between">
                    <View className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 w-full mb-3">
                      <Text className="text-[10px] uppercase tracking-widest text-blue-300 mb-2">Next EMI Due</Text>
                      <View className="self-start px-3 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                        <Text className="text-lg font-bold text-blue-200">
                          {Number.isNaN(dueDate.getTime()) ? "-" : formatDate(dueDate)}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-300 mt-3">
                        EMI Amount: <Text className="font-semibold text-white">{formatCurrency(remainingAmount)}</Text>
                      </Text>
                    </View>
                    
                    <View className="bg-black/40 border border-white/10 rounded-2xl p-4 w-[48%] mb-3">
                      <Text className="text-[10px] uppercase tracking-widest text-blue-300">Payment Status</Text>
                      <Text className="text-white font-semibold mt-2">{paymentStatus}</Text>
                    </View>
                    <View className="bg-black/40 border border-white/10 rounded-2xl p-4 w-[48%] mb-3">
                      <Text className="text-[10px] uppercase tracking-widest text-blue-300">Payment Mode</Text>
                      <Text className="text-white font-semibold mt-2">{paymentMode}</Text>
                    </View>

                    <View className="bg-black/40 border border-white/10 rounded-2xl p-4 w-[48%]">
                      <Text className="text-[10px] uppercase tracking-widest text-blue-300">Start Date</Text>
                      <Text className="text-white font-semibold mt-2">{formatDate(startDate)}</Text>
                    </View>
                    <View className="bg-black/40 border border-white/10 rounded-2xl p-4 w-[48%]">
                      <Text className="text-[10px] uppercase tracking-widest text-blue-300">End Date</Text>
                      <Text className="text-white font-semibold mt-2">{formatDate(endDate)}</Text>
                    </View>
                  </View>

                  <View className="mt-6">
                    <Text className="text-sm font-bold uppercase tracking-widest text-white mb-3">EMI Dues History</Text>
                    {dues.length > 0 ? (
                      <View className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
                        <View className="flex-row bg-white/5 py-3 px-2">
                          <Text className="flex-1 text-xs uppercase tracking-widest text-gray-400 pl-2">Due Amount</Text>
                          <Text className="flex-1 text-xs uppercase tracking-widest text-gray-400">Date</Text>
                          <Text className="flex-1 text-xs uppercase tracking-widest text-gray-400">Reference</Text>
                        </View>
                        {dues.map((due, dueIndex) => (
                          <View key={dueIndex} className="flex-row py-4 px-2 border-t border-white/10">
                            <Text className="flex-1 text-white font-semibold pl-2">{formatCurrency(due.amount)}</Text>
                            <Text className="flex-1 text-gray-300">{formatDate(due.collectedAt)}</Text>
                            <Text className="flex-1 text-gray-300 text-xs" numberOfLines={2}>{due.paymentId || "Cash"}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text className="text-gray-400 text-sm">No dues recorded yet for this plan.</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
