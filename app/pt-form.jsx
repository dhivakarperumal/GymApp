import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import FitnessScreening from "./(trainers)/PTForm/FitnessScreening";
import FlexibilityAndMeasurements from "./(trainers)/PTForm/FlexibilityAndMeasurements";
import HealthHistory2 from "./(trainers)/PTForm/HealthHistory2";
import HealthHistoy from "./(trainers)/PTForm/HealthHistoy";
import PTFormEnquiry from "./(trainers)/PTForm/PTFormEnquiry";
import SessionTracker from "./(trainers)/PTForm/SessionTracker";
import BackButton from "./BackButton";
import Header from "./Header";

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
                <PTFormEnquiry
                  formData={formData}
                  onNext={(data) => handleEnquirySubmit(data)}
                  onPrevious={() => router.back()}
                  isFirstStep={true}
                  isLastStep={false}
                  isModal={false}
                />
              )}

              {activeTab === "health1" && (
                <HealthHistoy
                  formData={formData}
                  onNext={(data) => handleHealthHistorySubmit(data)}
                  onPrevious={() => setActiveTab("enquiry")}
                  isFirstStep={false}
                />
              )}

              {activeTab === "health2" && (
                <HealthHistory2
                  formData={formData}
                  onNext={(data) => handleHealthHistory2Submit(data)}
                  onPrevious={() => setActiveTab("health1")}
                  isFirstStep={false}
                />
              )}

              {activeTab === "fitness" && (
                <FitnessScreening
                  initialData={formData}
                  onNext={(data) => handleFitnessSubmit(data)}
                  onPrevious={() => setActiveTab("health2")}
                  readOnly={true}
                />
              )}

              {activeTab === "flexibility" && (
                <FlexibilityAndMeasurements
                  formData={formData}
                  onNext={(data) => handleFlexibilitySubmit(data)}
                  onPrevious={() => setActiveTab("fitness")}
                  readOnly={true}
                />
              )}

              {activeTab === "sessions" && (
                <SessionTracker
                  formData={formData}
                  onNext={() => {} }
                  onPrevious={() => setActiveTab("flexibility")}
                  isFirstStep={false}
                  isLastStep={true}
                  readOnly={false}
                  userMode={true}
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
