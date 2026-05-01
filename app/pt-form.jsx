import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import BackButton from "./BackButton";
import Header from "./Header";
import EnquiryFormPage from "./pt-form-user/EnquiryFormPage";
import HealthHistory2Page from "./pt-form-user/HealthHistory2Page";
import HealthHistoryPage from "./pt-form-user/HealthHistoryPage";

const tabs = [
  { key: "enquiry", label: "Enquiry Form" },
  { key: "health1", label: "Health History" },
  { key: "health2", label: "Health History 2" },
  { key: "fitness", label: "Fitness Screening" },
  { key: "flexibility", label: "Flexibility & Measurements" },
  { key: "sessions", label: "Session Tracker" },
];

const safeParse = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const buildInitialForm = (userData, memberData) => ({
  name: memberData?.name || userData.username || "",
  email: userData.email || "",
  phone: memberData?.phone || userData.mobile || "",
  dob: memberData?.dob || "",
  age: memberData?.age || "",
  blood_group: memberData?.blood_group || "",
  gender: memberData?.gender || "",
  address: memberData?.address || "",
  employer: memberData?.employer || "",
  occupation: memberData?.occupation || "",
  emergency_contact_name: memberData?.emergency_contact_name || "",
  emergency_contact_relationship: memberData?.emergency_contact_relationship || "",
  emergency_contact_address: memberData?.emergency_contact_address || "",
  emergency_contact_phone_home: memberData?.emergency_contact_phone_home || "",
  emergency_contact_phone_work: memberData?.emergency_contact_phone_work || "",
  fitness_goal: memberData?.fitness_goal || "",
  message: memberData?.message || "",
  height: memberData?.height || "",
  weight: memberData?.weight || "",
  bmi: memberData?.bmi || "",
  medications: memberData?.medications || "",
  med1: memberData?.med1 || "",
  dose1: memberData?.dose1 || "",
  reason1: memberData?.reason1 || "",
  med2: memberData?.med2 || "",
  dose2: memberData?.dose2 || "",
  reason2: memberData?.reason2 || "",
  med3: memberData?.med3 || "",
  dose3: memberData?.dose3 || "",
  reason3: memberData?.reason3 || "",
  allergies: memberData?.allergies || "",
  surgeries1: memberData?.surgeries1 || "",
  surgeries2: memberData?.surgeries2 || "",
  surgeries3: memberData?.surgeries3 || "",
  exercise_program: memberData?.exercise_program || "",
  sport1: memberData?.sport1 || "",
  sport2: memberData?.sport2 || "",
  sport3: memberData?.sport3 || "",
  sport4: memberData?.sport4 || "",
  sport5: memberData?.sport5 || "",
  sport6: memberData?.sport6 || "",
  smoking: memberData?.smoking || "",
  alcohol: memberData?.alcohol || "",
  food_preference: memberData?.food_preference || "",
  supplements: memberData?.supplements || "",
  bp: memberData?.bp || "",
  sugar: memberData?.sugar || "",
  cholesterol: memberData?.cholesterol || "",
  thyroid: memberData?.thyroid || "",
  uric: memberData?.uric || "",
  serum3d: memberData?.serum3d || "",
  sessions: memberData?.sessions || [
    {
      session_no: 1,
      date: "",
      workout: "",
      status: "Completed",
      client_sign: userData.username || userData.name || "",
      trainer_sign: userData.username || userData.name || "",
      approved_by: userData.username || userData.name || "",
    },
  ],
  ...memberData,
});

