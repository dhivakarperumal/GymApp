import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { getTrainerDashboard } from "../../services/api";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    members: 0,
    todayCheckins: 0,
    workoutPlans: 0,
    dietPlans: 0,
  });

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      if (!isRefresh) setLoading(true);
      setError(null);

      try {
        const data = await getTrainerDashboard(user.id, user);
        setMembers(Array.isArray(data.members) ? data.members : []);
        setStats(data.stats);
      } catch (err) {
        console.log("Dashboard error:", err);
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard(true);
  }, [loadDashboard]);

  /* ─── Safe field helpers (matches web field names) ─── */
  const getName = (m) => m.username || m.user_name || "No Name";
  const getEmail = (m) => m.userEmail || m.user_email || "-";
  const getMobile = (m) => m.userMobile || m.user_mobile || "-";
  const getPlan = (m) => m.planName || m.plan_name || "-";
  const getStatus = (m) => m.status || "Active";

  const formatDate = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  /* ─── Stat Card ─── */
  const StatCard = ({ title, value, icon }) => (
    <View
      className="bg-[#141414] rounded-2xl p-5 border border-[#262626] mb-3"
      style={{
        width: "48%",
        shadowColor: "#ff3c00",
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mr-3 shrink-0">
          <Ionicons name={icon} size={22} color="#ff3c00" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-400 text-[10px] uppercase" numberOfLines={2}>{title}</Text>
          <Text className="text-white text-2xl font-bold mt-0.5">{value}</Text>
        </View>
      </View>
    </View>
  );

  const displayNameRaw = user?.name || user?.username || "Trainer";
  const displayName =
    displayNameRaw.charAt(0).toUpperCase() + displayNameRaw.slice(1);

  /* ─── LOADING ─── */
  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#ff3c00" />
        <Text className="text-gray-400 mt-4 text-sm">Loading dashboard…</Text>
      </View>
    );
  }

  /* ─── ERROR ─── */
  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Ionicons name="cloud-offline-outline" size={52} color="#ff3c00" />
        <Text className="text-white text-lg font-bold mt-4 text-center">
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => loadDashboard()}
          className="mt-6 bg-red-600 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ─── MAIN ─── */
  return (
    <View className="flex-1 bg-black pt-12 px-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff3c00"
            colors={["#ff3c00"]}
          />
        }
      >
        {/* HEADER */}
        <Text className="text-white text-3xl font-bold mb-1">
          Trainer Dashboard
        </Text>
        <Text className="text-gray-500 text-sm mb-6">
          Welcome, {displayName}
        </Text>

        {/* STATS */}
        <View className="flex-row flex-wrap justify-between mb-2">
          <StatCard title="Assigned Members" value={stats.members} icon="people-outline" />
          <StatCard title="Today's Check-ins" value={stats.todayCheckins} icon="calendar-outline" />
          <StatCard title="Workout Plans" value={stats.workoutPlans} icon="barbell-outline" />
          <StatCard title="Diet Plans" value={stats.dietPlans} icon="restaurant-outline" />
        </View>

        {/* MEMBERS SECTION HEADER */}
        <View className="flex-row items-center justify-between mt-4 mb-4">
          <Text className="text-red-600 text-2xl font-bold">
            Assigned Members
          </Text>
          <View className="bg-red-500/20 px-3 py-1 rounded-full">
            <Text className="text-red-400 text-xs font-bold">
              {members.length} Total
            </Text>
          </View>
        </View>

        {/* MEMBERS LIST */}
        {members.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Ionicons name="people-outline" size={52} color="#444" />
            <Text className="text-gray-500 text-base mt-4 text-center">
              No members assigned yet.{"\n"}Pull down to refresh.
            </Text>
          </View>
        ) : (
          members.map((m, i) => {
            const status = getStatus(m);
            const isActive = status.toLowerCase() === "active";

            return (
              <View
                key={`${m.userId || m.user_id || i}`}
                className="bg-[#141414] rounded-2xl p-4 mb-4 border border-[#262626]"
                style={{
                  shadowColor: "#ff3c00",
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                {/* Row 1: Avatar + Info + Status */}
                <View className="flex-row items-center">
                  {/* Letter Avatar */}
                  <View className="w-12 h-12 rounded-full bg-red-500 items-center justify-center mr-3">
                    <Text className="text-white text-lg font-bold">
                      {getName(m).charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base">
                      {getName(m)}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {getEmail(m)}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {getMobile(m)}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <View
                    className={`px-3 py-1 rounded-2xl ${isActive ? "bg-green-500/20" : "bg-gray-500/20"
                      }`}
                  >
                    <Text
                      className={`text-xs font-bold ${isActive ? "text-green-400" : "text-gray-400"
                        }`}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View className="h-[1px] bg-[#262626] my-3" />

                {/* Row 2: Plan */}
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-400 text-sm">Membership Plan</Text>
                  <View className="bg-red-500/20 px-3 py-1 rounded-2xl">
                    <Text className="text-red-400 text-sm font-semibold">
                      {getPlan(m)}
                    </Text>
                  </View>
                </View>

                {/* Row 3: Start / End Dates */}
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-gray-500 text-[10px] uppercase mb-0.5">
                      Starts
                    </Text>
                    <Text className="text-gray-300 text-xs">
                      {formatDate(m.planStartDate || m.plan_start_date)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-500 text-[10px] uppercase mb-0.5">
                      Ends
                    </Text>
                    <Text className="text-gray-300 text-xs">
                      {formatDate(m.planEndDate || m.plan_end_date)}
                    </Text>
                  </View>
                </View>

                {/* Row 4: PT Form Status */}
                <View className="mt-3 pt-3 border-t border-[#262626]">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-400 text-sm">PT Form</Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => {
                          router.push({
                            pathname: "/(trainers)/pt-form",
                            params: { member_id: m.gymMemberId || m.userId || m.user_id }
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl border ${m.ptFormCompleted
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-red-500/10 border-red-500/20"
                          }`}
                      >
                        <Text
                          className={`text-xs font-bold ${m.ptFormCompleted ? "text-green-400" : "text-red-400"
                            }`}
                        >
                          {m.ptFormCompleted ? "Completed" : "Pending"}
                        </Text>
                      </TouchableOpacity>

                      {m.ptFormCompleted && (
                        <View className="flex-row gap-1">
                          <TouchableOpacity
                            onPress={() => {
                              // For now, navigate to edit - could be enhanced to show view modal
                              router.push({
                                pathname: "/(trainers)/pt-form",
                                params: { member_id: m.gymMemberId || m.userId || m.user_id }
                              });
                            }}
                            className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20"
                          >
                            <Ionicons name="eye-outline" size={16} color="#3b82f6" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              router.push({
                                pathname: "/(trainers)/pt-form",
                                params: { member_id: m.gymMemberId || m.userId || m.user_id }
                              });
                            }}
                            className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20"
                          >
                            <Ionicons name="pencil-outline" size={16} color="#f59e0b" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
