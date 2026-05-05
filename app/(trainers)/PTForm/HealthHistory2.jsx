import React, { useState } from "react";
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
  "Orthopedic problem (including arthritis)"
];

const HealthHistory2 = ({ onNext, onPrevious, formData, isFirstStep }) => {
  const [form, setForm] = useState({
    bp: formData?.bp || "",
    sugar: formData?.sugar || "",
    cholesterol: formData?.cholesterol || "",
    thyroid: formData?.thyroid || "",
    uric: formData?.uric || "",
    serum3d: formData?.serum3d || "",
    ...formData
  });

  React.useEffect(() => {
    if (formData) {
      setForm(prev => ({ ...prev, ...formData }));
    }
  }, [formData]);

  const handleRadio = (name, val) => {
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleChange = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submit = () => {
    onNext(form);
  };

  const RadioButton = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      onPress={() => onPress(value)}
      className="flex-row items-center gap-2"
    >
      <View className={`w-4 h-4 rounded-full border-2 ${selected ? 'bg-orange-500 border-orange-500' : 'border-white/40'}`} />
      <Text className="text-white">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1">
      <View className="py-4">
        <Text className="text-orange-500 font-bold border-b border-white/10 pb-2 uppercase tracking-wider mb-6">
          Health History Questionnaire
        </Text>

        <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-white/80 mb-6">
            Please fill out all information requested below
          </Text>

          <View className="space-y-4">
            {questions.map((item, index) => (
              <View key={index} className="border-b border-white/10 pb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white flex-1 text-sm">
                    {index + 1}. {item}
                  </Text>
                  <View className="flex-row gap-6">
                    <RadioButton
                      label="Yes"
                      value="Yes"
                      selected={form[`q${index}`] === "Yes"}
                      onPress={(value) => handleRadio(`q${index}`, value)}
                    />
                    <RadioButton
                      label="No"
                      value="No"
                      selected={form[`q${index}`] === "No"}
                      onPress={(value) => handleRadio(`q${index}`, value)}
                    />
                  </View>
                </View>

                {(index === 14 || index === 15) && (
                  <TextInput
                    value={form[`specify${index}`]}
                    onChangeText={(text) => handleChange(`specify${index}`, text)}
                    placeholder="List specifies"
                    placeholderTextColor="#ffffff40"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white mt-2"
                    style={{ color: 'white' }}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Medical Information */}
        <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <Text className="text-orange-400 font-bold text-xl mb-6 uppercase tracking-wider">
            Medical Information
          </Text>

          <View className="gap-5">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-white mb-2">Blood Pressure</Text>
                <TextInput
                  value={form.bp}
                  onChangeText={(text) => handleChange("bp", text)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  style={{ color: 'white' }}
                  placeholder="Enter blood pressure"
                  placeholderTextColor="#ffffff40"
                />
              </View>
              <View className="flex-1">
                <Text className="text-white mb-2">Blood Sugar</Text>
                <TextInput
                  value={form.sugar}
                  onChangeText={(text) => handleChange("sugar", text)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  style={{ color: 'white' }}
                  placeholder="Enter blood sugar"
                  placeholderTextColor="#ffffff40"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-white mb-2">Blood Cholesterol</Text>
                <TextInput
                  value={form.cholesterol}
                  onChangeText={(text) => handleChange("cholesterol", text)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  style={{ color: 'white' }}
                  placeholder="Enter cholesterol"
                  placeholderTextColor="#ffffff40"
                />
              </View>
              <View className="flex-1">
                <Text className="text-white mb-2">Thyroid Level</Text>
                <TextInput
                  value={form.thyroid}
                  onChangeText={(text) => handleChange("thyroid", text)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  style={{ color: 'white' }}
                  placeholder="Enter thyroid level"
                  placeholderTextColor="#ffffff40"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-white mb-2">Blood Uric Acid</Text>
                <TextInput
                  value={form.uric}
                  onChangeText={(text) => handleChange("uric", text)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  style={{ color: 'white' }}
                  placeholder="Enter uric acid"
                  placeholderTextColor="#ffffff40"
                />
              </View>
              <View className="flex-1">
                <Text className="text-white mb-2">Serum 3D</Text>
                <TextInput
                  value={form.serum3d}
                  onChangeText={(text) => handleChange("serum3d", text)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  style={{ color: 'white' }}
                  placeholder="Enter serum 3D"
                  placeholderTextColor="#ffffff40"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row gap-3 pt-6">
          <TouchableOpacity
            onPress={onPrevious}
            disabled={isFirstStep}
            className={`flex-1 px-4 py-3 rounded-lg ${isFirstStep ? 'bg-gray-600' : 'bg-gray-700'}`}
            style={{ opacity: isFirstStep ? 0.5 : 1 }}
          >
            <Text className="text-white text-center font-bold">Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={submit}
            className="flex-1 px-4 py-3 bg-orange-600 rounded-lg"
          >
            <Text className="text-white text-center font-bold">Next Step</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HealthHistory2;