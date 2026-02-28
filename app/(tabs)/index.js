import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const workouts = [
    {
      id: 1,
      title: "Leg Day Destruction",
      duration: "60 min",
      kcal: "500 kcal",
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
    },
    {
      id: 2,
      title: "Core Blaster",
      duration: "15 min",
      kcal: "120 kcal",
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
    },
    {
      id: 3,
      title: "Arms Day",
      duration: "45 min",
      kcal: "350 kcal",
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e",
    },
  ];

  return (
    <View className="flex-1 bg-black pt-12 px-5">
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">TODAY'S MISSION</Text>
          <Text className="text-red-500 text-sm font-semibold">VIEW ALL</Text>
        </View>

        {/* 🔥 Featured Workout Card */}
        <View className="relative rounded-3xl overflow-hidden mb-6">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c",
            }}
            className="w-full h-80"
          />

          {/* Dark overlay */}
          <View className="absolute inset-0 bg-black/60 p-5 justify-end">
            <View className="bg-red-500 px-3 py-1 rounded-full self-start mb-3">
              <Text className="text-white text-xs font-bold">
                HIGH INTENSITY
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <View className="flex-row items-center mr-4">
                <Ionicons name="time-outline" size={14} color="#ff3c00" />
                <Text className="text-gray-300 text-md ml-1">45 MIN</Text>
              </View>

              <View className="flex-row items-center ml-2">
                <Ionicons name="flash-outline" size={14} color="#ff3c00" />
                <Text className="text-gray-300 text-md ml-1">ADVANCED</Text>
              </View>
            </View>

            <Text className="text-white text-2xl font-bold">
              UPPER BODY POWER
            </Text>

            <Text className="text-gray-400 text-sm mt-1">
              Chest, shoulders, triceps...
            </Text>
          </View>

          {/* Play Button */}
          <TouchableOpacity className="absolute bottom-6 right-6 bg-red-500 p-4 rounded-full">
            <Ionicons name="play" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 🏋️ Other Workouts */}
        {workouts.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center bg-[#1a1a1a] p-4 rounded-2xl mb-4"
          >
            <Image
              source={{ uri: item.image }}
              className="w-16 h-16 rounded-xl mr-4"
            />

            <View className="flex-1">
              <Text className="text-white font-semibold" numberOfLines={1}>
                {item.title}
              </Text>

              <View className="flex-row mt-1">
                <View className="flex-row items-center mr-4">
                  <Ionicons name="time-outline" size={14} color="#ff3c00" />
                  <Text className="text-gray-400 text-md ml-1">
                    {item.duration}
                  </Text>
                </View>

                <View className="flex-row items-center ml-4">
                  <Ionicons name="flame-outline" size={14} color="#ff3c00" />
                  <Text className="text-gray-400 text-md ml-1">
                    {item.kcal}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity className="bg-black p-2 rounded-full border border-gray-700">
              <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
