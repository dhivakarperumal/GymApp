import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { getAllPlans, getUserMemberships } from "../../services/api";
import BackButton from "../BackButton";

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const router = useRouter();

  const { user } = useAuth();

  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlans();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!user?.id) {
      setHasActivePlan(false);
      setCheckingPlan(false);
      return;
    }

    const checkActivePlan = async () => {
      try {
        const memberships = await getUserMemberships(user.id);

        if (!Array.isArray(memberships)) {
          setHasActivePlan(false);
          return;
        }

        // filter only this user's memberships
        const myMemberships = memberships.filter(
          (m) => Number(m.userId || m.user_id) === Number(user.id)
        );

        // check active plan
        const activePlan = myMemberships.some(
          (m) =>
            (m.status || "").toLowerCase() === "active" &&
            new Date(m.endDate) > new Date()
        );

        setHasActivePlan(activePlan);
      } catch (err) {
        console.log("Active plan check error:", err);
        setHasActivePlan(false);
      } finally {
        setCheckingPlan(false);
      }
    };

    checkActivePlan();
  }, [user]);

  const fetchPlans = async () => {
    try {
      const data = await getAllPlans();
      console.log("PLANS API:", data);

      // ensure array
      if (Array.isArray(data)) {
        setPlans(data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.log("Plans fetch error:", err.message);
      setPlans([]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>

      {/* HEADER ROW */}
      <View style={{
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
        backgroundColor: "#000", borderBottomWidth: 1, borderBottomColor: "#111",
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <BackButton style={{ marginRight: 12 }} />
          <View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>Membership Plans</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Choose Your Plan</Text>
          </View>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e11d1d", alignItems: "center", justifyContent: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}>
          <Ionicons name="pricetag-outline" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e11d1d"
          />
        }
      >

        {plans.length === 0 && (
          <Text className="text-gray-400 text-center mt-10">
            No plans available
          </Text>
        )}

        {plans.map((plan, index) => (
          <View key={plan.id || index} className="mb-8">
            {/* Glow Layer */}
            <View className="absolute -inset-1 bg-[#ff3c00]/10 rounded-3xl blur-xl" />

            {/* Card */}
            <View className="bg-[#161616] rounded-3xl p-7 border border-primary">
              {/* Plan Name */}
              <Text className="text-white text-2xl font-bold mb-2">
                {plan?.name}
              </Text>

              {/* Description */}
              <Text className="text-gray-400 text-sm mb-4">
                {plan?.description}
              </Text>

              {/* PRICE SECTION */}
              <View className="mb-6 flex-col">

                {/* Final Price + Duration */}
                <View className="flex-row items-end gap-2">
                  <Text className="text-primary text-5xl font-extrabold">
                    ₹{Number(plan?.final_price ?? plan?.price ?? 0).toLocaleString()}
                  </Text>

                  <Text className="text-gray-400 text-base mb-1">
                    / {plan?.duration || plan?.duration_months || "month"}
                  </Text>
                </View>

                {/* Original Price */}
                {plan?.price &&
                  plan?.final_price &&
                  Number(plan.price) !== Number(plan.final_price) && (
                    <Text className="text-gray-400 text-sm line-through mt-1">
                      ₹{Number(plan.price).toLocaleString()}
                    </Text>
                  )}
              </View>

              {/* Trainer Status */}
              {/* <View className="mb-6">
                {plan?.trainer_included === 1 ? (
                  <View className="bg-green-600/20 px-4 py-1.5 rounded-full self-start">
                    <Text className="text-green-400 text-xs font-semibold">
                      Trainer Included
                    </Text>
                  </View>
                ) : (
                  <View className="bg-[#222] px-4 py-1.5 rounded-full self-start border border-[#333]">
                    <Text className="text-gray-400 text-xs font-semibold">
                      Trainer Not Included
                    </Text>
                  </View>
                )}
              </View> */}

              {/* Facilities (From DB) */}
              <View className="mb-8">
                {Array.isArray(plan?.facilities) &&
                  plan.facilities.map((facility, i) => (
                    <View key={i} className="flex-row items-center mb-3">
                      <View className="w-2.5 h-2.5 bg-primary rounded-full mr-3" />
                      <Text className="text-gray-300 text-sm tracking-wide">
                        {facility}
                      </Text>
                    </View>
                  ))}
              </View>

              {/* <TouchableOpacity
                disabled={hasActivePlan || checkingPlan}
                onPress={() => {
                  if (hasActivePlan) {
                    alert("You already have an active plan.");
                    return;
                  }

                  router.push({
                    pathname: "/Pages/Buyplan",
                    params: { plan: JSON.stringify(plan) },
                  });
                }}
                className={`py-4 rounded-2xl items-center shadow-xl ${hasActivePlan ? "bg-gray-600" : "bg-primary"
                  }`}
              >
                <Text className="text-white font-bold text-xl tracking-wide">
                  {hasActivePlan ? "PLAN ACTIVE" : "BUY PLAN"}
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>
        ))}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
