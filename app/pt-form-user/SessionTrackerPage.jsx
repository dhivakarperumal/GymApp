import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Session Tracker</Text>

        <View className="bg-[#111] rounded-3xl p-5 space-y-4">
          <View className="space-y-2">
            <Text className="text-white/80">Complete each session and mark it as completed to record the final client sign.</Text>
            <Text className="text-white/80">Pending sessions keep the client signature blank until completion.</Text>
          </View>

          {sessions.map((session, index) => (
            <View key={session.session_no || index} className="bg-[#1a1a1a] rounded-3xl p-4 space-y-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-semibold">Session {session.session_no}</Text>
                <TouchableOpacity
                  onPress={() => handleMarkCompleted(index)}
                  className={`px-4 py-2 rounded-full ${session.status === "Completed" ? "bg-green-600" : "bg-orange-600"}`}>
                  <Text className="text-white text-xs uppercase tracking-wider">
                    {session.status === "Completed" ? "Completed" : "Mark Completed"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text className="text-white/80 mb-2">Date</Text>
                <Text className="bg-[#000] text-white rounded-2xl p-4">{session.date || "-"}</Text>
              </View>

              <View>
                <Text className="text-white/80 mb-2">Workout</Text>
                <Text className="bg-[#000] text-white rounded-2xl p-4">{session.workout || "-"}</Text>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-white/80 mb-2">Client Sign</Text>
                  <Text className="bg-[#000] text-white rounded-2xl p-4">{session.client_sign || "-"}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white/80 mb-2">Trainer Sign</Text>
                  <Text className="bg-[#000] text-white rounded-2xl p-4">{session.trainer_sign || trainerName || "-"}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity onPress={onPrevious} className="flex-1 bg-gray-700 rounded-2xl p-4">
            <Text className="text-white text-center">Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} className="flex-1 bg-orange-600 rounded-2xl p-4">
            <Text className="text-white text-center">Save Sessions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SessionTrackerPage;
