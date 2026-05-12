import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from '../../../context/AuthContext.js';
import api from "../../../services/api";

const SessionTracker = ({
  onNext,
  onPrevious,
  formData: initialFormData,
  isFirstStep,
  isLastStep,
  readOnly = false,
  userMode = false,
  allowStatusEdit = false,
  onSaved = () => {},
}) => {
  const { user } = useAuth();

  const trainerName = ""; // localStorage not available in RN

  const [localFormData, setLocalFormData] = useState({
    sessions: initialFormData?.sessions || Array(25).fill(null).map((_, i) => ({
      session_no: i + 1,
      date: "",
      workout: "",
      status: "Pending",
      client_sign: "",
      trainer_sign: initialFormData?.trainer_name_assigned || trainerName,
    }))
  });

  const [showPicker, setShowPicker] = useState(false);
  const [currentPickerIndex, setCurrentPickerIndex] = useState(null);

  useEffect(() => {
    if (initialFormData?.sessions) {
      setLocalFormData(prev => ({
        ...prev,
        sessions: initialFormData.sessions
      }));
    }
  }, [initialFormData]);

  const handleSessionChange = (index, field, value) => {
    if (userMode && ['date', 'workout', 'trainer_sign', 'client_sign'].includes(field)) {
      return;
    }

    const newSessions = [...localFormData.sessions];
    const updatedSession = { ...newSessions[index], [field]: value };

    if (field === "status") {
      if (value === "Completed") {
        updatedSession.client_sign = userMode
          ? (user?.username || user?.name || "")
          : (initialFormData?.name || "");
      } else {
        updatedSession.client_sign = "";
      }
    }

    newSessions[index] = updatedSession;
    setLocalFormData(prev => ({ ...prev, sessions: newSessions }));
  };

  const onDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate && currentPickerIndex !== null) {
      handleSessionChange(currentPickerIndex, "date", dayjs(selectedDate).format("YYYY-MM-DD"));
    }
    setCurrentPickerIndex(null);
  };

  const hasRequiredSessionFields = (session) => {
    return String(session.date || "").trim() !== "" &&
           String(session.workout || "").trim() !== "";
  };

  const canApproveSession = (session) => {
    return userMode && session.status === "Pending" && hasRequiredSessionFields(session);
  };

  const handleSubmit = async () => {
    if (userMode) {
      try {
        const payload = {
          member_id: initialFormData.member_id,
          user_id: initialFormData.u_id,
          formData: { ...initialFormData, sessions: localFormData.sessions },
          completed: true
        };

        await api.post(`/pt-forms`, payload);

        // Send notification
        notificationService.sendDirectPTFormNotification(
          initialFormData.name || initialFormData.member_name
        );

        Toast.show({ type: "success", text1: "Sessions approved successfully!" });

        onSaved({ ...initialFormData, sessions: localFormData.sessions });
      } catch (err) {
        Toast.show({ type: "error", text1: "Failed to approve sessions" });
      }
    } else {
      onNext(localFormData);
    }
  };

  return (
    <View className="flex-1">
      <View className="py-4">

        {/* TITLE */}
        <Text className="text-white text-xl font-bold text-center mb-2">
          Session Tracker
        </Text>

        {userMode && (
          <Text className="text-white/60 text-center mb-4">
            Approve your workout sessions
          </Text>
        )}

        {/* SESSION LIST */}
        {localFormData.sessions.map((session, index) => {
          const isCompleted = session.status === "Completed";
          
          return (
            <View 
              key={index} 
              className="bg-[#1a1a1a] p-5 mb-6 border border-white/5"
              style={{ borderRadius: 32 }}
            >
              <View className="flex-row justify-between items-center mb-5">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-orange-500/10 items-center justify-center mr-3 border border-orange-500/20">
                    <Text className="text-orange-500 font-bold text-xs">{session.session_no}</Text>
                  </View>
                  <Text className="text-white font-bold text-lg">
                    Session Record
                  </Text>
                </View>
                {isCompleted && (
                  <View className="bg-green-500/20 px-2 py-1 rounded-lg border border-green-500/30 flex-row items-center">
                    <Ionicons name="checkmark-circle" size={12} color="#4ade80" />
                    <Text className="text-green-400 text-[10px] font-bold ml-1 uppercase">Logged</Text>
                  </View>
                )}
              </View>

              <View className="space-y-4">
                {/* Date Field */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-2 px-1">
                    <Ionicons name="calendar-outline" size={12} color="#f97316" />
                    <Text className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">Training Date</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (!userMode) {
                        setCurrentPickerIndex(index);
                        setShowPicker(true);
                      }
                    }}
                    className="bg-white/5 p-4 border border-white/5 flex-row justify-between items-center"
                    style={{ borderRadius: 16 }}
                  >
                    <Text className={session.date ? "text-white" : "text-white/20 font-medium"}>
                      {session.date || "Pick a date..."}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#f97316" />
                  </TouchableOpacity>
                </View>

                {/* Workout Field */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-2 px-1">
                    <Ionicons name="barbell-outline" size={12} color="#f97316" />
                    <Text className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">Workout / Exercise Details</Text>
                  </View>
                  <TextInput
                    value={session.workout}
                    onChangeText={(t) => handleSessionChange(index, "workout", t)}
                    placeholder="Enter workout summary..."
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    multiline
                    editable={!userMode}
                    className="bg-white/5 p-4 text-white border border-white/5 text-sm"
                    style={{ textAlignVertical: 'top', borderRadius: 16, minHeight: 60 }}
                  />
                </View>

                {/* Status Toggle */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-2 px-1">
                    <Ionicons name="stats-chart-outline" size={12} color="#f97316" />
                    <Text className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">Session Status</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (canApproveSession(session)) {
                        handleSessionChange(index, "status", "Completed");
                      }
                    }}
                    disabled={!canApproveSession(session)}
                    className={`p-4 flex-row items-center justify-center border ${
                      isCompleted
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-orange-500/10 border-orange-500/30"
                    }`}
                    style={{ borderRadius: 16 }}
                  >
                    <Ionicons 
                      name={isCompleted ? "checkmark-circle" : "time-outline"} 
                      size={18} 
                      color={isCompleted ? "#4ade80" : "#f97316"} 
                    />
                    <Text className={`font-bold ml-2 ${isCompleted ? "text-green-400" : "text-orange-400"}`}>
                      {session.status}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-4">
                  {/* Client Sign */}
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2 px-1">
                      <Ionicons name="person-outline" size={12} color="#f97316" />
                      <Text className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">Member Sign</Text>
                    </View>
                    <TextInput
                      value={session.client_sign}
                      placeholder="Waiting..."
                      placeholderTextColor="rgba(255,255,255,0.1)"
                      editable={false}
                      className="bg-white/5 p-4 text-white/60 border border-white/5 text-xs font-medium"
                      style={{ borderRadius: 16 }}
                    />
                  </View>

                  {/* Trainer Sign */}
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2 px-1">
                      <Ionicons name="pencil-outline" size={12} color="#f97316" />
                      <Text className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">Trainer Sign</Text>
                    </View>
                    <TextInput
                      value={session.trainer_sign}
                      onChangeText={(t) => handleSessionChange(index, "trainer_sign", t)}
                      editable={!userMode}
                      placeholder="Sign here..."
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      className="bg-white/5 p-4 text-white border border-white/5 text-xs font-medium"
                      style={{ borderRadius: 16 }}
                    />
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* BUTTONS */}
        <View className="flex-row gap-3 mt-6">

          {!userMode && (
            <TouchableOpacity
              onPress={onPrevious}
              className="flex-1 bg-gray-700 p-3 rounded-lg"
            >
              <Text className="text-white text-center">Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            className="flex-1 bg-orange-600 p-3 rounded-lg"
          >
            <Text className="text-white text-center">
              {userMode
                ? "Approve Sessions"
                : (isLastStep ? "Complete Registration" : "Next")}
            </Text>
          </TouchableOpacity>

        </View>

        {showPicker && (
          <DateTimePicker
            value={
              localFormData.sessions[currentPickerIndex]?.date 
                ? new Date(localFormData.sessions[currentPickerIndex].date) 
                : new Date()
            }
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

      </View>
    </View>
  );
};

export default SessionTracker;