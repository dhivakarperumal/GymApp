import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const HealthHistoryPage = ({ formData = {}, onNext, onPrevious, isFirstStep = false }) => {
  const [form, setForm] = useState({
    medications: "No",
    med1: "",
    dose1: "",
    reason1: "",
    med2: "",
    dose2: "",
    reason2: "",
    med3: "",
    dose3: "",
    reason3: "",
    allergies: "",
    surgeries1: "",
    surgeries2: "",
    surgeries3: "",
    exercise_program: "No",
    sport1: "",
    sport2: "",
    sport3: "",
    sport4: "",
    sport5: "",
    sport6: "",
    smoking: "",
    alcohol: "",
    food_preference: "",
    supplements: "",
  });

  useEffect(() => {
    if (formData) {
      setForm((prev) => ({ ...prev, ...formData }));
    }
  }, [formData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Health History</Text>

        <View className="bg-[#111] rounded-3xl p-5 space-y-4">
          <Text className="text-white/80">Taking medications?</Text>
          <View className="flex-row gap-3">
            {['Yes', 'No'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleChange('medications', option)}
                className={`px-4 py-3 rounded-2xl border ${form.medications === option ? 'border-orange-500 bg-orange-500/15' : 'border-white/20'}`}>
                <Text className="text-white">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="space-y-3">
            <Text className="text-white/80">Medication 1</Text>
            <TextInput
              value={form.med1}
              onChangeText={(text) => handleChange('med1', text)}
              placeholder="Name"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.dose1}
              onChangeText={(text) => handleChange('dose1', text)}
              placeholder="Dosage / Frequency"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.reason1}
              onChangeText={(text) => handleChange('reason1', text)}
              placeholder="Reason"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-3">
            <Text className="text-white/80">Medication 2</Text>
            <TextInput
              value={form.med2}
              onChangeText={(text) => handleChange('med2', text)}
              placeholder="Name"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.dose2}
              onChangeText={(text) => handleChange('dose2', text)}
              placeholder="Dosage / Frequency"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.reason2}
              onChangeText={(text) => handleChange('reason2', text)}
              placeholder="Reason"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-3">
            <Text className="text-white/80">Medication 3</Text>
            <TextInput
              value={form.med3}
              onChangeText={(text) => handleChange('med3', text)}
              placeholder="Name"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.dose3}
              onChangeText={(text) => handleChange('dose3', text)}
              placeholder="Dosage / Frequency"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.reason3}
              onChangeText={(text) => handleChange('reason3', text)}
              placeholder="Reason"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-4">
            <Text className="text-white/80">Allergies</Text>
            <TextInput
              value={form.allergies}
              onChangeText={(text) => handleChange('allergies', text)}
              placeholder="Allergies"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-4">
            <Text className="text-white/80">Surgeries / Accidents</Text>
            <TextInput
              value={form.surgeries1}
              onChangeText={(text) => handleChange('surgeries1', text)}
              placeholder="1"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.surgeries2}
              onChangeText={(text) => handleChange('surgeries2', text)}
              placeholder="2"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.surgeries3}
              onChangeText={(text) => handleChange('surgeries3', text)}
              placeholder="3"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-4">
            <Text className="text-white/80">Exercise program</Text>
            <View className="flex-row gap-3">
              {['Yes', 'No'].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleChange('exercise_program', option)}
                  className={`px-4 py-3 rounded-2xl border ${form.exercise_program === option ? 'border-orange-500 bg-orange-500/15' : 'border-white/20'}`}>
                  <Text className="text-white">{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="space-y-3">
            <Text className="text-white/80">Sports / Activities</Text>
            {['sport1', 'sport2', 'sport3', 'sport4', 'sport5', 'sport6'].map((field, index) => (
              <TextInput
                key={field}
                value={form[field]}
                onChangeText={(text) => handleChange(field, text)}
                placeholder={`Sport ${index + 1}`}
                placeholderTextColor="#999"
                className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
              />
            ))}
          </View>

          <View className="space-y-3">
            <Text className="text-white/80">Smoking</Text>
            <TextInput
              value={form.smoking}
              onChangeText={(text) => handleChange('smoking', text)}
              placeholder="Smoking"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-3">
            <Text className="text-white/80">Alcohol</Text>
            <TextInput
              value={form.alcohol}
              onChangeText={(text) => handleChange('alcohol', text)}
              placeholder="Alcohol"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-3">
            <Text className="text-white/80">Food Preference</Text>
            <TextInput
              value={form.food_preference}
              onChangeText={(text) => handleChange('food_preference', text)}
              placeholder="Food Preference"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="space-y-3">
            <Text className="text-white/80">Supplements</Text>
            <TextInput
              value={form.supplements}
              onChangeText={(text) => handleChange('supplements', text)}
              placeholder="Supplements"
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

export default HealthHistoryPage;
