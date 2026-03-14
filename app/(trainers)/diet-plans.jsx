import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/AuthContext";
import { getTrainerMembers } from "../../services/api";
import { useRouter } from "expo-router";

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

  const [members, setMembers] = useState([]);

  const [form, setForm] = useState({
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

  /* -------- FETCH MEMBERS -------- */

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

  /* -------- AUTO CALCULATE CALORIES -------- */

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

  /* -------- HANDLE MEAL CHANGE -------- */

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

  return (
    <ScrollView className="flex-1 bg-black p-4">



      <View className="flex-1 bg-[#0f0f0f] p-4 pt-12">

        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-6">

          <Text className="text-white text-2xl font-bold">
            Diet Plans
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/trainerdiet/dietplan")}
            className="bg-red-600 px-4 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">
              All Diet Plans
            </Text>
          </TouchableOpacity>

        </View>

        {/* ADD DIET PLAN BUTTON */}

        <TouchableOpacity
          onPress={() => router.push("/trainerdiet/adddiet")}
          className="bg-green-600 p-5 rounded-xl items-center"
        >
          <Text className="text-white text-lg font-bold">
            Create Diet Plan
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

      {/* CALORIES */}

      <TextInput
        placeholder="Total Calories"
        value={String(form.totalCalories)}
        editable={false}
        className="bg-[#141414] text-white rounded-xl px-4 py-3 mb-4"
      />

      {/* DAYS */}

      <View className="flex-row justify-between items-center mb-4">

        <Text className="text-white font-semibold">
          Total Days: {Object.keys(form.days).length}
        </Text>

        <View className="flex-row space-x-3">

          <TouchableOpacity
            onPress={handleAddDay}
            className="bg-green-600 px-4 py-2 rounded-lg"
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

      {Object.keys(form.days).map((day) => (
        <View key={day} className="bg-[#141414] p-4 rounded-xl mb-4">

          <Text className="text-green-400 font-bold mb-3">{day}</Text>

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
      ))}

      <TouchableOpacity className="bg-red-600 p-4 rounded-xl mb-10">
        <Text className="text-white text-center font-bold">
          Save Diet Plan
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}