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
} from "react-native";
import * as XLSX from "xlsx";
import { useAuth } from "../../context/AuthContext";
import api, { getTrainerDietPlans, getTrainerMembers } from "../../services/api";

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

const generateTestData = () => {
  return {
    Day1: {
      "Early-morning": {
        time: "06:00 AM",
        items: [
          { food: "Warm Water with Lemon", quantity: "1 glass", calories: "5" },
          { food: "Almonds", quantity: "8 pcs", calories: "80" }
        ]
      },
      "Breakfast": {
        time: "07:30 AM",
        items: [
          { food: "Oats Porridge", quantity: "1 bowl (40g)", calories: "150" },
          { food: "Whole Milk", quantity: "1 cup (200ml)", calories: "130" },
          { food: "Banana", quantity: "1 medium", calories: "105" }
        ]
      },
      "Mid-morning": {
        time: "10:30 AM",
        items: [
          { food: "Apple", quantity: "1 large", calories: "95" },
          { food: "Peanut Butter", quantity: "1 tbsp", calories: "95" }
        ]
      },
      "Lunch": {
        time: "01:00 PM",
        items: [
          { food: "Basmati Rice", quantity: "1 cup cooked", calories: "300" },
          { food: "Grilled Chicken Breast", quantity: "150g", calories: "250" },
          { food: "Mixed Vegetables", quantity: "1 bowl", calories: "80" }
        ]
      },
      "Evening": {
        time: "04:00 PM",
        items: [
          { food: "Greek Yogurt", quantity: "150g", calories: "100" },
          { food: "Granola", quantity: "30g", calories: "120" },
          { food: "Berries", quantity: "50g", calories: "30" }
        ]
      },
      "Pre-workout": {
        time: "05:00 PM",
        items: [
          { food: "White Bread", quantity: "2 slices", calories: "160" },
          { food: "Honey", quantity: "2 tbsp", calories: "130" }
        ]
      },
      "Post-workout": {
        time: "07:00 PM",
        items: [
          { food: "Whey Protein Shake", quantity: "1 scoop (30g)", calories: "120" },
          { food: "Whole Milk", quantity: "200ml", calories: "130" }
        ]
      },
      "Dinner": {
        time: "09:00 PM",
        items: [
          { food: "Whole Wheat Roti", quantity: "3 pcs", calories: "210" },
          { food: "Paneer Curry", quantity: "1 bowl", calories: "200" },
          { food: "Cucumber Salad", quantity: "1 bowl", calories: "45" }
        ]
      }
    },
    Day2: {
      "Early-morning": {
        time: "06:00 AM",
        items: [
          { food: "Green Tea", quantity: "1 cup", calories: "2" },
          { food: "Cashews", quantity: "10 pcs", calories: "100" }
        ]
      },
      "Breakfast": {
        time: "07:30 AM",
        items: [
          { food: "Brown Bread", quantity: "2 slices", calories: "160" },
          { food: "Boiled Eggs", quantity: "2 pcs", calories: "160" },
          { food: "Tomato", quantity: "1 medium", calories: "22" }
        ]
      },
      "Mid-morning": {
        time: "10:30 AM",
        items: [
          { food: "Orange", quantity: "1 large", calories: "86" },
          { food: "Almonds", quantity: "8 pcs", calories: "80" }
        ]
      },
      "Lunch": {
        time: "01:00 PM",
        items: [
          { food: "Brown Rice", quantity: "1 cup cooked", calories: "280" },
          { food: "Grilled Fish", quantity: "150g", calories: "240" },
          { food: "Steamed Broccoli", quantity: "1 cup", calories: "55" }
        ]
      },
      "Evening": {
        time: "04:00 PM",
        items: [
          { food: "Protein Bar", quantity: "1 bar (50g)", calories: "200" },
          { food: "Almond Milk", quantity: "200ml", calories: "30" }
        ]
      },
      "Pre-workout": {
        time: "05:00 PM",
        items: [
          { food: "Banana", quantity: "1 large", calories: "120" },
          { food: "Peanut Butter", quantity: "1 tbsp", calories: "95" }
        ]
      },
      "Post-workout": {
        time: "07:00 PM",
        items: [
          { food: "Whey Protein Shake", quantity: "1 scoop (30g)", calories: "120" },
          { food: "Whole Milk", quantity: "200ml", calories: "130" }
        ]
      },
      "Dinner": {
        time: "09:00 PM",
        items: [
          { food: "Quinoa", quantity: "1 cup cooked", calories: "240" },
          { food: "Grilled Chicken Thigh", quantity: "120g", calories: "200" },
          { food: "Bell Pepper Mix", quantity: "1 bowl", calories: "60" }
        ]
      }
    }
  };
};