export default function PTFormUser() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("enquiry");
  const [formData, setFormData] = useState({});
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEnquiry, setHasEnquiry] = useState(false);

  useEffect(() => {
    fetchUserFormData();
  }, [user]);

  const fetchUserFormData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [memberRes, enquiryRes] = await Promise.allSettled([
        api.get(`/members/user/${user.id}`),
        api.get("/enquiries"),
      ]);

      let memberData = null;
      if (memberRes.status === "fulfilled" && memberRes.value?.data) {
        const fetchedMember = memberRes.value.data;
        memberData = fetchedMember;
        setMember(memberData);
      }

      const enquiries =
        enquiryRes.status === "fulfilled" && Array.isArray(enquiryRes.value.data)
          ? enquiryRes.value.data
          : [];
      const userEnquiry = enquiries.find((entry) => entry.email === user.email);
      setHasEnquiry(!!userEnquiry);

      let initialForm = buildInitialForm(user, memberData);
      if (memberData?.id) {
        try {
          const ptRes = await api.get(`/pt-forms/${memberData.id}`);
          if (ptRes.data && ptRes.data.form_data) {
            const savedData = safeParse(ptRes.data.form_data);
            initialForm = { ...initialForm, ...savedData };
            if (!hasEnquiry) {
              setHasEnquiry(!!savedData.name || !!savedData.email);
            }
          }
        } catch (error) {
          console.log("No saved PT form available", error);
        }
      }

      setFormData(initialForm);
    } catch (err) {
      console.error("Failed to load PT form data", err);
    } finally {
      setLoading(false);
    }
  };

  const savePtForm = async (updatedData) => {
    if (!member?.id) {
      Toast.show({
        type: "error",
        text1: "Unable to save",
        text2: "Your account is not linked to a gym member record.",
      });
      return;
    }

    try {
      await api.post("/pt-forms", {
        member_id: member.id,
        user_id: user.id,
        formData: updatedData,
      });
      setFormData(updatedData);
      Toast.show({
        type: "success",
        text1: "PT Form Saved",
        text2: "Your PT form data has been saved.",
      });
    } catch (err) {
      console.error("Failed to save PT form", err);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: err.response?.data?.message || "Unable to save PT form.",
      });
    }
  };

  const handleEnquirySubmit = async (data) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (!hasEnquiry) {
      try {
        await api.post("/enquiries", data);
        setHasEnquiry(true);
      } catch (err) {
        console.log("Enquiry post failed", err);
      }
    }

    if (member?.id) {
      await savePtForm(updatedData);
    }
    setActiveTab("health1");
  };

  const handleHealthHistorySubmit = async (data) => {
    const updatedData = { ...formData, ...data };
    await savePtForm(updatedData);
    setActiveTab("health2");
  };

  const handleHealthHistory2Submit = async (data) => {
    const updatedData = { ...formData, ...data };
    await savePtForm(updatedData);
    setActiveTab("fitness");
  };

  const handleFitnessSubmit = async (data) => {
    const updatedData = { ...formData, ...data };
    await savePtForm(updatedData);
    setActiveTab("flexibility");
  };

  const handleFlexibilitySubmit = async (data) => {
    const updatedData = { ...formData, ...data };
    await savePtForm(updatedData);
    setActiveTab("sessions");
  };

  const handleSessionSaved = (updated) => {
    setFormData(updated);
    Toast.show({
      type: "success",
      text1: "Sessions Updated",
      text2: "Session tracker was saved successfully.",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        <BackButton style={{ marginTop: 20 }} />
        <Text className="text-white text-3xl font-bold mt-7 mb-4">PT Form</Text>

        <View className="bg-[#111] rounded-3xl p-5 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">PT Form Tabs</Text>
          <Text className="text-gray-400 mb-4">
            Use the tabs below to move between the enquiry form, health history, medical data, fitness screening, flexibility tests, and session tracker.
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`px-4 py-3 rounded-full border ${
                  activeTab === tab.key
                    ? "border-orange-500 bg-orange-500/20"
                    : "border-white/20 bg-white/5"
                }`}
              >
                <Text className={`text-sm font-semibold ${activeTab === tab.key ? "text-orange-300" : "text-white"}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!member?.id && (
            <View className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-4">
              <Text className="text-yellow-200">
                Your account is not linked to a gym member record yet. The PT form will still load, but some save actions may not complete until you are linked.
              </Text>
            </View>
          )}

          {loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-white mt-4">Loading PT form data...</Text>
            </View>
          ) : (
            <View>
              {activeTab === "enquiry" && (
                <EnquiryFormPage
                  formData={formData}
                  onNext={(data) => handleEnquirySubmit(data)}
                  onPrevious={() => router.back()}
                  isFirstStep={true}
                  isLastStep={false}
                />
              )}

              {activeTab === "health1" && (
                <HealthHistoryPage
                  formData={formData}
                  onNext={(data) => handleHealthHistorySubmit(data)}
                  onPrevious={() => setActiveTab("enquiry")}
                  isFirstStep={false}
                />
              )}

              {activeTab === "health2" && (
                <HealthHistory2Page
                  formData={formData}
                  onNext={(data) => handleHealthHistory2Submit(data)}
                  onPrevious={() => setActiveTab("health1")}
                  isFirstStep={false}
                />
              )}

              {activeTab === "fitness" && (
                <FitnessScreeningPage
                  formData={formData}
                  onNext={(data) => handleFitnessSubmit(data)}
                  onPrevious={() => setActiveTab("health2")}
                />
              )}

              {activeTab === "flexibility" && (
                <FlexibilityAndMeasurementsPage
                  formData={formData}
                  onNext={(data) => handleFlexibilitySubmit(data)}
                  onPrevious={() => setActiveTab("fitness")}
                />
              )}

              {activeTab === "sessions" && (
                <SessionTrackerPage
                  formData={formData}
                  onPrevious={() => setActiveTab("flexibility")}
                  onSaved={handleSessionSaved}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const EnquiryFormPage = ({ formData = {}, onNext, onPrevious, isFirstStep, isLastStep }) => {
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
      setForm((prev) => ({ ...prev, ...formData }));
    }
  }, [formData]);

  useEffect(() => {
    if (form.height && form.weight) {
      const heightInMeters = parseFloat(form.height) / 100;
      const weightKg = parseFloat(form.weight);
      if (heightInMeters > 0 && weightKg > 0) {
        const bmiValue = (weightKg / (heightInMeters * heightInMeters)).toFixed(1);
        setForm((prev) => ({ ...prev, bmi: bmiValue }));
      }
    }
  }, [form.height, form.weight]);

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
          <Text className="text-white/80">Blood Group</Text>
          <TextInput
            value={form.blood_group}
            onChangeText={(text) => handleChange("blood_group", text)}
            placeholder="Blood Group"
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
          <Text className="text-white/80">Message</Text>
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

const HealthHistoryPage = ({ formData = {}, onNext, onPrevious, isFirstStep }) => {
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
            {['Yes','No'].map((option) => (
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
              {['Yes','No'].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleChange('exercise_program', option)}
                  className={`px-4 py-3 rounded-2xl border ${form.exercise_program === option ? 'border-orange-500 bg-orange-500/15' : 'border-white/20'}`}>
                  <Text className="text-white">{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-col gap-3">
            <TextInput
              value={form.sport1}
              onChangeText={(text) => handleChange('sport1', text)}
              placeholder="Sport 1"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.sport2}
              onChangeText={(text) => handleChange('sport2', text)}
              placeholder="Sport 2"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.sport3}
              onChangeText={(text) => handleChange('sport3', text)}
              placeholder="Sport 3"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.sport4}
              onChangeText={(text) => handleChange('sport4', text)}
              placeholder="Sport 4"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.sport5}
              onChangeText={(text) => handleChange('sport5', text)}
              placeholder="Sport 5"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.sport6}
              onChangeText={(text) => handleChange('sport6', text)}
              placeholder="Sport 6"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
          </View>

          <View className="flex-col gap-3">
            <TextInput
              value={form.smoking}
              onChangeText={(text) => handleChange('smoking', text)}
              placeholder="Smoking"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.alcohol}
              onChangeText={(text) => handleChange('alcohol', text)}
              placeholder="Alcohol"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
            <TextInput
              value={form.food_preference}
              onChangeText={(text) => handleChange('food_preference', text)}
              placeholder="Food preference"
              placeholderTextColor="#999"
              className="bg-[#1a1a1a] text-white p-4 rounded-2xl"
            />
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

const HealthHistory2Page = ({ formData = {}, onNext, onPrevious, isFirstStep }) => {
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
                {['Yes','No'].map((option) => (
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
                  placeholder="List specifies"
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

const FitnessScreeningPage = ({ formData = {}, onNext, onPrevious }) => {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Fitness Screening</Text>

        <View className="bg-[#111] rounded-3xl p-5 space-y-4">
          {[
            { label: 'Height', value: formData.height },
            { label: 'Weight', value: formData.weight },
            { label: 'Resting HR', value: formData.resting_hr },
            { label: 'Fat %', value: formData.fat_percentage },
            { label: 'Fat Level', value: formData.fat_level },
            { label: 'Speed (km)', value: formData.speed_km },
            { label: 'Heart Rate', value: formData.heart_rate },
          ].map((field) => (
            <View key={field.label} className="space-y-2">
              <Text className="text-white/80">{field.label}</Text>
              <Text className="bg-[#1a1a1a] text-white p-4 rounded-2xl">{field.value || '-'}</Text>
            </View>
          ))}

          {[
            { label: 'Push Ups', count: formData.push_ups_count, level: formData.push_ups_level },
            { label: 'Squats', count: formData.squats_count, level: formData.squats_level },
            { label: 'Plank Hold', count: formData.plank_hold_count, level: formData.plank_hold_level },
            { label: 'Shoulder', count: formData.shoulder_count, level: formData.shoulder_level },
            { label: 'Biceps', count: formData.biceps_count, level: formData.biceps_level },
            { label: 'Triceps', count: formData.triceps_count, level: formData.triceps_level },
            { label: 'Curl Ups', count: formData.curl_ups_count, level: formData.curl_ups_level },
          ].map((item) => (
            <View key={item.label} className="bg-[#1a1a1a] rounded-2xl p-4">
              <Text className="text-white/80 mb-2">{item.label}</Text>
              <Text className="text-white">Count: {item.count || '-'}</Text>
              <Text className="text-white">Level: {item.level || '-'}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity onPress={onPrevious} className="flex-1 bg-gray-700 rounded-2xl p-4">
            <Text className="text-white text-center">Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNext(formData)} className="flex-1 bg-orange-600 rounded-2xl p-4">
            <Text className="text-white text-center">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const FlexibilityAndMeasurementsPage = ({ formData = {}, onNext, onPrevious }) => {
  const measurements = formData.measurements || [
    { date: '', height: '', weight: '', neck: '', shoulder: '', arm: '', chest_normal: '', chest_expanded: '', waist: '', abdomen: '', hip: '', thigh: '', calf: '', lat: '' },
  ];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Flexibility & Measurements</Text>

        <View className="bg-[#111] rounded-3xl p-5 space-y-4">
          {[
            { label: 'Apley Test', value: formData.flex_apley_test },
            { label: 'YMCA Value', value: formData.flex_ymca_val },
            { label: 'YMCA Result', value: formData.flex_ymca_test },
            { label: 'Knee Value', value: formData.flex_knee_val },
            { label: 'Knee Result', value: formData.flex_knee_test },
          ].map((field) => (
            <View key={field.label} className="space-y-2">
              <Text className="text-white/80">{field.label}</Text>
              <Text className="bg-[#1a1a1a] text-white p-4 rounded-2xl">{field.value || '-'}</Text>
            </View>
          ))}

          <Text className="text-white/80">Measurements</Text>
          {measurements.map((item, index) => (
            <View key={index} className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
              <Text className="text-white/80">Session {index + 1}</Text>
              {Object.entries(item).map(([key, value]) => (
                <View key={key} className="flex-row justify-between">
                  <Text className="text-white/80">{key.replace(/_/g, ' ')}</Text>
                  <Text className="text-white">{value || '-'}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity onPress={onPrevious} className="flex-1 bg-gray-700 rounded-2xl p-4">
            <Text className="text-white text-center">Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNext(formData)} className="flex-1 bg-orange-600 rounded-2xl p-4">
            <Text className="text-white text-center">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const SessionTrackerPage = ({ formData = {}, onPrevious, onSaved }) => {
  const { user } = useAuth();
  const username = user?.username || user?.name || "User";
  const [sessions, setSessions] = useState(
    formData.sessions?.length > 0
      ? formData.sessions
      : [
          {
            session_no: 1,
            date: "",
            workout: "",
            status: "Completed",
            client_sign: username,
            trainer_sign: username,
          },
        ]
  );

  useEffect(() => {
    if (formData.sessions?.length > 0) {
      setSessions(formData.sessions.map((session) => ({
        ...session,
        client_sign: session.client_sign || username,
        trainer_sign: session.trainer_sign || username,
      })));
    }
  }, [formData.sessions, username]);

  const markCompleted = (index) => {
    const nextSessions = [...sessions];
    nextSessions[index] = {
      ...nextSessions[index],
      status: "Completed",
      client_sign: username,
      trainer_sign: username,
    };
    setSessions(nextSessions);
  };

  const handleSave = () => {
    const updated = { ...formData, sessions };
    onSaved(updated);
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Session Tracker</Text>

        <View className="bg-[#111] rounded-3xl p-5 space-y-4">
          {sessions.map((session, index) => (
            <View key={index} className="bg-[#1a1a1a] rounded-3xl p-4 space-y-3">
              <Text className="text-white font-semibold">Session {session.session_no}</Text>
              <View className="space-y-2">
                <Text className="text-white/80">Status</Text>
                <Text className="bg-[#000] text-white p-3 rounded-2xl">{session.status}</Text>
              </View>
              <View className="space-y-2">
                <Text className="text-white/80">Client Sign</Text>
                <Text className="bg-[#000] text-white p-3 rounded-2xl">{session.client_sign || username}</Text>
              </View>
              <View className="space-y-2">
                <Text className="text-white/80">Trainer Sign</Text>
                <Text className="bg-[#000] text-white p-3 rounded-2xl">{session.trainer_sign || username}</Text>
              </View>
              <TouchableOpacity
                onPress={() => markCompleted(index)}
                className={`px-4 py-3 rounded-2xl ${session.status === 'Completed' ? 'bg-green-600' : 'bg-orange-600'}`}>
                <Text className="text-white text-center">
                  {session.status === 'Completed' ? 'Completed' : 'Mark Completed'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity onPress={onPrevious} className="flex-1 bg-gray-700 rounded-2xl p-4">
            <Text className="text-white text-center">Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} className="flex-1 bg-orange-600 rounded-2xl p-4">
            <Text className="text-white text-center">Save Sessions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
