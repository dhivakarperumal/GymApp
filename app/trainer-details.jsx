import { View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getAllStaffs } from "../services/api";
import Header from "./Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
    <SafeAreaView className="flex-1 bg-black">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-black px-5 pt-12"
      >
        {/* Trainer Image */}
        <View className="rounded-3xl overflow-hidden mt-4">
          <Image
            source={{
              uri:
                trainer.photo ||
                "https://via.placeholder.com/400",
            }}
            className="w-full h-96"
            resizeMode="cover"
          />
        </View>

        {/* Trainer Name Section */}
        <View className="mt-6 items-center">
          <Text className="text-white text-3xl font-bold">
            {trainer.name}
          </Text>

          <View className="bg-[#ff3c00]/20 px-4 py-1 rounded-full mt-2">
            <Text className="text-[#ff3c00] text-sm font-semibold">
              {trainer.department}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View className="mt-6 bg-[#111] rounded-3xl p-6 border border-[#1f1f1f]">
          
          <InfoRow icon="id-card-outline" label="Employee ID" value={trainer.employee_id} />
          <InfoRow icon="mail-outline" label="Email" value={trainer.email} />
          <InfoRow icon="call-outline" label="Phone" value={trainer.phone} />
          <InfoRow icon="person-outline" label="Gender" value={trainer.gender} />
          <InfoRow icon="water-outline" label="Blood Group" value={trainer.blood_group} />
          <InfoRow icon="time-outline" label="Shift" value={trainer.shift} />
          <InfoRow icon="alarm-outline" label="Working Time" value={`${trainer.time_in} - ${trainer.time_out}`} />
          <InfoRow icon="checkmark-circle-outline" label="Status" value={trainer.status} />
          <InfoRow icon="location-outline" label="Address" value={trainer.address} />

        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}


function InfoRow({ icon, label, value }) {
  return (
    <View className="flex-row items-center py-3 border-b border-[#1f1f1f]">
      <Ionicons name={icon} size={20} color="#ff3c00" />

      <View className="ml-4 flex-1">
        <Text className="text-gray-400 text-xs">{label}</Text>
        <Text className="text-white text-sm font-semibold">
          {value}
        </Text>
      </View>
    </View>
  );
}