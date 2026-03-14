import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { getTrainerDietPlans } from "../../services/api";
import TrainerHeader from "./TrainerHeader";

export default function DietPlan() {
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const openPlan = (plan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-[#0f0f0f]">
      <TrainerHeader />

      <View className="flex-1 p-4">
        {/* HEADER */}
        <View className="px-4 py-3 border-b border-gray-800">
          <Text className="text-white text-xl font-bold">Diet Plans</Text>
        </View>

        <View className="flex-1 p-4">
          <FlatList
            data={plans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => openPlan(item)}
                className="bg-[#1a1a1a] p-4 rounded-xl mb-3"
              >
                <Text className="text-white text-lg font-semibold">
                  {item.member_name}
                </Text>

                <Text className="text-gray-400">{item.title}</Text>

                <Text className="text-gray-400">
                  {item.total_calories} Calories
                </Text>

                <Text className="text-red-500 mt-2">View Details</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* MODAL */}

        <Modal visible={modalVisible} animationType="slide">
          <SafeAreaView className="flex-1 bg-[#0f0f0f]">
            {/* MODAL HEADER */}

            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-800">
              <Text className="text-white text-xl font-bold">Diet Details</Text>

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
    </View>
  );
}
