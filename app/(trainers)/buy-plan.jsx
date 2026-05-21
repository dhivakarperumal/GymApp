import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AssignPlan() {
  const router = useRouter();
  const { user, profileName } = useAuth();
  
  const loggedInName = profileName || user?.username || user?.name || "";

  // Data state
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [memberHistory, setMemberHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selection state
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const todayDateStr = new Date().toISOString().split("T")[0];

  // Form state
  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
    height: "",
    weight: "",
    bmi: "",
    startDate: new Date(),
    endDate: new Date(),
    paymentMode: "cash",
    paymentDate: new Date(),
  });

  const [paymentType, setPaymentType] = useState("full");
  const [initialPayment, setInitialPayment] = useState("");
  const [discount, setDiscount] = useState("");
  const [referredBy, setReferredBy] = useState(loggedInName);

  const [memberSearch, setMemberSearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  // Date picker state
  const [datePickerConfig, setDatePickerConfig] = useState({
    show: false,
    field: null, // "startDate", "endDate", "paymentDate"
  });

  const { member_id, user_id } = useLocalSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, plansRes, enqRes] = await Promise.all([
          api.get("/members"),
          api.get("/plans"),
          api.get("/enquiries").catch(() => ({ data: [] })),
        ]);
        const fetchedMembers = membersRes.data || [];
        const fetchedPlans = (plansRes.data || []).filter(p => p.active);
        
        setMembers(fetchedMembers);
        setPlans(fetchedPlans);
        setEnquiries(Array.isArray(enqRes.data) ? enqRes.data : []);

        const targetId = member_id || user_id;
        if (targetId) {
          const found = fetchedMembers.find(m => String(m.id || m.u_id || m.user_id || m.gymMemberId) === String(targetId));
          if (found) {
            setSelectedUser(found);
            setForm(prev => ({
              ...prev,
              phone: found.phone || "",
              email: found.email || "",
              address: found.address || "",
              height: found.height ? String(found.height) : "",
              weight: found.weight ? String(found.weight) : "",
              bmi: found.bmi ? String(found.bmi) : "",
            }));

            const uId = found.u_id || found.user_id || found.id || found.gymMemberId;
            if (uId) {
              api.get(`/memberships/user/${uId}`)
                .then(res => setMemberHistory(Array.isArray(res.data) ? res.data : []))
                .catch(err => console.log("History fetch err", err));
            }

            if (found.plan && found.plan !== "user") {
              const p = fetchedPlans.find(plan => plan.name.toLowerCase() === found.plan.toLowerCase());
              if (p) setSelectedPlan(p);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    fetchData();
  }, [member_id, user_id]);

  // Set default end date based on initial load
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setForm(prev => ({ ...prev, endDate: d }));
  }, []);

  // Filter Members
  const getFilteredMembers = () => {
    const seenPhones = new Set();
    return members.filter(m => {
      if (m.source === "users") return false;
      const hasPlan = m.status === "active" && m.plan;
      if (hasPlan && !memberSearch) return false;
      if (seenPhones.has(m.phone)) return false;
      seenPhones.add(m.phone);

      const searchLower = memberSearch.toLowerCase().trim();
      if (!searchLower) return true;
      const name = (m.name || m.username || "").toLowerCase();
      const phone = (m.phone || "").toLowerCase();
      const email = (m.email || "").toLowerCase();
      return name.includes(searchLower) || phone.includes(searchLower) || email.includes(searchLower);
    }).slice(0, 50); // limit to avoid lag
  };

  // Filter Plans
  const getFilteredPlans = () => {
    const searchLower = planSearch.toLowerCase().trim();
    if (!searchLower) return plans;
    return plans.filter(p => {
      const name = (p.name || "").toLowerCase();
      const duration = (p.duration || "").toLowerCase();
      return name.includes(searchLower) || duration.includes(searchLower);
    });
  };

  // Utility to parse duration
  const parseDurationValue = (value) => {
    if (value == null) return null;
    const raw = value.toString().trim().toLowerCase();
    const numberMatch = raw.match(/(\d+(?:\.\d+)?)/);
    const amount = numberMatch ? Number(numberMatch[1]) : NaN;
    if (Number.isNaN(amount)) return null;
    if (raw.includes("year")) return Math.round(amount * 12);
    if (raw.includes("month")) return Math.round(amount);
    if (raw.includes("week")) return Math.ceil((amount * 7) / 30);
    if (raw.includes("day")) return Math.ceil(amount / 30);
    return Number.isFinite(amount) ? Math.round(amount) : null;
  };

  const getSelectedPlanTotal = () => {
    if (!selectedPlan) return 0;
    const originalPrice = Number(selectedPlan.finalPrice ?? selectedPlan.final_price ?? selectedPlan.price) || 0;
    const discountVal = Number(discount) || 0;
    return Math.max(0, originalPrice - discountVal);
  };

  const getSelectedPlanDuration = () => {
    if (!selectedPlan) return 1;
    return parseDurationValue(selectedPlan.duration) || 1;
  };

  const isEMIAllowed = selectedPlan ? getSelectedPlanDuration() > 1 : false;

  useEffect(() => {
    if (!selectedPlan) return;
    if (paymentType === "emi" && !initialPayment) {
      const total = getSelectedPlanTotal();
      const duration = getSelectedPlanDuration();
      const emi = duration > 0 ? Number((total / duration).toFixed(2)) : 0;
      setInitialPayment(emi.toString());
    }
  }, [selectedPlan, paymentType, discount]);

  // Calculate BMI
  useEffect(() => {
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    if (h > 0 && w > 0) {
      const bmiVal = (w / ((h / 100) * (h / 100))).toFixed(2);
      setForm(prev => ({ ...prev, bmi: bmiVal }));
    }
  }, [form.height, form.weight]);

  // Auto-set End Date based on Plan & Start Date
  useEffect(() => {
    if (!selectedPlan) return;
    const durationMonths = parseDurationValue(selectedPlan.duration) || 0;
    const start = new Date(form.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (durationMonths * 30));
    setForm(prev => ({ ...prev, endDate: end }));
  }, [selectedPlan, form.startDate]);

  const selectMember = (m) => {
    setSelectedUser(m);
    setMemberSearch("");
    setShowMemberDropdown(false);
    
    setForm(prev => ({
      ...prev,
      phone: m.phone || "",
      email: m.email || "",
      address: m.address || "",
      height: m.height || "",
      weight: m.weight || "",
      bmi: m.bmi || "",
    }));

    // Fetch History
    const uId = m.u_id || m.user_id || m.id;
    if (uId) {
      api.get(`/memberships/user/${uId}`)
        .then(res => setMemberHistory(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.log("History fetch err", err));
    }

    // Try finding matching plan if they had enquiries or previous plans
    if (m.plan && m.plan !== "user") {
      const p = plans.find(plan => plan.name.toLowerCase() === m.plan.toLowerCase());
      if (p) setSelectedPlan(p);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedPlan) {
      Alert.alert("Error", "Please select both a member and a plan");
      return;
    }

    setLoading(true);
    try {
      const planTotal = getSelectedPlanTotal();
      const isEMI = paymentType === "emi" && isEMIAllowed;
      const amountNow = isEMI ? Number(initialPayment || 0) : planTotal;
      
      const sDate = form.startDate.toISOString().split("T")[0];
      const eDate = form.endDate.toISOString().split("T")[0];
      const pDate = form.paymentDate.toISOString().split("T")[0];

      // Update Member
      const updatedMember = {
        ...selectedUser,
        phone: form.phone,
        email: form.email,
        address: form.address,
        height: form.height,
        weight: form.weight,
        bmi: form.bmi,
        plan: selectedPlan.name,
        duration: selectedPlan.duration,
        joinDate: sDate,
        expiryDate: eDate,
        status: "pending", 
      };

      const finalUserId = selectedUser.id || selectedUser.u_id;
      if (selectedUser.id) {
        await api.put(`/members/${selectedUser.id}`, updatedMember);
      } else {
        await api.post("/members", updatedMember);
      }

      // Create Membership
      const membershipData = {
        userId: finalUserId,
        userName: selectedUser.name || selectedUser.username,
        userEmail: form.email,
        userPhone: form.phone,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        price: planTotal,
        pricePaid: amountNow,
        secondPaymentPaid: 0,
        duration: selectedPlan.duration,
        startDate: sDate,
        endDate: eDate,
        paymentMode: isEMI ? "emi" : form.paymentMode,
        paymentDate: pDate,
        paymentStatus: isEMI ? "Pending" : "Paid",
        status: "pending",
        referredBy: referredBy,
        trainerId: user?.id || null,
        trainerName: loggedInName,
      };

      await api.post("/memberships", membershipData);
      
      Alert.alert("Success", "Plan assigned successfully (Pending Approval)", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to assign plan");
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = (dateObj) => {
    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Assign Plan</Text>
            <Text style={styles.headerSubtitle}>New Membership</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* ================= MEMBER SECTION ================= */}
          <Text style={styles.sectionTitle}>1. Member Details</Text>
          
          {!selectedUser ? (
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search member by name, phone..."
                placeholderTextColor="#666"
                value={memberSearch}
                onChangeText={(t) => {
                  setMemberSearch(t);
                  setShowMemberDropdown(true);
                }}
                onFocus={() => setShowMemberDropdown(true)}
              />
              {memberSearch ? (
                <TouchableOpacity onPress={() => setMemberSearch("")}>
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.selectedCard}>
              <View>
                <Text style={styles.selectedTitle}>{selectedUser.name || selectedUser.username || "Member"}</Text>
                <Text style={styles.selectedSub}>{selectedUser.phone}</Text>
                {selectedUser.plan && selectedUser.plan !== 'user' && (
                  <Text style={styles.selectedTag}>Current: {selectedUser.plan}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => { setSelectedUser(null); setMemberSearch(""); }} style={styles.removeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {showMemberDropdown && !selectedUser && (
            <View style={styles.dropdown}>
              {getFilteredMembers().length === 0 ? (
                <Text style={styles.dropdownEmpty}>No members found</Text>
              ) : (
                getFilteredMembers().map((m, idx) => (
                  <TouchableOpacity key={idx} style={styles.dropdownItem} onPress={() => selectMember(m)}>
                    <Text style={styles.dropdownItemTitle}>{m.name || "Unknown"}</Text>
                    <Text style={styles.dropdownItemSub}>{m.phone} • {m.email || "No Email"}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Member Form Fields */}
          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput style={styles.input} value={form.phone} onChangeText={t => setForm({ ...form, phone: t })} keyboardType="phone-pad" placeholder="e.g. 9876543210" placeholderTextColor="#666" />
            </View>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={form.email} onChangeText={t => setForm({ ...form, email: t })} keyboardType="email-address" placeholder="e.g. name@domain.com" placeholderTextColor="#666" />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={form.address} onChangeText={t => setForm({ ...form, address: t })} multiline placeholder="Enter member address" placeholderTextColor="#666" />
          </View>

          <View style={styles.row}>
            <View style={styles.flexThird}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput style={styles.input} value={form.height} onChangeText={t => setForm({ ...form, height: t })} keyboardType="numeric" placeholder="Height" placeholderTextColor="#666" />
            </View>
            <View style={styles.flexThird}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput style={styles.input} value={form.weight} onChangeText={t => setForm({ ...form, weight: t })} keyboardType="numeric" placeholder="Weight" placeholderTextColor="#666" />
            </View>
            <View style={styles.flexThird}>
              <Text style={styles.label}>BMI</Text>
              <TextInput style={[styles.input, { backgroundColor: '#1a1a1a', color: '#f97316' }]} value={form.bmi} editable={false} placeholder="Auto" placeholderTextColor="#666" />
            </View>
          </View>

          {/* ================= PLAN SECTION ================= */}
          <Text style={[styles.sectionTitle, { marginTop: 30 }]}>2. Plan Details</Text>

          {!selectedPlan ? (
             <View style={styles.searchBox}>
               <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
               <TextInput
                 style={styles.searchInput}
                 placeholder="Search plans..."
                 placeholderTextColor="#666"
                 value={planSearch}
                 onChangeText={(t) => { setPlanSearch(t); setShowPlanDropdown(true); }}
                 onFocus={() => setShowPlanDropdown(true)}
               />
               {planSearch ? (
                 <TouchableOpacity onPress={() => setPlanSearch("")}>
                   <Ionicons name="close-circle" size={20} color="#888" />
                 </TouchableOpacity>
               ) : null}
             </View>
          ) : (
            <View style={[styles.selectedCard, { borderColor: '#f9731650', backgroundColor: '#f9731610' }]}>
              <View>
                <Text style={[styles.selectedTitle, { color: '#f97316' }]}>{selectedPlan.name}</Text>
                <Text style={styles.selectedSub}>{selectedPlan.duration} • Base: ₹{selectedPlan.finalPrice ?? selectedPlan.final_price}</Text>
              </View>
              <TouchableOpacity onPress={() => { setSelectedPlan(null); setPlanSearch(""); }} style={[styles.removeBtn, { backgroundColor: '#f97316' }]}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {showPlanDropdown && !selectedPlan && (
            <View style={styles.dropdown}>
              {getFilteredPlans().length === 0 ? (
                <Text style={styles.dropdownEmpty}>No plans found</Text>
              ) : (
                getFilteredPlans().map((p, idx) => (
                  <TouchableOpacity key={idx} style={styles.dropdownItem} onPress={() => { setSelectedPlan(p); setShowPlanDropdown(false); }}>
                    <Text style={styles.dropdownItemTitle}>{p.name}</Text>
                    <Text style={styles.dropdownItemSub}>{p.duration} • ₹{p.finalPrice ?? p.final_price}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} onPress={() => setDatePickerConfig({ show: true, field: 'startDate' })}>
                <Text style={{ color: '#fff' }}>{formatDateLabel(form.startDate)}</Text>
                <Ionicons name="calendar-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} onPress={() => setDatePickerConfig({ show: true, field: 'endDate' })}>
                <Text style={{ color: '#fff' }}>{formatDateLabel(form.endDate)}</Text>
                <Ionicons name="calendar-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= PAYMENT SECTION ================= */}
          <Text style={[styles.sectionTitle, { marginTop: 30 }]}>3. Payment Details</Text>

          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Payment Type</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={paymentType} onValueChange={setPaymentType} style={{ color: '#fff' }} dropdownIconColor="#f97316">
                  <Picker.Item label="Full Payment" value="full" />
                  {isEMIAllowed && <Picker.Item label="EMI" value="emi" />}
                </Picker>
              </View>
            </View>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Payment Mode</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={form.paymentMode} onValueChange={t => setForm({...form, paymentMode: t})} style={{ color: '#fff' }} dropdownIconColor="#f97316">
                  <Picker.Item label="Cash" value="cash" />
                  <Picker.Item label="UPI" value="upi" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Discount Amount (₹)</Text>
              <TextInput style={styles.input} value={discount} onChangeText={setDiscount} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
            </View>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Payment Date</Text>
              <TouchableOpacity style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} onPress={() => setDatePickerConfig({ show: true, field: 'paymentDate' })}>
                <Text style={{ color: '#fff' }}>{formatDateLabel(form.paymentDate)}</Text>
                <Ionicons name="calendar-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {paymentType === "emi" && isEMIAllowed && (
            <View style={styles.emiCard}>
              <View style={styles.emiHeader}>
                <View style={styles.emiIconBox}><Ionicons name="pie-chart" size={18} color="#f97316" /></View>
                <Text style={styles.emiTitle}>EMI Payment Plan</Text>
              </View>
              
              <View style={styles.emiRow}>
                <View>
                  <Text style={styles.emiLabel}>Total Final Price</Text>
                  <Text style={styles.emiVal}>₹{getSelectedPlanTotal()}</Text>
                </View>
                <View>
                  <Text style={styles.emiLabel}>Duration</Text>
                  <Text style={styles.emiVal}>{getSelectedPlanDuration()} months</Text>
                </View>
              </View>

              <Text style={[styles.label, { color: '#fff', marginTop: 16 }]}>Initial Payment (Today)</Text>
              <View style={styles.emiInputContainer}>
                <Text style={styles.emiCurrency}>₹</Text>
                <TextInput 
                  style={styles.emiInput} 
                  value={initialPayment} 
                  onChangeText={setInitialPayment} 
                  keyboardType="numeric" 
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={styles.emiSummary}>
                <Text style={styles.emiSummaryText}>Balance Remaining: <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>₹{getSelectedPlanTotal() - Number(initialPayment || 0)}</Text></Text>
                <Text style={styles.emiSummaryText}>Due in: <Text style={{ color: '#fff', fontWeight: 'bold' }}>30 Days</Text></Text>
              </View>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Referred By</Text>
            <TextInput style={styles.input} value={referredBy} onChangeText={setReferredBy} placeholder="Referrer Name" placeholderTextColor="#666" />
          </View>

          {/* ================= SUBMIT ================= */}
          <View style={styles.summaryFooter}>
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>Final Amount</Text>
              <Text style={styles.summaryTotalVal}>₹{getSelectedPlanTotal()}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleAssign}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitText}>
                  Pay ₹{paymentType === "emi" && isEMIAllowed ? (initialPayment || 0) : getSelectedPlanTotal()}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ================= HISTORY ================= */}
          {memberHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Previous History</Text>
              {memberHistory.map((h, i) => (
                <View key={i} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyPlan}>{h.planName}</Text>
                    <View style={[styles.historyBadge, h.status === 'active' ? {backgroundColor: '#10b98120'} : {backgroundColor: '#66666620'}]}>
                      <Text style={[styles.historyBadgeText, h.status === 'active' ? {color: '#10b981'} : {color: '#888'}]}>{h.status || 'Past'}</Text>
                    </View>
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyInfo}>Paid: ₹{h.pricePaid} / ₹{h.price}</Text>
                    <Text style={styles.historyInfo}>{new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {datePickerConfig.show && (
        <DateTimePicker
          value={form[datePickerConfig.field]}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setDatePickerConfig({ show: false, field: null });
            if (selectedDate) {
              setForm(prev => ({ ...prev, [datePickerConfig.field]: selectedDate }));
            }
          }}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: "#1a1a1a", backgroundColor: '#0a0a0a'
  },
  backButton: { marginRight: 16, padding: 8, backgroundColor: "#1a1a1a", borderRadius: 12 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  headerSubtitle: { color: "#f97316", fontSize: 12, marginTop: 2, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 16, letterSpacing: 0.5 },
  label: { color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 10, fontWeight: "700" },
  
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  flexHalf: { flex: 1 },
  flexThird: { flex: 1 },
  fieldGroup: { marginBottom: 16 },
  
  input: {
    backgroundColor: "#151515", borderWidth: 1, borderColor: "#262626", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 15,
  },
  pickerContainer: {
    backgroundColor: "#151515", borderWidth: 1, borderColor: "#262626", borderRadius: 12, overflow: "hidden", height: 50, justifyContent: 'center'
  },

  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#151515", borderWidth: 1, borderColor: "#333", borderRadius: 14, paddingHorizontal: 14, marginBottom: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, color: "#fff", fontSize: 15 },
  
  dropdown: { backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#333", borderRadius: 12, maxHeight: 200, marginBottom: 16, overflow: 'hidden' },
  dropdownEmpty: { color: "#888", padding: 16, textAlign: "center" },
  dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#2a2a2a" },
  dropdownItemTitle: { color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 2 },
  dropdownItemSub: { color: "#888", fontSize: 12 },

  selectedCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#333", borderRadius: 14, padding: 16, marginBottom: 16 },
  selectedTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  selectedSub: { color: "#aaa", fontSize: 13 },
  selectedTag: { color: "#f97316", fontSize: 10, fontWeight: "bold", backgroundColor: "#f9731620", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden', alignSelf: 'flex-start', marginTop: 6 },
  removeBtn: { backgroundColor: "#333", padding: 6, borderRadius: 10 },

  emiCard: { backgroundColor: "#f973160a", borderWidth: 1, borderColor: "#f9731640", borderRadius: 16, padding: 20, marginBottom: 16 },
  emiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  emiIconBox: { backgroundColor: "#f9731620", padding: 6, borderRadius: 8, marginRight: 10 },
  emiTitle: { color: "#f97316", fontSize: 16, fontWeight: "bold" },
  emiRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, backgroundColor: '#00000040', padding: 12, borderRadius: 10 },
  emiLabel: { color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 4 },
  emiVal: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  emiInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#000", borderWidth: 1, borderColor: "#f9731640", borderRadius: 12, paddingHorizontal: 16 },
  emiCurrency: { color: "#f97316", fontSize: 18, fontWeight: "bold", marginRight: 10 },
  emiInput: { flex: 1, color: "#fff", fontSize: 18, fontWeight: "bold", paddingVertical: 14 },
  emiSummary: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f9731620", flexDirection: "row", justifyContent: "space-between" },
  emiSummaryText: { color: "#888", fontSize: 12 },

  summaryFooter: { marginTop: 20, backgroundColor: "#111", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#222" },
  summaryTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  summaryTotalLabel: { color: "#aaa", fontSize: 14, fontWeight: "600" },
  summaryTotalVal: { color: "#f97316", fontSize: 24, fontWeight: "bold" },
  submitButton: { backgroundColor: "#f97316", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  submitText: { color: "white", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 },

  historySection: { marginTop: 30, paddingTop: 30, borderTopWidth: 1, borderTopColor: "#222" },
  historyCard: { backgroundColor: "#151515", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#262626" },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  historyPlan: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  historyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  historyBadgeText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  historyDetails: { flexDirection: "row", justifyContent: "space-between" },
  historyInfo: { color: "#888", fontSize: 12 },
});
