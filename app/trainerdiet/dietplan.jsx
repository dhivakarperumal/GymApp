import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function DietPlans() {

  const router = useRouter();
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchPlans = async () => {
      try {
        const res = await fetch(`/api/diet-plans?trainerId=${user.id}`);
        const data = await res.json();
        setPlans(data);
      } catch (err) {
        console.log("Diet fetch error", err);
      }
    };

    fetchPlans();
  }, [user]);

  return (
    <View className="flex-1 bg-[#0f0f0f] p-4">

      <Text className="text-white text-2xl font-bold mb-4">
        All Diet Plans
      </Text>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(trainers)/dietdetails",
                params: { plan: JSON.stringify(item) }
              })
            }
            className="bg-[#1a1a1a] p-4 rounded-xl mb-3"
          >
            <Text className="text-white text-lg font-semibold">
              {item.member_name}
            </Text>

            <Text className="text-gray-400">
              {item.title}
            </Text>

            <Text className="text-gray-400">
              {item.total_calories} Calories
            </Text>

          </TouchableOpacity>

        )}
      />
    </View>
  );
}