import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const EnquiryFormPage = ({ formData = {}, onNext, onPrevious, isFirstStep = false }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    age: "",
    blood_group: "",
    gender: "",
    address: "",
    employer: "",
    occupation: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_address: "",
    emergency_contact_phone_home: "",
    emergency_contact_phone_work: "",
    fitness_goal: "",
    message: "",
    height: "",
    weight: "",
    bmi: "",
  });

  useEffect(() => {
    if (formData) {
      setForm((prev) => ({
        ...prev,
        ...formData,
        dob: formData.dob || "",
        age: formData.age || "",
      }));
    }
  }, [formData]);

  useEffect(() => {
    if (form.height && form.weight) {
      const heightInMeters = parseFloat(form.height) / 100;
      const weightKg = parseFloat(form.weight);
      if (heightInMeters > 0 && weightKg > 0) {
        const bmiValue = (weightKg / (heightInMeters * heightInMeters)).toFixed(1);
        setForm((prev) => ({ ...prev, bmi: bmiValue }));
        return;
      }
    }
    setForm((prev) => ({ ...prev, bmi: "" }));
  }, [form.height, form.weight]);

  useEffect(() => {
    if (form.dob) {
      const parts = form.dob.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts.map((value) => parseInt(value, 10));
        const dobDate = new Date(year, month - 1, day);
        if (!Number.isNaN(dobDate.getTime())) {
          const ageValue = new Date().getFullYear() - dobDate.getFullYear();
          setForm((prev) => ({ ...prev, age: ageValue >= 0 ? String(ageValue) : "" }));
        }
      }
    }
  }, [form.dob]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Enquiry Form</Text>

        <View className="space-y-4">
          <Text className="text-white/80">Name</Text>
          <TextInput
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
            placeholder="Name"
            placeholderTextColor="#999"
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
          />
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Email</Text>
          <TextInput
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
          />
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Phone</Text>
          <TextInput
            value={form.phone}
            onChangeText={(text) => handleChange("phone", text)}
            placeholder="Phone"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 space-y-4">
            <Text className="text-white/80">DOB (YYYY-MM-DD)</Text>
            <TextInput
              value={form.dob}
              onChangeText={(text) => handleChange("dob", text)}
              placeholder="2024-01-01"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>
          <View className="flex-1 space-y-4">
            <Text className="text-white/80">Age</Text>
            <TextInput
              value={form.age}
              onChangeText={(text) => handleChange("age", text)}
              placeholder="Age"
              placeholderTextColor="#999"
              keyboardType="numeric"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 space-y-4">
            <Text className="text-white/80">Height (cm)</Text>
            <TextInput
              value={form.height}
              onChangeText={(text) => handleChange("height", text)}
              placeholder="Height"
              placeholderTextColor="#999"
              keyboardType="numeric"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>
          <View className="flex-1 space-y-4">
            <Text className="text-white/80">Weight (kg)</Text>
            <TextInput
              value={form.weight}
              onChangeText={(text) => handleChange("weight", text)}
              placeholder="Weight"
              placeholderTextColor="#999"
              keyboardType="numeric"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 space-y-4">
            <Text className="text-white/80">BMI</Text>
            <TextInput
              value={form.bmi}
              editable={false}
              placeholder="BMI"
              placeholderTextColor="#999"
              className="bg-[#111] text-white p-4 rounded-2xl"
            />
          </View>
          <View className="flex-1 space-y-4">
            <Text className="text-white/80">Blood Group</Text>
            <TextInput
              value={form.blood_group}
              onChangeText={(text) => handleChange("blood_group", text)}
              placeholder="Blood Group"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Gender</Text>
          <TextInput
            value={form.gender}
            onChangeText={(text) => handleChange("gender", text)}
            placeholder="Gender"
            placeholderTextColor="#999"
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
          />
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Address</Text>
          <TextInput
            value={form.address}
            onChangeText={(text) => handleChange("address", text)}
            placeholder="Address"
            placeholderTextColor="#999"
            multiline
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl h-24"
          />
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Employer</Text>
          <TextInput
            value={form.employer}
            onChangeText={(text) => handleChange("employer", text)}
            placeholder="Employer"
            placeholderTextColor="#999"
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
          />
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Occupation</Text>
          <TextInput
            value={form.occupation}
            onChangeText={(text) => handleChange("occupation", text)}
            placeholder="Occupation"
            placeholderTextColor="#999"
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
          />
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Emergency Contact Name</Text>
          <TextInput
            value={form.emergency_contact_name}
            onChangeText={(text) => handleChange("emergency_contact_name", text)}
            placeholder="Contact Name"
            placeholderTextColor="#999"
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
          />
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Relationship</Text>
          <TextInput
            value={form.emergency_contact_relationship}
            onChangeText={(text) => handleChange("emergency_contact_relationship", text)}
            placeholder="Relationship"
            placeholderTextColor="#999"
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
          />
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Emergency Contact Address</Text>
          <TextInput
            value={form.emergency_contact_address}
            onChangeText={(text) => handleChange("emergency_contact_address", text)}
            placeholder="Contact Address"
            placeholderTextColor="#999"
            multiline
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl h-24"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 space-y-4">
            <Text className="text-white/80">Contact Phone Home</Text>
            <TextInput
              value={form.emergency_contact_phone_home}
              onChangeText={(text) => handleChange("emergency_contact_phone_home", text)}
              placeholder="Home Phone"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>
          <View className="flex-1 space-y-4">
            <Text className="text-white/80">Contact Phone Work</Text>
            <TextInput
              value={form.emergency_contact_phone_work}
              onChangeText={(text) => handleChange("emergency_contact_phone_work", text)}
              placeholder="Work Phone"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Fitness Goal</Text>
          <TextInput
            value={form.fitness_goal}
            onChangeText={(text) => handleChange("fitness_goal", text)}
            placeholder="Fitness Goal"
            placeholderTextColor="#999"
            multiline
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl h-24"
          />
        </View>

        <View className="space-y-4">
          <Text className="text-white/80">Additional Notes</Text>
          <TextInput
            value={form.message}
            onChangeText={(text) => handleChange("message", text)}
            placeholder="Message"
            placeholderTextColor="#999"
            multiline
            className="bg-[#1a1a1a] text-white p-4 rounded-2xl h-24"
          />
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

export default EnquiryFormPage;
