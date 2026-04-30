import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";

const FlexibilityAndMeasurements = ({
  onNext,
  onPrevious,
  formData: initialFormData,
  isFirstStep,
  isLastStep,
  readOnly = false,
}) => {
  const [localFormData, setLocalFormData] = useState({
    flex_apley_test: "",
    flex_ymca_val: "",
    flex_ymca_test: "",
    flex_knee_val: "",
    flex_knee_test: "",
    measurements: Array(5).fill({
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
    }),
  });

  useEffect(() => {
    if (initialFormData) {
      setLocalFormData(prev => ({
        ...prev,
        ...initialFormData,
      }));
    }
  }, [initialFormData]);

  const handleChange = (name, value) => {
    if (readOnly) return;
    setLocalFormData(prev => ({ ...prev, [name]: value }));
  };

  const normalizeValue = (value) =>
    String(value || "").trim().toLowerCase();

  const handleMeasurementChange = (index, field, value) => {
    if (readOnly) return;
    const updated = [...localFormData.measurements];
    updated[index] = { ...updated[index], [field]: value };
    setLocalFormData(prev => ({ ...prev, measurements: updated }));
  };

  const handleSubmit = () => {
    onNext(localFormData);
  };

  const Radio = ({ label, name }) => (
    <TouchableOpacity
      onPress={() => handleChange(name, label)}
      className="flex-row items-center gap-2"
    >
      <View
        className={`w-4 h-4 rounded-full border-2 ${
          normalizeValue(localFormData[name]) === label.toLowerCase()
            ? "bg-orange-500 border-orange-500"
            : "border-white/40"
        }`}
      />
      <Text className="text-white">{label}</Text>
    </TouchableOpacity>
  );

  const measurementFields = [
    "date","height","weight","neck","shoulder","arm",
    "chest_normal","chest_expanded","waist","abdomen",
    "hip","thigh","calf","lat"
  ];

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6">

        {/* FLEXIBILITY */}
        <Text className="text-orange-500 font-bold mb-4 uppercase">
          Flexibility
        </Text>

        {/* Apley */}
        <View className="bg-white/5 p-4 rounded-lg mb-4">
          <Text className="text-white mb-2">Apley's Test</Text>
          <View className="flex-row gap-6">
            <Radio label="Normal" name="flex_apley_test" />
            <Radio label="Restricted" name="flex_apley_test" />
          </View>
        </View>

        {/* YMCA */}
        <View className="bg-white/5 p-4 rounded-lg mb-4">
          <Text className="text-white mb-2">YMCA Test</Text>

          <TextInput
            value={localFormData.flex_ymca_val}
            onChangeText={(t) => handleChange("flex_ymca_val", t)}
            placeholder="Value"
            placeholderTextColor="#aaa"
            className="bg-white/10 p-2 rounded mb-3 text-white"
          />

          <View className="flex-row gap-6">
            <Radio label="Well" name="flex_ymca_test" />
            <Radio label="Average" name="flex_ymca_test" />
          </View>
        </View>

        {/* Knee */}
        <View className="bg-white/5 p-4 rounded-lg mb-6">
          <Text className="text-white mb-2">Knee Test</Text>

          <TextInput
            value={localFormData.flex_knee_val}
            onChangeText={(t) => handleChange("flex_knee_val", t)}
            placeholder="Value"
            placeholderTextColor="#aaa"
            className="bg-white/10 p-2 rounded mb-3 text-white"
          />

          <View className="flex-row gap-6">
            <Radio label="Normal" name="flex_knee_test" />
            <Radio label="Restricted" name="flex_knee_test" />
          </View>
        </View>

        {/* MEASUREMENTS */}
        <Text className="text-orange-500 font-bold mb-4 uppercase">
          Measurements
        </Text>

        {measurementFields.map((field) => (
          <View key={field} className="mb-4">
            <Text className="text-white mb-2 capitalize">{field}</Text>

            <View className="flex-row flex-wrap gap-2">
              {[0,1,2,3,4].map((i) => (
                <TextInput
                  key={i}
                  value={localFormData.measurements[i][field]}
                  onChangeText={(t) =>
                    handleMeasurementChange(i, field, t)
                  }
                  className="bg-white/10 p-2 rounded text-white w-[18%]"
                  placeholder={`${i+1}`}
                  placeholderTextColor="#aaa"
                />
              ))}
            </View>
          </View>
        ))}

        {/* BUTTONS */}
        {!readOnly && (
          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              onPress={onPrevious}
              disabled={isFirstStep}
              className="flex-1 bg-gray-700 p-3 rounded-lg"
              style={{ opacity: isFirstStep ? 0.5 : 1 }}
            >
              <Text className="text-white text-center">Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 bg-orange-600 p-3 rounded-lg"
            >
              <Text className="text-white text-center">
                {isLastStep ? "Complete" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ScrollView>
  );
};

export default FlexibilityAndMeasurements;