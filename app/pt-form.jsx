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
import EnquiryFormPage from "./pt-form-user/EnquiryFormPage";
import FitnessScreeningPage from "./pt-form-user/FitnessScreeningPage";
import HealthHistory2Page from "./pt-form-user/HealthHistory2Page";
import HealthHistoryPage from "./pt-form-user/HealthHistoryPage";
import SessionTrackerPage from "./pt-form-user/SessionTrackerPage";
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

  const handleSessionSaved = async (updated) => {
    try {
      await savePtForm(updated);
      setFormData(updated);
      Toast.show({
        type: "success",
        text1: "Sessions Updated",
        text2: "Session tracker was saved successfully.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Unable to save session updates.",
      });
      console.error("Failed to save session tracker", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      {/* HEADER */}
      <View style={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: "#000",
        borderBottomWidth: 1,
        borderBottomColor: "#111",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Left: Back + Title */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <BackButton style={{ marginRight: 12 }} />
          <View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>PT Form</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Personal Training Record</Text>
          </View>
        </View>

        {/* Right: Icon */}
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: "#e11d1d",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#e11d1d",
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 8,
        }}>
          <Text style={{ fontSize: 20 }}>🏋️</Text>
        </View>
      </View>

      {/* HORIZONTAL SCROLLABLE TAB BAR */}
      <View style={{ backgroundColor: "#000", borderBottomWidth: 1, borderBottomColor: "#111" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: activeTab === tab.key ? "#e11d1d" : "#111",
                borderWidth: 1,
                borderColor: activeTab === tab.key ? "#e11d1d" : "#222",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                shadowColor: activeTab === tab.key ? "#e11d1d" : "transparent",
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: activeTab === tab.key ? 6 : 0,
              }}
            >
              <Text style={{ color: "#aaa", fontSize: 11, fontWeight: "700" }}>
                {index + 1}
              </Text>
              <Text style={{
                color: activeTab === tab.key ? "#fff" : "#6b7280",
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PROGRESS BAR */}
        <View style={{ height: 2, backgroundColor: "#111", marginHorizontal: 16, marginBottom: 2, borderRadius: 2 }}>
          <View style={{
            height: 2,
            backgroundColor: "#e11d1d",
            borderRadius: 2,
            width: `${((tabs.findIndex(t => t.key === activeTab) + 1) / tabs.length) * 100}%`,
          }} />
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {!member?.id && (
          <View style={{
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#f59e0b44",
            backgroundColor: "#f59e0b11",
            padding: 14,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
          }}>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
            <Text style={{ color: "#fcd34d", fontSize: 13, flex: 1, lineHeight: 20 }}>
              Your account is not linked to a gym member record yet. PT form will load but save actions may not complete until you&apos;re linked.
            </Text>
          </View>
        )}

        {loading ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
            <ActivityIndicator size="large" color="#e11d1d" />
            <Text style={{ color: "#6b7280", marginTop: 16, fontSize: 14 }}>Loading PT form data...</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}


const FlexibilityAndMeasurementsPage = ({ formData = {}, onNext, onPrevious }) => {
  const [localFormData, setLocalFormData] = useState({
    flex_apley_test: "",
    flex_ymca_val: "",
    flex_ymca_test: "",
    flex_knee_val: "",
    flex_knee_test: "",
    measurements: Array(5).fill({
      date: "",
      height: "",
      weight: "",
      neck: "",
      shoulder: "",
      arm: "",
      chest_normal: "",
      chest_expanded: "",
      waist: "",
      abdomen: "",
      hip: "",
      thigh: "",
      calf: "",
      lat: "",
    })
  });

  useEffect(() => {
    if (formData) {
      setLocalFormData((prev) => ({
        ...prev,
        flex_apley_test: String(formData.flex_apley_test || "").trim(),
        flex_ymca_val: formData.flex_ymca_val || "",
        flex_ymca_test: String(formData.flex_ymca_test || "").trim(),
        flex_knee_val: formData.flex_knee_val || "",
        flex_knee_test: String(formData.flex_knee_test || "").trim(),
        measurements: formData.measurements || prev.measurements
      }));
    }
  }, [formData]);

  const measurementFields = [
    { label: "Date", key: "date" },
    { label: "Height (cms)", key: "height" },
    { label: "Weight", key: "weight" },
    { label: "Neck", key: "neck" },
    { label: "Shoulder (cms)", key: "shoulder" },
    { label: "Arm", key: "arm" },
    { label: "Chest (Normal)", key: "chest_normal" },
    { label: "Chest (Expanded)", key: "chest_expanded" },
    { label: "Waist", key: "waist" },
    { label: "Abdomen", key: "abdomen" },
    { label: "Hip", key: "hip" },
    { label: "Thigh", key: "thigh" },
    { label: "Calf", key: "calf" },
    { label: "Lat", key: "lat" },
  ];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6 space-y-5">
        <Text className="text-orange-400 text-xl font-bold">Flexibility & Measurements</Text>

        <View className="bg-[#111] rounded-3xl p-5 space-y-4">
          {/* FLEXIBILITY */}
          <View className="space-y-4">
            <Text className="text-orange-500 font-bold text-sm uppercase tracking-wider">Flexibility</Text>

            {/* Apley's Scratch test */}
            <View className="bg-[#1a1a1a] rounded-2xl p-4">
              <Text className="text-white/80 mb-2">Apley&apos;s Scratch test:</Text>
              <Text className="text-white">{localFormData.flex_apley_test || "-"}</Text>
            </View>

            {/* YMCA sit & Reach test */}
            <View className="bg-[#1a1a1a] rounded-2xl p-4">
              <Text className="text-white/80 mb-2">YMCA sit & Reach test (normal/back saver):</Text>
              <Text className="text-white">Value: {localFormData.flex_ymca_val || "-"}</Text>
              <Text className="text-white">Result: {localFormData.flex_ymca_test || "-"}</Text>
            </View>

            {/* Knee to Wall Lunge test */}
            <View className="bg-[#1a1a1a] rounded-2xl p-4">
              <Text className="text-white/80 mb-2">Knee to Wall Lunge test:</Text>
              <Text className="text-white">Value: {localFormData.flex_knee_val || "-"}</Text>
              <Text className="text-white">Result: {localFormData.flex_knee_test || "-"}</Text>
            </View>
          </View>

          {/* MEASUREMENTS TABLE */}
          <View className="space-y-4 pt-4">
            <Text className="text-orange-500 font-bold text-sm uppercase tracking-wider">Measurements</Text>

            <View className="border border-white/20 rounded-lg overflow-hidden">
              {/* Header */}
              <View className="flex-row bg-[#1a1a1a]">
                <View className="flex-1 p-3 border-r border-white/20">
                  <Text className="text-white/80 text-center">S.No</Text>
                </View>
                <View className="flex-2 p-3 border-r border-white/20">
                  <Text className="text-white/80">Measurement</Text>
                </View>
                {[1, 2, 3, 4, 5].map((num) => (
                  <View key={num} className="flex-1 p-3 border-r border-white/20 last:border-0">
                    <Text className="text-orange-400 text-center">{num}</Text>
                  </View>
                ))}
              </View>

              {/* Rows */}
              {measurementFields.map((field, rowIndex) => (
                <View key={field.key} className="flex-row border-b border-white/10">
                  <View className="flex-1 p-3 border-r border-white/20">
                    <Text className="text-white/70 text-center">{rowIndex + 1}</Text>
                  </View>
                  <View className="flex-2 p-3 border-r border-white/20">
                    <Text className="text-white">{field.label}</Text>
                  </View>
                  {[0, 1, 2, 3, 4].map((colIndex) => (
                    <View key={colIndex} className="flex-1 p-3 border-r border-white/20 last:border-0">
                      <Text className="text-white text-center">
                        {localFormData.measurements[colIndex]?.[field.key] || "-"}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity onPress={onPrevious} className="flex-1 bg-gray-700 rounded-2xl p-4">
            <Text className="text-white text-center">Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNext(localFormData)} className="flex-1 bg-orange-600 rounded-2xl p-4">
            <Text className="text-white text-center">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};


