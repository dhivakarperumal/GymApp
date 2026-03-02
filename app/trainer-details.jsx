import { View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getAllStaffs } from "../services/api";

export default function TrainerDetails() {
  const { id } = useLocalSearchParams();
  const [trainer, setTrainer] = useState(null);

  useEffect(() => {
    const fetchTrainer = async () => {
      const data = await getAllStaffs();
      const staffList = data.staff || data;

      const selected = staffList.find(
        (item) => item.id === Number(id)
      );

      setTrainer(selected);
    };

    fetchTrainer();
  }, [id]);

  if (!trainer) return null;

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-12">
      {/* Image */}
      <Image
        source={{
          uri:
            trainer.photo ||
            "https://via.placeholder.com/400",
        }}
        className="w-full h-96 rounded-3xl"
        resizeMode="cover"
      />

      {/* Info Card */}
      <View className="mt-6 bg-[#111] p-6 rounded-3xl border border-[#1f1f1f]">
        <Text className="text-white text-3xl font-bold">
          {trainer.name}
        </Text>

        <Text className="text-[#ff3c00] text-lg mt-2">
          {trainer.department}
        </Text>

        <View className="mt-6 space-y-3">
          <Text className="text-gray-400">
            Employee ID: {trainer.employee_id}
          </Text>

          <Text className="text-gray-400">
            Email: {trainer.email}
          </Text>

          <Text className="text-gray-400">
            Phone: {trainer.phone}
          </Text>

          <Text className="text-gray-400">
            Gender: {trainer.gender}
          </Text>

          <Text className="text-gray-400">
            Blood Group: {trainer.blood_group}
          </Text>

          <Text className="text-gray-400">
            Shift: {trainer.shift}
          </Text>

          <Text className="text-gray-400">
            Time: {trainer.time_in} - {trainer.time_out}
          </Text>

          <Text className="text-gray-400">
            Salary: ₹ {trainer.salary}
          </Text>

          <Text className="text-gray-400">
            Status: {trainer.status}
          </Text>

          <Text className="text-gray-400">
            Address: {trainer.address}
          </Text>
        </View>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}