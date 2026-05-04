import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FlexibilityAndMeasurementsPage = ({ formData = {}, onNext, onPrevious }) => {
  const [localFormData, setLocalFormData] = useState({
    flex_apley_test: "",
    flex_ymca_val: "",
    flex_ymca_test: "",
    flex_knee_val: "",
    flex_knee_test: "",
    measurements: Array.from({ length: 5 }, () => ({
      date: "",
      height: "",
      weight: "",
      neck: "",
      shoulder: "",
      arm: "",
      chest_normal: "",
      chest_expanded: "",
      waist: "",
      abdomen: "",
      hip: "",
      thigh: "",
      calf: "",
      lat: "",
    }))
  });

  useEffect(() => {
    if (formData) {
      setLocalFormData((prev) => ({
        ...prev,
        flex_apley_test: String(formData.flex_apley_test || formData.apley_test || "").trim(),
        flex_ymca_val: formData.flex_ymca_val || formData.ymca_val || formData.ymca_value || "",
        flex_ymca_test: String(formData.flex_ymca_test || formData.ymca_test || "").trim(),
        flex_knee_val: formData.flex_knee_val || formData.knee_val || "",
        flex_knee_test: String(formData.flex_knee_test || formData.knee_test || "").trim(),
        measurements: formData.measurements || prev.measurements
      }));
    }
  }, [formData]);

  const measurementFields = [
    { label: "Date", key: "date" },
    { label: "Height (cms)", key: "height" },
    { label: "Weight", key: "weight" },
    { label: "Neck", key: "neck" },
    { label: "Shoulder (cms)", key: "shoulder" },
    { label: "Arm", key: "arm" },
    { label: "Chest (Normal)", key: "chest_normal" },
    { label: "Chest (Expanded)", key: "chest_expanded" },
    { label: "Waist", key: "waist" },
    { label: "Abdomen", key: "abdomen" },
    { label: "Hip", key: "hip" },
    { label: "Thigh", key: "thigh" },
    { label: "Calf", key: "calf" },
    { label: "Lat", key: "lat" },
  ];

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View className="px-4 pb-6" style={{ marginTop: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginRight: 12, borderWidth: 1, borderColor: "#222" }}>
            <Ionicons name="body-outline" size={20} color="#e11d1d" />
          </View>
          <Text className="text-white text-2xl font-bold">Flexibility & Measurements</Text>
        </View>

        <View className="bg-[#111] rounded-3xl p-5 border border-[#1a1a1a]" style={{ marginBottom: 20 }}>
          {/* FLEXIBILITY */}
          <View style={{ marginBottom: 30 }}>
            <Text className="text-[#e11d1d] font-bold text-xs uppercase tracking-widest mb-4">Flexibility</Text>

            {/* Apley's Scratch test */}
            <View className="bg-[#1a1a1a] rounded-2xl p-4">
              <Text className="text-white/80 mb-2">Apley&apos;s Scratch test:</Text>
              <Text className="text-white">{localFormData.flex_apley_test || "-"}</Text>
            </View>

            {/* YMCA sit & Reach test */}
            <View className="bg-[#1a1a1a] rounded-2xl p-4">
              <Text className="text-white/80 mb-2">YMCA sit & Reach test (normal/back saver):</Text>
              <Text className="text-white">Value: {localFormData.flex_ymca_val || "-"}</Text>
              <Text className="text-white">Result: {localFormData.flex_ymca_test || "-"}</Text>
            </View>

            {/* Knee to Wall Lunge test */}
            <View className="bg-[#1a1a1a] rounded-2xl p-4">
              <Text className="text-white/80 mb-2">Knee to Wall Lunge test:</Text>
              <Text className="text-white">Value: {localFormData.flex_knee_val || "-"}</Text>
              <Text className="text-white">Result: {localFormData.flex_knee_test || "-"}</Text>
            </View>
          </View>

          {/* MEASUREMENTS TABLE */}
          <View style={{ marginBottom: 10 }}>
            <Text className="text-[#e11d1d] font-bold text-xs uppercase tracking-widest mb-4">Measurements</Text>
          <View className="space-y-4 pt-4 ">
            <Text className="text-orange-500 font-bold text-sm uppercase tracking-wider">Measurements</Text>

            <View className="border border-white/20 rounded-lg overflow-hidden">
              {/* Header */}
              <View className="flex-row bg-[#1a1a1a]">
                <View className="flex-1 p-3 border-r border-white/20">
                  <Text className="text-white/80 text-center">S.No</Text>
                </View>
                <View className="flex-2 p-3 border-r border-white/20">
                  <Text className="text-white/80">Measurement</Text>
                </View>
                {[1, 2, 3, 4, 5].map((num) => (
                  <View key={num} className="flex-1 p-3 border-r border-white/20 last:border-0">
                    <Text className="text-[#e11d1d] font-bold text-center">{num}</Text>
                  </View>
                ))}
              </View>

                {/* Rows */}
                {measurementFields.map((field, rowIndex) => (
                  <View key={field.key} style={{ flexDirection: "row" }}>

                    <View style={{ width: 60, padding: 12 }}>
                      <Text style={{ color: "#aaa", textAlign: "center" }}>
                        {rowIndex + 1}
                      </Text>
                    </View>

                    <View style={{ width: 180, padding: 12 }}>
                      <Text style={{ color: "#fff" }} numberOfLines={1}>
                        {field.label}
                      </Text>
                    </View>

                    {[0, 1, 2, 3, 4].map((colIndex) => (
                      <View key={colIndex} style={{ width: 100, padding: 12 }}>
                        <Text numberOfLines={1}
                          ellipsizeMode="tail" style={{ color: "#fff", textAlign: "center" }}>
                          {localFormData.measurements[colIndex]?.[field.key] || "-"}
                        </Text>
                      </View>
                    ))}

                  </View>
                ))}
              </View>
            </ScrollView>
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
            className="flex-1 bg-[#e11d1d] rounded-2xl p-4 shadow-lg flex-row justify-center items-center"
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

export default FlexibilityAndMeasurementsPage;