import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext.js';
import api from '../../../services/api';
import FitnessScreening from './FitnessScreening';
import FlexibilityAndMeasurements from './FlexibilityAndMeasurements';
import HealthHistory2 from './HealthHistory2';
import HealthHistoy from './HealthHistoy';
import PTFormEnquiry from './PTFormEnquiry';
import SessionTracker from './SessionTracker';

const PTForm = ({ route, navigation }) => {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { user } = useAuth();
  const role = user?.role;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const memberId = searchParams?.member_id;

  useEffect(() => {
    if (memberId) {
      const fetchMember = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/members/${memberId}`);
          const data = res.data;
          setFormData({
            member_id: data.id,
            u_id: data.u_id,
            name: data.name || "",
            email: data.email || data.user_email || "",
            phone: data.phone || "",
            location: data.location || "",
            height: data.height || "",
            weight: data.weight || "",
            bmi: data.bmi || "",
            dob: data.dob ? dayjs(data.dob).format('YYYY-MM-DD') : "",
            age: data.age || "",
            address: data.address || "",
            employer: data.employer || "",
            occupation: data.occupation || "",
            emergency_contact_name: data.emergency_contact_name || "",
            emergency_contact_relationship: data.emergency_contact_relationship || "",
            emergency_contact_address: data.emergency_contact_address || "",
            emergency_contact_phone_home: data.emergency_contact_phone_home || "",
            emergency_contact_phone_work: data.emergency_contact_phone_work || "",
            fitness_goal: data.fitness_goal || "",
            blood_group: data.blood_group || "",
            gender: data.gender || ""
          });

          // Also try to fetch existing PT Form data if any
          try {
            const [ptRes, assignRes] = await Promise.all([
              api.get(`/pt-forms/${memberId}`).catch(() => ({ data: null })),
              api.get('/assignments').catch(() => ({ data: [] }))
            ]);

            let trainerName = "";
            if (assignRes.data) {
              const myAssign = assignRes.data.find(a => 
                String(a.gymMemberId) === String(memberId) || 
                String(a.userId) === String(data.u_id)
              );
              if (myAssign) trainerName = myAssign.trainerName;
            }

            if (ptRes.data && ptRes.data.form_data) {
              const savedData = typeof ptRes.data.form_data === 'string'
                ? JSON.parse(ptRes.data.form_data)
                : ptRes.data.form_data;

              setFormData(prev => ({
                ...prev,
                ...savedData,
                trainer_name_assigned: trainerName || savedData.trainer_name_assigned || ""
              }));
            } else {
              setFormData(prev => ({
                ...prev,
                trainer_name_assigned: trainerName
              }));
            }
          } catch (err) {
            console.log('Error fetching supplemental PT form data', err);
          }

          try {
            const enquiryRes = await api.get('/enquiries', {
              params: { email: data.email }
            });
            const enquiries = Array.isArray(enquiryRes.data) ? enquiryRes.data : [];
            const enquiry = enquiries[0];
            if (enquiry) {
              const consentData = enquiry.consent_data && typeof enquiry.consent_data === 'string'
                ? JSON.parse(enquiry.consent_data)
                : enquiry.consent_data || {};
              setFormData(prev => ({
                ...prev,
                participant_name: consentData.participant_name || enquiry.name || prev.participant_name,
                consent_agree: consentData.agree || prev.consent_agree,
                consent_signature: consentData.signature || prev.consent_signature,
                consent_date: consentData.date || prev.consent_date,
                guardian_signature: consentData.guardian_signature || prev.guardian_signature,
                witness: consentData.witness || prev.witness,
              }));
            }
          } catch (enqErr) {
            console.log('No linked enquiry found for this member');
          }
        } catch (err) {
          console.error("Failed to pre-fill member data", err);
        } finally {
          setLoading(false);
        }
      };
      fetchMember();
    }
  }, [memberId]);

  const steps = [
    { title: 'Personal Information', component: PTFormEnquiry },
    { title: 'Health History', component: HealthHistoy },
    { title: 'Medical Information', component: HealthHistory2 },
    { title: 'Fitness Screening', component: FitnessScreening },
    { title: 'Flexibility & Measurements', component: FlexibilityAndMeasurements },
    { title: 'Session Tracker', component: SessionTracker },
  ];

  const handleNext = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleMemberSelected = async (memberId) => {
    setLoading(true);
    try {
      const res = await api.get(`/members/${memberId}`);
      const data = res.data;
      const memberPrefill = {
        member_id: data.id,
        u_id: data.u_id,
        name: data.name || "",
        email: data.email || data.user_email || "",
        phone: data.phone || "",
        location: data.location || "",
        height: data.height || "",
        weight: data.weight || "",
        bmi: data.bmi || "",
        dob: data.dob ? dayjs(data.dob).format('YYYY-MM-DD') : "",
        age: data.age || "",
        address: data.address || "",
        employer: data.employer || "",
        occupation: data.occupation || "",
        emergency_contact_name: data.emergency_contact_name || "",
        emergency_contact_relationship: data.emergency_contact_relationship || "",
        emergency_contact_address: data.emergency_contact_address || "",
        emergency_contact_phone_home: data.emergency_contact_phone_home || "",
        emergency_contact_phone_work: data.emergency_contact_phone_work || "",
        fitness_goal: data.fitness_goal || "",
        blood_group: data.blood_group || "",
        gender: data.gender || ""
      };

      setFormData(memberPrefill);

      try {
        const ptRes = await api.get(`/pt-forms/${memberId}`);
        if (ptRes.data && ptRes.data.form_data) {
          const savedData = typeof ptRes.data.form_data === 'string'
            ? JSON.parse(ptRes.data.form_data)
            : ptRes.data.form_data;
          setFormData(prev => ({ ...prev, ...savedData }));
        }
      } catch (err) {
        console.log('No saved PT form for selected member');
      }

      try {
        const enquiryRes = await api.get('/enquiries', {
          params: { email: memberPrefill.email }
        });
        const enquiries = Array.isArray(enquiryRes.data) ? enquiryRes.data : [];
        const enquiry = enquiries[0];
        if (enquiry) {
          const consentData = enquiry.consent_data && typeof enquiry.consent_data === 'string'
            ? JSON.parse(enquiry.consent_data)
            : enquiry.consent_data || {};
          setFormData(prev => ({
            ...prev,
            participant_name: consentData.participant_name || enquiry.name || prev.participant_name,
            consent_agree: consentData.agree || prev.consent_agree,
            consent_signature: consentData.signature || prev.consent_signature,
            consent_date: consentData.date || prev.consent_date,
            guardian_signature: consentData.guardian_signature || prev.guardian_signature,
            witness: consentData.witness || prev.witness,
          }));
        }
      } catch (enqErr) {
        console.log('No linked enquiry found for selected member');
      }
    } catch (err) {
      console.error('Failed to pre-fill member data on selection', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.member_id && !formData.u_id) {
        throw new Error('Member ID is required. Please select a member first.');
      }

      // Format payload to match backend expectations
      const payload = {
        member_id: formData.member_id || formData.u_id,
        user_id: formData.u_id || user?.id,
        formData: {
          ...formData,
          trainer_id: user?.id,
          trainer_name_assigned: formData.trainer_name_assigned || user?.username || '',
          created_at: new Date().toISOString(),
        },
        completed: true
      };

      console.log('📤 Submitting PT form payload:', JSON.stringify(payload, null, 2));

      // Submit to backend
      const response = await api.post('/pt-forms', payload);

      console.log('✅ PT Form submitted successfully:', response.data);

      Alert.alert(
        'Success',
        'PT Form submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error submitting PT form');
      console.error('Error object:', error);
      console.error('Status:', error.response?.status);
      console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Message:', error.message);
      
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Failed to submit PT form. Please try again.';
      
      Alert.alert(
        'Submission Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={["top", "left", "right"]}>
      <View className="flex-1">
      {/* Header */}
      <View className="bg-[#1a1a1a] px-4 py-4 border-b border-white/10 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-8 h-8 bg-[#262626] rounded-full items-center justify-center mr-3 border border-white/5"
        >
          <Ionicons name="arrow-back" size={18} color="white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold text-left">
            PT Form
          </Text>
          <Text className="text-orange-400 text-xs text-left uppercase tracking-widest">
            Step {currentStep + 1} of {steps.length} • {steps[currentStep].title}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="px-4 py-2 bg-[#1a1a1a]">
        <View className="flex-row justify-between mb-2">
          {steps.map((step, index) => (
            <View key={index} className="flex-1 flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-orange-500' : 'bg-gray-600'
                }`}
              >
                <Text className="text-white text-xs font-bold">{index + 1}</Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  className={`flex-1 h-1 mx-2 ${
                    index < currentStep ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Form Content */}
      <ScrollView className="flex-1 px-2">
        <CurrentStepComponent
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSelectMember={handleMemberSelected}
          formData={formData}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="bg-[#1a1a1a] px-6 py-4 rounded-lg">
            <Text className="text-white text-center">
              {memberId ? "Pre-filling member data..." : "Submitting form..."}
            </Text>
          </View>
        </View>
      )}
      </View>
    </SafeAreaView>
  );
};

export default PTForm;