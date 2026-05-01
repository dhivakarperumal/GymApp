import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const questions = [
  "Heart Attack",
  "Heart bypass or any other cardiac surgery",
  "Chest discomfort with Digine",
  "Palpitation",
  "Epilepsy",
  "Fainting or dizziness or loss of consciousness",
  "Hypertension (High blood pressure)",
  "Family history of heart disease (Male < 55 yrs & Female < 65 yrs)",
  "Rheumatic fever",
  "Shortness of breath with or without exercise",
  "Any Breathing difficulties / Wheezing / Asthma",
  "High blood cholesterol (lipid)",
  "Diabetes or impaired blood sugar",
  "Stroke",
  "Recent hospitalization / other medical conditions",
  "Orthopedic problem (including arthritis)",
];

const HealthHistory2Page = ({ formData = {}, onNext, onPrevious, isFirstStep = false }) => {
  const [form, setForm] = useState({
    bp: "",
    sugar: "",
    cholesterol: "",
    thyroid: "",
    uric: "",
    serum3d: "",
  });

  useEffect(() => {
    if (formData) {
      setForm((prev) => ({ ...prev, ...formData }));
    }
  }, [formData]);

  const handleRadio = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Health History 2</Text>

        <View className="bg-[#111] rounded-3xl p-5 space-y-4">
          {questions.map((question, index) => (
            <View key={index} className="space-y-3">
              <Text className="text-white">{index + 1}. {question}</Text>
              <View className="flex-row gap-3">
                {['Yes', 'No'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleRadio(`q${index}`, option)}
                    className={`px-4 py-3 rounded-2xl border ${form[`q${index}`] === option ? 'border-orange-500 bg-orange-500/15' : 'border-white/20'}`}>
                    <Text className="text-white">{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {(index === 14 || index === 15) && (
                <TextInput
                  value={form[`specify${index}`] || ""}
                  onChangeText={(text) => handleChange(`specify${index}`, text)}
                  placeholder="List specifics"
                  placeholderTextColor="#999"
                  className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
                />
              )}
            </View>
          ))}

          <View className="space-y-4">
            <Text className="text-white/80">Blood Pressure</Text>
            <TextInput
              value={form.bp}
              onChangeText={(text) => handleChange('bp', text)}
              placeholder="Blood Pressure"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-4">
            <Text className="text-white/80">Blood Sugar</Text>
            <TextInput
              value={form.sugar}
              onChangeText={(text) => handleChange('sugar', text)}
              placeholder="Blood Sugar"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-4">
            <Text className="text-white/80">Cholesterol</Text>
            <TextInput
              value={form.cholesterol}
              onChangeText={(text) => handleChange('cholesterol', text)}
              placeholder="Cholesterol"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-4">
            <Text className="text-white/80">Thyroid Level</Text>
            <TextInput
              value={form.thyroid}
              onChangeText={(text) => handleChange('thyroid', text)}
              placeholder="Thyroid"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-4">
            <Text className="text-white/80">Uric Acid</Text>
            <TextInput
              value={form.uric}
              onChangeText={(text) => handleChange('uric', text)}
              placeholder="Uric Acid"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-4">
            <Text className="text-white/80">Serum 3D</Text>
            <TextInput
              value={form.serum3d}
              onChangeText={(text) => handleChange('serum3d', text)}
              placeholder="Serum 3D"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>
        </View>

        <View className="flex-row gap-3 mt-4">
          {!isFirstStep && (
            <TouchableOpacity onPress={onPrevious} className="flex-1 bg-gray-700 rounded-2xl p-4">
              <Text className="text-white text-center">Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onNext(form)} className="flex-1 bg-orange-600 rounded-2xl p-4">
            <Text className="text-white text-center">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default HealthHistory2Page;
