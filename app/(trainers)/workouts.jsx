import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import {
  getAssignments,
  getWorkout,
  createWorkout,
  updateWorkout,
} from "../../services/api";


const timeOptions = [
  "06:00-08:00",
  "08:00-10:00",
  "12:00-14:00",
  "16:00-18:00",
  "20:00-22:00",
];

const categories = [
  "Strength Training",
  "Fat Loss",
  "Muscle Gain",
  "Cardio",
  "Functional Training",
  "CrossFit",
  "Yoga",
];

export default function Workouts() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [members, setMembers] = useState([]);


  const [form, setForm] = useState({
    memberId: "",
    memberName: "",
    memberEmail: "",
    memberMobile: "",
    category: "",
    level: "Beginner",
    goal: "",
    durationWeeks: "",
  });

  const [days, setDays] = useState({
    Day1: [{ time: "", name: "" }],
  });

  /* ---------------- FETCH MEMBERS ---------------- */

  useEffect(() => {
    if (!user?.id) return;

    const fetchMembers = async () => {
      try {
        const data = await getAssignments();

        const assignments = Array.isArray(data)
          ? data
          : data.data || data.assignments || [];

        const assignedMembers = assignments
          .filter(
            (a) => Number(a.trainerId || a.trainer_id) === Number(user.id),
          )
          .map((a) => ({
            id: String(a.userId || a.user_id),
            name: a.username || a.user_name || "Member",
            email: a.userEmail || a.user_email || "",
            mobile: a.userMobile || a.user_mobile || "",
            planName: a.planName || a.plan_name || "",
          }));

        setMembers(assignedMembers);
      } catch (err) {
        console.log("Fetch members error:", err);
      }
    };

    fetchMembers();
  }, [user]);

  useEffect(() => {
    if (!id) return;

    const fetchWorkout = async () => {
      try {
        const data = await getWorkout(id);

        setForm({
          memberId: String(data.member_id),
          memberName: data.member_name,
          memberEmail: data.member_email,
          memberMobile: data.member_mobile,
          category: data.category,
          level: data.level,
          goal: data.goal,
          durationWeeks: String(data.duration_weeks),
        });

        setDays(data.days || { Day1: [{ time: "", name: "" }] });
      } catch (err) {
        console.log("Fetch workout error:", err);
      }
    };

    fetchWorkout();
  }, [id]);

  /* ---------------- ADD DAY ---------------- */

  const addDay = () => {
    const nextDay = `Day${Object.keys(days).length + 1}`;
    setDays({ ...days, [nextDay]: [{ time: "", name: "" }] });
  };

  /* ---------------- ADD EXERCISE ---------------- */

  const addExercise = (dayKey) => {
    setDays({
      ...days,
      [dayKey]: [...days[dayKey], { time: "", name: "" }],
    });
  };

  /* ---------------- UPDATE EXERCISE ---------------- */

  const updateExercise = (dayKey, index, field, value) => {
    const updated = [...days[dayKey]];
    updated[index][field] = value;

    setDays({ ...days, [dayKey]: updated });
  };

  /* ---------------- REMOVE EXERCISE ---------------- */

  const removeExercise = (dayKey, index) => {
    const updated = [...days[dayKey]];
    updated.splice(index, 1);

    setDays({
      ...days,
      [dayKey]: updated.length ? updated : [{ time: "", name: "" }],
    });
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!form.memberId || !form.category || !form.goal) {
      Alert.alert("Missing Fields", "Please fill required fields");
      return;
    }

    try {
      const payload = {
        trainerId: user.id,
        trainerName: user.username,
        memberId: form.memberId,
        memberName: form.memberName,
        memberEmail: form.memberEmail,
        memberMobile: form.memberMobile,
        category: form.category,
        level: form.level,
        goal: form.goal,
        durationWeeks: Number(form.durationWeeks),
        days,
        status: "active",
      };

      if (id) {
        await updateWorkout(id, payload);
      } else {
        await createWorkout(payload);
      }

      Alert.alert(
        "Success",
        id ? "Workout Updated Successfully" : "Workout Created Successfully",
        [
          {
            text: "OK",
            onPress: () => router.replace("/trainerdiet/AllWorkouts"),
          },
        ],
      );
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save workout");
    }
  };

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-12">
      {/* HEADER */}

      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">
          Create Workout Program
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/trainerdiet/AllWorkouts")}
          className="bg-primary px-4 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">All Workouts</Text>
        </TouchableOpacity>
      </View>

      {/* MEMBER SELECT */}

      <View className="bg-[#141414] border border-[#262626] rounded-xl mb-4">
        <Picker
          selectedValue={form.memberId}
          dropdownIconColor="white"
          style={{ color: "white" }}
          onValueChange={(value) => {
            const member = members.find((m) => m.id === value);

            setForm({
              ...form,
              memberId: value,
              memberName: member?.name || "",
              memberEmail: member?.email || "",
              memberMobile: member?.mobile || "",
            });
          }}
        >
          <Picker.Item label="Select Member" value="" />

          {members.map((m) => (
            <Picker.Item
              key={m.id}
              label={`${m.name}${m.email ? ` • ${m.email}` : ""}${m.mobile ? ` • ${m.mobile}` : ""}${m.planName ? ` (${m.planName})` : ""}`}
              value={m.id}
            />
          ))}
        </Picker>
      </View>

      {/* LEVEL SELECT */}

      <View className="bg-[#141414] border border-[#262626] rounded-xl mb-4">
        <Picker
          selectedValue={form.level}
          dropdownIconColor="white"
          style={{ color: "white" }}
          onValueChange={(value) => setForm({ ...form, level: value })}
        >
          <Picker.Item label="Beginner" value="Beginner" />
          <Picker.Item label="Intermediate" value="Intermediate" />
          <Picker.Item label="Advanced" value="Advanced" />
        </Picker>
      </View>

      {/* CATEGORY */}

      <View className="bg-[#141414] border border-[#262626] rounded-xl mb-4">
        <Picker
          selectedValue={form.category}
          dropdownIconColor="white"
          style={{ color: "white" }}
          onValueChange={(value) => setForm({ ...form, category: value })}
        >
          <Picker.Item label="Select Category" value="" />
          {categories.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
      </View>

      {/* GOAL */}

      <TextInput
        placeholder="Goal"
        placeholderTextColor="#aaa"
        value={form.goal}
        onChangeText={(text) => setForm({ ...form, goal: text })}
        className="bg-[#141414] text-white border border-[#262626] rounded-xl px-4 py-3 mb-4"
      />

      {/* DURATION */}

      <TextInput
        placeholder="Duration Weeks"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={form.durationWeeks}
        onChangeText={(text) => setForm({ ...form, durationWeeks: text })}
        className="bg-[#141414] text-white border border-[#262626] rounded-xl px-4 py-3 mb-4"
      />

      {/* DAYS */}

      {Object.keys(days).map((dayKey) => (
        <View
          key={dayKey}
          className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-4"
        >
          <Text className="text-primary text-lg font-bold mb-3">{dayKey}</Text>

          {days[dayKey].map((item, index) => (
            <View key={index} className="mb-3">
              <TextInput
                placeholder="Exercise Name"
                placeholderTextColor="#aaa"
                value={item.name}
                onChangeText={(text) =>
                  updateExercise(dayKey, index, "name", text)
                }
                className="text-white border-b border-[#262626] pb-2 mb-2"
              />

              <Picker
                selectedValue={item.time}
                dropdownIconColor="white"
                style={{ color: "white" }}
                onValueChange={(value) =>
                  updateExercise(dayKey, index, "time", value)
                }
              >
                <Picker.Item label="Select Time" value="" />
                {timeOptions.map((t) => (
                  <Picker.Item key={t} label={t} value={t} />
                ))}
              </Picker>

              <TouchableOpacity
                onPress={() => removeExercise(dayKey, index)}
                className="bg-red-500/20 rounded-full p-2 mt-2"
              >
                <Text className="text-red-400 text-center">Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => addExercise(dayKey)}
            className="bg-primary/20 rounded-full p-2 mt-2"
          >
            <Text className="text-primary text-center">+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={addDay}
        className="bg-[#141414] border border-[#262626] rounded-xl p-3 mb-4"
      >
        <Text className="text-white text-center">+ Add Day</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-primary rounded-xl p-4 mb-10"
      >
        <Text className="text-white text-center font-bold">Save Program</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
