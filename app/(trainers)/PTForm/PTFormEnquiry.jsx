import dayjs from "dayjs";
import { Search, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from '../../../context/AuthContext.js'
import api from "../../../services/api";

const PTFormEnquiry = ({
  onNext,
  onPrevious,
  onSelectMember,
  formData: initialFormData,
  isFirstStep,
  isLastStep,
  isModal = false
}) => {
  const { user } = useAuth();
  const role = user?.role;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMemberList, setShowMemberList] = useState(false);
  const [localFormData, setLocalFormData] = useState({
    member_id: initialFormData?.member_id || "",
    u_id: initialFormData?.u_id || "",
    name: initialFormData?.name || "",
    email: initialFormData?.email || "",
    phone: initialFormData?.phone || "",
    subject: initialFormData?.subject || "",
    message: initialFormData?.message || "",
    location: initialFormData?.location || "",
    height: initialFormData?.height || "",
    weight: initialFormData?.weight || "",
    bmi: initialFormData?.bmi || "",
    dob: initialFormData?.dob || "",
    age: initialFormData?.age || "",
    address: initialFormData?.address || "",
    employer: initialFormData?.employer || "",
    occupation: initialFormData?.occupation || "",
    emergency_contact_name: initialFormData?.emergency_contact_name || "",
    emergency_contact_relationship: initialFormData?.emergency_contact_relationship || "",
    emergency_contact_address: initialFormData?.emergency_contact_address || "",
    emergency_contact_phone_home: initialFormData?.emergency_contact_phone_home || "",
    emergency_contact_phone_work: initialFormData?.emergency_contact_phone_work || "",
    fitness_goal: initialFormData?.fitness_goal || "",
    blood_group: initialFormData?.blood_group || "",
    gender: initialFormData?.gender || "",
    participant_name: initialFormData?.participant_name || "",
    consent_agree: initialFormData?.consent_agree || false,
  });

  useEffect(() => {
    if (initialFormData && Object.keys(initialFormData).length > 0) {
      const consentData = initialFormData.consent_data && typeof initialFormData.consent_data === 'string'
        ? JSON.parse(initialFormData.consent_data)
        : initialFormData.consent_data || {};

      setLocalFormData(prev => ({
        ...prev,
        ...initialFormData,
        participant_name: initialFormData.participant_name || consentData.participant_name || prev.participant_name,
        consent_agree: initialFormData.consent_agree || consentData.agree || prev.consent_agree,
      }));
    }
  }, [initialFormData]);

  useEffect(() => {
    if (localFormData.height && localFormData.weight) {
      const h = parseFloat(localFormData.height) / 100;
      const w = parseFloat(localFormData.weight);
      if (h > 0) {
        const bmiVal = (w / (h * h)).toFixed(1);
        setLocalFormData(prev => ({ ...prev, bmi: bmiVal }));
      }
    } else {
      setLocalFormData(prev => ({ ...prev, bmi: "" }));
    }
  }, [localFormData.height, localFormData.weight]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setError(null);
      let data = [];

      if (role === 'trainer') {
        // Fetch only members assigned to this trainer
        const res = await api.get(`/assignments?trainerUserId=${user.id}`);
        const raw = res.data || [];
        const assignments = Array.isArray(raw) ? raw : (raw.data || raw.assignments || []);

        // Filter active members and deduplicate by userId (sync with dashboard logic)
        const activeAssignments = assignments.filter(
          (a) => !a.status || (a.status || "").toLowerCase() === "active"
        );

        const seen = new Set();
        data = [];
        for (const a of activeAssignments) {
          const uid = String(a.userId || a.user_id || "");
          if (uid && !seen.has(uid)) {
            seen.add(uid);
            data.push({
              id: a.gymMemberId || a.id || a.userId,
              u_id: a.userId || a.user_id,
              name: a.username || a.user_name,
              email: a.userEmail || a.user_email,
              phone: a.userMobile || a.user_mobile,
              plan: a.planName || a.plan_name,
              pt_form_completed: a.ptFormCompleted
            });
          }
        }
      } else {
        const response = await api.get('/members');
        data = Array.isArray(response.data) ? response.data : [];
      }

      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to load members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (member) => {
    setLocalFormData({
      member_id: member.id,
      u_id: member.u_id,
      name: member.name || "",
      email: member.email || member.user_email || "",
      phone: member.phone || "",
      subject: "",
      message: "",
      location: member.location || "",
      height: member.height || "",
      weight: member.weight || "",
      bmi: member.bmi || "",
      dob: member.dob ? dayjs(member.dob).format('YYYY-MM-DD') : "",
      age: member.age || "",
      address: member.address || "",
      employer: member.employer || "",
      occupation: member.occupation || "",
      emergency_contact_name: member.emergency_contact_name || "",
      emergency_contact_relationship: member.emergency_contact_relationship || "",
      emergency_contact_address: member.emergency_contact_address || "",
      emergency_contact_phone_home: member.emergency_contact_phone_home || "",
      emergency_contact_phone_work: member.emergency_contact_phone_work || "",
      fitness_goal: member.fitness_goal || "",
      blood_group: member.blood_group || "",
      gender: member.gender || ""
    });
    if (onSelectMember) {
      onSelectMember(member.id);
    }
    setSearchTerm("");
    setShowMemberList(false);
  };

  const filteredMembers = members.filter(member =>
    !member.pt_form_completed && (
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-white mt-4">Loading members...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-red-900/20 border border-red-500 rounded-lg p-4 mx-4 my-4">
        <Text className="text-red-400 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="py-4">
        {/* Quick Select Section */}
        {!isModal && (
          <View className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
            <Text className="text-orange-400 text-sm font-bold uppercase tracking-widest mb-2">
              Import from Existing Member (Optional)
            </Text>
            <View className="relative">
              <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <Search size={16} color="#ffffff40" />
              </View>
              <TextInput
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  setShowMemberList(true);
                }}
                onFocus={() => setShowMemberList(true)}
                placeholder="Search member by name, phone or email..."
                placeholderTextColor="#ffffff40"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
              />

              {showMemberList && (
                <View className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-white/20 rounded-lg shadow-2xl z-50 max-h-96">
                  <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map(member => (
                        <TouchableOpacity
                          key={member.id}
                          onPress={() => handleSelectMember(member)}
                          className="px-4 py-3 border-b border-white/5"
                        >
                          <Text className="font-bold text-white text-orange-400">
                            {member.name}
                          </Text>
                          <Text className="text-xs text-white/40 uppercase tracking-tight">
                            {member.phone || 'No Phone'} • {member.email || member.user_email || 'No Email'}
                            {member.plan && ` • ${member.plan}`}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text className="px-4 py-4 text-white/40 text-sm italic text-center">No matching members found</Text>
                    )}
                    <TouchableOpacity
                      onPress={() => setShowMemberList(false)}
                      className="py-2 border-t border-white/10"
                    >
                      <Text className="text-xs font-bold uppercase tracking-widest text-orange-500 text-center">Close Suggestions</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Personal Information */}
        <View className="mb-6">
          <Text className="text-orange-500 font-bold border-b border-white/10 pb-1 uppercase tracking-wider text-sm mb-4">
            Personal Information
          </Text>
          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Name</Text>
            <TextInput
              value={localFormData.name}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, name: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="Enter name"
              placeholderTextColor="#ffffff40"
            />
          </View>
          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Email</Text>
            <TextInput
              value={localFormData.email}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, email: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="Enter email"
              placeholderTextColor="#ffffff40"
              keyboardType="email-address"
            />
          </View>
          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Phone</Text>
            <TextInput
              value={localFormData.phone}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, phone: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="Enter phone"
              placeholderTextColor="#ffffff40"
              keyboardType="phone-pad"
            />
          </View>
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Date of Birth</Text>
              <TextInput
                value={localFormData.dob}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, dob: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#ffffff40"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Age</Text>
              <TextInput
                value={localFormData.age}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, age: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="Enter age"
                placeholderTextColor="#ffffff40"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Blood Group</Text>
            <TextInput
              value={localFormData.blood_group}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, blood_group: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="e.g., A+, B-"
              placeholderTextColor="#ffffff40"
            />
          </View>
          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Gender</Text>
            <TextInput
              value={localFormData.gender}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, gender: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="Male/Female/Other"
              placeholderTextColor="#ffffff40"
            />
          </View>
          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Full Address</Text>
            <TextInput
              value={localFormData.address}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, address: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="Enter full address"
              placeholderTextColor="#ffffff40"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Professional Information */}
        <View className="mb-6">
          <Text className="text-orange-500 font-bold border-b border-white/10 pb-1 uppercase tracking-wider text-sm mb-4">
            Professional Information
          </Text>
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Employer</Text>
              <TextInput
                value={localFormData.employer}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, employer: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="Enter employer"
                placeholderTextColor="#ffffff40"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Occupation</Text>
              <TextInput
                value={localFormData.occupation}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, occupation: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="Enter occupation"
                placeholderTextColor="#ffffff40"
              />
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        <View className="mb-6">
          <Text className="text-orange-500 font-bold border-b border-white/10 pb-1 uppercase tracking-wider text-sm mb-4">
            In Case of Emergency
          </Text>
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Contact Name</Text>
              <TextInput
                value={localFormData.emergency_contact_name}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, emergency_contact_name: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="Enter contact name"
                placeholderTextColor="#ffffff40"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Relationship</Text>
              <TextInput
                value={localFormData.emergency_contact_relationship}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, emergency_contact_relationship: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="Enter relationship"
                placeholderTextColor="#ffffff40"
              />
            </View>
          </View>
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Home Phone</Text>
              <TextInput
                value={localFormData.emergency_contact_phone_home}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, emergency_contact_phone_home: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="Enter home phone"
                placeholderTextColor="#ffffff40"
                keyboardType="phone-pad"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Work Phone</Text>
              <TextInput
                value={localFormData.emergency_contact_phone_work}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, emergency_contact_phone_work: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="Enter work phone"
                placeholderTextColor="#ffffff40"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Contact Address</Text>
            <TextInput
              value={localFormData.emergency_contact_address}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, emergency_contact_address: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="Enter contact address"
              placeholderTextColor="#ffffff40"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Health & Goals */}
        <View className="mb-6">
          <Text className="text-orange-500 font-bold border-b border-white/10 pb-1 uppercase tracking-wider text-sm mb-4">
            Health & Fitness Goals
          </Text>
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Height (cm)</Text>
              <TextInput
                value={localFormData.height}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, height: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="Enter height"
                placeholderTextColor="#ffffff40"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">Weight (kg)</Text>
              <TextInput
                value={localFormData.weight}
                onChangeText={(text) => setLocalFormData(prev => ({ ...prev, weight: text }))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ color: 'white' }}
                placeholder="Enter weight"
                placeholderTextColor="#ffffff40"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm mb-1">BMI</Text>
              <TextInput
                value={localFormData.bmi}
                editable={false}
                className="px-3 py-2 bg-white/20 border border-white/20 rounded-lg text-orange-400 font-bold"
                style={{ color: '#f97316' }}
              />
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Fitness Goals</Text>
            <TextInput
              value={localFormData.fitness_goal}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, fitness_goal: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="Describe your fitness objectives..."
              placeholderTextColor="#ffffff40"
              multiline
              numberOfLines={2}
            />
          </View>
          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Additional Notes / Message</Text>
            <TextInput
              value={localFormData.message}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, message: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="Enter additional notes"
              placeholderTextColor="#ffffff40"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Informed Consent */}
        <View className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 mb-6">
          <View className="flex-row gap-4 mb-4">
            <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center">
              <Users size={20} color="#f97316" />
            </View>
            <View>
              <Text className="text-xl font-bold text-white uppercase tracking-widest">Informed Consent</Text>
              <Text className="text-white/60 text-sm">Please complete the consent form before moving to the next step.</Text>
            </View>
          </View>

          <Text className="text-white/80 leading-7 mb-4">
            I <Text className="font-bold">{localFormData.participant_name || '__________'}</Text> give my consent to participate in the physical fitness evaluation program conducted by DAP Unisex Fitness Studio.
          </Text>

          <View className="mb-4">
            <Text className="text-white/80 text-sm mb-1">Participant Name</Text>
            <TextInput
              value={localFormData.participant_name}
              onChangeText={(text) => setLocalFormData(prev => ({ ...prev, participant_name: text }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              style={{ color: 'white' }}
              placeholder="Full Name"
              placeholderTextColor="#ffffff40"
            />
          </View>

          <View className="flex-row items-center gap-3 mt-4">
            <TouchableOpacity
              onPress={() => setLocalFormData(prev => ({ ...prev, consent_agree: !prev.consent_agree }))}
              className={`w-5 h-5 border-2 rounded ${localFormData.consent_agree ? 'bg-orange-500 border-orange-500' : 'border-white/20'}`}
            />
            <Text className="text-white">I have read and agree to the informed consent above.</Text>
          </View>

          {!localFormData.consent_agree && (
            <Text className="text-red-400 text-sm mt-2">You must check the box to proceed.</Text>
          )}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row gap-3 pt-6">
          <TouchableOpacity
            onPress={onPrevious}
            disabled={isFirstStep}
            className={`flex-1 px-4 py-3 rounded-lg ${isFirstStep ? 'bg-gray-600' : 'bg-gray-700'}`}
            style={{ opacity: isFirstStep ? 0.5 : 1 }}
          >
            <Text className="text-white text-center font-bold">Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!localFormData.consent_agree) {
                Alert.alert('Error', 'Please agree to the informed consent to proceed.');
                return;
              }
              onNext(localFormData);
            }}
            className="flex-1 px-4 py-3 bg-orange-600 rounded-lg"
          >
            <Text className="text-white text-center font-bold">
              {isLastStep ? 'Complete Registration' : 'Next Step'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PTFormEnquiry;