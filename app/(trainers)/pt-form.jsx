import dayjs from "dayjs";
import { useRouter, useSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const defaultFormData = {
  member_id: "",
  u_id: "",
  name: "",
  email: "",
  phone: "",
  location: "",
  dob: "",
  age: "",
  height: "",
  weight: "",
  bmi: "",
  gender: "",
  blood_group: "",
  fitness_goal: "",
  emergency_contact_name: "",
  emergency_contact_relationship: "",
  emergency_contact_address: "",
  emergency_contact_phone_home: "",
  emergency_contact_phone_work: "",
  health_conditions: "",
  medications: "",
  allergies: "",
  exercise_habits: "",
  injury_history: "",
  resting_heart_rate: "",
  flexibility_notes: "",
  session_goals: "",
  planned_sessions: "",
  session_progress: "",
  trainer_name_assigned: "",
  participant_name: "",
  consent_agree: "",
  consent_signature: "",
  consent_date: "",
  guardian_signature: "",
  witness: "",
};

const steps = [
  { id: 1, title: "Member Info" },
  { id: 2, title: "Health History" },
  { id: 3, title: "Fitness Screening" },
  { id: 4, title: "Measurements" },
  { id: 5, title: "Review & Submit" },
];

export default function TrainerPTForm() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const memberIdFromUrl = searchParams?.member_id || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultFormData);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => {
      const name = (member.name || "").toLowerCase();
      const email = (member.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [members, search]);

  const fetchAssignedMembers = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/assignments?trainerUserId=${user.id}`);
      const raw = res.data || [];
      const mapped = raw
        .filter((item) => item.userId || item.user_id)
        .map((item) => ({
          id: item.userId || item.user_id,
          name: item.username || item.user_name || "Unknown",
          email: item.userEmail || item.user_email || "",
          trainerName: item.trainerName || item.trainer_name || "",
        }));
      setMembers(mapped);
      setAssignments(raw);
    } catch (error) {
      console.log("PT Form members load error:", error);
      Alert.alert("Unable to load members", "Please try again later.");
    }
  };

  const mergeConsentFromEnquiry = (saved, enquiry) => {
    if (!enquiry) return saved;
    const consentData =
      enquiry.consent_data && typeof enquiry.consent_data === "string"
        ? JSON.parse(enquiry.consent_data)
        : enquiry.consent_data || {};

    return {
      ...saved,
      participant_name:
        consentData.participant_name || enquiry.name || saved.participant_name,
      consent_agree: consentData.agree || saved.consent_agree,
      consent_signature: consentData.signature || saved.consent_signature,
      consent_date: consentData.date || saved.consent_date,
      guardian_signature:
        consentData.guardian_signature || saved.guardian_signature,
      witness: consentData.witness || saved.witness,
    };
  };

  const loadMemberData = async (memberId) => {
    if (!memberId) return;
    setLoading(true);

    try {
      const memberRes = await api.get(`/members/${memberId}`);
      const member = memberRes.data || {};

      const baseData = {
        ...defaultFormData,
        member_id: member.id || memberId,
        u_id: member.u_id || member.user_id || "",
        name: member.name || "",
        email: member.email || member.user_email || "",
        phone: member.phone || "",
        location: member.location || "",
        height: member.height || "",
        weight: member.weight || "",
        bmi: member.bmi || "",
        dob: member.dob ? dayjs(member.dob).format("YYYY-MM-DD") : "",
        age: member.age || "",
        address: member.address || "",
        employer: member.employer || "",
        occupation: member.occupation || "",
        emergency_contact_name: member.emergency_contact_name || "",
        emergency_contact_relationship:
          member.emergency_contact_relationship || "",
        emergency_contact_address: member.emergency_contact_address || "",
        emergency_contact_phone_home: member.emergency_contact_phone_home || "",
        emergency_contact_phone_work: member.emergency_contact_phone_work || "",
        fitness_goal: member.fitness_goal || "",
        blood_group: member.blood_group || "",
        gender: member.gender || "",
      };

      let savedForm = {};
      try {
        const ptRes = await api.get(`/pt-forms/${memberId}`);
        const stored = ptRes.data?.form_data;
        savedForm = stored
          ? typeof stored === "string"
            ? JSON.parse(stored)
            : stored
          : {};
      } catch (error) {
        // ignore if there is no PT form yet
      }

      let enquiryData = null;
      if (baseData.email) {
        try {
          const enquiryRes = await api.get(
            `/enquiries?email=${encodeURIComponent(baseData.email)}`,
          );
          const enquiries = Array.isArray(enquiryRes.data)
            ? enquiryRes.data
            : [];
          enquiryData = enquiries[0] || null;
        } catch (error) {
          // ignore missing enquiry
        }
      }

      const assigned = assignments.find(
        (item) =>
          String(item.userId || item.user_id) === String(baseData.u_id) ||
          String(item.gymMemberId) === String(baseData.member_id),
      );

      const trainerName =
        assigned?.trainerName || assigned?.trainer_name ||
        savedForm.trainer_name_assigned ||
        "";

      setFormData({
        ...baseData,
        ...savedForm,
        ...mergeConsentFromEnquiry(savedForm, enquiryData),
        trainer_name_assigned: trainerName,
      });
      setSelectedMemberId(memberId);
    } catch (error) {
      console.log("PT Form load member data error:", error);
      Alert.alert("Unable to load member", "Try selecting another member.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchAssignedMembers();
  }, [user?.id]);

  useEffect(() => {
    if (memberIdFromUrl) {
      loadMemberData(memberIdFromUrl);
    } else if (!selectedMemberId && members.length > 0) {
      setLoading(false);
    }
  }, [memberIdFromUrl, members]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMemberSelect = (member) => {
    setSearch("");
    setSelectedMemberId(member.id);
    loadMemberData(member.id);
  };

  const handleSave = async () => {
    if (!formData.member_id) {
      Alert.alert("Select Member", "Please select a member before saving.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/pt-forms", {
        member_id: formData.member_id,
        user_id: formData.u_id || formData.user_id,
        formData,
        completed: true,
      });

      Alert.alert("Saved", "PT form saved successfully.", [
        {
          text: "OK",
          onPress: () => router.push("/(trainers)/dashboard"),
        },
      ]);
    } catch (error) {
      console.log("PT Form save error:", error);
      Alert.alert(
        "Save failed",
        error?.response?.data?.error || error?.message || "Unable to save.",
      );
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSave();
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const renderField = ({
    label,
    value,
    name,
    placeholder,
    keyboardType,
    multiline,
  }) => (
    <View className="mb-4">
      <Text className="text-sm text-gray-300 mb-2">{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        onChangeText={(text) => updateField(name, text)}
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        className="bg-[#141414] text-white rounded-2xl border border-[#2a2a2a] px-4 py-3"
      />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <View className="mb-5">
              <Text className="text-white text-lg font-semibold mb-3">Assigned Member</Text>
              <TextInput
                value={search}
                placeholder="Search by name or email"
                placeholderTextColor="#6b7280"
                onChangeText={setSearch}
                className="bg-[#141414] text-white rounded-2xl border border-[#2a2a2a] px-4 py-3 mb-3"
              />
              {filteredMembers.length === 0 ? (
                <Text className="text-gray-400 text-sm">
                  No assigned members found.
                </Text>
              ) : (
                <View className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
                  {filteredMembers.slice(0, 10).map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      onPress={() => handleMemberSelect(member)}
                      className={`px-4 py-4 border-b border-[#2a2a2a] ${
                        member.id === selectedMemberId ? "bg-[#1f2937]" : "bg-[#0f0f0f]"
                      }`}
                    >
                      <Text className="text-white font-medium">{member.name}</Text>
                      <Text className="text-gray-400 text-xs mt-1">{member.email}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {selectedMemberId ? (
              <View className="space-y-3">
                {renderField({
                  label: "Member Name",
                  value: formData.name,
                  name: "name",
                  placeholder: "Enter full name",
                })}
                {renderField({
                  label: "Email",
                  value: formData.email,
                  name: "email",
                  placeholder: "example@mail.com",
                  keyboardType: "email-address",
                })}
                {renderField({
                  label: "Phone",
                  value: formData.phone,
                  name: "phone",
                  placeholder: "Enter phone number",
                  keyboardType: "phone-pad",
                })}
                {renderField({
                  label: "Date of Birth",
                  value: formData.dob,
                  name: "dob",
                  placeholder: "YYYY-MM-DD",
                  keyboardType: "default",
                })}
                {renderField({
                  label: "Gender",
                  value: formData.gender,
                  name: "gender",
                  placeholder: "Male / Female / Other",
                })}
                {renderField({
                  label: "Assigned Trainer",
                  value: formData.trainer_name_assigned,
                  name: "trainer_name_assigned",
                  placeholder: "Trainer name",
                })}
              </View>
            ) : (
              <Text className="text-gray-400">Select a member to prefill the PT form.</Text>
            )}
          </>
        );

      case 2:
        return (
          <>
            {renderField({
              label: "Health Conditions",
              value: formData.health_conditions,
              name: "health_conditions",
              placeholder: "Describe any medical conditions",
              multiline: true,
            })}
            {renderField({
              label: "Current Medications",
              value: formData.medications,
              name: "medications",
              placeholder: "Enter medications",
              multiline: true,
            })}
            {renderField({
              label: "Allergies",
              value: formData.allergies,
              name: "allergies",
              placeholder: "Enter allergies",
              multiline: true,
            })}
            {renderField({
              label: "Injury History",
              value: formData.injury_history,
              name: "injury_history",
              placeholder: "Describe previous injuries",
              multiline: true,
            })}
          </>
        );

      case 3:
        return (
          <>
            {renderField({
              label: "Exercise Habits",
              value: formData.exercise_habits,
              name: "exercise_habits",
              placeholder: "How often does the member exercise?",
              multiline: true,
            })}
            {renderField({
              label: "Resting Heart Rate",
              value: formData.resting_heart_rate,
              name: "resting_heart_rate",
              placeholder: "Enter resting heart rate",
              keyboardType: "numeric",
            })}
            {renderField({
              label: "Fitness Goals",
              value: formData.fitness_goal,
              name: "fitness_goal",
              placeholder: "What does the member want to achieve?",
              multiline: true,
            })}
          </>
        );

      case 4:
        return (
          <>
            {renderField({
              label: "Height (cm)",
              value: formData.height,
              name: "height",
              placeholder: "Enter height",
              keyboardType: "numeric",
            })}
            {renderField({
              label: "Weight (kg)",
              value: formData.weight,
              name: "weight",
              placeholder: "Enter weight",
              keyboardType: "numeric",
            })}
            {renderField({
              label: "BMI",
              value: formData.bmi,
              name: "bmi",
              placeholder: "Enter BMI",
              keyboardType: "numeric",
            })}
            {renderField({
              label: "Flexibility Notes",
              value: formData.flexibility_notes,
              name: "flexibility_notes",
              placeholder: "Describe flexibility and measurements",
              multiline: true,
            })}
            {renderField({
              label: "Planned Sessions",
              value: formData.planned_sessions,
              name: "planned_sessions",
              placeholder: "Enter sessions planned",
              multiline: true,
            })}
          </>
        );

      case 5:
        return (
          <View className="space-y-4">
            <View className="rounded-2xl border border-[#2a2a2a] bg-[#111827] p-4">
              <Text className="text-white font-semibold text-lg mb-3">Review</Text>
              <Text className="text-gray-300 text-sm">Member: {formData.name || "Not selected"}</Text>
              <Text className="text-gray-300 text-sm">Email: {formData.email || "—"}</Text>
              <Text className="text-gray-300 text-sm">Phone: {formData.phone || "—"}</Text>
              <Text className="text-gray-300 text-sm">Fitness Goal: {formData.fitness_goal || "—"}</Text>
              <Text className="text-gray-300 text-sm">Assigned Trainer: {formData.trainer_name_assigned || "—"}</Text>
            </View>

            <View className="rounded-2xl border border-[#2a2a2a] bg-[#111827] p-4 space-y-3">
              <Text className="text-white font-semibold text-lg">Session Summary</Text>
              <Text className="text-gray-300 text-sm">Planned Sessions: {formData.planned_sessions || "—"}</Text>
              <Text className="text-gray-300 text-sm">Progress Notes: {formData.session_progress || "—"}</Text>
            </View>

            {renderField({
              label: "Session Progress Notes",
              value: formData.session_progress,
              name: "session_progress",
              placeholder: "Add any notes about progress",
              multiline: true,
            })}
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-4 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-2xl font-bold">PT Registration</Text>
              <Text className="text-gray-400 text-sm mt-1">
                Fill the PT form and save to the backend.
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.back()} className="rounded-full border border-[#2a2a2a] px-4 py-2">
              <Text className="text-white">Back</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-semibold">Step {currentStep} of {steps.length}</Text>
              <Text className="text-gray-400 text-sm">{steps[currentStep - 1].title}</Text>
            </View>
            <View className="h-2 rounded-full bg-[#1f2937] overflow-hidden">
              <View
                className="h-full bg-orange-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 180 }}
            showsVerticalScrollIndicator={false}
          >
            {renderCurrentStep()}
          </ScrollView>

          <View className="absolute left-0 right-0 bottom-0 bg-[#0f0f0f] border-t border-[#1f2937] px-4 py-4">
            <View className="flex-row items-center justify-between gap-3">
              <TouchableOpacity
                onPress={goBack}
                className="flex-1 rounded-2xl border border-[#2a2a2a] bg-[#111827] px-4 py-3 items-center"
              >
                <Text className="text-white">{currentStep === 1 ? "Cancel" : "Previous"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={goNext}
                disabled={saving}
                className="flex-1 rounded-2xl bg-orange-500 px-4 py-3 items-center"
              >
                <Text className="text-black font-semibold">
                  {saving ? "Saving..." : currentStep === steps.length ? "Submit PT Form" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
