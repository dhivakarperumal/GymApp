import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const InformedConsent = ({ onNext, onPrevious, initialData = {} }) => {
  const [form, setForm] = useState({
    consent_read: initialData.consent_read || false,
    consent_agreed: initialData.consent_agreed || false,
    consent_understand: initialData.consent_understand || false,
  });

  const [errors, setErrors] = useState({});

  const handleToggleConsent = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.consent_read) {
      newErrors.consent_read = "Please confirm you have read the consent form";
    }
    if (!form.consent_agreed) {
      newErrors.consent_agreed = "Please agree to the terms";
    }
    if (!form.consent_understand) {
      newErrors.consent_understand = "Please confirm you understand the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext?.({ ...form });
    }
  };

  const CheckboxItem = ({ label, value, field, description }) => (
    <TouchableOpacity
      onPress={() => handleToggleConsent(field)}
      className="mb-4"
    >
      <View className="flex-row items-start">
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: value ? "#f97316" : "#4b5563",
            backgroundColor: value ? "#f97316" : "transparent",
            marginRight: 12,
            marginTop: 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm mb-1">
            {label}
          </Text>
          {description && (
            <Text className="text-gray-400 text-xs">{description}</Text>
          )}
        </View>
      </View>
      {errors[field] && (
        <Text className="text-red-500 text-xs mt-1 ml-8">
          {errors[field]}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-[#0f0f0f]" showsVerticalScrollIndicator={false}>
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-white mb-2">
          Informed Consent
        </Text>
        <Text className="text-gray-400 text-sm mb-6">
          Please read and acknowledge our terms
        </Text>

        <View className="bg-[#1a1a1a] rounded-lg p-4 mb-6 border border-[#262626]">
          <Text className="text-white font-semibold mb-3">
            Health & Safety Information
          </Text>
          <Text className="text-gray-300 text-sm leading-6 mb-3">
            By participating in our fitness program, you acknowledge that you have:
          </Text>
          <Text className="text-gray-400 text-xs leading-5">
            • Consulted with a healthcare provider regarding your fitness level{"\n"}
            • Disclosed all relevant medical conditions and medications{"\n"}
            • Understood the risks associated with physical exercise{"\n"}
            • Agreed to follow all safety guidelines provided{"\n"}
            • Understand that fitness activities carry inherent risks of injury{"\n"}
          </Text>
        </View>

        <View className="mb-8">
          <CheckboxItem
            field="consent_read"
            value={form.consent_read}
            label="I have read and understand the health information"
            description="Confirm that you have carefully reviewed the consent form"
          />

          <CheckboxItem
            field="consent_agreed"
            value={form.consent_agreed}
            label="I agree to the terms and conditions"
            description="I consent to participate in the fitness program"
          />

          <CheckboxItem
            field="consent_understand"
            value={form.consent_understand}
            label="I understand the risks and assume responsibility"
            description="I understand potential risks and take full responsibility"
          />
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onPrevious}
            className="flex-1 border border-[#404040] rounded-lg py-3 items-center justify-center"
          >
            <Text className="text-white font-semibold">Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className={`flex-1 rounded-lg py-3 items-center justify-center ${
              form.consent_read && form.consent_agreed && form.consent_understand
                ? "bg-orange-600"
                : "bg-gray-700 opacity-50"
            }`}
            disabled={
              !(
                form.consent_read &&
                form.consent_agreed &&
                form.consent_understand
              )
            }
          >
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default InformedConsent;
