import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import {
  deleteDietPlanApi,
  getTrainerDietPlans
} from "../../services/api";
import TrainerHeader from "./TrainerHeader";
import BackButton from "../BackButton";


export default function DietPlan() {
  const { user } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
const [planToDelete, setPlanToDelete] = useState(null);

  const mealTimes = {
    Morning: "5:00 - 6:00 AM",
    Breakfast: "8:00 - 9:00 AM",
    Lunch: "1:00 - 2:00 PM",
    Evening: "4:00 - 4:30 PM",
    Dinner: "7:00 - 8:00 PM",
  };

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
  setPlanToDelete(id);
  setDeleteModalVisible(true);
};

const confirmDelete = async () => {
  try {
    await deleteDietPlanApi(planToDelete);

    setPlans((prev) => prev.filter((p) => p.id !== planToDelete));

    setDeleteModalVisible(false);
    setPlanToDelete(null);
  } catch (err) {
    console.log("Delete error", err);
  }
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      
        <View className="flex-1 bg-black">

          <TrainerHeader />

          <SafeAreaView className="flex-1 p-4 -mt-5">

            <BackButton />

            {/* HEADER */}
            <View className="flex-row justify-between items-center mt-5 mb-4">

              <Text className="text-white text-2xl font-bold">
                All Diet Plans
              </Text>

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
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />

          </SafeAreaView>

          {/* ---------------- VIEW MODAL ---------------- */}

          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
            statusBarTranslucent
          >

            <KeyboardAvoidingView
              style={{ flex: 1, justifyContent: "flex-end" }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >

              <View className="flex-1 justify-end bg-black/50">

                <View className="flex-1 bg-[#0f0f0f] rounded-t-3xl">

                  {/* MODAL HEADER */}
                  <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-800">

                    <Text className="text-white text-xl font-bold">
                      Diet Details
                    </Text>

                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={26} color="#ef4444" />
                    </TouchableOpacity>

                  </View>

                  <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={150}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
                  >

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

                                <View className="flex-row items-center">
                                  <Text className="text-white font-semibold">
                                    {meal}
                                  </Text>

                                  <Text className="text-red-500 ml-2">
                                    ({mealTimes[meal]})
                                  </Text>
                                </View>

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

                  </KeyboardAwareScrollView>

                </View>

              </View>

            </KeyboardAvoidingView>

          </Modal>

          {/* ---------------- DELETE CONFIRM MODAL ---------------- */}

<Modal
  visible={deleteModalVisible}
  transparent
  animationType="fade"
  statusBarTranslucent
>
  <View className="flex-1 justify-center items-center bg-black/60">

    <View className="bg-[#0f0f0f] w-[85%] p-6 rounded-2xl border border-gray-800">

      <View className="items-center mb-4">
        <Ionicons name="trash" size={40} color="#ef4444" />
      </View>

      <Text className="text-white text-lg font-bold text-center mb-2">
        Delete Diet Plan
      </Text>

      <Text className="text-gray-400 text-center mb-6">
        Are you sure you want to delete this diet plan? This action cannot be undone.
      </Text>

      <View className="flex-row justify-between">

        {/* Cancel */}
        <TouchableOpacity
          onPress={() => setDeleteModalVisible(false)}
          className="bg-gray-700 px-5 py-3 rounded-lg flex-1 mr-2"
        >
          <Text className="text-white text-center font-semibold">
            Cancel
          </Text>
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          onPress={confirmDelete}
          className="bg-red-500 px-5 py-3 rounded-lg flex-1 ml-2"
        >
          <Text className="text-white text-center font-semibold">
            Delete
          </Text>
        </TouchableOpacity>

      </View>

    </View>

  </View>
</Modal>

        </View>

      
    </KeyboardAvoidingView>
  );
}