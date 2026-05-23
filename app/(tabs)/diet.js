import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { getDietPlans } from "../../services/api";

const format12h = (time) => {
  if (!time) return "";
  if (typeof time !== "string") return time;
  const normalized = time.trim();
  if (normalized.toLowerCase().includes("am") || normalized.toLowerCase().includes("pm")) {
    return normalized;
  }
  if (!normalized.includes(":")) return normalized;

  const [hours, minutes] = normalized.split(":");
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const getDayIndex = (dayKey, allKeys = []) => {
  const digits = String(dayKey).match(/\d+/g);
  const rawNumber = digits ? Number(digits.join("")) : NaN;
  if (Number.isNaN(rawNumber)) return 0;
  const hasZeroKey = allKeys.some((key) => String(key).trim() === "0");
  return hasZeroKey ? rawNumber : Math.max(0, rawNumber - 1);
};

const formatPlanDay = (dayKey, createdAt, allKeys = []) => {
  if (!createdAt) return String(dayKey);
  const index = getDayIndex(dayKey, allKeys);
  return dayjs(createdAt).add(index, "day").format("DD MMM");
};

export default function DietChartScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [diet, setDiet] = useState(null);
  const [title, setTitle] = useState("");
  const [createdAt, setCreatedAt] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDietPlan = useCallback(async () => {
    setLoading(true);

    try {
      const identifier = user?.user_id || user?.id;
      const params = {};
      if (identifier) params.memberId = identifier;
      if (user?.email) params.email = user.email;
      if (user?.mobile) params.mobile = user.mobile;

      const data = await getDietPlans(params);
      const plans = Array.isArray(data) ? data : data?.data || [];
      
      const userEmail = user?.email?.toLowerCase() || "";
      const userMobile = user?.mobile || "";
      const userId = String(user?.id || "");
      const userUuid = user?.user_id || "";

      const userPlans = plans.filter(
        (item) =>
          (item.member_email && item.member_email.toLowerCase() === userEmail) ||
          (item.member_mobile && item.member_mobile === userMobile) ||
          (String(item.user_id) === userId) ||
          (item.user_id_uuid === userUuid)
      );

      if (!userPlans.length) {
        setDiet(null);
        setTitle("");
        setCreatedAt(null);
        setActiveDay(null);
        return;
      }

      const latestPlan = userPlans.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0];

      let daysData = latestPlan.days;
      if (typeof daysData === "string") {
        try {
          daysData = JSON.parse(daysData);
        } catch (err) {
          console.log("Diet days parse error:", err);
        }
      }

      if (!daysData || typeof daysData !== "object") {
        setDiet(null);
        return;
      }

      const dayKeys = Object.keys(daysData);
      const todayKey = dayKeys.find((key) => {
        const index = getDayIndex(key, dayKeys);
        return dayjs(latestPlan.created_at).add(index, "day").isSame(dayjs(), "day");
      });

      setTitle(latestPlan.title || "My Diet Plan");
      setDiet(daysData);
      setCreatedAt(latestPlan.created_at || null);
      setActiveDay((prev) => prev || todayKey || dayKeys[0] || null);
    } catch (err) {
      console.log("Diet fetch error:", err);
      setDiet(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDietPlan();
    }
  }, [user, fetchDietPlan]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDietPlan();
    setRefreshing(false);
  };

  const dayKeys = diet ? Object.keys(diet) : [];
  const selectedDay = activeDay || dayKeys[0];
  const meals = selectedDay ? diet?.[selectedDay] : null;

  if (loading) {
    return (
      <View className="flex-1 bg-[#0f0f0f] items-center justify-center px-5 pt-12">
        <ActivityIndicator size="large" color="#e11d1d" />
        <Text className="text-white/60 text-sm mt-4">Loading your diet plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#0f0f0f] px-5 pt-12"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#e11d1d"
        />
      }
    >
      <Text className="text-white text-3xl font-extrabold mb-2">My Diet Plan</Text>
      {title ? (
        <Text className="text-gray-400 mb-6">{title}</Text>
      ) : null}

      {diet ? (
        <>
          {/* <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            className="mb-4"
          >
            {dayKeys.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-full mr-2 ${activeDay === day ? "bg-primary" : "bg-[#222]"}`}
              >
                <Text className={`text-sm font-semibold ${activeDay === day ? "text-white" : "text-gray-400"}`}>
                  {formatPlanDay(day, createdAt, dayKeys)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView> */}

          {meals ? (
            Object.entries(meals).map(([meal, value]) => {
              const mealItems = Array.isArray(value?.items) ? value.items : [];
              const totalCalories = mealItems.reduce(
                (sum, item) => sum + (parseInt(item.calories, 10) || 0),
                0
              );

              return (
                <View
                  key={meal}
                  className="bg-[#1c1c1c] rounded-2xl border border-[#262626] mb-6"
                >
                  <View className="flex-row justify-between items-center bg-black/40 px-5 py-4 border-b border-[#262626]">
                    <Text className="text-white font-semibold text-lg">{meal}</Text>
                    {value?.time ? (
                      <Text className="text-red-500 text-sm">
                        {format12h(value.time)}
                      </Text>
                    ) : (
                      <Text className="text-gray-500 text-xs">No time</Text>
                    )}
                  </View>

                  <View className="px-5 py-4 space-y-3">
                    {mealItems.length > 0 ? (
                      mealItems.map((item, idx) => (
                        <View
                          key={`${meal}-${idx}`}
                          className="flex-row justify-between items-start gap-2 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                        >
                          <View className="flex-1">
                            <Text className="text-white text-sm font-medium">
                              {item.food || "Food item"}
                            </Text>
                            <Text className="text-white/40 text-[12px] mt-1">
                              Qty: <Text className="text-white/60">{item.quantity || "-"}</Text>
                            </Text>
                          </View>
                          <View className="text-right">
                            <Text className="text-xs font-semibold text-emerald-400 whitespace-nowrap">
                              {item.calories || "0"} <Text className="text-[10px] opacity-70">kcal</Text>
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text className="text-white/60 text-sm">No food items</Text>
                    )}

                    {mealItems.length > 0 && (
                      <View className="mt-3 pt-3 border-t border-red-500/20 flex-row items-center justify-between">
                        <Text className="text-[10px] text-white/30 uppercase tracking-tighter font-semibold">Total</Text>
                        <Text className="text-xs font-bold text-red-500">
                          {totalCalories} <Text className="text-[10px] opacity-70">kcal</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View className="bg-[#1c1c1c] rounded-2xl p-5 border border-[#262626] mb-6">
              <Text className="text-white text-sm">No meals available for this day.</Text>
            </View>
          )}
        </>
      ) : (
        <View className="items-center mt-16">
          <View className="bg-[#1c1c1c] p-6 rounded-full mb-6 border border-[#262626]">
            <Ionicons name="nutrition-outline" size={70} color="#e11d1d" />
          </View>
          <Text className="text-white text-lg font-semibold mb-2">No Diet Plan Assigned</Text>
          <Text className="text-gray-400 text-center mb-6 px-10">
            Purchase a premium plan to unlock your personalized diet chart
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/Pages/Pricing")}
            className="bg-primary px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">View Pricing Plans</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="h-20" />
    </ScrollView>
  );
}
