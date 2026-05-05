import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [members, setMembers] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeField, setSelectedTimeField] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

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

  const pickMedia = async (dayKey, index) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need library permissions to upload media.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        updateExercise(dayKey, index, "media", result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick media.");
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
      const workoutList = await getTrainerWorkouts();
      const memberList = await getTrainerMembers(user.id, user);
      
      setMembers(memberList || []);
      
      const assignedMemberIds = (memberList || []).map(m => String(m.id));
      const workoutArray = Array.isArray(workoutList) ? workoutList : (workoutList?.data || []);
      
      const filteredWorkouts = workoutArray.filter(w => 
        assignedMemberIds.includes(String(w.member_id || w.memberId))
      );
      
      setWorkouts(filteredWorkouts);
    } catch (err) {
      console.log("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
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
            <View className="w-12 h-12 rounded-2xl bg-orange-500/10 items-center justify-center border border-orange-500/20">
              <Ionicons name="barbell-outline" size={20} color="#f97316" />
            </View>
            <View className="ml-4">
              <Text className="text-white font-black text-base uppercase tracking-tight">{item.member_name}</Text>
              <Text className="text-orange-500/60 text-[9px] font-black uppercase tracking-widest">
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
            className="flex-row items-center px-4 py-2 bg-orange-500/10 rounded-xl border border-orange-500/20"
          >
            <Ionicons name="create-outline" size={14} color="#f97316" />
            <Text className="text-orange-500 text-[9px] font-black uppercase tracking-widest ml-2">Edit</Text>
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
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-white/40 mt-4 uppercase tracking-[0.3em] font-black text-[9px]">Syncing Workouts...</Text>
        </View>
      ) : (
        <>
          {/* HEADER */}
          <View className="pt-16 pb-8 px-5 bg-[#0f0f0f] border-b border-white/5 flex-row justify-between items-center">
            <View>
              <Text className="text-white text-3xl font-black tracking-tight">Workouts</Text>
              <Text className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Trainer Panel</Text>
            </View>
            <TouchableOpacity className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={workouts}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
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
        className="absolute bottom-10 right-5 w-16 h-16 bg-orange-600 rounded-full items-center justify-center shadow-2xl shadow-orange-600/60 border-4 border-black"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/80">
          <View className="bg-[#111] rounded-t-[32px] h-[92%] border-t border-white/10">
             <View className="flex-row justify-between items-center px-6 py-8 border-b border-white/5">
                <Text className="text-white font-black uppercase tracking-widest text-xs">
                   {isViewOnly ? 'View Program' : (editingId ? 'Edit Program' : 'New Program')}
                </Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full">
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
                         dropdownIconColor="#f97316" 
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
                         dropdownIconColor="#f97316" 
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
                   {days && Object.keys(days).length > 0 && Object.keys(days).sort((a,b) => {
                      const numA = parseInt(a.replace(/\D/g, "")) || 0;
                      const numB = parseInt(b.replace(/\D/g, "")) || 0;
                      return numA - numB;
                   }).map((dayKey) => (
                     <View key={dayKey} className="mb-10">
                        <View className="flex-row justify-between items-center mb-6 px-2">
                           <Text className="text-orange-500 font-black text-xl uppercase tracking-tighter">{dayKey}</Text>
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
                                       onPress={() => { setSelectedTimeField({dayKey, idx}); setShowTimePicker(true); }}
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
                                           dropdownIconColor="#f97316" 
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
                                        <TouchableOpacity onPress={() => updateExercise(dayKey, idx, "mediaType", "url")} className={`px-3 py-1 rounded-md ${ex.mediaType === 'url' ? 'bg-orange-500' : ''}`}>
                                           <Text className="text-white font-black text-[7px] uppercase">URL</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { updateExercise(dayKey, idx, "mediaType", "upload"); updateExercise(dayKey, idx, "media", ""); }} className={`px-3 py-1 rounded-md ${ex.mediaType === 'upload' ? 'bg-orange-500' : ''}`}>
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
                                   onPress={() => pickMedia(dayKey, idx)}
                                   disabled={isViewOnly}
                                   className={`bg-black/40 p-4 rounded-xl border border-white/5 flex-row items-center justify-between ${isViewOnly ? 'opacity-50' : ''}`}
                                 >
                                    <Text className="text-white/60 font-medium text-[10px]">
                                      {ex.media ? "Media Selected (Ready to Sync)" : "Select Video or Image from Library"}
                                    </Text>
                                    <Ionicons name={ex.media ? "checkmark-circle" : "cloud-upload-outline"} size={16} color={ex.media ? "#22c55e" : "#f97316"} />
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
                              <Text className="text-orange-500 font-black text-xs uppercase">+ Add Exercise</Text>
                           </TouchableOpacity>
                         )}
                     </View>
                   ))}

                    {!isViewOnly && (
                      <>
                        <TouchableOpacity onPress={addDay} className="bg-white/5 p-6 rounded-2xl mb-8 items-center justify-center border border-dashed border-white/10">
                           <View className="flex-row items-center">
                              <Ionicons name="calendar-outline" size={20} color="#f97316" />
                              <Text className="text-white font-black uppercase tracking-widest text-[10px] ml-3">Add Training Day</Text>
                           </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={saveProgram} className="bg-orange-600 p-6 rounded-2xl items-center justify-center mb-24 shadow-xl shadow-orange-600/40">
                          <Text className="text-white font-black uppercase tracking-[0.1em]">Publish Training Program</Text>
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
