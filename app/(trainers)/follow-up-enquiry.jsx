import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import dayjs from "dayjs";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  FileText,
  History,
  Info,
  Mail,
  Phone,
  Search,
  Trash2,
  User,
  X
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as XLSX from "xlsx";

import { useAuth } from "../../context/AuthContext";
import api, {
  createFollowup,
  createFollowupInteraction,
  getFollowupInteractions,
  getFollowups,
  getPlans,
  updateFollowup
} from "../../services/api";

export default function FollowupEnquiry() {
  const { user, role } = useAuth();
  const router = useRouter();
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
    dob: "",
    age: "",
    address: "",
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
    updated_by: user?.username || "Admin",
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
      console.error("Save record error:", err);
      let errorMsg = err?.response?.data?.message || "Error saving record";

      if (errorMsg.includes("Email or mobile already exists")) {
        errorMsg = "Email or Mobile number already registered!";
      }

      Toast.show({ type: "error", text1: errorMsg });
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
      dob: "",
      age: "",
      address: "",
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
            } catch (err) { }
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
    // Only show followups created/updated by the current user
    if (user?.username && e.updated_by !== user.username) {
      return false;
    }

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
        <View className="flex-row items-center flex-1 pr-2">
          <View
            className="w-10 h-10 rounded-xl bg-red-600 items-center justify-center mr-3 shrink-0"
            style={{ backgroundColor: getStatusColor(item.status) + "20" }}
          >
            <User size={20} color={getStatusColor(item.status)} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base" numberOfLines={1}>{item.name}</Text>
            <Text className="text-gray-500 text-xs" numberOfLines={1}>
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
    <SafeAreaView className="flex-1 bg-black" edges={["top", "left", "right"]}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-[#1a1a1a] rounded-full items-center justify-center mr-3 border border-white/10"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Follow-up Enquiry</Text>
            <Text className="text-gray-400 text-xs uppercase tracking-widest">Manage leads & interactions</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleExcelImport}
              className="w-10 h-10 bg-indigo-600/20 rounded-full items-center justify-center border border-indigo-600/30"
            >
              <FileText size={20} color="#818cf8" />
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
        <View className="flex-1 bg-black/80 justify-end">
          <SafeAreaView className="flex-[0.95] bg-[#0a0a0a] rounded-t-[32px] border-t border-[#262626] shadow-2xl overflow-hidden pt-2">
            {/* Grabber */}
            <View className="w-12 h-1.5 bg-[#333] rounded-full self-center mb-2" />

            {/* Header */}
            <View className="px-6 py-4 border-b border-[#262626] flex-row justify-between items-center">
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
                    className={`flex-1 py-4 items-center border-b-2 ${activeTab === tab ? "border-red-600" : "border-transparent"
                      }`}
                  >
                    <Text
                      className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab ? "text-red-500" : "text-gray-500"
                        }`}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <KeyboardAwareScrollView
              className="flex-1 p-4"
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              extraScrollHeight={20}
              keyboardShouldPersistTaps="handled"
            >
              {activeTab === "basic" && (
                <View className="space-y-4">
                  <FormInput label="Full Name *" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="Enter name" />
                  <View className="flex-row gap-2">
                    <View className="flex-[2]">
                      <FormDatePicker label="Date of Birth" value={formData.dob} onChange={(v) => {
                        const newAge = v ? dayjs().diff(dayjs(v), 'year').toString() : formData.age;
                        setFormData({ ...formData, dob: v, age: newAge });
                      }} />
                    </View>
                    <View className="flex-1">
                      <FormInput label="Age" value={formData.age?.toString()} onChange={(v) => setFormData({ ...formData, age: v })} keyboardType="numeric" placeholder="25" />
                    </View>
                  </View>
                  <FormPicker
                    label="Gender"
                    selectedValue={formData.gender}
                    onValueChange={(v) => setFormData({ ...formData, gender: v })}
                    items={[
                      { label: "[SELECT]", value: "" },
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Other" },
                    ]}
                  />
                  <FormInput label="Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} placeholder="email@example.com" keyboardType="email-address" />
                  <FormInput label="Phone *" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} placeholder="9876543210" keyboardType="phone-pad" />
                  <FormInput label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} placeholder="Full address" multiline numberOfLines={3} />
                  <FormPicker
                    label="Blood Group"
                    selectedValue={formData.blood_group}
                    onValueChange={(v) => setFormData({ ...formData, blood_group: v })}
                    items={[
                      { label: "[SELECT]", value: "" },
                      { label: "A+", value: "A+" },
                      { label: "A-", value: "A-" },
                      { label: "B+", value: "B+" },
                      { label: "B-", value: "B-" },
                      { label: "AB+", value: "AB+" },
                      { label: "AB-", value: "AB-" },
                      { label: "O+", value: "O+" },
                      { label: "O-", value: "O-" },
                    ]}
                  />
                </View>
              )}

              {activeTab === "details" && (
                <View className="space-y-4">
                  {selectedEnquiry && (
                    <View className="mb-4">
                      <Text className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">Reg. No</Text>
                      <TextInput value={`#F-${selectedEnquiry.id}`} editable={false} className="bg-[#141414] border border-[#262626] text-gray-500 p-4 rounded-2xl" />
                    </View>
                  )}
                  <FormInput label="Organization" value={formData.organization} onChange={(v) => setFormData({ ...formData, organization: v })} placeholder="Company name" />

                  <FormInput label="Subject" value={formData.subject} onChange={(v) => setFormData({ ...formData, subject: v })} placeholder="Topic" />
                  <FormInput label="Message" value={formData.message} onChange={(v) => setFormData({ ...formData, message: v })} placeholder="Notes" multiline numberOfLines={4} />

                  <FormPicker
                    label="Plan Name"
                    selectedValue={formData.plan_name}
                    onValueChange={(v) => {
                      const selectedPlan = plans.find(p => p.name === v);
                      setFormData({
                        ...formData,
                        plan_name: v,
                        plan_price: selectedPlan ? (selectedPlan.finalPrice || selectedPlan.price)?.toString() : ""
                      });
                    }}
                    items={[
                      { label: "[SELECT PLAN]", value: "" },
                      ...plans.map(p => ({ label: `${p.name} - ₹${p.finalPrice || p.price}`, value: p.name }))
                    ]}
                  />
                  <FormInput label="Plan Price" value={formData.plan_price} onChange={(v) => setFormData({ ...formData, plan_price: v })} placeholder="Price" keyboardType="numeric" editable={false} />
                  <FormInput label="Plan Duration" value={formData.plan_duration} onChange={(v) => setFormData({ ...formData, plan_duration: v })} placeholder="e.g. 3 Months" />

                  <FormInput label="Fitness Goal" value={formData.fitness_goal} onChange={(v) => setFormData({ ...formData, fitness_goal: v })} placeholder="e.g. Weight loss" />
                  <FormInput label="Website" value={formData.website} onChange={(v) => setFormData({ ...formData, website: v })} placeholder="https://" keyboardType="url" />
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <FormInput label="Referred By" value={formData.referred_by} onChange={(v) => setFormData({ ...formData, referred_by: v })} placeholder="Name" />
                    </View>
                    <View className="flex-1">
                      <FormInput label="Updated By" value={formData.updated_by} onChange={(v) => setFormData({ ...formData, updated_by: v })} editable={false} />
                    </View>
                  </View>

                  <Text className="text-gray-500 text-[10px] font-black uppercase mt-4 mb-2">Status Selection</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {["pending", "followup", "completed", "cancelled"].map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => setFormData({ ...formData, status: s })}
                        className={`px-4 py-2 rounded-xl border ${formData.status === s ? "bg-red-600 border-red-600" : "bg-[#141414] border-[#262626]"
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
                      <View className="flex-row items-center mb-4">
                        <History size={16} color="#ef4444" />
                        <Text className="text-white font-bold ml-2">Timeline</Text>
                      </View>
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
            </KeyboardAwareScrollView>

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
      <TouchableOpacity
        onPress={() => {
          setSelectedEnquiry(null);
          setShowForm(true);
          setActiveTab("basic");
        }}
        className="absolute bottom-6 right-6 w-16 h-16 bg-red-600 rounded-full items-center justify-center shadow-xl shadow-red-600/40 elevation-8"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
      <Toast />
    </SafeAreaView>
  );
}

function FormInput({ label, onChange, ...props }) {
  return (
    <View className="mb-4">
      <Text className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">{label}</Text>
      <TextInput
        onChangeText={onChange}
        placeholderTextColor="#333"
        className="bg-[#141414] border border-[#262626] text-white p-4 rounded-2xl focus:border-red-600"
        {...props}
      />
    </View>
  );
}

function FormPicker({ label, selectedValue, onValueChange, items }) {
  return (
    <View className="mb-4">
      <Text className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">{label}</Text>
      <View className="bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden h-14 justify-center">
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          dropdownIconColor="white"
          style={{ color: "white", backgroundColor: "transparent" }}
        >
          {items.map((item, idx) => (
            <Picker.Item key={idx} label={item.label} value={item.value} color={Platform.OS === 'ios' ? 'white' : undefined} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

function FormDatePicker({ label, value, onChange }) {
  const [show, setShow] = useState(false);

  const handleConfirm = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(dayjs(selectedDate).format("YYYY-MM-DD"));
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">{label}</Text>
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="bg-[#141414] border border-[#262626] p-4 rounded-2xl h-14 justify-center"
      >
        <Text className={value ? "text-white" : "text-[#333]"}>
          {value ? dayjs(value).format("YYYY-MM-DD") : "YYYY-MM-DD"}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          onChange={handleConfirm}
          onValueChange={handleConfirm}
        />
      )}
    </View>
  );
}
