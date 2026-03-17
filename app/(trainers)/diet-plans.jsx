import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { getTrainerMembers, getTrainerDietPlans } from "../../services/api";

const meals = ["Morning", "Breakfast", "Lunch", "Evening", "Dinner"];

const generateSingleDay = () => {
  const day = {};
  meals.forEach((meal) => {
    day[meal] = {
      food: "",
      quantity: "",
      calories: "",
    };
  });
  return day;
};

export default function AddDietPlan() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [members, setMembers] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);
  const [memberPlans, setMemberPlans] = useState([]);

  const [existingPlanId, setExistingPlanId] = useState(null);

  const getDefaultForm = () => ({
    memberId: "",
    memberName: "",
    memberEmail: "",
    memberMobile: "",
    title: "",
    totalCalories: "",
    duration: 7,
    days: {
      Day1: generateSingleDay(),
      Day2: generateSingleDay(),
      Day3: generateSingleDay(),
      Day4: generateSingleDay(),
      Day5: generateSingleDay(),
      Day6: generateSingleDay(),
      Day7: generateSingleDay(),
    },
  });

  const [form, setForm] = useState(getDefaultForm());

  /* ---------------- FETCH MEMBERS ---------------- */

  useEffect(() => {
    if (!user) return;

    const loadMembers = async () => {
      try {
        const data = await getTrainerMembers(user.id, user);
        setMembers(data);
      } catch (err) {
        console.log("Fetch members error:", err);
      }
    };

    loadMembers();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const loadPlans = async () => {
      try {
        const data = await getTrainerDietPlans(user.id);
        setMemberPlans(data);
      } catch (err) {
        console.log("Fetch diet plans error:", err);
      }
    };

    loadPlans();
  }, [user]);

  /* ---------------- AUTO CALCULATE CALORIES ---------------- */

  useEffect(() => {
    let total = 0;

    Object.values(form.days).forEach((day) => {
      Object.values(day).forEach((meal) => {
        total += Number(meal.calories || 0);
      });
    });

    setForm((prev) => ({
      ...prev,
      totalCalories: total,
    }));
  }, [form.days]);

  useEffect(() => {
    if (!id) return;

    const loadDiet = async () => {
      const res = await fetch(`https://mygym.qtechx.com/api/diet-plans/${id}`);

      const data = await res.json();

      setForm({
        memberId: String(data.memberId || data.member_id),
        memberName: data.member_name,
        memberEmail: data.member_email || "",
        memberMobile: data.member_mobile || "",
        title: data.title,
        totalCalories: data.totalCalories || data.total_calories || 0,
        duration: data.duration || 1,
        days: data.days || { Day1: generateSingleDay() },
      });
    };

    loadDiet();
  }, [id]);

  const handleSaveDiet = async () => {
    try {
      console.log("===== SAVE DIET START =====");

      if (!form.memberId) {
        alert("Please select member");
        return;
      }

      if (!form.title) {
        alert("Please enter diet title");
        return;
      }

      const payload = {
        trainerId: user?.id,
        trainerName: user?.name || user?.username || "trainer",
        trainerSource: "trainer",

        memberId: Number(form.memberId),
        memberName: form.memberName,
        memberEmail: form.memberEmail,
        memberMobile: form.memberMobile,

        title: form.title,
        totalCalories: Number(form.totalCalories) || 0,

        duration: Object.keys(form.days).length,

        days: form.days,

        status: "active",
      };

      console.log("Payload:", JSON.stringify(payload, null, 2));

      const planIdToUpdate = id || existingPlanId;

      const url = planIdToUpdate
        ? `https://mygym.qtechx.com/api/diet-plans/${planIdToUpdate}`
        : `https://mygym.qtechx.com/api/diet-plans`;

      const method = planIdToUpdate ? "PUT" : "POST";

      console.log("API URL:", url);
      console.log("METHOD:", method);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response Status:", res.status);

      const data = await res.json();

      console.log("Response Data:", data);

      if (res.ok) {
        alert(id ? "Diet plan updated" : "Diet plan created");

        setForm(getDefaultForm());
        setExpandedDay(null);
        setExistingPlanId(null);

        router.replace("/trainerdiet/dietplan");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.log("===== SAVE DIET ERROR =====");
      console.log(err);
      alert("Error saving diet plan");
    }
  };

  /* ---------------- HANDLE MEAL CHANGE ---------------- */

  const handleMealChange = (day, meal, field, value) => {
    setForm((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [meal]: {
            ...prev.days[day][meal],
            [field]: value,
          },
        },
      },
    }));
  };

  /* ---------------- ADD DAY ---------------- */

  const handleAddDay = () => {
    const count = Object.keys(form.days).length;

    if (count >= 60) {
      alert("Maximum 60 days allowed");
      return;
    }

    const newKey = `Day${count + 1}`;

    setForm((prev) => ({
      ...prev,
      duration: count + 1,
      days: {
        ...prev.days,
        [newKey]: generateSingleDay(),
      },
    }));
  };

  /* ---------------- REMOVE DAY ---------------- */

  const handleRemoveDay = () => {
    const count = Object.keys(form.days).length;

    if (count <= 1) {
      alert("Minimum 1 day required");
      return;
    }

    const lastKey = `Day${count}`;

    const updated = { ...form.days };
    delete updated[lastKey];

    setForm((prev) => ({
      ...prev,
      duration: count - 1,
      days: updated,
    }));
  };
  useFocusEffect(
    useCallback(() => {
      if (!id) {
        setForm(getDefaultForm());
        setExpandedDay(null);
      }
    }, [id]),
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        className="flex-1 bg-black p-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}

        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-2xl font-bold">
            {id ? "Edit Diet Plan" : "Create Diet Plan"}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/trainerdiet/dietplan")}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">All Diet Plans</Text>
          </TouchableOpacity>
        </View>

        {/* MEMBER SELECT */}

        <Text className="text-gray-400 text-xs mb-1">Select Member</Text>
        <View className="bg-[#141414] rounded-xl mb-4">
          <Picker
            selectedValue={form.memberId}
            dropdownIconColor="white"
            style={{ color: "white" }}
            onValueChange={(value) => {
              const m = members.find((x) => String(x.id) === String(value));

              const existingPlan = memberPlans.find(
                (p) => String(p.member_id) === String(value),
              );

              if (existingPlan) {
                setExistingPlanId(existingPlan.id);

                setForm({
                  memberId: String(existingPlan.member_id),
                  memberName: existingPlan.member_name,
                  memberEmail: existingPlan.member_email || "",
                  memberMobile: existingPlan.member_mobile || "",
                  title: existingPlan.title,
                  totalCalories: existingPlan.total_calories || 0,
                  duration: existingPlan.duration,
                  days: existingPlan.days || { Day1: generateSingleDay() },
                });
              } else {
                setForm((p) => ({
                  ...p,
                  memberId: value,
                  memberName: m?.name || "",
                  memberEmail: m?.email || "",
                  memberMobile: m?.mobile || "",
                }));
              }
            }}
          >
            <Picker.Item label="Select Member" value="" />

            {members.map((m) => (
              <Picker.Item
                key={m.id}
                label={`${m.name} (${m.planName})`}
                value={m.id}
              />
            ))}
          </Picker>
        </View>

        {/* TITLE */}

        <Text className="text-gray-400 text-xs mb-1">Diet Title</Text>
        <TextInput
          placeholder="Diet Title"
          placeholderTextColor="#aaa"
          value={form.title}
          onChangeText={(text) => setForm((prev) => ({ ...prev, title: text }))}
          className="bg-[#141414] text-white rounded-xl px-4 py-3 mb-4"
        />

        {/* TOTAL CALORIES */}

        <Text className="text-gray-400 text-xs mb-1">Total Calories</Text>
        <TextInput
          placeholder="Total Calories"
          value={String(form.totalCalories)}
          editable={false}
          className="bg-[#141414] text-white rounded-xl px-4 py-3 mb-4"
        />

        {/* DAY CONTROLS */}

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-semibold">
            Total Days: {Object.keys(form.days).length}
          </Text>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleAddDay}
              className="bg-green-600 px-4 py-2 mr-2 rounded-lg"
            >
              <Text className="text-white font-semibold">+ Add Day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRemoveDay}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Remove Day</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DAYS */}

        {Object.keys(form.days)
          .sort((a, b) => parseInt(a.slice(3)) - parseInt(b.slice(3)))
          .map((day) => (
            <View
              key={day}
              className="bg-[#141414] border border-[#262626] rounded-xl mb-4"
            >
              {/* DAY HEADER */}

              <TouchableOpacity
                onPress={() => setExpandedDay(expandedDay === day ? null : day)}
                className="flex-row justify-between items-center p-4"
              >
                <Text className="text-white font-bold text-lg">
                  {day.replace("Day", "Day ")}
                </Text>

                <Ionicons
                  name={
                    expandedDay === day
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={22}
                  color="white"
                />
              </TouchableOpacity>

              {/* DAY CONTENT */}

              {expandedDay === day && (
                <View className="px-4 pb-4">
                  {meals.map((meal) => (
                    <View
                      key={meal}
                      className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-3 mb-4"
                    >
                      {/* MEAL TITLE */}
                      <Text className="text-red-700 font-semibold mb-2">
                        {meal}
                      </Text>

                      <Text className="text-gray-400 text-xs mb-2">Food</Text>
                      <TextInput
                        placeholder="Enter food name"
                        placeholderTextColor="#aaa"
                        value={form.days[day][meal].food}
                        onChangeText={(text) =>
                          handleMealChange(day, meal, "food", text)
                        }
                        className="bg-black text-white px-3 py-2 rounded-lg mb-2"
                      />

                      <Text className="text-gray-400 text-xs mb-2">
                        Quantity
                      </Text>
                      <TextInput
                        placeholder="Enter quantity"
                        placeholderTextColor="#aaa"
                        value={form.days[day][meal].quantity}
                        onChangeText={(text) =>
                          handleMealChange(day, meal, "quantity", text.trim())
                        }
                        className="bg-black text-white px-3 py-2 rounded-lg mb-2"
                      />

                      <Text className="text-gray-400 text-xs mb-2">
                        Calories
                      </Text>
                      <TextInput
                        placeholder="Enter calories"
                        placeholderTextColor="#aaa"
                        keyboardType="numeric"
                        value={form.days[day][meal].calories}
                        onChangeText={(text) =>
                          handleMealChange(
                            day,
                            meal,
                            "calories",
                            text.replace(/[^0-9]/g, ""),
                          )
                        }
                        className="bg-black text-white px-3 py-2 rounded-lg"
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

        {/* SAVE BUTTON */}

        <TouchableOpacity
          onPress={handleSaveDiet}
          className="bg-red-600 p-4 rounded-xl mb-10"
        >
          <Text className="text-white text-center font-bold">
            Save Diet Plan
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
