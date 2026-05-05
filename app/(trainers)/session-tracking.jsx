import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Dimensions,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import SessionTracker from "./PTForm/SessionTracker";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get('window');

export default function SessionTrackingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const trainerId = user?.id;
  const trainerName = user?.username || user?.name || "";

  const [assignedMembers, setAssignedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("sessions"); // "sessions" or "overview"
  const [showMemberPicker, setShowMemberPicker] = useState(true);

  useEffect(() => {
    if (trainerId) {
      fetchAssignedMembers();
    }
  }, [trainerId]);

  const fetchAssignedMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/assignments?trainerUserId=${trainerId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      const members = data.map(item => ({
        id: item.gymMemberId || item.id || item.gm_id || item.member_id || "",
        userId: item.userId || item.user_id || "",
        name: item.username || item.name || item.user_name || item.full_name || "Member",
        email: item.userEmail || item.user_email || item.email || "",
        phone: item.userMobile || item.user_mobile || item.phone || "",
        planName: item.planName || item.plan_name || "",
      })).filter(m => m.id);

      setAssignedMembers(members);
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to load assigned members" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPtForm = async (member) => {
    setLoading(true);
    try {
      const res = await api.get(`/pt-forms/${member.id}`);
      const rawFormData = res.data?.form_data;
      const savedData = rawFormData && typeof rawFormData === "string"
        ? JSON.parse(rawFormData)
        : rawFormData || {};
      
      const sessions = Array.isArray(savedData.sessions)
        ? savedData.sessions
        : Array.from({ length: 25 }, (_, i) => ({
            session_no: i + 1,
            date: "",
            workout: "",
            status: "Pending",
            client_sign: "",
            trainer_sign: trainerName,
          }));

      setFormData({
        ...savedData,
        member_id: member.id,
        u_id: member.userId,
        name: member.name,
        sessions,
        trainer_name_assigned: trainerName
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setFormData({
          member_id: member.id,
          u_id: member.userId,
          name: member.name,
          trainer_name_assigned: trainerName,
          sessions: Array.from({ length: 25 }, (_, i) => ({
            session_no: i + 1,
            date: "",
            workout: "",
            status: "Pending",
            client_sign: "",
            trainer_sign: trainerName,
          }))
        });
      } else {
        Toast.show({ type: "error", text1: "Failed to load PT form data" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setShowMemberPicker(false);
    fetchPtForm(member);
  };

  const handleSaveSessions = async (sessionData) => {
    setSaving(true);
    try {
      await api.post("/pt-forms", {
        member_id: selectedMember.id,
        user_id: selectedMember.userId,
        formData: {
          ...formData,
          sessions: sessionData.sessions,
          trainer_name_assigned: trainerName,
        },
        completed: true,
      });
      Toast.show({ type: "success", text1: "Session tracker saved" });
      setFormData(prev => ({ ...prev, sessions: sessionData.sessions }));
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to save sessions" });
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = assignedMembers.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  if (showMemberPicker) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={["top"]}>
        <View className="flex-row items-center p-4 border-b border-white/10 bg-[#1a1a1a]">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Select Member</Text>
        </View>

        <View className="p-4">
          <View className="flex-row items-center bg-white/5 rounded-2xl px-4 py-1 border border-white/10">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Search assigned members..."
              placeholderTextColor="#666"
              className="flex-1 h-12 text-white ml-2"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {loading ? (
            <ActivityIndicator color="#f97316" className="mt-10" />
          ) : filteredMembers.length === 0 ? (
            <Text className="text-white/40 text-center mt-10">No assigned members found</Text>
          ) : (
            filteredMembers.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => handleSelectMember(m)}
                className="bg-[#1a1a1a] p-5 rounded-3xl mb-4 border border-white/5"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white text-lg font-bold">{m.name}</Text>
                    <Text className="text-white/40 text-xs mt-1">{m.phone || m.email}</Text>
                    <Text className="text-orange-400 text-[10px] mt-2 font-bold uppercase tracking-widest">{m.planName}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#f97316" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={["top"]}>
      {/* Header */}
      <View className="bg-[#1a1a1a] p-4 border-b border-white/10">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => setShowMemberPicker(true)}>
            <View className="flex-row items-center">
              <Ionicons name="people" size={20} color="#f97316" />
              <Text className="text-white font-bold ml-2">{selectedMember?.name}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" className="ml-1" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-black/40 p-1 rounded-2xl">
          <TouchableOpacity
            onPress={() => setActiveTab("sessions")}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === 'sessions' ? 'bg-[#262626]' : ''}`}
          >
            <Ionicons name="clipboard" size={18} color={activeTab === 'sessions' ? '#f97316' : '#666'} />
            <Text className={`ml-2 font-bold ${activeTab === 'sessions' ? 'text-white' : 'text-gray-500'}`}>Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("overview")}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === 'overview' ? 'bg-[#262626]' : ''}`}
          >
            <Ionicons name="person" size={18} color={activeTab === 'overview' ? '#f97316' : '#666'} />
            <Text className={`ml-2 font-bold ${activeTab === 'overview' ? 'text-white' : 'text-gray-500'}`}>Overview</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <ActivityIndicator color="#f97316" className="mt-20" />
        ) : activeTab === "sessions" ? (
          <View className="p-4">
            {formData && (
              <SessionTracker
                formData={formData}
                onSaved={handleSaveSessions}
                isLastStep={true}
                onNext={handleSaveSessions}
                onPrevious={() => setShowMemberPicker(true)}
              />
            )}
          </View>
        ) : (
          <View className="p-6">
            {/* Profile Card */}
            <View style={styles.profileCard}>
               <View className="flex-row items-center mb-6">
                  <View className="w-14 h-14 bg-orange-500/20 rounded-2xl items-center justify-center border border-orange-500/30">
                    <Ionicons name="person" size={30} color="#f97316" />
                  </View>
                  <View className="ml-4">
                    <Text className="text-white text-2xl font-extrabold">{selectedMember?.name}</Text>
                    <Text className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Gym Member</Text>
                  </View>
               </View>

               <View className="space-y-6">
                  <InfoItem icon="mail" label="Email Address" value={selectedMember?.email || 'N/A'} />
                  <InfoItem icon="call" label="Phone Number" value={selectedMember?.phone || 'N/A'} />
                  <InfoItem icon="ribbon" label="Current Plan" value={selectedMember?.planName || 'No Active Plan'} valueColor="#f97316" />
                  <InfoItem icon="finger-print" label="Member ID" value={selectedMember?.id} />
               </View>

               {/* Background Decorative Blob */}
               <View style={styles.blob} />
            </View>

            {/* Status Card */}
            <View className="bg-white/5 border border-white/10 rounded-[40px] p-8 mt-6 items-center">
                <View className="w-16 h-16 bg-white/5 rounded-full items-center justify-center mb-4">
                   <Ionicons name="shield-checkmark" size={32} color="#10b981" />
                </View>
                <Text className="text-white font-bold text-lg">Active Member</Text>
                <Text className="text-white/40 text-sm text-center mt-2 px-4">
                  This member is currently assigned to you for PT sessions.
                </Text>
                <View className="mt-6 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                  <Text className="text-green-500 text-[10px] font-bold uppercase tracking-tighter">Verified Status</Text>
                </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoItem = ({ icon, label, value, valueColor = "white" }) => (
  <View className="flex-row items-center mb-5">
    <View className="w-10 h-10 bg-white/5 rounded-xl items-center justify-center mr-4">
      <Ionicons name={icon} size={18} color="#f97316" />
    </View>
    <View>
      <Text className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">{label}</Text>
      <Text className="text-sm font-medium" style={{ color: valueColor }}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 40,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    zIndex: -1,
  }
});
