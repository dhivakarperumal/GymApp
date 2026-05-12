import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl
} from "react-native";
import * as XLSX from "xlsx";
import { useAuth } from "../../context/AuthContext";
import api, { getTrainerMembers, getTrainerWorkouts } from "../../services/api";

const workoutTypes = [
  "Weight Training",
  "Cardio",
  "Yoga / Stretching",
  "HIIT",
  "Bodyweight",
  "Mobility",
  "Activity",
  "Stability",
  "Warm Up",
  "Cool Down",
  "Rest Day",
];

export default function Workouts() {
  const { user } = useAuth();
  const router = useRouter();

  // -- STATE --
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [members, setMembers] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeField, setSelectedTimeField] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [importing, setImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // -- FORM STATE --
  const [editingId, setEditingId] = useState(null);
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMobile, setMemberMobile] = useState("");
  const [workoutGoal, setWorkoutGoal] = useState("");
  const [trainingLevel, setTrainingLevel] = useState("beginner");
  const [category, setCategory] = useState("General");
  const [days, setDays] = useState({ Day1: [{ time: "", type: "Weight Training", name: "", sets: "", count: "", media: "", mediaType: "url" }] });

  // ... (existing functions)

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
      });
      if (result.canceled || !result.assets) return;

      setImporting(true);
      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const arrayBuffer = await response.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!rows || rows.length === 0) {
        Alert.alert("Error", "Excel file is empty or invalid.");
        setImporting(false);
        return;
      }

      const parsedDays = {};
      let rowsParsed = 0;

      rows.forEach((row) => {
        const dayRaw = row.Day || row.day || "Day1";
        const time = row.Time || row.time || "";
        const type = row.Type || row.type || "Weight Training";
        const name = row["Exercise Name"] || row.exercise || row.name || "";
        const sets = row.Sets || row.sets || "";
        const count = row.Count || row.count || row.Reps || row.reps || "";
        const media = row.Media || row.media || "";

        if (!name) return;

        if (!parsedDays[dayRaw]) parsedDays[dayRaw] = [];

        parsedDays[dayRaw].push({
          time,
          type,
          name,
          sets,
          count,
          media,
          mediaType: "url"
        });

        rowsParsed += 1;
      });

      if (Object.keys(parsedDays).length === 0 || rowsParsed === 0) {
        Alert.alert("Error", "No valid exercises found in file.");
        setImporting(false);
        return;
      }

      const newDays = {};
      Object.keys(parsedDays).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.replace(/\D/g, "")) || 0;
        return numA - numB;
      }).forEach((dayKey) => {
        newDays[dayKey] = parsedDays[dayKey];
      });

      setDays(newDays);
      Alert.alert("Success", `Imported workout plan for ${Object.keys(newDays).length} day(s)!`);
      setImporting(false);
    } catch (err) {
      console.log("Import error:", err);
      Alert.alert("Error", "Failed to import Excel file: " + err.message);
      setImporting(false);
    }
  };

  const downloadExcelTemplate = () => {
    try {
      const template = [
        {
          "Day": "Day1",
          "Time": "10:00",
          "Type": "Weight Training",
          "Exercise Name": "Bench Press",
          "Sets": "3",
          "Count": "12",
          "Media": ""
        },
        {
          "Day": "Day1",
          "Time": "10:15",
          "Type": "Weight Training",
          "Exercise Name": "Squats",
          "Sets": "4",
          "Count": "15",
          "Media": ""
        },
        {
          "Day": "Day2",
          "Time": "10:00",
          "Type": "Cardio",
          "Exercise Name": "Running",
          "Sets": "1",
          "Count": "20 mins",
          "Media": ""
        }
      ];

      const ws = XLSX.utils.json_to_sheet(template);
      const wscols = [
        { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 20 },
        { wch: 8 }, { wch: 12 }, { wch: 20 }
      ];
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Workout_Template");
      XLSX.writeFile(wb, "Gym_Workout_Template.xlsx");
      Alert.alert("Success", "Template downloaded! 📥");
    } catch (err) {
      console.log("Download error:", err);
      Alert.alert("Error", "Failed to download template.");
    }
  };

  // -- DATA FETCHING --
  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const workoutList = await getTrainerWorkouts({ trainerId: user.id });
      const memberList = await getTrainerMembers(user.id, user);

      setMembers(memberList || []);

      // Use all workouts returned by the trainer-specific API call
      const workoutArray = Array.isArray(workoutList) ? workoutList : (workoutList?.data || []);
      setWorkouts(workoutArray);
    } catch (err) {
      console.log("Dashboard Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // -- HANDLERS --
  const handleAdd = () => {
    setEditingId(null);
    setMemberId("");
    setMemberName("");
    setMemberEmail("");
    setMemberMobile("");
    setTrainingLevel("beginner");
    setWorkoutGoal("");
    setCategory("General");
    setDays({ Day1: [{ time: "", type: "Weight Training", name: "", sets: "", count: "", media: "", mediaType: "url" }] });
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleEdit = (workout) => {
    let daysData = workout.days;
    if (typeof daysData === 'string') {
      try { daysData = JSON.parse(daysData); } catch (e) { daysData = null; }
    }

    setEditingId(workout.id);
    setMemberId(String(workout.member_id || workout.memberId));
    setMemberName(workout.member_name || workout.memberName);
    setMemberEmail(workout.member_email || workout.memberEmail || "");
    setMemberMobile(workout.member_mobile || workout.memberMobile || "");
    setTrainingLevel(workout.level || workout.training_level || workout.trainingLevel || "beginner");
    setWorkoutGoal(workout.goal || workout.workout_goal || workout.workoutGoal || "");
    setCategory(workout.category || "General");
    setDays(daysData || { Day1: [{ time: "", type: "Weight Training", name: "", sets: "", count: "", media: "", mediaType: "url" }] });
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (workout) => {
    let daysData = workout.days;
    if (typeof daysData === 'string') {
      try { daysData = JSON.parse(daysData); } catch (e) { daysData = null; }
    }

    setEditingId(workout.id);
    setMemberId(String(workout.member_id || workout.memberId));
    setMemberName(workout.member_name || workout.memberName);
    setMemberEmail(workout.member_email || workout.memberEmail || "");
    setMemberMobile(workout.member_mobile || workout.memberMobile || "");
    setTrainingLevel(workout.level || workout.training_level || workout.trainingLevel || "beginner");
    setWorkoutGoal(workout.goal || workout.workout_goal || workout.workoutGoal || "");
    setCategory(workout.category || "General");
    setDays(daysData || { Day1: [{ time: "", type: "Weight Training", name: "", sets: "", count: "", media: "", mediaType: "url" }] });
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Remove Program",
      "Are you sure you want to delete this workout program? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`https://dap.qtechx.com/api/workouts/${id}`, {
                method: "DELETE"
              });
              if (res.ok) {
                fetchData();
                Alert.alert("Success", "Program removed successfully.");
              }
            } catch (err) {
              Alert.alert("Error", "Failed to delete program.");
            }
          }
        }
      ]
    );
  };

  const addDay = () => {
    const nextDay = `Day${Object.keys(days).length + 1}`;
    setDays({ ...days, [nextDay]: [{ time: "", type: "Weight Training", name: "", sets: "", count: "", media: "", mediaType: "url" }] });
  };

  const removeDay = (dayKey) => {
    if (Object.keys(days).length <= 1) return;
    const updated = { ...days };
    delete updated[dayKey];
    setDays(updated);
  };

  const addExercise = (dayKey) => {
    setDays({ ...days, [dayKey]: [...days[dayKey], { time: "", type: "Weight Training", name: "", sets: "", count: "", media: "", mediaType: "url" }] });
  };

  const updateExercise = (dayKey, index, field, value) => {
    setDays(prev => {
      if (!prev[dayKey] || !prev[dayKey][index]) return prev;
      return {
        ...prev,
        [dayKey]: prev[dayKey].map((ex, i) =>
          i === index ? { ...ex, [field]: value } : ex
        )
      };
    });
  };

  const removeExercise = (dayKey, index) => {
    setDays(prev => {
      const updated = prev[dayKey].filter((_, i) => i !== index);
      return {
        ...prev,
        [dayKey]: updated.length ? updated : [{ time: "", type: "Weight Training", name: "", sets: "", count: "", media: "", mediaType: "url" }]
      };
    });
  };


  const saveProgram = async () => {
    if (!memberId) { Alert.alert("Missing Selection", "Please select a member first."); return; }

    // Check if there are any exercises
    let totalExercises = 0;
    Object.values(days).forEach(dayExercises => {
      totalExercises += (dayExercises || []).length;
    });

    if (totalExercises === 0) {
      Alert.alert("No Exercises", "Please add at least one exercise before saving.");
      return;
    }

    setSubmitting(true);
    try {
      const calculatedWeeks = Math.ceil(Object.keys(days).length / 7);
      const payload = {
        trainerId: user.id,
        trainerName: user.username,
        memberId: Number(memberId),
        memberName: memberName,
        member_email: memberEmail,
        member_mobile: memberMobile,
        memberEmail: memberEmail,
        memberMobile: memberMobile,
        level: trainingLevel,
        category: category,
        goal: workoutGoal,
        durationWeeks: calculatedWeeks,
        days,
        status: "active",
        // Fallbacks for older backend versions
        trainer_id: user.id,
        trainer_name: user.username,
        member_id: Number(memberId),
        member_name: memberName,
        title: workoutGoal || "Training Program",
        duration: Object.keys(days).length,
        training_days: JSON.stringify(days)
      };

      if (editingId) {
        await api.put(`/workouts/${editingId}`, payload);
      } else {
        await api.post(`/workouts`, payload);
      }

      setIsModalOpen(false);
      fetchData();
      Alert.alert("Success", "Training program synchronized.");
    } catch (err) {
      console.log("SYNC ERROR:", err.response?.data || err.message);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      Alert.alert("Sync Error", serverMsg || "Server rejected the program. Please check all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const WorkoutCard = ({ item }) => (
    <View className="bg-[#1a1a1a] rounded-2xl mb-4 border border-white/5 overflow-hidden">
      <TouchableOpacity
        onPress={() => handleView(item)}
        activeOpacity={0.7}
        className="p-6 pb-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-[#e11d1d]/10 items-center justify-center border border-[#e11d1d]/20">
              <Ionicons name="barbell-outline" size={20} color="#e11d1d" />
            </View>
            <View className="ml-4">
              <Text className="text-white font-black text-base uppercase tracking-tight">{item.member_name}</Text>
              <Text className="text-[#e11d1d]/60 text-[9px] font-black uppercase tracking-widest">
                {(item.level || item.training_level || item.trainingLevel || "beginner").charAt(0).toUpperCase() + (item.level || item.training_level || item.trainingLevel || "beginner").slice(1)} • {item.goal || item.workout_goal || item.workoutGoal || "General Training"}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
        </View>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.4)" />
          <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest ml-2">Active Training Plan</Text>
        </View>
      </TouchableOpacity>

      {/* ACTIONS */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-black/20 border-t border-white/5">
        <TouchableOpacity
          onPress={() => handleView(item)}
          className="flex-row items-center"
        >
          <View className="w-8 h-8 rounded-xl bg-blue-500/10 items-center justify-center border border-blue-500/20">
            <Ionicons name="eye-outline" size={16} color="#3b82f6" />
          </View>
          <Text className="text-blue-500/60 text-[9px] font-black uppercase tracking-widest ml-2">View</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="flex-row items-center px-4 py-2 bg-[#e11d1d]/10 rounded-xl border border-[#e11d1d]/20"
          >
            <Ionicons name="create-outline" size={14} color="#e11d1d" />
            <Text className="text-[#e11d1d] text-[9px] font-black uppercase tracking-widest ml-2">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="w-8 h-8 rounded-xl bg-red-500/10 items-center justify-center border border-red-500/20"
          >
            <Ionicons name="trash-outline" size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      {loading && !workouts.length ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e11d1d" />
          <Text className="text-white/40 mt-4 uppercase tracking-[0.3em] font-black text-[9px]">Syncing Workouts...</Text>
        </View>
      ) : (
        <>
          {/* HEADER */}
          <View className="pt-16 pb-8 px-5 bg-[#0f0f0f] border-b border-white/5 flex-row justify-between items-center">
            <View>
              <Text className="text-white text-3xl font-black tracking-tight">Workouts</Text>
              <Text className="text-[#e11d1d] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Trainer Panel</Text>
            </View>
            <View className="flex-row gap-3 items-center">
              <TouchableOpacity
                onPress={downloadExcelTemplate}
                className="px-4 py-2 bg-white/5 rounded-xl border border-white/10"
              >
                <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">Template</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={workouts}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#e11d1d"
              />
            }
            renderItem={({ item }) => <WorkoutCard item={item} />}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-32">
                <Ionicons name="barbell-outline" size={60} color="rgba(255,255,255,0.05)" />
                <Text className="text-white/20 font-black uppercase tracking-widest text-[10px] mt-6">No training programs</Text>
              </View>
            }
          />
        </>
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={handleAdd}
        activeOpacity={0.9}
        className="absolute bottom-10 right-5 w-16 h-16 bg-[#e11d1d] rounded-full items-center justify-center shadow-2xl shadow-[#e11d1d]/60 border-4 border-black"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/80">
          <View className="bg-[#111] rounded-t-[32px] h-[92%] border-t border-white/10">
            <View className="flex-row justify-between items-center px-6 py-8 border-b border-white/5">
              <View className="flex-row items-center flex-1">

               

                <View>
                  <Text className="text-white font-black uppercase tracking-widest text-xs">
                    {isViewOnly
                      ? "View Program"
                      : editingId
                        ? "Edit Program"
                        : "New Program"}
                  </Text>
                </View>
              </View>

               {!isViewOnly && (
                  <TouchableOpacity
                    onPress={handleImportExcel}
                    disabled={importing}
                    className="mr-3 px-3 py-2 bg-blue-500/20 rounded-xl border border-blue-500/40 flex-row items-center"
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={14}
                      color="#3b82f6"
                    />
                    <Text className="text-blue-500 text-[9px] font-black uppercase tracking-widest ml-1">
                      {importing ? "Importing..." : "Import"}
                    </Text>
                  </TouchableOpacity>
                )}

              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                className="bg-white/10 p-2 rounded-full"
              >
                <Ionicons name="close" size={22} color="white" />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="flex-1"
            >
              <ScrollView
                className="flex-1 px-4 py-8"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >

                <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 px-1">Assignment</Text>
                <View className={`bg-white/5 rounded-2xl mb-6 border border-white/5 overflow-hidden ${isViewOnly ? 'opacity-50' : ''}`}>
                  <Picker
                    selectedValue={memberId}
                    enabled={!isViewOnly}
                    dropdownIconColor="#e11d1d"
                    style={{ color: "white" }}
                    onValueChange={(val) => {
                      const m = members.find(i => String(i.id) === String(val));
                      setMemberId(val);
                      setMemberName(m?.name || "");
                      setMemberEmail(m?.email || "");
                      setMemberMobile(m?.mobile || m?.phone || "");
                    }}>
                    <Picker.Item label="Select Member..." value="" />
                    {members.map(m => <Picker.Item key={m.id} label={m.name} value={String(m.id)} />)}
                  </Picker>
                </View>

                <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 px-1">Training Level</Text>
                <View className={`bg-white/5 rounded-2xl mb-8 border border-white/5 ${isViewOnly ? 'opacity-50' : ''}`}>
                  <Picker
                    selectedValue={trainingLevel}
                    enabled={!isViewOnly}
                    dropdownIconColor="#e11d1d"
                    style={{ color: "white" }}
                    onValueChange={(itemValue) => setTrainingLevel(itemValue)}>
                    <Picker.Item label="Beginner" value="beginner" />
                    <Picker.Item label="Intermediate" value="intermediate" />
                    <Picker.Item label="Advanced" value="advanced" />
                  </Picker>
                </View>

                <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 px-1">Workout Goal</Text>
                <TextInput
                  placeholder="e.g. Weight Loss, Muscle Gain"
                  value={workoutGoal}
                  editable={!isViewOnly}
                  onChangeText={setWorkoutGoal}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  className={`bg-white/5 p-5 rounded-2xl text-white mb-10 border border-white/5 font-bold ${isViewOnly ? 'opacity-50' : ''}`}
                />

                {/* DAYS ORCHESTRATOR */}
                {days && Object.keys(days).length > 0 && Object.keys(days).sort((a, b) => {
                  const numA = parseInt(a.replace(/\D/g, "")) || 0;
                  const numB = parseInt(b.replace(/\D/g, "")) || 0;
                  return numA - numB;
                }).map((dayKey) => (
                  <View key={dayKey} className="mb-10">
                    <View className="flex-row justify-between items-center mb-6 px-2">
                      <Text className="text-[#e11d1d] font-black text-xl uppercase tracking-tighter">{dayKey}</Text>
                      {Object.keys(days).length > 1 && !isViewOnly && (
                        <TouchableOpacity onPress={() => removeDay(dayKey)} className="bg-red-500/10 px-4 py-2 rounded-xl">
                          <Text className="text-red-500 font-black text-[9px] uppercase">Remove Day</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {days[dayKey].map((ex, idx) => (
                      <View key={idx} className="bg-[#1a1a1a] p-6 rounded-2xl mb-6 border border-white/5 shadow-sm">
                        {/* ROW 1: TIME, TYPE, NAME */}
                        <View className="flex-row gap-3 mb-4">
                          <View className="flex-1">
                            <Text className="text-white/30 text-[8px] font-black uppercase mb-2 ml-1">Time Slot</Text>
                            <TouchableOpacity
                              onPress={() => { setSelectedTimeField({ dayKey, idx }); setShowTimePicker(true); }}
                              className="bg-black/40 h-14 rounded-xl border border-white/5 flex-row items-center px-4 justify-between"
                            >
                              <Text className="text-white/60 font-bold text-xs">{ex.time || "--:--"}</Text>
                              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.2)" />
                            </TouchableOpacity>
                          </View>
                          <View className="flex-[1.5]">
                            <Text className="text-white/30 text-[8px] font-black uppercase mb-2 ml-1">Type</Text>
                            <View className="bg-black/40 h-14 rounded-xl border border-white/5 justify-center overflow-hidden">
                              <Picker
                                selectedValue={ex.type}
                                enabled={!isViewOnly}
                                style={{ color: "white" }}
                                dropdownIconColor="#e11d1d"
                                onValueChange={v => updateExercise(dayKey, idx, "type", v)}>
                                {workoutTypes.map(type => (
                                  <Picker.Item key={type} label={type} value={type} />
                                ))}
                              </Picker>
                            </View>
                          </View>
                          <View className="flex-[1.5]">
                            <Text className="text-white/30 text-[8px] font-black uppercase mb-2 ml-1">Exercise Name</Text>
                            <TextInput
                              placeholder="e.g. Bench Press"
                              value={ex.name}
                              editable={!isViewOnly}
                              onChangeText={v => updateExercise(dayKey, idx, "name", v)}
                              placeholderTextColor="rgba(255,255,255,0.1)"
                              className={`bg-black/40 h-14 rounded-xl border border-white/5 px-4 text-white font-bold text-xs ${isViewOnly ? 'opacity-50' : ''}`}
                            />
                          </View>
                        </View>

                        {/* ROW 2: SETS, COUNT */}
                        <View className="flex-row gap-3 mb-6">
                          <View className="flex-1">
                            <Text className="text-white/30 text-[8px] font-black uppercase mb-2 ml-1">Sets</Text>
                            <TextInput
                              placeholder="No. of Sets"
                              value={ex.sets}
                              editable={!isViewOnly}
                              onChangeText={v => updateExercise(dayKey, idx, "sets", v)}
                              placeholderTextColor="rgba(255,255,255,0.1)"
                              className={`bg-black/40 h-14 rounded-xl border border-white/5 px-4 text-white font-bold text-xs ${isViewOnly ? 'opacity-50' : ''}`}
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-white/30 text-[8px] font-black uppercase mb-2 ml-1">Count / Reps</Text>
                            <TextInput
                              placeholder="e.g. 12 reps / 30s"
                              value={ex.count}
                              editable={!isViewOnly}
                              onChangeText={v => updateExercise(dayKey, idx, "count", v)}
                              placeholderTextColor="rgba(255,255,255,0.1)"
                              className={`bg-black/40 h-14 rounded-xl border border-white/5 px-4 text-white font-bold text-xs ${isViewOnly ? 'opacity-50' : ''}`}
                            />
                          </View>
                        </View>

                        {/* ROW 3: MEDIA */}
                        <View className="mb-4">
                          <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-white/30 text-[8px] font-black uppercase ml-1">Exercise Media (Image/Video)</Text>
                            {!isViewOnly && (
                              <View className="flex-row bg-black/60 rounded-lg p-0.5">
                                <TouchableOpacity onPress={() => updateExercise(dayKey, idx, "mediaType", "url")} className={`px-3 py-1 rounded-md ${ex.mediaType === 'url' ? 'bg-[#e11d1d]' : ''}`}>
                                  <Text className="text-white font-black text-[7px] uppercase">URL</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { updateExercise(dayKey, idx, "mediaType", "upload"); updateExercise(dayKey, idx, "media", ""); }} className={`px-3 py-1 rounded-md ${ex.mediaType === 'upload' ? 'bg-[#e11d1d]' : ''}`}>
                                  <Text className="text-white font-black text-[7px] uppercase">Upload</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>

                          {ex.mediaType === 'url' ? (
                            <TextInput
                              placeholder="Paste image or video URL (YouTube, MP4, JPG, etc.)"
                              value={ex.media}
                              editable={!isViewOnly}
                              onChangeText={v => updateExercise(dayKey, idx, "media", v)}
                              placeholderTextColor="rgba(255,255,255,0.1)"
                              className={`bg-black/40 p-4 rounded-xl border border-white/5 text-white font-medium text-[10px] ${isViewOnly ? 'opacity-50' : ''}`}
                            />
                          ) : (
                            <TouchableOpacity
                              disabled={isViewOnly}
                              className={`bg-black/40 p-4 rounded-xl border border-white/5 flex-row items-center justify-between ${isViewOnly ? 'opacity-50' : ''}`}
                            >
                              <Text className="text-white/60 font-medium text-[10px]">
                                Upload not available on mobile. Use URL instead.
                              </Text>
                              <Ionicons name="cloud-upload-outline" size={16} color="#e11d1d" />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* REMOVE ACTION */}
                        {!isViewOnly && (
                          <TouchableOpacity onPress={() => removeExercise(dayKey, idx)} className="flex-row items-center justify-end mt-2">
                            <Ionicons name="close" size={14} color="#ef4444" />
                            <Text className="text-red-500/60 font-black text-[9px] uppercase ml-1">Remove Exercise</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                    {!isViewOnly && (
                      <TouchableOpacity onPress={() => addExercise(dayKey)} className="flex-row items-center py-2">
                        <Text className="text-[#e11d1d] font-black text-xs uppercase">+ Add Exercise</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {!isViewOnly && (
                  <>
                    <TouchableOpacity onPress={addDay} disabled={submitting} className="bg-white/5 p-6 rounded-2xl mb-8 items-center justify-center border border-dashed border-white/10">
                      <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={20} color="#e11d1d" />
                        <Text className="text-white font-black uppercase tracking-widest text-[10px] ml-3">Add Training Day</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={saveProgram}
                      disabled={submitting}
                      className={`${submitting ? 'bg-[#e11d1d]/50' : 'bg-[#e11d1d]'} p-6 rounded-2xl items-center justify-center mb-24 shadow-xl shadow-[#e11d1d]/40 flex-row gap-2`}
                    >
                      {submitting && <ActivityIndicator size="small" color="white" />}
                      <Text className="text-white font-black uppercase tracking-[0.1em]">
                        {submitting ? 'Publishing...' : 'Publish Training Program'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={new Date()} mode="time" is24Hour={false} display="default"
                    onChange={(event, date) => {
                      setShowTimePicker(false);
                      if (event.type === "set" && date && selectedTimeField) {
                        const h = date.getHours();
                        const m = date.getMinutes();
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const h12 = h % 12 || 12;
                        const mStr = m < 10 ? `0${m}` : m;
                        const formatted = `${h12}:${mStr} ${ampm}`;
                        updateExercise(selectedTimeField.dayKey, selectedTimeField.idx, "time", formatted);
                      }
                    }}
                  />
                )}

                <View className="h-64" />
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>

      {/* Removed separate DateTimePicker as it's now inside the Modal */}
    </View>
  );
}
