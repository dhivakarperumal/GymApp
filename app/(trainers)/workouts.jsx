import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "https://mygym.qtechx.com/api";

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
    if (!user) return;

    const fetchMembers = async () => {
      try {
        const res = await fetch(`${API_BASE}/assignments`);
        const data = await res.json();

        const assignments = Array.isArray(data)
          ? data
          : data.data || data.assignments || [];

        const assignedMembers = [];

        assignments.forEach((a) => {
          let include = false;

          /* match trainer by ID */
          if (user?.id) {
            const assignTrainerId = Number(a.trainerId || a.trainer_id);
            const currentTrainerId = Number(user.id);

            if (
              !isNaN(assignTrainerId) &&
              assignTrainerId === currentTrainerId
            ) {
              include = true;
            }
          }

          /* match trainer by name */
          if (!include && user?.username && (a.trainerName || a.trainer_name)) {
            if (
              (a.trainerName || a.trainer_name).toLowerCase() ===
              user.username.toLowerCase()
            ) {
              include = true;
            }
          }

          /* match trainer by email */
          if (!include && user?.email && (a.trainerEmail || a.trainer_email)) {
            if (
              (a.trainerEmail || a.trainer_email).toLowerCase() ===
              user.email.toLowerCase()
            ) {
              include = true;
            }
          }

          if (!include) return;

          assignedMembers.push({
            id: String(a.userId || a.user_id),
            name: a.username || a.user_name || "Member",
            email: a.userEmail || a.user_email || "",
            mobile: a.userMobile || a.user_mobile || "",
            planName: a.planName || a.plan_name || "",
          });
        });

        console.log("Assigned Members:", assignedMembers);

        setMembers(assignedMembers);
      } catch (err) {
        console.log("Fetch members error:", err);
      }
    };

    fetchMembers();
  }, [user]);

  /* ---------------- ADD DAY ---------------- */

  const addDay = () => {
    const nextDay = `Day${Object.keys(days).length + 1}`;

    setDays({
      ...days,
      [nextDay]: [{ time: "", name: "" }],
    });
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

    setDays({
      ...days,
      [dayKey]: updated,
    });
  };

  /* ---------------- REMOVE EXERCISE ---------------- */

  const removeExercise = (dayKey, index) => {
    const updated = [...days[dayKey]];
    updated.splice(index, 1);

    setDays({
      ...days,
      [dayKey]: updated.length > 0 ? updated : [{ time: "", name: "" }],
    });
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
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

      await fetch(`${API_BASE}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      alert("Workout Created Successfully 💪");
    } catch (err) {
      console.log(err);
      alert("Failed to create workout");
    }
  };

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-12">
      <Text className="text-white text-2xl font-bold mb-6">
        Create Workout Program
      </Text>

      {/* MEMBER SELECT */}

      <View className="bg-[#141414] rounded-xl border border-[#262626] mb-4">
        <Picker
          selectedValue={form.memberId}
          dropdownIconColor="white"
          style={{ color: "white" }}
          onValueChange={(value) => {
            const member = members.find((m) => String(m.id) === String(value));

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
              label={`${m.name} (${m.planName})`}
              value={m.id}
            />
          ))}
        </Picker>
      </View>

      {/* BASIC DETAILS */}

      <View className="bg-[#141414] rounded-xl border border-[#262626] p-4 mb-4">
        <TextInput
          placeholder="Goal"
          placeholderTextColor="#aaa"
          value={form.goal}
          onChangeText={(text) => setForm({ ...form, goal: text })}
          className="text-white border-b border-[#262626] mb-3 pb-2"
        />

        <TextInput
          placeholder="Duration Weeks"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={form.durationWeeks}
          onChangeText={(text) => setForm({ ...form, durationWeeks: text })}
          className="text-white border-b border-[#262626] pb-2"
        />
      </View>

      {/* DAYS */}

      {Object.keys(days).map((dayKey) => (
        <View
          key={dayKey}
          className="bg-[#141414] rounded-xl border border-[#262626] p-4 mb-4"
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
                <Text className="text-red-400 bg-white p-2 rounded-full text-center">
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => addExercise(dayKey)}
            className="bg-primary/20 rounded-full p-2 mt-2"
          >
            <Text className="text-primary bg-white p-2 rounded-full text-center">
              + Add Exercise
            </Text>
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
