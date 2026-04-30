import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";

const FitnessScreening = ({ onNext, onPrevious }) => {
  const [form, setForm] = useState({
    fs_height: "",
    fs_weight: "",
    fs_resting_hr: "",
    fs_fat_percentage: "",
    fs_fat_level: "",
  });

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const Radio = ({ label, value }) => (
    <TouchableOpacity
      onPress={() => handleChange("fs_fat_level", value)}
      className="flex-row items-center gap-2"
    >
      <View
        className={`w-4 h-4 rounded-full border-2 ${
          form.fs_fat_level === value
            ? "bg-orange-500 border-orange-500"
            : "border-white/40"
        }`}
      />
      <Text className="text-white">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6">

        {/* Title */}
        <Text className="text-orange-500 font-bold mb-6 uppercase">
          Fitness Screening
        </Text>

        {/* Resting */}
        <View className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <Text className="text-white mb-4">Resting Parameters</Text>

          <TextInput
            placeholder="Height (cm)"
            placeholderTextColor="#ffffff40"
            value={form.fs_height}
            onChangeText={(t) => handleChange("fs_height", t)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-3"
          />

          <TextInput
            placeholder="Weight (kg)"
            placeholderTextColor="#ffffff40"
            value={form.fs_weight}
            onChangeText={(t) => handleChange("fs_weight", t)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-3"
          />

          <TextInput
            placeholder="Resting HR"
            placeholderTextColor="#ffffff40"
            value={form.fs_resting_hr}
            onChangeText={(t) => handleChange("fs_resting_hr", t)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </View>

        {/* Fat */}
        <View className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <Text className="text-white mb-4">Fat %</Text>

          <TextInput
            placeholder="Enter Fat %"
            placeholderTextColor="#ffffff40"
            value={form.fs_fat_percentage}
            onChangeText={(t) => handleChange("fs_fat_percentage", t)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-4"
          />

          <View className="flex-row gap-6">
            <Radio label="Low" value="Low" />
            <Radio label="Healthy" value="Healthy" />
            <Radio label="Overweight" value="Overweight" />
            <Radio label="Obese" value="Obese" />
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onPrevious}
            className="flex-1 bg-gray-700 px-4 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold">Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNext(form)}
            className="flex-1 bg-orange-600 px-4 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold">Next</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
};

export default FitnessScreening;