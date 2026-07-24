import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function MyPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [memberData, setMemberData] = useState(null);

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

        const [memberRes, membershipsRes] = await Promise.all([
          api.get(`/members/user/${userData.id}`),
          api.get(`/memberships/user/${userData.id}`)
        ]);

        const mData = memberRes?.data || null;
        let memberships = Array.isArray(membershipsRes?.data) ? membershipsRes.data : [];
        setMemberData(mData);
        setPlans(expandAndMergePlans(memberships, mData));
      } catch (err) {
        console.error("Failed to fetch my plans", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const expandAndMergePlans = (memberships, member) => {
    const expanded = [];

    memberships.forEach((m) => {
      const hasPt = m.has_pt_plan || m.pt_planId || m.pt_planName;
      const hasNormal = m.planId || m.planName;

      if (hasNormal) {
        expanded.push(m);
      }

      if (hasPt && m.pt_planName) {
        expanded.push({
          id: `pt-ms-${m.id}`,
          planName: m.pt_planName,
          price: Number(m.pt_price ?? 0),
          pricePaid: Number(m.pt_pricePaid ?? 0),
          duration: m.pt_duration || null,
          startDate: m.pt_startDate || null,
          endDate: m.pt_endDate || null,
          status: m.pt_status || 'active',
          paymentMode: m.pt_paymentMode || null,
          paymentStatus: m.pt_paymentStatus || null,
          trainerId: m.pt_trainerId || null,
          trainerName: m.pt_trainerName || null,
          isPtPlan: true,
        });
      }

      if (!hasNormal && !hasPt) {
        expanded.push(m);
      }
    });

    if (member && member.pt_status) {
      const ptActive = String(member.pt_status).toLowerCase() === 'active';
      const hasPlanName = Boolean(member.pt_plan);
      const hasValidDates = Boolean(member.pt_join_date && member.pt_expiry_date);
      if (ptActive && hasPlanName && hasValidDates) {
        const exists = expanded.some(
          (p) => p.isPtPlan && (
            String(p.planName || '').toLowerCase() === String(member.pt_plan || '').toLowerCase()
          )
        );
        if (!exists) {
          expanded.push({
            id: `pt-${member.member_id}`,
            planName: member.pt_plan,
            price: Number(member.pt_price ?? member.pt_pricePaid ?? 0),
            duration: member.pt_duration || null,
            startDate: member.pt_join_date || null,
            endDate: member.pt_expiry_date || null,
            status: member.pt_status || 'ACTIVE',
            isPtPlan: true,
          });
        }
      }
    }

    return expanded;
  };

  const formatPlanDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between p-4 border-b border-red-500/20 bg-black/95">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-xl bg-gray-800/50"
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">My Plans</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-red-500 text-center">Your Active Plans</Text>
          <Text className="text-gray-400 text-center mt-2">Manage your purchased memberships</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#ef4444" />
          </View>
        ) : plans.length === 0 ? (
          <View className="bg-gray-900/50 p-8 rounded-2xl border border-red-500/10 items-center mt-10">
            <Text className="text-xl font-bold text-red-500 mb-2">No Active Plans</Text>
            <Text className="text-gray-400 text-center mb-6">
              Unlock your full potential with our premium membership plans.
            </Text>
            <TouchableOpacity
              className="bg-red-600 px-8 py-3 rounded-full"
              onPress={() => router.push("/Shop")}
            >
              <Text className="text-white font-bold">Explore Plans</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-6">
            {plans.map((plan, index) => {
              const price = Number(plan.price || plan.pricePaid || plan.pt_price || plan.pt_pricePaid || 0);
              const start = formatPlanDate(plan.startDate);
              const end = formatPlanDate(plan.endDate);
              const endDate = plan.endDate ? new Date(plan.endDate) : null;
              const isExpired = endDate instanceof Date && !Number.isNaN(endDate.getTime()) && endDate < new Date();
              const uniqueId = plan.id || index.toString();

              return (
                <View
                  key={uniqueId}
                  className="bg-gray-900 border border-red-500/20 p-6 rounded-2xl mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <Text className="text-xl font-bold text-white flex-1 mr-2">{plan.planName}</Text>
                    <View className={`px-3 py-1 rounded-full ${isExpired ? "bg-gray-800" : "bg-red-600"}`}>
                      <Text className={`text-[10px] font-bold uppercase ${isExpired ? "text-gray-400" : "text-white"}`}>
                        {isExpired ? "EXPIRED" : (plan.status || "ACTIVE")}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-baseline mb-4">
                    <Text className="text-3xl font-black text-red-600">₹{price.toLocaleString("en-IN")}</Text>
                    {plan.duration && (
                      <Text className="text-sm font-bold text-gray-500 ml-1">/ {plan.duration}</Text>
                    )}
                  </View>

                  <View className="flex-row border-t border-white/10 pt-4 mt-2">
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-gray-500 uppercase mb-1">Started On</Text>
                      <Text className="text-sm text-gray-200">{start}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-gray-500 uppercase mb-1">Expires On</Text>
                      <Text className="text-sm text-gray-200">{end}</Text>
                    </View>
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
