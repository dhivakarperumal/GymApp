import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  User,
  History,
  Edit2,
  ChevronDown,
  FileText,
  Download,
  Info,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-toast-message";

import api, {
  getFollowups,
  createFollowup,
  updateFollowup,
  getFollowupInteractions,
  createFollowupInteraction,
  getPlans,
  getStaff,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function FollowupEnquiry() {
  const { user, role } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followupLoading, setFollowupLoading] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selection & Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // basic | details | history

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    height: "",
    weight: "",
    bmi: "",
    dob: "",
    age: "",
    address: "",
    employer: "",
    occupation: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_address: "",
    emergency_contact_phone_home: "",
    emergency_contact_phone_work: "",
    fitness_goal: "",
    blood_group: "",
    gender: "",
    status: "pending",
    plan_name: "",
    plan_price: "",
    plan_duration: "",
    reg_no: "",
    organization: "",
    website: "",
    best_time_to_reach: "",
    updated_by: "",
    referred_by: "",
  });

  const [followupFormData, setFollowupFormData] = useState({
    followup_date: dayjs().format("YYYY-MM-DDTHH:mm"),
    notes: "",
    status: "pending",
    next_followup_date: "",
  });

  useEffect(() => {
    fetchEnquiries();
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedEnquiry) {
      fetchFollowups(selectedEnquiry.id);
      setFormData({
        ...selectedEnquiry,
        dob: selectedEnquiry.dob ? dayjs(selectedEnquiry.dob).format("YYYY-MM-DD") : "",
        status: selectedEnquiry.status || "pending",
        updated_by: selectedEnquiry.updated_by || user?.username || "Admin",
      });
    } else {
      resetForm();
    }
  }, [selectedEnquiry]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const data = await getFollowups();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to load follow-ups" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error fetching plans", err);
    }
  };

  const fetchFollowups = async (followupId) => {
    try {
      setFollowupLoading(true);
      const data = await getFollowupInteractions(followupId);
      setFollowups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error fetching interactions", err);
    } finally {
      setFollowupLoading(false);
    }
  };

  const handleSubmitEnquiry = async () => {
    if (!formData.name || !formData.phone) {
      Alert.alert("Error", "Name and Phone are required");
      return;
    }

    try {
      if (selectedEnquiry && selectedEnquiry.id) {
        await updateFollowup(selectedEnquiry.id, formData);
      } else {
        await createFollowup(formData);
      }
      fetchEnquiries();
      setShowForm(false);
      Toast.show({ type: "success", text1: "Record saved successfully!" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Error saving record" });
    }
  };

  const handleAddFollowup = async () => {
    if (!selectedEnquiry || !followupFormData.notes) return;
    try {
      await createFollowupInteraction({
        followup_id: selectedEnquiry.id,
        ...followupFormData,
      });
      setFollowupFormData({
        followup_date: dayjs().format("YYYY-MM-DDTHH:mm"),
        notes: "",
        status: "pending",
        next_followup_date: "",
      });
      fetchFollowups(selectedEnquiry.id);
      fetchEnquiries();
      Toast.show({ type: "success", text1: "Activity logged!" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Error logging activity" });
    }
  };

  const handleDeleteEnquiry = (id) => {
    const targetId = id || selectedEnquiry?.id;
    if (!targetId) return;

    Alert.alert("Confirm Delete", "Are you sure you want to delete this record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/enquiries/${targetId}`);
            fetchEnquiries();
            setShowForm(false);
            Toast.show({ type: "success", text1: "Record deleted successfully!" });
          } catch (err) {
            Toast.show({ type: "error", text1: "Failed to delete record" });
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      height: "",
      weight: "",
      bmi: "",
      dob: "",
      age: "",
      address: "",
      employer: "",
      occupation: "",
      emergency_contact_name: "",
      emergency_contact_relationship: "",
      emergency_contact_address: "",
      emergency_contact_phone_home: "",
      emergency_contact_phone_work: "",
      fitness_goal: "",
      blood_group: "",
      gender: "",
      status: "pending",
      plan_name: "",
      plan_duration: "",
      reg_no: "",
      organization: "",
      website: "",
      best_time_to_reach: "",
      updated_by: user?.username || "Admin",
      referred_by: "",
    });
  };

  const handleExcelImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"],
      });

      if (result.canceled) return;

      setLoading(true);
      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        for (const row of jsonData) {
          const payload = {
            name: row.Name || row["Lead Name"] || row.name || "",
            email: row.Email || row.email || "",
            phone: (row.Phone || row.Mobile || row.phone || "").toString(),
            subject: row.Subject || "General Inquiry",
            message: row.Message || row.Notes || "",
            gender: row.Gender || "",
            status: (row.Status || "pending").toLowerCase(),
            updated_by: user?.username || "Admin",
          };
          if (payload.name && payload.phone) {
            try {
              await createFollowup(payload);
              successCount++;
            } catch (err) {}
          }
        }
        Toast.show({ type: "success", text1: `Imported ${successCount} leads!` });
        fetchEnquiries();
        setLoading(false);
      };
      reader.readAsArrayBuffer(blob);
    } catch (err) {
      setLoading(false);
      Toast.show({ type: "error", text1: "Failed to read Excel file" });
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone?.includes(searchTerm) ||
      e.organization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#EAB308";
      case "completed": return "#22C55E";
      case "cancelled": return "#EF4444";
      case "followup": return "#3B82F6";
      default: return "#94A3B8";
    }
  };

  const renderEnquiry = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedEnquiry(item);
        setShowForm(true);
        setActiveTab("basic");
      }}
      className="bg-[#141414] border border-[#262626] rounded-2xl p-4 mb-4"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-xl bg-red-600 items-center justify-center mr-3"
            style={{ backgroundColor: getStatusColor(item.status) + "20" }}
          >
            <User size={20} color={getStatusColor(item.status)} />
          </View>
          <View>
            <Text className="text-white font-bold text-base">{item.name}</Text>
            <Text className="text-gray-500 text-xs">
              {item.organization || item.employer || "Direct Lead"}
            </Text>
          </View>
        </View>
        <View
          className="px-2 py-1 rounded-full border"
          style={{ borderColor: getStatusColor(item.status), backgroundColor: getStatusColor(item.status) + "10" }}
        >
          <Text style={{ color: getStatusColor(item.status) }} className="text-[10px] font-bold uppercase">
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-1">
        <Phone size={12} color="#666" />
        <Text className="text-gray-400 text-xs ml-2">{item.phone || "N/A"}</Text>
      </View>
      <View className="flex-row items-center">
        <Mail size={12} color="#666" />
        <Text className="text-gray-400 text-xs ml-2" numberOfLines={1}>
          {item.email || "N/A"}
        </Text>
      </View>

      <View className="mt-3 pt-3 border-t border-[#262626] flex-row justify-between items-center">
        <Text className="text-gray-600 text-[10px] font-bold">
          {dayjs(item.created_at).format("MMM DD, YYYY")}
        </Text>
        <ChevronRight size={16} color="#444" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["left", "right"]}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-2xl font-bold">Follow-up Enquiry</Text>
          <View className="flex-row gap-2">
             <TouchableOpacity
              onPress={handleExcelImport}
              className="w-10 h-10 bg-indigo-600/20 rounded-full items-center justify-center border border-indigo-600/30"
            >
              <FileText size={20} color="#818cf8" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedEnquiry(null);
                setShowForm(true);
                setActiveTab("basic");
              }}
              className="w-10 h-10 bg-red-600 rounded-full items-center justify-center"
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH & FILTER */}
        <View className="flex-row gap-2 mb-6">
          <View className="flex-1 bg-[#141414] border border-[#262626] rounded-xl flex-row items-center px-4 py-2">
            <Search size={18} color="#666" />
            <TextInput
              placeholder="Search leads..."
              placeholderTextColor="#666"
              className="flex-1 text-white ml-2 py-1"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
                // simple status toggle or picker
                const statuses = ['all', 'pending', 'followup', 'completed', 'cancelled'];
                const nextIdx = (statuses.indexOf(statusFilter) + 1) % statuses.length;
                setStatusFilter(statuses[nextIdx]);
            }}
            className="bg-[#141414] border border-[#262626] rounded-xl px-4 items-center justify-center"
          >
             <Text className="text-white text-xs font-bold uppercase">{statusFilter}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center">
            <ActivityIndicator color="#ef4444" size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredEnquiries}
            renderItem={renderEnquiry}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="mt-20 items-center">
                <History size={48} color="#222" />
                <Text className="text-gray-500 mt-4">No records found</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* FULL FORM MODAL */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View className="flex-1 bg-black/90">
          <SafeAreaView className="flex-1">
            {/* Header */}
            <View className="px-4 py-4 border-b border-[#262626] flex-row justify-between items-center">
              <View>
                <Text className="text-white text-lg font-bold">
                  {selectedEnquiry ? "Enquiry Management" : "Create New Lead"}
                </Text>
                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                  {selectedEnquiry ? `ID: #F-${selectedEnquiry.id}` : "NEW ENTRY"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                className="w-10 h-10 bg-[#141414] rounded-full items-center justify-center border border-[#262626]"
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-[#262626]">
              {["basic", "details", "history"]
                .filter((tab) => selectedEnquiry || tab !== "history")
                .map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`flex-1 py-4 items-center border-b-2 ${
                    activeTab === tab ? "border-red-600" : "border-transparent"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      activeTab === tab ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                {activeTab === "basic" && (
                  <View className="space-y-4">
                    <FormInput label="Full Name *" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="Enter name" />
                    <FormInput label="Phone *" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} placeholder="9876543210" keyboardType="phone-pad" />
                    <FormInput label="Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} placeholder="email@example.com" keyboardType="email-address" />
                    <FormInput label="Gender" value={formData.gender} onChange={(v) => setFormData({ ...formData, gender: v })} placeholder="Male/Female/Other" />
                    <FormInput label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} placeholder="Full address" multiline numberOfLines={3} />
                    <FormInput label="Fitness Goal" value={formData.fitness_goal} onChange={(v) => setFormData({ ...formData, fitness_goal: v })} placeholder="e.g. Weight loss" />
                  </View>
                )}

                {activeTab === "details" && (
                  <View className="space-y-4">
                    <FormInput label="Organization" value={formData.organization} onChange={(v) => setFormData({ ...formData, organization: v, employer: v })} placeholder="Company name" />
                    <FormInput label="Plan Name" value={formData.plan_name} onChange={(v) => setFormData({ ...formData, plan_name: v })} placeholder="Interested plan" />
                    <FormInput label="Subject" value={formData.subject} onChange={(v) => setFormData({ ...formData, subject: v })} placeholder="Topic" />
                    <FormInput label="Message" value={formData.message} onChange={(v) => setFormData({ ...formData, message: v })} placeholder="Notes" multiline numberOfLines={4} />
                    
                    <Text className="text-gray-500 text-[10px] font-black uppercase mt-4 mb-2">Status Selection</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {["pending", "followup", "completed", "cancelled"].map((s) => (
                        <TouchableOpacity
                          key={s}
                          onPress={() => setFormData({ ...formData, status: s })}
                          className={`px-4 py-2 rounded-xl border ${
                            formData.status === s ? "bg-red-600 border-red-600" : "bg-[#141414] border-[#262626]"
                          }`}
                        >
                          <Text className={`text-[10px] font-bold uppercase ${formData.status === s ? "text-white" : "text-gray-500"}`}>
                            {s}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {activeTab === "history" && (
                  <View>
                    {!selectedEnquiry ? (
                      <View className="py-20 items-center">
                        <Info size={32} color="#333" />
                        <Text className="text-gray-500 text-center mt-4 px-10">
                          Save the lead first to enable interaction tracking.
                        </Text>
                      </View>
                    ) : (
                      <View>
                        {/* Timeline */}
                        <Text className="text-white font-bold mb-4 flex-row items-center">
                           <History size={16} color="#ef4444" /> Timeline
                        </Text>
                        {followupLoading ? (
                          <ActivityIndicator color="red" />
                        ) : (
                          followups.map((f, idx) => (
                            <View key={idx} className="flex-row mb-6">
                              <View className="items-center mr-4">
                                <View className="w-2 h-2 rounded-full bg-red-600" />
                                <View className="w-[1px] flex-1 bg-[#262626] mt-1" />
                              </View>
                              <View className="flex-1 bg-[#141414] border border-[#262626] rounded-2xl p-4">
                                <View className="flex-row justify-between mb-2">
                                  <Text className="text-red-500 text-[10px] font-bold">
                                    {dayjs(f.followup_date).format("MMM DD, HH:mm")}
                                  </Text>
                                  <Text className="text-gray-500 text-[10px] font-bold uppercase">{f.status}</Text>
                                </View>
                                <Text className="text-white text-sm">{f.notes}</Text>
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                )}
                <View className="h-40" />
              </KeyboardAvoidingView>
            </ScrollView>

            {/* Footer */}
            <View className="p-4 border-t border-[#262626] bg-[#0f0f0f] flex-row gap-3">
              {selectedEnquiry && (
                <TouchableOpacity
                  onPress={() => handleDeleteEnquiry()}
                  className="flex-1 bg-red-600/10 border border-red-600/20 py-4 rounded-2xl items-center"
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleSubmitEnquiry}
                className="flex-[3] bg-red-600 py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold uppercase tracking-widest">
                  {selectedEnquiry ? "Update Record" : "Create Record"}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
      <Toast />
    </SafeAreaView>
  );
}

function FormInput({ label, ...props }) {
  return (
    <View className="mb-4">
      <Text className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">{label}</Text>
      <TextInput
        placeholderTextColor="#333"
        className="bg-[#141414] border border-[#262626] text-white p-4 rounded-2xl focus:border-red-600"
        {...props}
      />
    </View>
  );
}
