import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

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
        fs_resting_hr: formData.fs_resting_hr || formData.resting_hr || "",
        fs_fat_percentage: formData.fs_fat_percentage || formData.fat_percentage || "",
        fs_fat_level: String(formData.fs_fat_level || formData.fat_level || "").trim(),
        fs_speed_km: formData.fs_speed_km || formData.speed_km || "",
        fs_heart_rate: formData.fs_heart_rate || formData.heart_rate || "",
        fs_push_ups_count: formData.fs_push_ups_count || formData.push_ups_count || "",
        fs_push_ups_level: String(formData.fs_push_ups_level || formData.push_ups_level || "").trim(),
        fs_squats_count: formData.fs_squats_count || formData.squats_count || "",
        fs_squats_level: String(formData.fs_squats_level || formData.squats_level || "").trim(),
        fs_plank_hold_count: formData.fs_plank_hold_count || formData.plank_hold_count || "",
        fs_plank_hold_level: String(formData.fs_plank_hold_level || formData.plank_hold_level || "").trim(),
        fs_shoulder_count: formData.fs_shoulder_count || formData.shoulder_count || "",
        fs_shoulder_level: String(formData.fs_shoulder_level || formData.shoulder_level || "").trim(),
        fs_biceps_count: formData.fs_biceps_count || formData.biceps_count || "",
        fs_biceps_level: String(formData.fs_biceps_level || formData.biceps_level || "").trim(),
        fs_triceps_count: formData.fs_triceps_count || formData.triceps_count || "",
        fs_triceps_level: String(formData.fs_triceps_level || formData.triceps_level || "").trim(),
        fs_curl_ups_count: formData.fs_curl_ups_count || formData.curl_ups_count || "",
        fs_curl_ups_level: String(formData.fs_curl_ups_level || formData.curl_ups_level || "").trim(),
      }));
    }
  }, [formData]);

  const renderDataRow = (label, value, iconName, showBorder = true) => (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: showBorder ? 1 : 0, borderBottomColor: "#1a1a1a" }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginRight: 12, borderWidth: 1, borderColor: "#222" }}>
        <Ionicons name={iconName} size={16} color="#e11d1d" />
      </View>
      <View style={{ flex: 1 }}>
        <Text className="text-white/60 text-xs mb-1">{label}</Text>
        <Text className="text-white font-semibold">{value || "-"}</Text>
      </View>
    </View>
  );

  const renderMuscleEnduranceRow = (label, namePrefix, showBorder = true) => (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: showBorder ? 1 : 0, borderBottomColor: "#1a1a1a" }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginRight: 12, borderWidth: 1, borderColor: "#222" }}>
        <Ionicons name="barbell-outline" size={16} color="#e11d1d" />
      </View>
      <View style={{ flex: 1 }}>
        <Text className="text-white/60 text-xs mb-1">{label}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text className="text-white font-semibold mr-3">Count: <Text style={{ color: "#aaa" }}>{localFormData[`${namePrefix}_count`] || "-"}</Text></Text>
          <Text className="text-white font-semibold">Level: <Text style={{ color: "#aaa" }}>{localFormData[`${namePrefix}_level`] || "-"}</Text></Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="pb-6 px-4" style={{ marginTop: 20 }}>
        
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginRight: 12, borderWidth: 1, borderColor: "#222" }}>
            <Ionicons name="fitness-outline" size={20} color="#e11d1d" />
          </View>
          <Text className="text-white text-2xl font-bold">Fitness Screening</Text>
        </View>

        <View className="bg-[#111] rounded-3xl p-5 border border-[#1a1a1a]" style={{ marginBottom: 20 }}>
          
          {/* RESTING PARAMETERS */}
          <View style={{ marginBottom: 30 }}>
            <Text className="text-[#e11d1d] font-bold text-xs uppercase tracking-widest mb-4">Resting Parameters</Text>
            <View style={{ backgroundColor: "#0d0d0d", borderRadius: 20, borderWidth: 1, borderColor: "#1a1a1a", paddingHorizontal: 16 }}>
              {renderDataRow("Height (cm)", localFormData.fs_height ? `${localFormData.fs_height} cm` : "", "resize-outline")}
              {renderDataRow("Weight (KG)", localFormData.fs_weight ? `${localFormData.fs_weight} KG` : "", "scale-outline")}
              {renderDataRow("Resting HR", localFormData.fs_resting_hr ? `${localFormData.fs_resting_hr} bpm` : "", "heart-outline", false)}
            </View>
          </View>

          {/* COMPOSITIONS */}
          <View style={{ marginBottom: 30 }}>
            <Text className="text-[#e11d1d] font-bold text-xs uppercase tracking-widest mb-4">Compositions</Text>
            <View style={{ backgroundColor: "#0d0d0d", borderRadius: 20, borderWidth: 1, borderColor: "#1a1a1a", paddingHorizontal: 16 }}>
              {renderDataRow("Fat% (BIA)", localFormData.fs_fat_percentage ? `${localFormData.fs_fat_percentage}%` : "", "pie-chart-outline")}
              {renderDataRow("Fat Level", localFormData.fs_fat_level, "speedometer-outline", false)}
            </View>
          </View>

          {/* CARDIORESPIRATORY FITNESS */}
          <View style={{ marginBottom: 30 }}>
            <Text className="text-[#e11d1d] font-bold text-xs uppercase tracking-widest mb-4">Cardiorespiratory Fitness</Text>
            <View style={{ backgroundColor: "#0d0d0d", borderRadius: 20, borderWidth: 1, borderColor: "#1a1a1a", paddingHorizontal: 16 }}>
              {renderDataRow("Speed in KM", localFormData.fs_speed_km ? `${localFormData.fs_speed_km} km/h` : "", "bicycle-outline")}
              {renderDataRow("Heart Rate", localFormData.fs_heart_rate ? `${localFormData.fs_heart_rate} bpm` : "", "pulse-outline", false)}
            </View>
          </View>

          {/* MUSCLE ENDURANCE */}
          <View style={{ marginBottom: 10 }}>
            <Text className="text-[#e11d1d] font-bold text-xs uppercase tracking-widest mb-4">Muscle Endurance</Text>
            <View style={{ backgroundColor: "#0d0d0d", borderRadius: 20, borderWidth: 1, borderColor: "#1a1a1a", paddingHorizontal: 16 }}>
              {renderMuscleEnduranceRow('Push-ups', 'fs_push_ups')}
              {renderMuscleEnduranceRow('Squats', 'fs_squats')}
              {renderMuscleEnduranceRow('Plank Hold', 'fs_plank_hold')}
              {renderMuscleEnduranceRow('Shoulder', 'fs_shoulder')}
              {renderMuscleEnduranceRow('Biceps', 'fs_biceps')}
              {renderMuscleEnduranceRow('Triceps', 'fs_triceps')}
              {renderMuscleEnduranceRow('Curl ups', 'fs_curl_ups', false)}
            </View>
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
            onPress={() => onNext(localFormData)} 
            className="flex-1 bg-[#e11d1d] rounded-2xl p-4 shadow-lg shadow-red-900/50 flex-row justify-center items-center"
            style={{ shadowColor: "#e11d1d", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
          >
            <Text className="text-white font-bold mr-2">Next</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default FitnessScreeningPage;