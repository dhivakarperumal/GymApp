import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import SessionTracker from "./PTForm/SessionTracker";

const { width } = Dimensions.get('window');

/* ─── Styles mirrored from pricing.jsx ─── */
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: "#0a0a0a" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 120 },

  /* Header */
  header:          { paddingTop: 28, paddingBottom: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn:         { width: 40, height: 40, borderRadius: 20, backgroundColor: "#111", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#222" },
  headerTextBlock: { flex: 1 },
  headerTitle:     { color: "#ffffff", fontSize: 24, fontWeight: "800" },

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14 },
});

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
  const [refreshing, setRefreshing] = useState(false);

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
        pt_join_date: item.pt_join_date || item.ptJoinDate || item.join_date || "",
        pt_expiry_date: item.pt_expiry_date || item.ptExpiryDate || item.expiry_date || "",
        join_date: item.join_date || "",
        expiry_date: item.expiry_date || "",
      })).filter(m => m.id);

      console.log("📊 Assignments from server:", data.length);
      console.log("👥 Assigned members:", members.length);
      setAssignedMembers(members);
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to load assigned members" });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssignedMembers();
    setRefreshing(false);
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
        trainer_name_assigned: trainerName,
        pt_join_date: member.pt_join_date || savedData.pt_join_date,
        pt_expiry_date: member.pt_expiry_date || savedData.pt_expiry_date,
        join_date: member.join_date || savedData.join_date,
        expiry_date: member.expiry_date || savedData.expiry_date,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setFormData({
          member_id: member.id,
          u_id: member.userId,
          name: member.name,
          trainer_name_assigned: trainerName,
          pt_join_date: member.pt_join_date,
          pt_expiry_date: member.pt_expiry_date,
          join_date: member.join_date,
          expiry_date: member.expiry_date,
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
      <SafeAreaView style={s.safe} edges={["top"]}>
        <ScrollView 
          style={s.scroll} 
          contentContainerStyle={s.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e11d1d"
            />
          }
        >
          {/* ── HEADER ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View style={s.headerTextBlock}>
              <Text style={s.headerTitle}>Directory</Text>
            </View>
          </View>

          {/* ── SEARCH ── */}
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={18} color="#6b7280" />
            <TextInput
              placeholder="Find a member..."
              placeholderTextColor="#4b5563"
              style={s.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm !== "" && (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Ionicons name="close-circle" size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color="#e11d1d" className="mt-20" />
          ) : filteredMembers.length === 0 ? (
            <View className="mt-32 items-center">
               <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center border border-white/5">
                 <Ionicons name="search-outline" size={32} color="#262626" />
               </View>
               <Text className="text-white/40 text-center mt-6 font-medium">No results for "{searchTerm}"</Text>
            </View>
          ) : (
            filteredMembers.map((m, index) => (
              <TouchableOpacity
                key={`${m.id}-${index}`}
                onPress={() => handleSelectMember(m)}
                className="mb-5"
              >
                <LinearGradient
                  colors={['#1a1a1a', '#0f0f0f']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}
                >
                  <View className="flex-row justify-between items-center relative z-10">
                    <View className="flex-row items-center flex-1">
                      <View className="w-14 h-14 rounded-2xl bg-[#e11d1d]/10 items-center justify-center mr-4 border border-[#e11d1d]/20">
                        <Text className="text-[#e11d1d] font-black text-xl">{m.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-lg font-bold tracking-tight" numberOfLines={1}>{m.name}</Text>
                        <View className="flex-row items-center mt-1">
                          <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                          <Text className="text-white/40 text-[11px] font-bold uppercase tracking-widest">{m.planName || 'Pro Membership'}</Text>
                        </View>
                      </View>
                    </View>
                    <View className="w-10 h-10 rounded-xl bg-[#e11d1d]/10 items-center justify-center border border-[#e11d1d]/20">
                      <Ionicons name="arrow-forward" size={18} color="#e11d1d" />
                    </View>
                  </View>
                  <View style={{ position: 'absolute', top: 0, right: 0, padding: 8, opacity: 0.03 }}>
                     <Ionicons name="ribbon" size={100} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      {/* Dynamic Header */}
      <View className="bg-[#0f0f0f] px-6 pt-4 pb-6 border-b border-white/5">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            onPress={() => setShowMemberPicker(true)}
            className="flex-row items-center flex-1 bg-white/5 p-3 border border-white/5"
            style={{ borderRadius: 20 }}
          >
            <View className="w-10 h-10 rounded-xl bg-[#e11d1d] items-center justify-center shadow-lg">
              <Text className="text-white font-black text-lg">{selectedMember?.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-white font-bold text-lg leading-tight" numberOfLines={1}>{selectedMember?.name}</Text>
              <Text className="text-[#e11d1d]/60 text-[10px] font-bold uppercase tracking-widest">{selectedMember?.planName || 'Active Member'}</Text>
            </View>
            <View className="mr-2">
              <Ionicons name="swap-horizontal" size={16} color="#666" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowMemberPicker(true)}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#111", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#222", marginLeft: 12 }}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Pro Tabs */}
        <View 
          className="flex-row bg-[#1a1a1a] p-1.5 border border-white/5"
          style={{ borderRadius: 24 }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("sessions")}
            className="flex-1 flex-row items-center justify-center py-3.5"
            style={[
              { borderRadius: 18 },
              activeTab === 'sessions' ? { backgroundColor: '#e11d1d' } : {}
            ]}
          >
            <Ionicons name="calendar" size={16} color={activeTab === 'sessions' ? 'white' : '#666'} />
            <Text 
              className={`ml-2 text-[11px] font-black uppercase ${activeTab === 'sessions' ? 'text-white' : 'text-gray-500'}`}
              style={{ letterSpacing: 2 }}
            >
              Sessions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("overview")}
            className="flex-1 flex-row items-center justify-center py-3.5"
            style={[
              { borderRadius: 18 },
              activeTab === 'overview' ? { backgroundColor: '#e11d1d' } : {}
            ]}
          >
            <Ionicons name="id-card" size={16} color={activeTab === 'overview' ? 'white' : '#666'} />
            <Text 
              className={`ml-2 text-[11px] font-black uppercase ${activeTab === 'overview' ? 'text-white' : 'text-gray-500'}`}
              style={{ letterSpacing: 2 }}
            >
              Overview
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e11d1d"
          />
        }
      >
        {loading ? (
          <ActivityIndicator color="#e11d1d" className="mt-20" />
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
            {/* Pro Profile Card */}
            <LinearGradient
              colors={['#1a1a1a', '#0a0a0a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 40, padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}
            >
               <View className="flex-row items-center mb-10">
                  <View className="w-16 h-16 bg-[#e11d1d] rounded-[22px] items-center justify-center shadow-xl shadow-[#e11d1d]/40">
                    <Ionicons name="person" size={32} color="white" />
                  </View>
                  <View className="ml-5 flex-1">
                    <Text className="text-white text-3xl font-black leading-tight" style={{ letterSpacing: -0.5 }}>{selectedMember?.name}</Text>
                    <View 
                      className="bg-[#e11d1d]/10 self-start px-2 py-1 mt-1 border border-[#e11d1d]/20"
                      style={{ borderRadius: 6 }}
                    >
                      <Text className="text-[#e11d1d] text-[10px] font-black uppercase" style={{ letterSpacing: 1.5 }}>Platinum Tier</Text>
                    </View>
                  </View>
               </View>

               <View className="space-y-6">
                  <ProInfoItem icon="mail" label="E-Mail Address" value={selectedMember?.email || 'N/A'} />
                  <ProInfoItem icon="call" label="Direct Contact" value={selectedMember?.phone || 'N/A'} />
                  <ProInfoItem icon="ribbon" label="Active Plan" value={selectedMember?.planName || 'Elite Training'} valueColor="#e11d1d" />
                  <ProInfoItem icon="finger-print" label="Unique Member ID" value={selectedMember?.id} />
               </View>

               <View className="absolute -top-10 -right-10 w-40 h-40 bg-[#e11d1d]/10 rounded-full" />
            </LinearGradient>

            {/* Premium Status Footer */}
            <View 
              className="bg-[#141414] p-6 mt-6 flex-row items-center border border-white/5"
              style={{ borderRadius: 32 }}
            >
                <View className="w-12 h-12 bg-green-500/10 rounded-2xl items-center justify-center border border-green-500/20">
                   <Ionicons name="shield-checkmark" size={24} color="#4ade80" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-white font-bold text-base">Verified Access</Text>
                  <Text className="text-white/40 text-xs mt-0.5">Subscription is active and valid.</Text>
                </View>
                <View className="w-2 h-2 rounded-full bg-green-500" />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const ProInfoItem = ({ icon, label, value, valueColor = "white" }) => (
  <View className="flex-row items-center mb-6">
    <View className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/5">
      <Ionicons name={icon} size={20} color="#f97316" />
    </View>
    <View className="flex-1">
      <Text className="text-[10px] text-white/30 uppercase font-black mb-1" style={{ letterSpacing: 2 }}>{label}</Text>
      <Text className="text-base font-bold" style={{ color: valueColor, letterSpacing: -0.2 }}>{value}</Text>
    </View>
  </View>
);
