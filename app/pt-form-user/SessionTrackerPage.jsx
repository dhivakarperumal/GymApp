import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const SessionTrackerPage = ({ formData = {}, onPrevious, onSaved }) => {
  const { user } = useAuth();
  const userName = user?.username || user?.name || "";
  const trainerName = formData.trainer_name_assigned || formData.trainer_sign || "";

  const [sessions, setSessions] = useState(
    formData.sessions?.length > 0
      ? formData.sessions.map((session) => ({
          session_no: session.session_no || 0,
          date: session.date || "",
          workout: session.workout || "",
          status: session.status || "Pending",
          client_sign: session.client_sign || "",
          trainer_sign: session.trainer_sign || trainerName,
        }))
      : Array(25)
          .fill(null)
          .map((_, index) => ({
            session_no: index + 1,
            date: "",
            workout: "",
            status: "Pending",
            client_sign: "",
            trainer_sign: trainerName,
          }))
  );

  useEffect(() => {
    if (formData.sessions?.length > 0) {
      setSessions(
        formData.sessions.map((session) => ({
          session_no: session.session_no || 0,
          date: session.date || "",
          workout: session.workout || "",
          status: session.status || "Pending",
          client_sign: session.client_sign || "",
          trainer_sign: session.trainer_sign || trainerName,
        }))
      );
    }
  }, [formData.sessions, trainerName]);

  const hasRequiredSessionFields = (session) => {
    return String(session.date || "").trim() !== "" && String(session.workout || "").trim() !== "";
  };

  const canCompleteSession = (session) => {
    return session.status !== "Completed" && hasRequiredSessionFields(session);
  };

  const handleSessionChange = (index, field, value) => {
    const nextSessions = [...sessions];
    const updatedSession = {
      ...nextSessions[index],
      [field]: value,
    };

    if (field === "status" && value === "Completed") {
      updatedSession.client_sign = userName || formData.name || "";
      updatedSession.trainer_sign = updatedSession.trainer_sign || trainerName;
    }

    if (field === "status" && value !== "Completed") {
      updatedSession.client_sign = "";
    }

    nextSessions[index] = updatedSession;
    setSessions(nextSessions);
  };

  const handleMarkCompleted = (index) => {
    if (!canCompleteSession(sessions[index])) {
      return;
    }

    handleSessionChange(index, "status", "Completed");
  };

  const handleSave = () => {
    const updated = { ...formData, sessions };
    onSaved(updated);
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-4 pb-6" style={{ marginTop: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginRight: 12, borderWidth: 1, borderColor: "#222" }}>
            <Ionicons name="calendar-outline" size={20} color="#e11d1d" />
          </View>
          <Text className="text-white text-2xl font-bold">Session Tracker</Text>
        </View>

        <View className="bg-[#111] rounded-3xl p-5 border border-[#1a1a1a]" style={{ marginBottom: 20 }}>
          <View className="space-y-2 mb-6">
            <Text className="text-white/80 text-sm">Complete each session and mark it as completed to record the final client sign.</Text>
            <Text className="text-white/80 text-sm">Pending sessions keep the client signature blank until completion.</Text>
          </View>
          {sessions.map((session, index) => (
            <View key={session.session_no || index} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-4 mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[#e11d1d] font-bold">SESSION {session.session_no}</Text>
                <TouchableOpacity
                  onPress={() => handleMarkCompleted(index)}
                  className={`px-4 py-2 rounded-full ${session.status === "Completed" ? "bg-green-600" : "bg-[#e11d1d]"}`}>
                  <Text className="text-white text-xs uppercase tracking-wider font-bold">
                    {session.status === "Completed" ? "Completed" : "Mark Completed"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-white/60 text-xs mb-2">Date</Text>
                <Text className="bg-[#111] border border-[#222] text-white rounded-2xl p-4">{session.date || "-"}</Text>
              </View>

              <View className="mb-4">
                <Text className="text-white/60 text-xs mb-2">Workout</Text>
                <Text className="bg-[#111] border border-[#222] text-white rounded-2xl p-4">{session.workout || "-"}</Text>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-white/60 text-xs mb-2">Client Sign</Text>
                  <Text className="bg-[#111] border border-[#222] text-white rounded-2xl p-4">{session.client_sign || "-"}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white/60 text-xs mb-2">Trainer Sign</Text>
                  <Text className="bg-[#111] border border-[#222] text-white rounded-2xl p-4">{session.trainer_sign || trainerName || "-"}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="flex-row gap-4 mt-2">
          <TouchableOpacity 
            onPress={onPrevious} 
            className="flex-1 bg-[#111] rounded-2xl p-4 border border-[#222] flex-row justify-center items-center"
          >
            <Ionicons name="arrow-back" size={16} color="#aaa" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSave} 
            className="flex-1 bg-[#e11d1d] rounded-2xl p-4 shadow-lg flex-row justify-center items-center"
            style={{ shadowColor: "#e11d1d", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
          >
            <Text className="text-white font-bold mr-2">Save Sessions</Text>
            <Ionicons name="save-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SessionTrackerPage;
