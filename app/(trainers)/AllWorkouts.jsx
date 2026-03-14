import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

const API_BASE = "https://mygym.qtechx.com/api";

export default function AllWorkouts() {
  const { user } = useAuth();
  const router = useRouter();

  const [workouts, setWorkouts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  /* ---------------- FETCH WORKOUTS ---------------- */

  useEffect(() => {
    if (!user?.id) return;

    const fetchWorkouts = async () => {
      try {
        const res = await fetch(`${API_BASE}/workouts?trainerId=${user.id}`);

        const data = await res.json();

        const normalized = data.map((w) => ({
          id: w.id,
          memberName: w.member_name,
          category: w.category,
          level: w.level,
          goal: w.goal,
          durationWeeks: w.duration_weeks,
          days: w.days,
        }));

        setWorkouts(normalized);
        setFiltered(normalized);
      } catch (err) {
        console.log("Fetch workouts error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  /* ---------------- SEARCH ---------------- */

  useEffect(() => {
    const result = workouts.filter((w) =>
      `${w.memberName} ${w.goal}`.toLowerCase().includes(search.toLowerCase()),
    );

    setFiltered(result);
  }, [search, workouts]);

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/workouts/${id}`, {
        method: "DELETE",
      });

      const updated = workouts.filter((w) => w.id !== id);

      setWorkouts(updated);
      setFiltered(updated);
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="red" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-12">
      {/* HEADER */}

      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">All Workouts</Text>

        <TouchableOpacity
          onPress={() => router.push("/(trainers)/workouts")}
          className="bg-primary px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}

      <TextInput
        placeholder="Search member or goal..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
        className="bg-[#141414] border border-[#262626] text-white px-4 py-3 rounded-xl mb-5"
      />

      {/* LIST */}

      {filtered.length === 0 && (
        <Text className="text-gray-400">No workouts created yet</Text>
      )}

      {filtered.map((w, index) => (
        <View
          key={w.id}
          className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-4"
        >
          <View className="flex-row justify-between">
            <View>
              <Text className="text-white font-bold text-lg">
                {w.memberName}
              </Text>

              <Text className="text-gray-400 text-sm">
                {w.category} • {w.level}
              </Text>

              <Text className="text-gray-400 text-sm mt-1">Goal: {w.goal}</Text>

              <Text className="text-gray-400 text-sm">
                Duration: {w.durationWeeks} weeks
              </Text>
            </View>

            {/* ACTIONS */}

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setSelectedWorkout(w)}
                className="bg-yellow-500 p-2 rounded-full mr-2"
              >
                <Ionicons name="eye" size={16} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(trainers)/workouts",
                    params: { id: w.id },
                  })
                }
                className="bg-green-500 p-2 rounded-full mr-2"
              >
                <Ionicons name="create" size={16} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(w.id)}
                className="bg-red-500 p-2 rounded-full"
              >
                <Ionicons name="trash" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* VIEW MODAL */}

      <Modal visible={!!selectedWorkout} animationType="slide">
        <ScrollView className="flex-1 bg-black p-5 pt-12">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-xl font-bold">
              Workout Details
            </Text>

            <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {selectedWorkout &&
            Object.entries(selectedWorkout.days || {}).map(
              ([day, exercises]) => (
                <View
                  key={day}
                  className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-4"
                >
                  <Text className="text-primary font-bold mb-2">{day}</Text>

                  {exercises.map((ex, i) => (
                    <Text key={i} className="text-gray-300">
                      • {ex.name} ({ex.time})
                    </Text>
                  ))}
                </View>
              ),
            )}
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}
