import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import api from "../../../services/api";
import { useAuth } from '../../../context/AuthContext.js'
import Toast from "react-native-toast-message";
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

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
    <View className="flex-1 bg-black">
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
        {localFormData.sessions.map((session, index) => (
          <View key={index} className="bg-white/5 p-4 rounded-xl mb-4">

            <Text className="text-orange-400 font-bold mb-2">
              Session {session.session_no}
            </Text>

            {/* Date */}
            <TouchableOpacity
              onPress={() => {
                if (!userMode) {
                  setCurrentPickerIndex(index);
                  setShowPicker(true);
                }
              }}
              className="bg-white/10 p-3 rounded-xl mb-2 flex-row justify-between items-center"
            >
              <Text className={session.date ? "text-white" : "text-white/40"}>
                {session.date || "Select Date"}
              </Text>
              <Text className="text-orange-400/50 text-[10px]">📅</Text>
            </TouchableOpacity>

            {/* Workout */}
            <TextInput
              value={session.workout}
              onChangeText={(t) => handleSessionChange(index, "workout", t)}
              placeholder="Workout"
              placeholderTextColor="#aaa"
              editable={!userMode}
              className="bg-white/10 p-2 rounded text-white mb-2"
            />

            {/* Status */}
            <TouchableOpacity
              onPress={() => {
                if (canApproveSession(session)) {
                  handleSessionChange(index, "status", "Completed");
                }
              }}
              disabled={!canApproveSession(session)}
              className={`p-2 rounded mb-2 ${
                session.status === "Completed"
                  ? "bg-green-500"
                  : "bg-orange-500"
              }`}
            >
              <Text className="text-white text-center">
                {session.status}
              </Text>
            </TouchableOpacity>

            {/* Client Sign */}
            <TextInput
              value={session.client_sign}
              placeholder="Client Sign"
              editable={false}
              className="bg-white/10 p-2 rounded text-white mb-2"
            />

            {/* Trainer Sign */}
            <TextInput
              value={session.trainer_sign}
              onChangeText={(t) => handleSessionChange(index, "trainer_sign", t)}
              editable={!userMode}
              placeholder="Trainer Sign"
              className="bg-white/10 p-2 rounded text-white"
            />

          </View>
        ))}

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