import dayjs from "dayjs";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const PTFormPrint = ({ formData = {}, onClose }) => {
  const renderRow = (label, value) => (
    <View className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <Text className="text-white/70 mb-1">{label}</Text>
      <Text className="text-white">{value || "N/A"}</Text>
    </View>
  );

  const measurements = formData.measurements || [];
  const sessions = formData.sessions || [];

  return (
    <View className="flex-1 bg-[#0f0f0f]">
      <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
        <View className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-4">
          <Text className="text-center text-xl font-bold text-orange-400">PT Form Print Preview</Text>
        </View>

        <View className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-4">
          <Text className="mb-4 text-base font-bold uppercase text-orange-400">Personal Information</Text>
          {renderRow("Name", formData.name)}
          {renderRow("Email", formData.email)}
          {renderRow("Phone", formData.phone)}
          {renderRow("DOB", formData.dob)}
          {renderRow("Age", formData.age)}
          {renderRow("Gender", formData.gender)}
          {renderRow("Address", formData.address)}
        </View>

        <View className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-4">
          <Text className="mb-4 text-base font-bold uppercase text-orange-400">Fitness Screening</Text>
          {renderRow("Height", formData.fs_height)}
          {renderRow("Weight", formData.fs_weight)}
          {renderRow("Resting HR", formData.fs_resting_hr)}
          {renderRow("Fat %", formData.fs_fat_percentage)}
          {renderRow("Fat Level", formData.fs_fat_level)}
          {renderRow("Speed", formData.fs_speed_km)}
          {renderRow("Heart Rate", formData.fs_heart_rate)}
        </View>

        <View className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-4">
          <Text className="mb-4 text-base font-bold uppercase text-orange-400">Measurements</Text>
          {measurements.map((measurement, index) => (
            <View key={index} className="mb-4 rounded-2xl border border-white/10 bg-white/10 p-4">
              <Text className="mb-3 text-white/80">Entry {index + 1}</Text>
              {renderRow("Date", measurement.date ? dayjs(measurement.date).format("DD/MM/YYYY") : "")}
              {renderRow("Height", measurement.height)}
              {renderRow("Weight", measurement.weight)}
              {renderRow("Neck", measurement.neck)}
              {renderRow("Shoulder", measurement.shoulder)}
              {renderRow("Arm", measurement.arm)}
              {renderRow("Chest Normal", measurement.chest_normal)}
              {renderRow("Chest Expanded", measurement.chest_expanded)}
              {renderRow("Waist", measurement.waist)}
              {renderRow("Abdomen", measurement.abdomen)}
              {renderRow("Hip", measurement.hip)}
              {renderRow("Thigh", measurement.thigh)}
              {renderRow("Calf", measurement.calf)}
              {renderRow("Lat", measurement.lat)}
            </View>
          ))}
        </View>

        <View className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-4">
          <Text className="mb-4 text-base font-bold uppercase text-orange-400">Session Tracker</Text>
          {sessions.map((session, index) => (
            <View key={index} className="mb-4 rounded-2xl border border-white/10 bg-white/10 p-4">
              <Text className="mb-3 text-white/80">Session {index + 1}</Text>
              {renderRow("Date", session.date ? dayjs(session.date).format("DD/MM/YYYY") : "")}
              {renderRow("Workout", session.workout)}
              {renderRow("Status", session.status)}
              {renderRow("Client Sign", session.client_sign)}
              {renderRow("Trainer Sign", session.trainer_sign)}
            </View>
          ))}
        </View>
      </ScrollView>

      {onClose ? (
        <TouchableOpacity onPress={onClose} className="m-4 rounded-2xl bg-orange-600 px-5 py-3">
          <Text className="text-center text-white font-bold">Close Preview</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default PTFormPrint;
