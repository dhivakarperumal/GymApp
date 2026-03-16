import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import {
  getTrainerMembers,
  getWorkout,
  createWorkout,
  updateWorkout,
} from "../../services/api";
import * as DocumentPicker from "expo-document-picker";

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

const workoutTypes = [
  "Weight Training",
  "Cardio",
  "Yoga / Stretching",
  "HIIT",
  "Bodyweight",
  "Warm Up",
  "Cool Down",
  "Rest Day",
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
    level: "Beginner",
    durationWeeks: "",
  });

  const [days, setDays] = useState({
    Day1: [
      {
        time: "",
        type: "Weight Training",
        name: "",
        sets: "",
        count: "",
        media: "",
        mediaType: "url",
      },
    ],
  });

  /* ---------------- FETCH MEMBERS ---------------- */

  useEffect(() => {
    if (!user?.id) return;

    const fetchMembers = async () => {
      try {
        const membersData = await getTrainerMembers(user.id, user);
        setMembers(membersData);
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
          level: data.level,
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
      [dayKey]: [
        ...days[dayKey],
        {
          time: "",
          type: "Weight Training",
          name: "",
          sets: "",
          count: "",
          media: "",
          mediaType: "url",
        },
      ],
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

  const pickFile = async (dayKey, index) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "video/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];

        updateExercise(dayKey, index, "media", file.uri);
        updateExercise(dayKey, index, "mediaType", file.mimeType || "file");
      }
    } catch (error) {
      console.log("File pick error:", error);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!form.memberId) {
      Alert.alert("Missing Fields", "Please select member");
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
        level: form.level,
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-black px-5 pt-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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
            className="bg-[#111111] border border-[#262626] rounded-2xl p-5 mb-5"
          >
            {/* DAY TITLE */}
            <Text className="text-primary text-xl font-bold mb-4">
              {dayKey}
            </Text>

            {days[dayKey].map((item, index) => (
              <View
                key={index}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4"
              >
                {/* EXERCISE HEADER */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white font-semibold text-sm">
                    Exercise {index + 1}
                  </Text>

                  <TouchableOpacity
                    onPress={() => removeExercise(dayKey, index)}
                    className="bg-red-500/20 px-3 py-1 rounded-full"
                  >
                    <Text className="text-red-400 text-xs font-semibold">
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* EXERCISE NAME */}
                <Text className="text-gray-400 text-xs mb-1">
                  Exercise Name
                </Text>
                <TextInput
                  placeholder="Example: Bench Press"
                  placeholderTextColor="#777"
                  value={item.name}
                  onChangeText={(text) =>
                    updateExercise(dayKey, index, "name", text)
                  }
                  className="bg-[#111111] text-white border border-[#333] rounded-lg px-3 py-3 mb-3"
                />

                {/* TIME */}
                <Text className="text-gray-400 text-xs mb-1">Time Slot</Text>
                <View className="bg-[#111111] border border-[#333] rounded-lg mb-3">
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
                </View>

                {/* WORKOUT TYPE */}
                <Text className="text-gray-400 text-xs mb-1">Workout Type</Text>
                <View className="bg-[#111111] border border-[#333] rounded-lg mb-3">
                  <Picker
                    selectedValue={item.type}
                    dropdownIconColor="white"
                    style={{ color: "white" }}
                    onValueChange={(value) =>
                      updateExercise(dayKey, index, "type", value)
                    }
                  >
                    {workoutTypes.map((t) => (
                      <Picker.Item key={t} label={t} value={t} />
                    ))}
                  </Picker>
                </View>

                {/* SETS */}
                <Text className="text-gray-400 text-xs mb-1">Sets</Text>
                <TextInput
                  placeholder="Example: 4"
                  placeholderTextColor="#777"
                  keyboardType="numeric"
                  value={item.sets}
                  onChangeText={(text) =>
                    updateExercise(dayKey, index, "sets", text)
                  }
                  className="bg-[#111111] text-white border border-[#333] rounded-lg px-3 py-3 mb-3"
                />

                {/* REPS */}
                <Text className="text-gray-400 text-xs mb-1">Reps / Count</Text>
                <TextInput
                  placeholder="Example: 12 reps"
                  placeholderTextColor="#777"
                  value={item.count}
                  onChangeText={(text) =>
                    updateExercise(dayKey, index, "count", text)
                  }
                  className="bg-[#111111] text-white border border-[#333] rounded-lg px-3 py-3 mb-3"
                />

                {/* MEDIA */}
                <Text className="text-gray-400 text-xs mb-1">Media URL</Text>
                {/* MEDIA URL */}
                <TextInput
                  placeholder="Paste image/video URL"
                  placeholderTextColor="#777"
                  value={item.media}
                  onChangeText={(text) =>
                    updateExercise(dayKey, index, "media", text)
                  }
                  className="bg-[#111111] text-white border border-[#333] rounded-lg px-3 py-3 mb-2"
                />

                {/* FILE UPLOAD BUTTON */}
                <TouchableOpacity
                  onPress={() => pickFile(dayKey, index)}
                  className="bg-[#222] border border-[#444] rounded-lg py-3"
                >
                  <Text className="text-center text-white">
                    Upload Image / Video / Document
                  </Text>
                </TouchableOpacity>

                {item.media ? (
                  <View className="mt-2">
                    <Text className="text-green-400 text-xs">
                      File Attached
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {item.media}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}

            {/* ADD EXERCISE BUTTON */}
            <TouchableOpacity
              onPress={() => addExercise(dayKey)}
              className="bg-primary rounded-xl py-3 mt-2"
            >
              <Text className="text-white text-center font-semibold">
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
    </KeyboardAvoidingView>
  );
}