export default function DietPlans() {
  const { user } = useAuth();
  const router = useRouter();

  // -- UI STATE --
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dietPlans, setDietPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [expandedDayIndex, setExpandedDayIndex] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeField, setSelectedTimeField] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [importing, setImporting] = useState(false);

  // -- FORM STATE --
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    memberId: "", memberName: "", memberEmail: "", memberMobile: "",
    memberWeight: "", title: "", totalCalories: 0, duration: 1,
    days: [generateSingleDay()],
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
    (form.days || []).forEach((day) => {
      Object.values(day || {}).forEach((meal) => {
        if (meal && meal.items && Array.isArray(meal.items)) {
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
      days: [generateSingleDay()],
    });
    setExpandedDayIndex(0);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleAddWithTestData = () => {
    if (members.length === 0) {
      Alert.alert("No Members", "Please add members first.");
      return;
    }
    const firstMember = members[0];
    const testData = generateTestData();
    const testDaysArray = Object.keys(testData).sort((a,b) => {
       const numA = parseInt(a.replace(/\D/g, "")) || 0;
       const numB = parseInt(b.replace(/\D/g, "")) || 0;
       return numA - numB;
    }).map(key => testData[key]);

    setEditingId(null);
    setForm({
      memberId: String(firstMember.id),
      memberName: firstMember.name || firstMember.username || "",
      memberEmail: firstMember.email || firstMember.userEmail || firstMember.user_email || "",
      memberMobile: firstMember.mobile || firstMember.phone || firstMember.userMobile || firstMember.user_mobile || "",
      memberWeight: firstMember.weight || firstMember.member_weight || firstMember.userWeight || "",
      title: "Endurance & Stamina Test Plan",
      totalCalories: 0,
      duration: testDaysArray.length,
      days: testDaysArray,
    });
    setExpandedDayIndex(0);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleEdit = (plan) => {
    let daysData = plan.days;
    if (typeof daysData === 'string') {
      try { daysData = JSON.parse(daysData); } catch (e) { daysData = null; }
    }

    let fixedDays = [];
    if (Array.isArray(daysData)) {
      fixedDays = daysData;
    } else if (daysData && typeof daysData === 'object') {
      const keys = Object.keys(daysData).sort((a,b) => {
         const numA = parseInt(a.replace(/\D/g, "")) || 0;
         const numB = parseInt(b.replace(/\D/g, "")) || 0;
         return numA - numB;
      });
      fixedDays = keys.map(k => daysData[k]);
    }
    if (fixedDays.length === 0) fixedDays = [generateSingleDay()];

    setEditingId(plan.id);
    setForm({
      memberId: String(plan.member_id || plan.memberId),
      memberName: plan.member_name || plan.memberName,
      memberEmail: plan.member_email || plan.memberEmail || "",
      memberMobile: plan.member_mobile || plan.memberMobile || "",
      memberWeight: plan.member_weight || plan.memberWeight || "",
      title: plan.title,
      totalCalories: plan.total_calories || plan.totalCalories || 0,
      duration: plan.duration || fixedDays.length,
      days: fixedDays,
    });
    setExpandedDayIndex(0);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (plan) => {
    let daysData = plan.days;
    if (typeof daysData === 'string') {
      try { daysData = JSON.parse(daysData); } catch (e) { daysData = null; }
    }

    let fixedDays = [];
    if (Array.isArray(daysData)) {
      fixedDays = daysData;
    } else if (daysData && typeof daysData === 'object') {
      const keys = Object.keys(daysData).sort((a,b) => {
         const numA = parseInt(a.replace(/\D/g, "")) || 0;
         const numB = parseInt(b.replace(/\D/g, "")) || 0;
         return numA - numB;
      });
      fixedDays = keys.map(k => daysData[k]);
    }
    if (fixedDays.length === 0) fixedDays = [generateSingleDay()];

    setEditingId(plan.id);
    setForm({
      memberId: String(plan.member_id || plan.memberId),
      memberName: plan.member_name || plan.memberName,
      memberEmail: plan.member_email || plan.memberEmail || "",
      memberMobile: plan.member_mobile || plan.memberMobile || "",
      memberWeight: plan.member_weight || plan.memberWeight || "",
      title: plan.title,
      totalCalories: plan.total_calories || plan.totalCalories || 0,
      duration: plan.duration || fixedDays.length,
      days: fixedDays,
    });
    setExpandedDayIndex(0);
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
    const count = form.days.length;
    setForm((prev) => ({
      ...prev,
      duration: count + 1,
      days: [...prev.days, generateSingleDay()],
    }));
  };

  const handleRemoveDay = (dayIndex) => {
    if (form.days.length <= 1) return;
    const updated = [...form.days];
    updated.splice(dayIndex, 1);
    setForm((prev) => ({ ...prev, duration: updated.length, days: updated }));
  };

  const parseTimeToDate = (timeStr) => {
    if (!timeStr) return new Date();
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return new Date();
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const date = new Date();
    date.setHours(hours, minutes, 0);
    return date;
  };

  const handleMealChange = (dayIndex, meal, field, value) => {
    setForm((prev) => {
      try {
        const updatedDays = [...prev.days];
        updatedDays[dayIndex] = {
          ...updatedDays[dayIndex],
          [meal]: { ...updatedDays[dayIndex][meal], [field]: String(value || "") },
        };
        return {
          ...prev,
          days: updatedDays,
        };
      } catch (error) {
        console.log("Error updating meal:", error);
        return prev;
      }
    });
  };

  const handleFoodItemChange = (dayIndex, meal, itemIndex, field, value) => {
    setForm((prev) => {
      try {
        const updatedDays = [...prev.days];
        const items = updatedDays[dayIndex]?.[meal]?.items || [];
        const updatedItems = [...items];
        if (updatedItems[itemIndex]) {
          updatedItems[itemIndex] = { ...updatedItems[itemIndex], [field]: String(value || "") };
        }
        updatedDays[dayIndex] = {
          ...updatedDays[dayIndex],
          [meal]: { ...updatedDays[dayIndex][meal], items: updatedItems },
        };
        return {
          ...prev,
          days: updatedDays,
        };
      } catch (error) {
        console.log("Error updating food item:", error);
        return prev;
      }
    });
  };

  const handleAddFoodItem = (dayIndex, meal) => {
    setForm((prev) => {
      try {
        const updatedDays = [...prev.days];
        const items = updatedDays[dayIndex]?.[meal]?.items || [];
        updatedDays[dayIndex] = {
          ...updatedDays[dayIndex],
          [meal]: {
            ...updatedDays[dayIndex][meal],
            items: [...items, { food: "", quantity: "", calories: "" }],
          },
        };
        return {
          ...prev,
          days: updatedDays,
        };
      } catch (error) {
        console.log("Error adding food item:", error);
        return prev;
      }
    });
  };

  const handleRemoveFoodItem = (dayIndex, meal, itemIndex) => {
    setForm((prev) => {
      try {
        const updatedDays = [...prev.days];
        const items = updatedDays[dayIndex]?.[meal]?.items || [];
        if (items.length <= 1) return prev;
        const updatedItems = items.filter((_, i) => i !== itemIndex);
        updatedDays[dayIndex] = {
          ...updatedDays[dayIndex],
          [meal]: { ...updatedDays[dayIndex][meal], items: updatedItems },
        };
        return {
          ...prev,
          days: updatedDays,
        };
      } catch (error) {
        console.log("Error removing food item:", error);
        return prev;
      }
    });
  };

  const handleCopyDay1ToAll = () => {
    if (form.days.length <= 1) {
      Alert.alert("Wait", "Add more days first.");
      return;
    }
    const day1Data = JSON.parse(JSON.stringify(form.days[0]));
    setForm((prev) => {
      const updatedDays = prev.days.map((day, i) => i === 0 ? day : day1Data);
      return { ...prev, days: updatedDays };
    });
    Alert.alert("Success", "Day 1 copied to all days.");
  };

  const normalizeString = (value) => String(value || "").trim();

  const getRowValue = (row, keys) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const value = row[key];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          return String(value).trim();
        }
      }
    }
    const lowerMap = Object.fromEntries(
      Object.keys(row).map((key) => [key.toLowerCase(), row[key]])
    );
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(lowerMap, lowerKey)) {
        const value = lowerMap[lowerKey];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          return String(value).trim();
        }
      }
    }
    return "";
  };

  const parseDayNumber = (value) => {
    const raw = normalizeString(value);
    if (!raw) return null;
    const found = raw.match(/\d+/);
    if (found) return Number(found[0]);
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const normalizeMeal = (value) => {
    const raw = normalizeString(value).toLowerCase();
    if (!raw) return "";
    const normalized = raw.replace(/[\s_-]+/g, " ").trim();
    if (["early morning", "early-morning", "early"].includes(normalized)) return "Early-morning";
    if (["mid morning", "mid-morning", "mid", "midmorning"].includes(normalized)) return "Mid-morning";
    if (["breakfast"].includes(normalized)) return "Breakfast";
    if (["lunch"].includes(normalized)) return "Lunch";
    if (["evening"].includes(normalized)) return "Evening";
    if (["dinner"].includes(normalized)) return "Dinner";
    if (["pre workout", "pre-workout", "preworkout"].includes(normalized)) return "Pre-workout";
    if (["post workout", "post-workout", "postworkout"].includes(normalized)) return "Post-workout";
    
    const found = meals.find((meal) => meal.toLowerCase() === raw);
    if (found) return found;
    for (const meal of meals) {
      if (raw.startsWith(meal.toLowerCase())) return meal;
    }
    
    if (raw.includes("pre") && raw.includes("workout")) return "Pre-workout";
    if (raw.includes("post") && raw.includes("workout")) return "Post-workout";
    if (raw.includes("early") && raw.includes("morning")) return "Early-morning";
    if (raw.includes("mid") && raw.includes("morning")) return "Mid-morning";
    return "";
  };

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
        return;
      }

      const parsedDays = {};
      let rowsParsed = 0;

      rows.forEach((row) => {
        const dayRaw = getRowValue(row, ["Day", "Day Number", "Day No", "DayNo", "Day#", "day"]);
        const mealRaw = getRowValue(row, ["Meal", "Meal Name", "Meal Type", "MealType", "meal"]);
        const dayNumber = parseDayNumber(dayRaw) || 1;
        const mealName = normalizeMeal(mealRaw);
        const time = getRowValue(row, ["Time", "Timing", "Meal Time", "MealTime", "time"]);
        const food = getRowValue(row, ["Food", "Food Item", "FoodItem", "Item", "Description", "food"]);
        const quantity = getRowValue(row, ["Qty", "Quantity", "QTY", "Serving", "quantity"]);
        const calories = getRowValue(row, ["Kcal", "Calories", "Cal", "Energy", "calories"]);

        if (!mealName || !meals.includes(mealName)) return;

        const dayKey = `Day${dayNumber}`;
        if (!parsedDays[dayKey]) parsedDays[dayKey] = {};
        if (!parsedDays[dayKey][mealName]) parsedDays[dayKey][mealName] = { time: "", items: [] };

        const mealData = parsedDays[dayKey][mealName];
        if (time) mealData.time = time;
        if (food || quantity || calories) mealData.items.push({ food, quantity, calories });

        rowsParsed += 1;
      });

      const dayIndices = Object.keys(parsedDays)
        .map(key => parseInt(key.replace("Day", "")))
        .sort((a,b) => a - b);

      if (dayIndices.length === 0 || rowsParsed === 0) {
        Alert.alert("Error", "No valid diet rows found.");
        return;
      }

      const maxDay = Math.max(...dayIndices);
      const newDaysArray = [];
      for (let i = 1; i <= maxDay; i++) {
        const rawDay = parsedDays[`Day${i}`] || {};
        const dayTemplate = generateSingleDay();
        const mergedDay = {};
        meals.forEach((meal) => {
          const mealData = rawDay[meal];
          if (mealData) {
            mergedDay[meal] = {
              ...dayTemplate[meal],
              time: mealData.time || dayTemplate[meal].time,
              items: mealData.items.length > 0 ? mealData.items : dayTemplate[meal].items,
            };
          } else {
            mergedDay[meal] = dayTemplate[meal];
          }
        });
        newDaysArray.push(mergedDay);
      }

      setForm((prev) => ({
        ...prev,
        days: newDaysArray,
        duration: newDaysArray.length,
      }));

      Alert.alert("Success", `Imported diet plan for ${newDaysArray.length} day(s)`);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to import Excel.");
    } finally {
      setImporting(false);
    }
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
        duration: Number(form.duration) || form.days.length,
        days: form.days,
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
            <View className="w-12 h-12 rounded-2xl bg-#e11d1d/10 items-center justify-center border border-#e11d1d/20">
              <Ionicons name="restaurant-outline" size={20} color="#e11d1d" />
            </View>
            <View className="ml-4">
              <Text className="text-white font-black text-base uppercase tracking-tight">{item.member_name}</Text>
              <Text className="text-[#e11d1d]/60 text-[9px] font-black uppercase tracking-widest">{item.title}</Text>
            </View>
          </View>
          <View className="bg-[#e11d1d] px-3 py-1.5 rounded-xl">
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
            className="flex-row items-center px-4 py-2 bg-#e11d1d/10 rounded-xl border border-#e11d1d/20"
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
      {loading && !dietPlans.length ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e11d1d" />
          <Text className="text-white/40 mt-4 uppercase tracking-[0.3em] font-black text-[9px]">Syncing Diets...</Text>
        </View>
      ) : (
        <>
          {/* HEADER */}
          <View className="pt-16 pb-8 px-5 bg-[#0f0f0f] border-b border-white/5 flex-row justify-between items-center">
            <View>
              <Text className="text-white text-3xl font-black tracking-tight">Diet Plans</Text>
              <Text className="text-[#e11d1d] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Nutrition Hub</Text>
            </View>

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
        className="absolute bottom-10 right-5 w-16 h-16 bg-[#e11d1d] rounded-full items-center justify-center shadow-2xl shadow-[#e11d1d]/60 border-4 border-black"
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
                <View className="flex-row items-center gap-4">
                   {!isViewOnly && (
                     <TouchableOpacity 
                       onPress={handleImportExcel} 
                       disabled={importing}
                       className={`flex-row items-center bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30 ${importing ? 'opacity-50' : ''}`}
                     >
                       <Ionicons name="document-text-outline" size={14} color="#10b981" />
                       <Text className="text-emerald-400 font-black text-[10px] uppercase ml-1">
                         {importing ? "..." : "Import"}
                       </Text>
                     </TouchableOpacity>
                   )}
                   <TouchableOpacity onPress={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full">
                      <Ionicons name="close" size={22} color="white" />
                   </TouchableOpacity>
                </View>
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
                   <View className="bg-[#e11d1d] p-6 rounded-2xl mb-8 flex-row justify-between items-center shadow-lg shadow-[#e11d1d]/40">
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
                         dropdownIconColor="#e11d1d" 
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
                   {form.days && form.days.length > 0 && form.days.map((dayData, dayIndex) => (
                      <View key={dayIndex} className="mb-8">
                         <View className="flex-row items-center mb-6">
                            <View className="w-10 h-[1px] bg-#e11d1d/30" />
                            <Text className="text-[#e11d1d] font-black uppercase tracking-[0.3em] mx-4 text-center">Day {dayIndex + 1}</Text>
                            <View className="flex-1 h-[1px] bg-#e11d1d/30" />
                            <View className="flex-row items-center gap-2 ml-4">
                               {dayIndex === 0 && form.days.length > 1 && (
                                 <TouchableOpacity onPress={handleCopyDay1ToAll} className="bg-emerald-500/10 p-2 rounded-xl">
                                   <Ionicons name="copy-outline" size={16} color="#10b981" />
                                 </TouchableOpacity>
                               )}
                               {form.days.length > 1 && (
                                 <TouchableOpacity onPress={() => handleRemoveDay(dayIndex)} className="bg-red-500/10 p-2 rounded-xl">
                                   <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                 </TouchableOpacity>
                               )}
                            </View>
                         </View>
                         
                         {meals.map(meal => {
                           const mealInfo = dayData[meal] || { time: "", items: [] };
                           const mealItems = mealInfo.items || [];
                           
                           return (
                             <View key={meal} className="bg-white/5 p-6 rounded-2xl mb-6 border border-white/5">
                                <View className="flex-row justify-between items-center mb-6">
                                   <View className="flex-1">
                                      <Text className="text-white font-black text-xs uppercase tracking-widest">{meal}</Text>
                                      {mealInfo.time && (
                                        <View className="flex-row items-center mt-2">
                                          <Ionicons name="time" size={14} color="#e11d1d" />
                                          <Text className="text-[#e11d1d] text-xs font-bold ml-1">{mealInfo.time}</Text>
                                        </View>
                                      )}
                                   </View>
                                    <TouchableOpacity 
                                       onPress={() => { setSelectedTimeField({dayIndex, meal}); setShowTimePicker(true); }} 
                                       disabled={isViewOnly}
                                       className="bg-#e11d1d/10 px-3 py-1.5 rounded-full border border-#e11d1d/20"
                                    >
                                       <Text className="text-[#e11d1d] text-[8px] font-black uppercase">{mealInfo.time ? "EDIT" : "SET TIME"}</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                {mealItems.map((item, idx) => (
                                  <View key={idx} className="mb-6 border-b border-white/5 pb-6">
                                     <TextInput 
                                        placeholder="Food Description" 
                                        value={String(item.food || "")} 
                                        editable={!isViewOnly}
                                        onChangeText={v => handleFoodItemChange(dayIndex, meal, idx, "food", v)} 
                                        placeholderTextColor="rgba(255,255,255,0.1)" 
                                        className={`bg-black/30 p-4 rounded-xl text-white mb-4 font-bold border border-white/5 ${isViewOnly ? 'opacity-50' : ''}`} 
                                     />
                                     
                                     <View className="flex-row gap-4">
                                        <TextInput 
                                           placeholder="Quantity" 
                                           value={String(item.quantity || "")} 
                                           editable={!isViewOnly}
                                           onChangeText={v => handleFoodItemChange(dayIndex, meal, idx, "quantity", v)} 
                                           placeholderTextColor="rgba(255,255,255,0.1)" 
                                           className={`flex-1 bg-black/30 p-4 rounded-xl text-white font-bold border border-white/5 ${isViewOnly ? 'opacity-50' : ''}`} 
                                        />
                                        <TextInput 
                                           placeholder="Kcal" 
                                           value={String(item.calories || "")} 
                                           editable={!isViewOnly}
                                           onChangeText={v => handleFoodItemChange(dayIndex, meal, idx, "calories", v.replace(/[^0-9]/g, ""))} 
                                           keyboardType="numeric" 
                                           placeholderTextColor="rgba(255,255,255,0.1)" 
                                           className={`flex-1 bg-black/30 p-4 rounded-xl text-white font-black text-center border border-white/5 ${isViewOnly ? 'opacity-50' : ''}`} 
                                        />
                                        
                                        {!isViewOnly && (
                                          <View className="flex-row gap-2">
                                            <TouchableOpacity 
                                              onPress={() => handleAddFoodItem(dayIndex, meal)}
                                              className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center border border-emerald-500/20"
                                            >
                                              <Ionicons name="add" size={18} color="#10b981" />
                                            </TouchableOpacity>
                                            {mealItems.length > 1 && (
                                              <TouchableOpacity 
                                                onPress={() => handleRemoveFoodItem(dayIndex, meal, idx)}
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
                              <Ionicons name="restaurant-outline" size={20} color="#e11d1d" />
                              <Text className="text-white font-black uppercase tracking-widest text-[10px] ml-3">Add Nutrition Day</Text>
                           </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={saveDietPlan} className="bg-#e11d1d p-6 rounded-2xl items-center justify-center mb-24 shadow-xl shadow-#e11d1d/40">
                          <Text className="text-white font-black uppercase tracking-[0.1em]">Publish Diet Plan</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {showTimePicker && selectedTimeField && (
                      <DateTimePicker
                        value={parseTimeToDate(form.days[selectedTimeField.dayIndex][selectedTimeField.meal]?.time)} 
                        mode="time" 
                        is24Hour={false} 
                        display="default"
                        onChange={(event, date) => {
                          setShowTimePicker(false);
                          if (event.type === "set" && date && selectedTimeField) {
                            const h = date.getHours();
                            const m = date.getMinutes();
                            const ampm = h >= 12 ? 'PM' : 'AM';
                            const h12 = h % 12 || 12;
                            const mStr = String(m).padStart(2, '0');
                            const hStr = String(h12).padStart(2, '0');
                            const formatted = `${hStr}:${mStr} ${ampm}`;
                            handleMealChange(selectedTimeField.dayIndex, selectedTimeField.meal, "time", formatted);
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

      
    </View>
  );
}
