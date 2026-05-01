import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const FitnessScreeningPage = ({ formData = {}, onNext, onPrevious }) => {
  const [localFormData, setLocalFormData] = useState({
    fs_height: "",
    fs_weight: "",
    fs_resting_hr: "",
    fs_fat_percentage: "",
    fs_fat_level: "",
    fs_speed_km: "",
    fs_heart_rate: "",
    fs_push_ups_count: "",
    fs_push_ups_level: "",
    fs_squats_count: "",
    fs_squats_level: "",
    fs_plank_hold_count: "",
    fs_plank_hold_level: "",
    fs_shoulder_count: "",
    fs_shoulder_level: "",
    fs_biceps_count: "",
    fs_biceps_level: "",
    fs_triceps_count: "",
    fs_triceps_level: "",
    fs_curl_ups_count: "",
    fs_curl_ups_level: "",
  });

  useEffect(() => {
    if (formData) {
      setLocalFormData((prev) => ({
        ...prev,
        fs_height: formData.fs_height || formData.height || "",
        fs_weight: formData.fs_weight || formData.weight || "",
        fs_resting_hr: formData.fs_resting_hr || "",
        fs_fat_percentage: formData.fs_fat_percentage || "",
        fs_fat_level: String(formData.fs_fat_level || "").trim(),
        fs_speed_km: formData.fs_speed_km || "",
        fs_heart_rate: formData.fs_heart_rate || "",
        fs_push_ups_count: formData.fs_push_ups_count || "",
        fs_push_ups_level: String(formData.fs_push_ups_level || "").trim(),
        fs_squats_count: formData.fs_squats_count || "",
        fs_squats_level: String(formData.fs_squats_level || "").trim(),
        fs_plank_hold_count: formData.fs_plank_hold_count || "",
        fs_plank_hold_level: String(formData.fs_plank_hold_level || "").trim(),
        fs_shoulder_count: formData.fs_shoulder_count || "",
        fs_shoulder_level: String(formData.fs_shoulder_level || "").trim(),
        fs_biceps_count: formData.fs_biceps_count || "",
        fs_biceps_level: String(formData.fs_biceps_level || "").trim(),
        fs_triceps_count: formData.fs_triceps_count || "",
        fs_triceps_level: String(formData.fs_triceps_level || "").trim(),
        fs_curl_ups_count: formData.fs_curl_ups_count || "",
        fs_curl_ups_level: String(formData.fs_curl_ups_level || "").trim(),
      }));
    }
  }, [formData]);

  const renderMuscleEnduranceRow = (label, namePrefix) => (
    <View className="bg-[#1a1a1a] rounded-2xl p-4 mb-3">
      <Text className="text-white/80 mb-2">{label}:</Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-white">Count: {localFormData[`${namePrefix}_count`] || "-"}</Text>
        <Text className="text-white">Level: {localFormData[`${namePrefix}_level`] || "-"}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Fitness Screening</Text>

        <View className="bg-[#111] rounded-3xl p-5 space-y-4">
          {/* RESTING PARAMETERS */}
          <View className="space-y-4">
            <Text className="text-orange-500 font-bold text-sm uppercase tracking-wider">Resting Parameters</Text>
            <View className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <View className="space-y-2">
                <Text className="text-white/80">Height in cm:</Text>
                <Text className="bg-[#1a1a1a] text-white p-4 rounded-2xl">{localFormData.fs_height || "-"}</Text>
              </View>
              <View className="space-y-2">
                <Text className="text-white/80">Weight in KG:</Text>
                <Text className="bg-[#1a1a1a] text-white p-4 rounded-2xl">{localFormData.fs_weight || "-"}</Text>
              </View>
              <View className="space-y-2">
                <Text className="text-white/80">Resting HR:</Text>
                <Text className="bg-[#1a1a1a] text-white p-4 rounded-2xl">{localFormData.fs_resting_hr || "-"}</Text>
              </View>
            </View>
          </View>

          {/* COMPOSITIONS */}
          <View className="space-y-4">
            <Text className="text-orange-500 font-bold text-sm uppercase tracking-wider">Compositions</Text>
            <View className="space-y-4">
              <View className="space-y-2">
                <Text className="text-white/80">Fat% (BIA):</Text>
                <Text className="bg-[#1a1a1a] text-white p-4 rounded-2xl">{localFormData.fs_fat_percentage || "-"}</Text>
              </View>
              <View className="space-y-2">
                <Text className="text-white/80">Fat Level:</Text>
                <Text className="bg-[#1a1a1a] text-white p-4 rounded-2xl">{localFormData.fs_fat_level || "-"}</Text>
              </View>
            </View>
          </View>

          {/* CARDIORESPIRATORY FITNESS */}
          <View className="space-y-4">
            <Text className="text-orange-500 font-bold text-sm uppercase tracking-wider">Cardiorespiratory Fitness</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 space-y-2">
                <Text className="text-white/80">Speed in KM:</Text>
                <Text className="bg-[#1a1a1a] text-white p-4 rounded-2xl">{localFormData.fs_speed_km || "-"}</Text>
              </View>
              <View className="flex-1 space-y-2">
                <Text className="text-white/80">Heart rate:</Text>
                <Text className="bg-[#1a1a1a] text-white p-4 rounded-2xl">{localFormData.fs_heart_rate || "-"}</Text>
              </View>
            </View>
          </View>

          {/* MUSCLE ENDURANCE */}
          <View className="space-y-4">
            <Text className="text-orange-500 font-bold text-sm uppercase tracking-wider">Muscle Endurance</Text>
            <View className="space-y-2">
              {renderMuscleEnduranceRow('Push-ups', 'fs_push_ups')}
              {renderMuscleEnduranceRow('Squats', 'fs_squats')}
              {renderMuscleEnduranceRow('Plank Hold', 'fs_plank_hold')}
              {renderMuscleEnduranceRow('Shoulder', 'fs_shoulder')}
              {renderMuscleEnduranceRow('Biceps', 'fs_biceps')}
              {renderMuscleEnduranceRow('Triceps', 'fs_triceps')}
              {renderMuscleEnduranceRow('Curl ups', 'fs_curl_ups')}
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity onPress={onPrevious} className="flex-1 bg-gray-700 rounded-2xl p-4">
            <Text className="text-white text-center">Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNext(localFormData)} className="flex-1 bg-orange-600 rounded-2xl p-4">
            <Text className="text-white text-center">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default FitnessScreeningPage;