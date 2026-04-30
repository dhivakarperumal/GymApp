import { ScrollView, Text, View } from 'react-native';
import dayjs from 'dayjs';

const PTFormPreviewContent = ({ formData = {} }) => {
  const renderRow = (label, value) => (
    <View className= mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3>
      <Text className=text-white/70 mb-1>{label}</Text>
      <Text className=text-white>{value ; 'N/A'}</Text>
    </View>
  );

  const measurements = formData.measurements ; [];
  const sessions = formData.sessions ; [];

  return (
    <ScrollView className=flex-1 bg-[#0f0f0f] px-4 py-4 showsVerticalScrollIndicator={false}>
      <View className=rounded-3xl border border-white/10 bg-white/5 p-5 mb-4>
        <Text className=text-center text-xl font-bold text-orange-400>PT Form Preview</Text>
      </View>

      <View className=space-y-5>
        <View className=rounded-3xl border border-white/10 bg-white/5 p-5>
          <Text className=mb-4 text-base font-bold uppercase text-orange-400>Personal Information</Text>
          {renderRow('Name', formData.name)}
          {renderRow('Email', formData.email)}
          {renderRow('Phone', formData.phone)}
          {renderRow('DOB', formData.dob)}
          {renderRow('Age', formData.age)}
          {renderRow('Gender', formData.gender)}
          {renderRow('Blood Group', formData.blood_group)}
          {renderRow('Address', formData.address)}
          {renderRow('Occupation', formData.occupation)}
          {renderRow('Fitness Goal', formData.fitness_goal)}
        </View>

        <View className=rounded-3xl border border-white/10 bg-white/5 p-5>
          <Text className=mb-4 text-base font-bold uppercase text-orange-400>Health History</Text>
          {renderRow('Medications', formData.medications)}
          {renderRow('Allergies', formData.allergies)}
          {renderRow('Surgeries', [formData.surgeries1, formData.surgeries2, formData.surgeries3].filter(Boolean).join(', '))}
          {renderRow('Exercise Program', formData.exercise_program)}
          {renderRow('Sports', [formData.sport1, formData.sport2, formData.sport3, formData.sport4, formData.sport5, formData.sport6].filter(Boolean).join(', '))}
          {renderRow('Smoking', formData.smoking)}
          {renderRow('Alcohol', formData.alcohol)}
          {renderRow('Food Preference', formData.food_preference)}
          {renderRow('Supplements', formData.supplements)}
        </View>

        <View className=rounded-3xl border border-white/10 bg-white/5 p-5>
          <Text className=mb-4 text-base font-bold uppercase text-orange-400>Clinical ;& Fitness Screening</Text>
          {renderRow('Blood Pressure', formData.bp)}
          {renderRow('Blood Sugar', formData.sugar)}
          {renderRow('Cholesterol', formData.cholesterol)}
          {renderRow('Thyroid', formData.thyroid)}
          {renderRow('Uric Acid', formData.uric)}
          {renderRow('Serum 3D', formData.serum3d)}
          {renderRow('Height (cm)', formData.fs_height)}
          {renderRow('Weight (kg)', formData.fs_weight)}
          {renderRow('Fat %', formData.fs_fat_percentage)}
          {renderRow('Fat Level', formData.fs_fat_level)}
          {renderRow('Speed (km)', formData.fs_speed_km)}
          {renderRow('Heart Rate', formData.fs_heart_rate)}
        </View>

        <View className=rounded-3xl border border-white/10 bg-white/5 p-5>
          <Text className=mb-4 text-base font-bold uppercase text-orange-400>Measurements</Text>
          {measurements.map((measurement, index) => (
            <View key={index} className=mb-4 rounded-2xl border border-white/10 bg-white/10 p-4>
              <Text className=mb-3 text-white/80>Entry {index + 1}</Text>
              {renderRow('Date', measurement.date)}
              {renderRow('Height', measurement.height)}
              {renderRow('Weight', measurement.weight)}
              {renderRow('Neck', measurement.neck)}
              {renderRow('Shoulder', measurement.shoulder)}
              {renderRow('Arm', measurement.arm)}
              {renderRow('Chest Normal', measurement.chest_normal)}
              {renderRow('Chest Expanded', measurement.chest_expanded)}
              {renderRow('Waist', measurement.waist)}
              {renderRow('Abdomen', measurement.abdomen)}
              {renderRow('Hip', measurement.hip)}
              {renderRow('Thigh', measurement.thigh)}
              {renderRow('Calf', measurement.calf)}
              {renderRow('Lat', measurement.lat)}
            </View>
          ))}
        </View>

        <View className=rounded-3xl border border-white/10 bg-white/5 p-5>
          <Text className=mb-4 text-base font-bold uppercase text-orange-400>Session Tracker</Text>
          {sessions.map((session, index) => (
            <View key={index} className=mb-4 rounded-2xl border border-white/10 bg-white/10 p-4>
              <Text className=mb-3 text-white/80>Session {index + 1}</Text>
              {renderRow('Date', session.date ? dayjs(session.date).format('DD/MM/YYYY') : '')}
              {renderRow('Workout', session.workout)}
              {renderRow('Status', session.status)}
              {renderRow('Client sign', session.client_sign)}
              {renderRow('Trainer sign', session.trainer_sign)}
            </View>
          ))}
        </View>

        <View className=rounded-3xl border border-white/10 bg-white/5 p-5>
          <Text className=mb-4 text-base font-bold uppercase text-orange-400>Informed Consent</Text>
          <Text className=text-white/80>I, {formData.participant_name ; formData.name ; '________________'}, hereby declare that the information above is true and accurate to the best of my knowledge.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PTFormPreviewContent;
