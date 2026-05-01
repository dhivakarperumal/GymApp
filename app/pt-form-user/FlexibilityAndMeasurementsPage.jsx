import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Flexibility & Measurements</Text>

        <View className="bg-[#111] rounded-3xl p-5 space-y-4">
          {/* FLEXIBILITY */}
          <View className="space-y-4">
            <Text className="text-orange-500 font-bold text-sm uppercase tracking-wider">Flexibility</Text>

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
          <View className="space-y-4 pt-4 ">
            <Text className="text-orange-500 font-bold text-sm uppercase tracking-wider">Measurements</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={{ width: 800 }} className="border border-white/20 rounded-lg overflow-hidden">
                {/* Header */}
                <View style={{ flexDirection: "row", backgroundColor: "#1a1a1a" }}>
                  <View style={{ width: 60, padding: 12 }}>
                    <Text style={{ color: "#aaa", textAlign: "center" }}>S.No</Text>
                  </View>

                  <View style={{ width: 180, padding: 12 }}>
                    <Text style={{ color: "#aaa" }}>Measurement</Text>
                  </View>

                  {[1, 2, 3, 4, 5].map((num) => (
                    <View key={num} style={{ width: 100, padding: 12 }}>
                      <Text style={{ color: "#f97316", textAlign: "center" }}>{num}</Text>
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

export default FlexibilityAndMeasurementsPage;