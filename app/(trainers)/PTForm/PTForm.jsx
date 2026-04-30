import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
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
  const { user, role } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

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
    <View className="flex-1 bg-[#0f0f0f]">
      {/* Header */}
      <View className="bg-[#1a1a1a] px-4 py-4 border-b border-white/10">
        <Text className="text-white text-lg font-bold text-center">
          PT Form - Step {currentStep + 1} of {steps.length}
        </Text>
        <Text className="text-orange-400 text-sm text-center mt-1">
          {steps[currentStep].title}
        </Text>
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
      <ScrollView className="flex-1 px-4">
        <CurrentStepComponent
          onNext={handleNext}
          onPrevious={handlePrevious}
          formData={formData}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="bg-[#1a1a1a] px-6 py-4 rounded-lg">
            <Text className="text-white text-center">Submitting form...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default PTForm;