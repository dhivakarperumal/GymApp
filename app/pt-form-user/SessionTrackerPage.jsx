import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";

const SessionTrackerPage = ({ formData = {}, onPrevious, onSaved }) => {
  const { user } = useAuth();
  const userName = user?.username || user?.name || "";
  const trainerName = formData.trainer_name_assigned || formData.trainer_sign || "";

  const parseDate = (d) => {
    if (!d) return null;
    const str = String(d);
    if (str.includes("-") && str.split("-")[0].length === 2) {
      const parts = str.split("-");
      if (parts.length === 3) {
        return dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    if (str.includes("/") && str.split("/")[0].length === 2) {
      const parts = str.split("/");
      if (parts.length === 3) {
        return dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    return dayjs(d);
  };

  let numRows = 25;
  if (formData?.pt_join_date && formData?.pt_expiry_date) {
    const diff = parseDate(formData.pt_expiry_date).startOf('day').diff(parseDate(formData.pt_join_date).startOf('day'), 'day');
    if (diff > 0) numRows = diff;
  } else if (formData?.join_date && formData?.expiry_date) {
    const diff = parseDate(formData.expiry_date).startOf('day').diff(parseDate(formData.join_date).startOf('day'), 'day');
    if (diff > 0) numRows = diff;
  }

  const [sessions, setSessions] = useState(() => {
    const initialSessions = formData.sessions?.length > 0 ? formData.sessions : [];
    return Array(numRows).fill(null).map((_, index) => {
      if (index < initialSessions.length) {
        return {
          session_no: initialSessions[index].session_no || 0,
          date: initialSessions[index].date || "",
          workout: initialSessions[index].workout || "",
          status: initialSessions[index].status || "Pending",
          client_sign: initialSessions[index].client_sign || "",
          trainer_sign: initialSessions[index].trainer_sign || trainerName,
        };
      }
      return {
        session_no: index + 1,
        date: "",
        workout: "",
        status: "Pending",
        client_sign: "",
        trainer_sign: trainerName,
      };
    });
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (formData.sessions?.length > 0) {
      setSessions(() => {
        const initialSessions = formData.sessions;
        return Array(numRows).fill(null).map((_, index) => {
          if (index < initialSessions.length) {
            return {
              session_no: initialSessions[index].session_no || 0,
              date: initialSessions[index].date || "",
              workout: initialSessions[index].workout || "",
              status: initialSessions[index].status || "Pending",
              client_sign: initialSessions[index].client_sign || "",
              trainer_sign: initialSessions[index].trainer_sign || trainerName,
            };
          }
          return {
            session_no: index + 1,
            date: "",
            workout: "",
            status: "Pending",
            client_sign: "",
            trainer_sign: trainerName,
          };
        });
      });
    }
  }, [formData.sessions, trainerName, numRows]);

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
          
          {sessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((session, pageIndex) => {
            const index = (currentPage - 1) * itemsPerPage + pageIndex;
            return (
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
            );
          })}

          {/* PAGINATION */}
          <View className="flex-row justify-between items-center mt-6">
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`p-3 rounded-lg ${currentPage === 1 ? 'bg-[#0d0d0d]' : 'bg-[#1a1a1a]'}`}
            >
              <Text className="text-white text-xs font-bold">Previous Page</Text>
            </TouchableOpacity>
            <Text className="text-white text-xs font-bold">
              Page {currentPage} of {Math.ceil(sessions.length / itemsPerPage)}
            </Text>
            <TouchableOpacity
              disabled={currentPage === Math.ceil(sessions.length / itemsPerPage)}
              onPress={() => setCurrentPage(prev => Math.min(Math.ceil(sessions.length / itemsPerPage), prev + 1))}
              className={`p-3 rounded-lg ${currentPage === Math.ceil(sessions.length / itemsPerPage) ? 'bg-[#0d0d0d]' : 'bg-[#1a1a1a]'}`}
            >
              <Text className="text-white text-xs font-bold">Next Page</Text>
            </TouchableOpacity>
          </View>
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
