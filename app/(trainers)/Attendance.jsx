import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getTrainerDashboard } from "../../services/api";

export default function Attendance() {
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadMembers = async () => {
      try {
        const data = await getTrainerDashboard(user.id, user);

        const memberList = data.members || [];

        setMembers(memberList);

        const defaultAttendance = {};
        memberList.forEach((m) => {
          const id = m.userId || m.user_id;
          defaultAttendance[id] = true;
        });

        setAttendance(defaultAttendance);
      } catch (err) {
        console.log("Attendance error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [user]);

  /* ---------------- TOGGLE CHECKBOX ---------------- */

  const toggleAttendance = (id) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ---------------- SUBMIT ATTENDANCE ---------------- */

  const handleSubmit = () => {
    const result = members.map((m) => ({
      memberId: m.userId || m.user_id,
      present: attendance[m.userId || m.user_id] || false,
    }));

    console.log("Attendance Data:", result);

    Alert.alert("Success", "Attendance submitted successfully");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#ff3c00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-5 pt-12">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}

        <Text className="text-white text-3xl font-bold mb-6">Attendance</Text>

        {/* MEMBERS LIST */}

        {members.length === 0 ? (
          <Text className="text-gray-400">No members assigned</Text>
        ) : (
          members.map((m, i) => {
            const id = m.userId || m.user_id;

            return (
              <View
                key={i}
                className="bg-[#141414] rounded-2xl p-4 mb-4 border border-[#262626]"
                style={{
                  shadowColor: "#ff3c00",
                  shadowOpacity: 0.25,
                  shadowRadius: 15,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center">
                  {/* Avatar */}

                  <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
                    <Ionicons name="person" size={22} color="white" />
                  </View>

                  {/* Member Info */}

                  <View className="flex-1">
                    <Text className="text-white font-bold text-base">
                      {m.username || m.user_name || "No Name"}
                    </Text>

                    <Text className="text-gray-400 text-xs mt-1">
                      {m.userEmail || m.user_email || "-"}
                    </Text>

                    <Text className="text-gray-500 text-xs">
                      {m.userMobile || m.user_mobile || "-"}
                    </Text>
                  </View>

                  {/* CHECKBOX */}

                  <TouchableOpacity
                    onPress={() => toggleAttendance(id)}
                    className={`w-7 h-7 rounded-md items-center justify-center border ${
                      attendance[id]
                        ? "bg-primary border-primary"
                        : "border-gray-500"
                    }`}
                  >
                    {attendance[id] && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Divider */}

                <View className="h-[1px] bg-[#262626] my-3" />

                {/* Plan */}

                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400 text-md">Membership Plan</Text>

                  <View className="bg-primary/20 px-3 py-1 rounded-2xl">
                    <Text className="text-primary text-sm font-semibold">
                      {m.planName || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* SUBMIT BUTTON */}

        {members.length > 0 && (
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-primary rounded-2xl p-4 mt-4 mb-8 items-center"
            style={{
              shadowColor: "#ff3c00",
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Text className="text-white text-lg font-bold">
              Submit Attendance
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
