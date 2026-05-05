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
import DateTimePicker from "@react-native-community/datetimepicker";
import api, { getTrainerMembers, getTrainerDietPlans } from "../../services/api";

const meals = ["Early-morning", "Breakfast", "Mid-morning", "Lunch", "Evening", "Dinner", "Pre-workout", "Post-workout"];

const generateSingleDay = () => {
  const day = {};
  meals.forEach((meal) => {
    day[meal] = { 
      time: "", 
      items: [{ food: "", quantity: "", calories: "" }] 
    };
  });
  return day;
};

export default function DietPlans() {
  const { user } = useAuth();
  const router = useRouter();

  // -- UI STATE --
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dietPlans, setDietPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [expandedDay, setExpandedDay] = useState("Day1");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeField, setSelectedTimeField] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // -- FORM STATE --
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    memberId: "", memberName: "", memberEmail: "", memberMobile: "",
    memberWeight: "", title: "", totalCalories: 0, duration: 7,
    days: { Day1: generateSingleDay() },
  });

  // -- DATA FETCHING --
  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const planList = await getTrainerDietPlans(user.id);
      const memberList = await getTrainerMembers(user.id, user);
      
      setMembers(memberList);
      
      const assignedMemberIds = memberList.map(m => String(m.id));
      const filteredPlans = (Array.isArray(planList) ? planList : (planList.data || []))
        .filter(p => assignedMemberIds.includes(String(p.member_id || p.memberId)));
        
      setDietPlans(filteredPlans);
    } catch (err) {
      console.log("Diet Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // -- CALCULATION --
  useEffect(() => {
    let total = 0;
    Object.values(form.days).forEach((day) => {
      Object.values(day).forEach((meal) => {
        if (meal.items && Array.isArray(meal.items)) {
          meal.items.forEach(item => {
            total += Number(item.calories || 0);
          });
        }
      });
    });
    setForm((prev) => ({ ...prev, totalCalories: total }));
  }, [form.days]);

  // -- HANDLERS --
  const handleAdd = () => {
    setEditingId(null);
    setForm({
      memberId: "", memberName: "", memberEmail: "", memberMobile: "",
      memberWeight: "", title: "", totalCalories: 0, duration: 1,
      days: { Day1: generateSingleDay() },
    });
    setExpandedDay("Day1");
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleEdit = (plan) => {
    let daysData = plan.days;
    if (typeof daysData === 'string') {
      try { daysData = JSON.parse(daysData); } catch (e) { daysData = null; }
    }

    setEditingId(plan.id);
    setForm({
      memberId: String(plan.member_id || plan.memberId),
      memberName: plan.member_name || plan.memberName,
      memberEmail: plan.member_email || plan.memberEmail || "",
      memberMobile: plan.member_mobile || plan.memberMobile || "",
      memberWeight: plan.member_weight || plan.memberWeight || "",
      title: plan.title,
      totalCalories: plan.total_calories || plan.totalCalories || 0,
      duration: plan.duration || 1,
      days: daysData || { Day1: generateSingleDay() },
    });
    setExpandedDay("Day1");
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (plan) => {
    let daysData = plan.days;
    if (typeof daysData === 'string') {
      try { daysData = JSON.parse(daysData); } catch (e) { daysData = null; }
    }

    setEditingId(plan.id);
    setForm({
      memberId: String(plan.member_id || plan.memberId),
      memberName: plan.member_name || plan.memberName,
      memberEmail: plan.member_email || plan.memberEmail || "",
      memberMobile: plan.member_mobile || plan.memberMobile || "",
      memberWeight: plan.member_weight || plan.memberWeight || "",
      title: plan.title,
      totalCalories: plan.total_calories || plan.totalCalories || 0,
      duration: plan.duration || 1,
      days: daysData || { Day1: generateSingleDay() },
    });
    setExpandedDay("Day1");
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Remove Nutrition Plan",
      "Are you sure you want to delete this diet plan?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`https://dap.qtechx.com/api/diet-plans/${id}`, {
                method: "DELETE"
              });
              if (res.ok) {
                fetchData();
                Alert.alert("Success", "Diet plan removed.");
              }
            } catch (err) {
              Alert.alert("Error", "Failed to delete plan.");
            }
          }
        }
      ]
    );
  };

  const handleAddDay = () => {
    const count = Object.keys(form.days).length;
    const newKey = `Day${count + 1}`;
    setForm((prev) => ({
      ...prev,
      duration: count + 1,
      days: { ...prev.days, [newKey]: generateSingleDay() },
    }));
  };

  const handleRemoveDay = (dayKey) => {
    if (Object.keys(form.days).length <= 1) return;
    const updated = { ...form.days };
    delete updated[dayKey];
    setForm((prev) => ({ ...prev, duration: Object.keys(updated).length, days: updated }));
  };

  const handleMealChange = (day, meal, field, value) => {
    setForm((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [meal]: { ...prev.days[day][meal], [field]: value },
        },
      },
    }));
  };

  const handleFoodItemChange = (day, meal, index, field, value) => {
    setForm((prev) => {
      const items = prev.days?.[day]?.[meal]?.items || [];
      const updatedItems = [...items];
      if (updatedItems[index]) {
        updatedItems[index] = { ...updatedItems[index], [field]: value };
      }
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...prev.days[day],
            [meal]: { ...prev.days[day][meal], items: updatedItems },
          },
        },
      };
    });
  };

  const handleAddFoodItem = (day, meal) => {
    setForm((prev) => {
      const items = prev.days?.[day]?.[meal]?.items || [];
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...prev.days[day],
            [meal]: {
              ...prev.days[day][meal],
              items: [...items, { food: "", quantity: "", calories: "" }],
            },
          },
        },
      };
    });
  };

  const handleRemoveFoodItem = (day, meal, index) => {
    setForm((prev) => {
      const items = prev.days?.[day]?.[meal]?.items || [];
      if (items.length <= 1) return prev;
      const updatedItems = items.filter((_, i) => i !== index);
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...prev.days[day],
            [meal]: { ...prev.days[day][meal], items: updatedItems },
          },
        },
      };
    });
  };

  const handleCopyDay1ToAll = () => {
    if (Object.keys(form.days).length <= 1) {
      Alert.alert("Wait", "Add more days first.");
      return;
    }
    const day1Data = JSON.parse(JSON.stringify(form.days["Day1"]));
    setForm((prev) => {
      const updatedDays = { ...prev.days };
      Object.keys(updatedDays).forEach((dayKey) => {
        if (dayKey !== "Day1") updatedDays[dayKey] = day1Data;
      });
      return { ...prev, days: updatedDays };
    });
    Alert.alert("Success", "Day 1 copied to all days.");
  };

  const saveDietPlan = async () => {
    if (!form.memberId) { Alert.alert("Selection Required", "Please select a member."); return; }
    if (!form.title) { Alert.alert("Title Required", "Please enter a diet plan title."); return; }
    
    try {
      const payload = {
        trainer_id: user.id,
        trainerId: user.id,
        trainer_name: user.username,
        trainerName: user.username,
        member_id: Number(form.memberId),
        memberId: Number(form.memberId),
        user_id: Number(form.memberId),
        member_name: form.memberName,
        memberName: form.memberName,
        memberEmail: form.memberEmail,
        member_email: form.memberEmail,
        memberMobile: form.memberMobile,
        member_mobile: form.memberMobile,
        memberWeight: form.memberWeight,
        member_weight: form.memberWeight,
        title: form.title,
        total_calories: Number(form.totalCalories),
        totalCalories: Number(form.totalCalories),
        duration: form.duration,
        days: JSON.stringify(form.days),
        status: "active"
      };

      if (editingId) {
        await api.put(`/diet-plans/${editingId}`, payload);
      } else {
        await api.post(`/diet-plans`, payload);
      }

      setIsModalOpen(false);
      fetchData();
      Alert.alert("Success", "Diet plan synchronized.");
    } catch (err) {
      console.log("SYNC ERROR:", err.response?.data || err.message);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      Alert.alert("Sync Error", serverMsg || "Server rejected the plan. Please check all fields.");
    }
  };

  const DietCard = ({ item }) => (
    <View className="bg-[#1a1a1a] rounded-2xl mb-4 border border-white/5 overflow-hidden">
      <TouchableOpacity 
        onPress={() => handleView(item)}
        activeOpacity={0.7}
        className="p-6 pb-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-orange-500/10 items-center justify-center border border-orange-500/20">
              <Ionicons name="restaurant-outline" size={20} color="#f97316" />
            </View>
            <View className="ml-4">
              <Text className="text-white font-black text-base uppercase tracking-tight">{item.member_name}</Text>
              <Text className="text-orange-500/60 text-[9px] font-black uppercase tracking-widest">{item.title}</Text>
            </View>
          </View>
          <View className="bg-orange-600 px-3 py-1.5 rounded-xl">
             <Text className="text-white text-[10px] font-black uppercase">{(item.total_calories || item.totalCalories || 0)} KCAL</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.4)" />
          <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest ml-2">7 Day Nutrition Cycle</Text>
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
      {loading && !dietPlans.length ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-white/40 mt-4 uppercase tracking-[0.3em] font-black text-[9px]">Syncing Diets...</Text>
        </View>
      ) : (
        <>
          {/* HEADER */}
          <View className="pt-16 pb-8 px-5 bg-[#0f0f0f] border-b border-white/5 flex-row justify-between items-center">
            <View>
              <Text className="text-white text-3xl font-black tracking-tight">Diet Plans</Text>
              <Text className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Nutrition Hub</Text>
            </View>
            <TouchableOpacity className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={dietPlans}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <DietCard item={item} />}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-32">
                <Ionicons name="restaurant-outline" size={60} color="rgba(255,255,255,0.05)" />
                <Text className="text-white/20 font-black uppercase tracking-widest text-[10px] mt-6">No diet plans active</Text>
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
                   {isViewOnly ? 'View Plan' : (editingId ? 'Edit Plan' : 'New Plan')}
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
                   key={editingId || "new"}
                   className="flex-1 px-4 py-8" 
                   showsVerticalScrollIndicator={false} 
                   keyboardShouldPersistTaps="handled"
                   nestedScrollEnabled={true}
                >
                   
                   {/* STATS OVERVIEW */}
                   <View className="bg-orange-600 p-6 rounded-2xl mb-8 flex-row justify-between items-center shadow-lg shadow-orange-600/40">
                      <View>
                        <Text className="text-white/60 text-[8px] font-black uppercase tracking-widest mb-1">Target Daily</Text>
                        <Text className="text-white text-2xl font-black">{form.totalCalories} KCAL</Text>
                      </View>
                      <Ionicons name="flame" size={32} color="white" />
                   </View>

                   <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 px-1">Plan Details</Text>
                   <View className={`bg-white/5 rounded-2xl mb-6 border border-white/5 overflow-hidden ${isViewOnly ? 'opacity-50' : ''}`}>
                      <Picker 
                         selectedValue={form.memberId} 
                         enabled={!isViewOnly}
                         dropdownIconColor="#f97316" 
                         style={{ color: "white" }} 
                         onValueChange={(val) => {
                          const m = members.find(i => String(i.id) === String(val));
                           setForm({
                             ...form, 
                             memberId: val, 
                             memberName: m?.name || m?.username || "", 
                             memberEmail: m?.email || m?.userEmail || m?.user_email || "", 
                             memberMobile: m?.mobile || m?.phone || m?.userMobile || m?.user_mobile || "", 
                             memberWeight: m?.weight || m?.member_weight || m?.userWeight || ""
                           });
                        }}>
                        <Picker.Item label="Select Member..." value="" />
                        {members.map(m => <Picker.Item key={m.id} label={m.name} value={String(m.id)} />)}
                      </Picker>
                   </View>

                   <View className="flex-row gap-4 mb-8">
                     <View className="flex-1">
                        <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 px-1">Plan Title</Text>
                        <TextInput 
                           placeholder="e.g. Muscle Gain" 
                           value={form.title} 
                           editable={!isViewOnly}
                           onChangeText={t => setForm({...form, title: t})} 
                           placeholderTextColor="rgba(255,255,255,0.2)" 
                           className={`bg-white/5 p-5 rounded-2xl text-white border border-white/5 font-bold ${isViewOnly ? 'opacity-50' : ''}`} 
                        />
                     </View>
                     <View className="w-28">
                        <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 px-1">Weight (kg)</Text>
                        <TextInput 
                           placeholder="75" 
                           value={String(form.memberWeight)} 
                           keyboardType="numeric"
                           editable={!isViewOnly}
                           onChangeText={t => setForm({...form, memberWeight: t})} 
                           placeholderTextColor="rgba(255,255,255,0.2)" 
                           className={`bg-white/5 p-5 rounded-2xl text-white border border-white/5 font-bold text-center ${isViewOnly ? 'opacity-50' : ''}`} 
                        />
                     </View>
                   </View>

                   {/* MEALS GRID */}
                   {form.days && Object.keys(form.days).length > 0 && Object.keys(form.days).sort((a,b) => {
                      const numA = parseInt(a.replace(/\D/g, "")) || 0;
                      const numB = parseInt(b.replace(/\D/g, "")) || 0;
                      return numA - numB;
                   }).map(day => (
                      <View key={day} className="mb-8">
                         <View className="flex-row items-center mb-6">
                            <View className="w-10 h-[1px] bg-orange-500/30" />
                            <Text className="text-orange-500 font-black uppercase tracking-[0.3em] mx-4 text-center">{day.replace("Day", "Day ")}</Text>
                            <View className="flex-1 h-[1px] bg-orange-500/30" />
                            <View className="flex-row items-center gap-2 ml-4">
                               {day === "Day1" && Object.keys(form.days).length > 1 && (
                                 <TouchableOpacity onPress={handleCopyDay1ToAll} className="bg-emerald-500/10 p-2 rounded-xl">
                                   <Ionicons name="copy-outline" size={16} color="#10b981" />
                                 </TouchableOpacity>
                               )}
                               {Object.keys(form.days).length > 1 && (
                                 <TouchableOpacity onPress={() => handleRemoveDay(day)} className="bg-red-500/10 p-2 rounded-xl">
                                   <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                 </TouchableOpacity>
                               )}
                            </View>
                         </View>
                         
                         {meals.map(meal => {
                           const mealData = form.days[day][meal];
                           const mealItems = mealData.items || [];
                           
                           return (
                             <View key={meal} className="bg-white/5 p-6 rounded-2xl mb-6 border border-white/5">
                                <View className="flex-row justify-between items-center mb-6">
                                   <Text className="text-white font-black text-xs uppercase tracking-widest">{meal}</Text>
                                    <TouchableOpacity 
                                       onPress={() => { setSelectedTimeField({day, meal}); setShowTimePicker(true); }} 
                                       disabled={isViewOnly}
                                       className="bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20"
                                    >
                                       <Text className="text-orange-500 text-[8px] font-black uppercase">{mealData.time || "SET TIME"}</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                {mealItems.map((item, idx) => (
                                  <View key={idx} className="mb-6 border-b border-white/5 pb-6">
                                     <TextInput 
                                        placeholder="Food Description" 
                                        value={item.food} 
                                        editable={!isViewOnly}
                                        onChangeText={v => handleFoodItemChange(day, meal, idx, "food", v)} 
                                        placeholderTextColor="rgba(255,255,255,0.1)" 
                                        className={`bg-black/30 p-4 rounded-xl text-white mb-4 font-bold border border-white/5 ${isViewOnly ? 'opacity-50' : ''}`} 
                                     />
                                     
                                     <View className="flex-row gap-4">
                                        <TextInput 
                                           placeholder="Quantity" 
                                           value={item.quantity} 
                                           editable={!isViewOnly}
                                           onChangeText={v => handleFoodItemChange(day, meal, idx, "quantity", v)} 
                                           placeholderTextColor="rgba(255,255,255,0.1)" 
                                           className={`flex-1 bg-black/30 p-4 rounded-xl text-white font-bold border border-white/5 ${isViewOnly ? 'opacity-50' : ''}`} 
                                        />
                                        <TextInput 
                                           placeholder="Kcal" 
                                           value={String(item.calories)} 
                                           editable={!isViewOnly}
                                           onChangeText={v => handleFoodItemChange(day, meal, idx, "calories", v.replace(/[^0-9]/g, ""))} 
                                           keyboardType="numeric" 
                                           placeholderTextColor="rgba(255,255,255,0.1)" 
                                           className={`flex-1 bg-black/30 p-4 rounded-xl text-white font-black text-center border border-white/5 ${isViewOnly ? 'opacity-50' : ''}`} 
                                        />
                                        
                                        {!isViewOnly && (
                                          <View className="flex-row gap-2">
                                            <TouchableOpacity 
                                              onPress={() => handleAddFoodItem(day, meal)}
                                              className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center border border-emerald-500/20"
                                            >
                                              <Ionicons name="add" size={18} color="#10b981" />
                                            </TouchableOpacity>
                                            {mealItems.length > 1 && (
                                              <TouchableOpacity 
                                                onPress={() => handleRemoveFoodItem(day, meal, idx)}
                                                className="w-10 h-10 bg-red-500/10 rounded-xl items-center justify-center border border-red-500/20"
                                              >
                                                <Ionicons name="remove" size={18} color="#ef4444" />
                                              </TouchableOpacity>
                                            )}
                                          </View>
                                        )}
                                     </View>
                                  </View>
                                ))}
                             </View>
                           );
                         })}
                      </View>
                   ))}

                    {!isViewOnly && (
                      <>
                        <TouchableOpacity 
                           onPress={handleAddDay}
                           className="bg-white/5 p-6 rounded-2xl mb-8 items-center justify-center border border-dashed border-white/10"
                        >
                           <View className="flex-row items-center">
                              <Ionicons name="restaurant-outline" size={20} color="#f97316" />
                              <Text className="text-white font-black uppercase tracking-widest text-[10px] ml-3">Add Nutrition Day</Text>
                           </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={saveDietPlan} className="bg-orange-600 p-6 rounded-2xl items-center justify-center mb-24 shadow-xl shadow-orange-600/40">
                          <Text className="text-white font-black uppercase tracking-[0.1em]">Publish Diet Plan</Text>
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
                            handleMealChange(selectedTimeField.day, selectedTimeField.meal, "time", formatted);
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
