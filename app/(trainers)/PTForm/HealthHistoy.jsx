import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const HealthHistoy = ({ onNext, onPrevious, formData, isFirstStep }) => {
  const [form, setForm] = useState({
    medications: formData?.medications || "",
    med1: formData?.med1 || "",
    dose1: formData?.dose1 || "",
    reason1: formData?.reason1 || "",
    med2: formData?.med2 || "",
    dose2: formData?.dose2 || "",
    reason2: formData?.reason2 || "",
    med3: formData?.med3 || "",
    dose3: formData?.dose3 || "",
    reason3: formData?.reason3 || "",
    allergies: formData?.allergies || "",
    surgeries1: formData?.surgeries1 || "",
    surgeries2: formData?.surgeries2 || "",
    surgeries3: formData?.surgeries3 || "",
    exercise_program: formData?.exercise_program || "",
    sports: formData?.sports || "",
    sport1: formData?.sport1 || "",
    sport2: formData?.sport2 || "",
    sport3: formData?.sport3 || "",
    sport4: formData?.sport4 || "",
    sport5: formData?.sport5 || "",
    sport6: formData?.sport6 || "",
    smoking: formData?.smoking || "",
    alcohol: formData?.alcohol || "",
    food_preference: formData?.food_preference || "",
    supplements: formData?.supplements || ""
  });

  React.useEffect(() => {
    if (formData) {
      setForm(prev => ({ ...prev, ...formData }));
    }
  }, [formData]);

  const handleChange = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
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

        {/* Medications */}
        <View className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <Text className="text-white mb-4">
            Are you taking any medications?
          </Text>

          <View className="flex-row gap-8 mb-5">
            <RadioButton
              label="Yes"
              value="Yes"
              selected={form.medications === "Yes"}
              onPress={(value) => handleChange("medications", value)}
            />
            <RadioButton
              label="No"
              value="No"
              selected={form.medications === "No"}
              onPress={(value) => handleChange("medications", value)}
            />
          </View>

          <Text className="text-orange-400 mb-4">
            If yes, complete the following
          </Text>

          <View className="gap-4">
            <View className="flex-row gap-2">
              <TextInput
                value={form.med1}
                onChangeText={(text) => handleChange("med1", text)}
                placeholder="Name"
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
              <TextInput
                value={form.dose1}
                onChangeText={(text) => handleChange("dose1", text)}
                placeholder="Dosage/Frequency"
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
              <TextInput
                value={form.reason1}
                onChangeText={(text) => handleChange("reason1", text)}
                placeholder="Reason"
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
            </View>

            <View className="flex-row gap-2">
              <TextInput
                value={form.med2}
                onChangeText={(text) => handleChange("med2", text)}
                placeholder="Name"
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
              <TextInput
                value={form.dose2}
                onChangeText={(text) => handleChange("dose2", text)}
                placeholder="Dosage/Frequency"
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
              <TextInput
                value={form.reason2}
                onChangeText={(text) => handleChange("reason2", text)}
                placeholder="Reason"
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
            </View>

            <View className="flex-row gap-2">
              <TextInput
                value={form.med3}
                onChangeText={(text) => handleChange("med3", text)}
                placeholder="Name"
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
              <TextInput
                value={form.dose3}
                onChangeText={(text) => handleChange("dose3", text)}
                placeholder="Dosage/Frequency"
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
              <TextInput
                value={form.reason3}
                onChangeText={(text) => handleChange("reason3", text)}
                placeholder="Reason"
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
            </View>
          </View>
        </View>

        {/* Allergies */}
        <View className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <Text className="text-white mb-2">
            Please list any allergies
          </Text>
          <TextInput
            value={form.allergies}
            onChangeText={(text) => handleChange("allergies", text)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            style={{ color: 'white' }}
            placeholder="List your allergies"
            placeholderTextColor="#ffffff40"
          />
        </View>

        {/* Surgeries */}
        <View className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <Text className="text-white mb-4">
            Have you undergone any major surgeries/major accidents?
          </Text>

          <TextInput
            value={form.surgeries1}
            onChangeText={(text) => handleChange("surgeries1", text)}
            placeholder="1."
            placeholderTextColor="#ffffff40"
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-3"
            style={{ color: 'white' }}
          />

          <TextInput
            value={form.surgeries2}
            onChangeText={(text) => handleChange("surgeries2", text)}
            placeholder="2."
            placeholderTextColor="#ffffff40"
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-3"
            style={{ color: 'white' }}
          />

          <TextInput
            value={form.surgeries3}
            onChangeText={(text) => handleChange("surgeries3", text)}
            placeholder="3."
            placeholderTextColor="#ffffff40"
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            style={{ color: 'white' }}
          />
        </View>

        {/* Exercise Program */}
        <View className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <Text className="text-white mb-4">
            Are you currently involved in any exercise program?
          </Text>

          <View className="flex-row gap-8 mb-6">
            <RadioButton
              label="Yes"
              value="Yes"
              selected={form.exercise_program === "Yes"}
              onPress={(value) => handleChange("exercise_program", value)}
            />
            <RadioButton
              label="No"
              value="No"
              selected={form.exercise_program === "No"}
              onPress={(value) => handleChange("exercise_program", value)}
            />
          </View>

          <Text className="text-white mb-4">
            Are you involved in recreational sports?
          </Text>

          <View className="gap-4">
            <View className="flex-row gap-2">
              <TextInput
                value={form.sport1}
                onChangeText={(text) => handleChange("sport1", text)}
                placeholder="1."
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
              <TextInput
                value={form.sport4}
                onChangeText={(text) => handleChange("sport4", text)}
                placeholder="4."
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
            </View>

            <View className="flex-row gap-2">
              <TextInput
                value={form.sport2}
                onChangeText={(text) => handleChange("sport2", text)}
                placeholder="2."
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
              <TextInput
                value={form.sport5}
                onChangeText={(text) => handleChange("sport5", text)}
                placeholder="5."
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
            </View>

            <View className="flex-row gap-2">
              <TextInput
                value={form.sport3}
                onChangeText={(text) => handleChange("sport3", text)}
                placeholder="3."
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
              <TextInput
                value={form.sport6}
                onChangeText={(text) => handleChange("sport6", text)}
                placeholder="6."
                placeholderTextColor="#ffffff40"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />
            </View>
          </View>
        </View>

        {/* Lifestyle */}
        <View className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <Text className="text-orange-400 font-bold mb-5 uppercase tracking-wider">
            Lifestyle and Dietary Factors
          </Text>

          <Text className="text-white mb-4 font-semibold">
            Smoking and Alcohol Consumption
          </Text>

          <View className="gap-6 mb-6">
            <View>
              <Text className="text-white mb-2">Smoking</Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => handleChange("smoking", "Yes")}
                  className={`px-4 py-2 rounded-lg border ${form.smoking === "Yes" ? 'bg-orange-500 border-orange-500' : 'border-white/20'}`}
                >
                  <Text className="text-white">Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleChange("smoking", "No")}
                  className={`px-4 py-2 rounded-lg border ${form.smoking === "No" ? 'bg-orange-500 border-orange-500' : 'border-white/20'}`}
                >
                  <Text className="text-white">No</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-white mb-2">Alcohol</Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => handleChange("alcohol", "Yes")}
                  className={`px-4 py-2 rounded-lg border ${form.alcohol === "Yes" ? 'bg-orange-500 border-orange-500' : 'border-white/20'}`}
                >
                  <Text className="text-white">Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleChange("alcohol", "No")}
                  className={`px-4 py-2 rounded-lg border ${form.alcohol === "No" ? 'bg-orange-500 border-orange-500' : 'border-white/20'}`}
                >
                  <Text className="text-white">No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-white mb-3">
              Food Preference
            </Text>
            <View className="flex-row gap-8">
              <RadioButton
                label="Veg"
                value="Veg"
                selected={form.food_preference === "Veg"}
                onPress={(value) => handleChange("food_preference", value)}
              />
              <RadioButton
                label="Non-Veg"
                value="Non-Veg"
                selected={form.food_preference === "Non-Veg"}
                onPress={(value) => handleChange("food_preference", value)}
              />
            </View>
          </View>

          <View>
            <Text className="text-white mb-3">
              Do you take dietary supplements?
            </Text>
            <View className="flex-row gap-8">
              <RadioButton
                label="Yes"
                value="Yes"
                selected={form.supplements === "Yes"}
                onPress={(value) => handleChange("supplements", value)}
              />
              <RadioButton
                label="No"
                value="No"
                selected={form.supplements === "No"}
                onPress={(value) => handleChange("supplements", value)}
              />
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
            onPress={handleSubmit}
            className="flex-1 px-4 py-3 bg-orange-600 rounded-lg"
          >
            <Text className="text-white text-center font-bold">Next Step</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HealthHistoy;