import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getTrainerMembers } from "../../services/api";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";

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
  const [expandedDay, setExpandedDay] = useState("Day1");

  const [form, setForm] = useState({
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
    const res = await fetch(
      `https://mygym.qtechx.com/api/diet-plans/${id}`
    );

    const data = await res.json();

    setForm({
      memberId: String(data.member_id),
      memberName: data.member_name,
      memberEmail: data.member_email || "",
      memberMobile: data.member_mobile || "",
      title: data.title,
      totalCalories: data.total_calories,
      duration: data.duration,
      days: data.days,
    });
  };

  loadDiet();
}, [id]);

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

  return (
    <ScrollView className="flex-1 bg-black p-4">

      {/* HEADER */}

      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">
          Create Diet Plan
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/trainerdiet/dietplan")}
          className="bg-red-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">
            All Diet Plans
          </Text>
        </TouchableOpacity>
      </View>

      {/* MEMBER SELECT */}

      <View className="bg-[#141414] rounded-xl mb-4">
        <Picker
          selectedValue={form.memberId}
          dropdownIconColor="white"
          style={{ color: "white" }}
          onValueChange={(value) => {
            const m = members.find((x) => x.id === value);

            setForm((p) => ({
              ...p,
              memberId: value,
              memberName: m?.name || "",
              memberEmail: m?.email || "",
              memberMobile: m?.mobile || "",
            }));
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

      <TextInput
        placeholder="Diet Title"
        placeholderTextColor="#aaa"
        value={form.title}
        onChangeText={(text) => setForm({ ...form, title: text })}
        className="bg-[#141414] text-white rounded-xl px-4 py-3 mb-4"
      />

      {/* TOTAL CALORIES */}

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
            className="bg-green-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">
              + Add Day
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRemoveDay}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">
              Remove Day
            </Text>
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
              onPress={() =>
                setExpandedDay(expandedDay === day ? null : day)
              }
              className="flex-row justify-between items-center p-4"
            >
              <Text className="text-green-400 font-bold text-lg">
                {day}
              </Text>

              <Ionicons
                name={
                  expandedDay === day
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={22}
                color="#22c55e"
              />
            </TouchableOpacity>

            {/* DAY CONTENT */}

            {expandedDay === day && (
              <View className="px-4 pb-4">

                {meals.map((meal) => (
                  <View key={meal} className="mb-3">

                    <TextInput
                      placeholder={`${meal} Food`}
                      placeholderTextColor="#aaa"
                      value={form.days[day][meal].food}
                      onChangeText={(text) =>
                        handleMealChange(day, meal, "food", text)
                      }
                      className="bg-black text-white px-3 py-2 rounded-lg mb-2"
                    />

                    <TextInput
                      placeholder="Quantity"
                      placeholderTextColor="#aaa"
                      value={form.days[day][meal].quantity}
                      onChangeText={(text) =>
                        handleMealChange(day, meal, "quantity", text)
                      }
                      className="bg-black text-white px-3 py-2 rounded-lg mb-2"
                    />

                    <TextInput
                      placeholder="Calories"
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                      value={form.days[day][meal].calories}
                      onChangeText={(text) =>
                        handleMealChange(day, meal, "calories", text)
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

      <TouchableOpacity className="bg-red-600 p-4 rounded-xl mb-10">
        <Text className="text-white text-center font-bold">
          Save Diet Plan
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}