import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import {
  getTrainerDietPlans,
  deleteDietPlanApi,
  getDietPlan,
} from "../../services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import TrainerHeader from "./TrainerHeader";

export default function DietPlan() {
  const { user } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  /* ---------------- FETCH PLANS ---------------- */

  useEffect(() => {
    if (!user?.id) return;

    const fetchPlans = async () => {
      try {
        const data = await getTrainerDietPlans(user.id);
        setPlans(data);
      } catch (err) {
        console.log("Diet fetch error", err);
      }
    };

    fetchPlans();
  }, [user]);

  /* ---------------- VIEW PLAN ---------------- */

  const openPlan = (plan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  /* ---------------- DELETE PLAN ---------------- */

  const deletePlan = (id) => {
    Alert.alert("Delete Diet Plan", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDietPlanApi(id);

            setPlans((prev) => prev.filter((p) => p.id !== id));
          } catch (err) {
            console.log("Delete error", err);
          }
        },
      },
    ]);
  };

  /* ---------------- RENDER CARD ---------------- */

  const renderItem = ({ item, index }) => (
    <View className="bg-[#1a1a1a] p-4 rounded-xl mb-3">

      <View className="flex-row justify-between">

        <View>
          <Text className="text-white text-lg font-semibold">
            {item.member_name}
          </Text>

          <Text className="text-gray-400">{item.title}</Text>

          <Text className="text-gray-400">
            {item.total_calories} Calories
          </Text>

          <Text className="text-gray-400">
            {item.duration} days
          </Text>
        </View>

        {/* ACTION BUTTONS */}

        <View className="flex-row items-center space-x-2 gap-2">

  {/* VIEW */}
  <TouchableOpacity
    onPress={() => openPlan(item)}
    className="bg-yellow-500 w-10 h-10 items-center justify-center rounded-full"
  >
    <Ionicons name="eye" size={16} color="white" />
  </TouchableOpacity>

  {/* EDIT */}
  <TouchableOpacity
    onPress={() =>
      router.push({
        pathname: "/diet-plans",
        params: { id: item.id },
      })
    }
    className="bg-green-500 w-10 h-10 items-center justify-center rounded-full"
  >
    <Ionicons name="create" size={16} color="white" />
  </TouchableOpacity>

  {/* DELETE */}
  <TouchableOpacity
    onPress={() => deletePlan(item.id)}
    className="bg-red-500 w-10 h-10 items-center justify-center rounded-full"
  >
    <Ionicons name="trash" size={16} color="white" />
  </TouchableOpacity>

</View>

      </View>

    </View>
  );

  return (
    <View className="flex-1 bg-[#0f0f0f]">

      <TrainerHeader />

      <SafeAreaView className="flex-1 p-4">

        {/* HEADER */}

        <View className="flex-row justify-between items-center mb-4">

          <Text className="text-white text-2xl font-bold">
            All Diet Plans
          </Text>

          {/* ADD NEW */}

          <TouchableOpacity
            onPress={() => router.push("/diet-plans")}
            className="bg-orange-500 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white ml-1 font-semibold">
              Add New
            </Text>
          </TouchableOpacity>

        </View>

        {/* LIST */}

        <FlatList
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />

      </SafeAreaView>

      {/* ---------------- VIEW MODAL ---------------- */}

      <Modal visible={modalVisible} animationType="slide">

        <SafeAreaView className="flex-1 bg-[#0f0f0f]">

          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-800">

            <Text className="text-white text-xl font-bold">
              Diet Details
            </Text>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text className="text-red-500 text-lg">Close</Text>
            </TouchableOpacity>

          </View>

          <ScrollView className="p-4">

            {selectedPlan && (
              <>
                <Text className="text-white text-2xl font-bold mb-2">
                  {selectedPlan.member_name}
                </Text>

                <Text className="text-gray-300 mb-1">
                  Plan: {selectedPlan.title}
                </Text>

                <Text className="text-gray-300 mb-4">
                  Calories: {selectedPlan.total_calories}
                </Text>

                {Object.entries(selectedPlan.days).map(([day, meals]) => (
                  <View
                    key={day}
                    className="bg-[#1a1a1a] p-4 rounded-xl mb-4"
                  >

                    <Text className="text-red-500 text-lg font-bold mb-3">
                      {day}
                    </Text>

                    {Object.entries(meals).map(([meal, data]) => (
                      <View key={meal} className="mb-2">

                        <Text className="text-white font-semibold">
                          {meal}
                        </Text>

                        <Text className="text-gray-400">
                          Food: {data.food}
                        </Text>

                        <Text className="text-gray-400">
                          Quantity: {data.quantity}
                        </Text>

                        <Text className="text-gray-400">
                          Calories: {data.calories}
                        </Text>

                      </View>
                    ))}

                  </View>
                ))}

              </>
            )}

          </ScrollView>

        </SafeAreaView>

      </Modal>

    </View>
  );
}