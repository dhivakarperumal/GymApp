import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getTrainerDashboard } from "../../services/api";

export default function TrainerDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    members: 0,
    todayCheckins: 0,
    workoutPlans: 0,
    dietPlans: 0,
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const loadDashboard = async () => {
      try {
        const data = await getTrainerDashboard(user.id, user);

        setMembers(data.members);
        setStats(data.stats);

      } catch (err) {
        console.log("Dashboard error:", err);
      }
    };

    loadDashboard();
  }, [user]);

  const StatCard = ({ title, value, icon }) => (
    <View
      className="flex-1 bg-[#141414] rounded-2xl p-5 border border-[#262626] m-1"
      style={{
        shadowColor: "#ff3c00",
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center">

        {/* ICON */}
        <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mr-3">
          <Ionicons name={icon} size={22} color="#ff3c00" />
        </View>

        {/* TEXT */}
        <View>
          <Text className="text-gray-400 text-xs uppercase">{title}</Text>
          <Text className="text-white text-2xl font-bold mt-1">{value}</Text>
        </View>

      </View>
    </View>
  );

  const displayNameRaw = user?.name || user?.username || "Trainer";

  const displayName =
    displayNameRaw.charAt(0).toUpperCase() + displayNameRaw.slice(1);

  return (

    <View className="flex-1 bg-black pt-12 px-5">
      <ScrollView showsVerticalScrollIndicator={false}>

        <View className="mb-6">
          <Text className="text-gray-400 text-sm">Welcome back</Text>

          <Text className="text-red-600 text-3xl font-bold">
            {displayName}
          </Text>
        </View>

        {/* STATS */}

        <View className="flex-row">
          <StatCard
            title="Assigned Members"
            value={stats.members}
            icon="people-outline"
          />

          <StatCard
            title="Today's Check-ins"
            value={stats.todayCheckins}
            icon="calendar-outline"
          />
        </View>

        <View className="flex-row">
          <StatCard
            title="Workout Plans"
            value={stats.workoutPlans}
            icon="barbell-outline"
          />

          <StatCard
            title="Diet Plans"
            value={stats.dietPlans}
            icon="restaurant-outline"
          />
        </View>

        {/* MEMBERS */}

        <Text className="text-red-600 text-3xl font-bold mt-6 mb-4">
          Assigned Members
        </Text>

        {members.length === 0 ? (
          <Text className="text-gray-400">No members assigned</Text>
        ) : (
          members.map((m, i) => (
            <View
              key={i}
              className="bg-[#141414] rounded-2xl p-4 mb-4 border border-[#262626]"
              style={{
                shadowColor: "#ff3c00",
                shadowOpacity: 0.25,
                shadowRadius: 15,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center">

                {/* Avatar */}
                <View className="w-12 h-12 rounded-full bg-red-500 items-center justify-center mr-3">
                  <Ionicons name="person" size={22} color="white" />
                </View>

                {/* Member Info */}
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">
                    {m.username || "No Name"}
                  </Text>

                  <Text className="text-gray-400 text-xs mt-1">
                    {m.userEmail || "-"}
                  </Text>

                  <Text className="text-gray-500 text-xs">
                    {m.userMobile || "-"}
                  </Text>
                </View>

                {/* Status */}
                <View
                  className={`px-3 py-1 rounded-2xl ${(m.status || "").toLowerCase() === "active"
                    ? "bg-green-500/20"
                    : "bg-gray-500/20"
                    }`}
                >
                  <Text
                    className={`text-xs font-bold ${(m.status || "").toLowerCase() === "active"
                      ? "text-green-400"
                      : "text-gray-400"
                      }`}
                  >
                    {m.status || "Unknown"}
                  </Text>
                </View>

              </View>

              <View className="h-[1px] bg-[#262626] my-3" />

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 text-md">
                  Membership Plan
                </Text>

                <View className="bg-red-500/20 px-3 py-1 rounded-2xl">
                  <Text className="text-red-400 text-sm font-semibold">
                    {m.planName || "-"}
                  </Text>
                </View>
              </View>

            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}