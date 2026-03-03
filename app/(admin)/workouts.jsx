import { View, Text, FlatList, TouchableOpacity } from "react-native";

const workouts = [
  { id: "1", name: "Chest Workout" },
  { id: "2", name: "Leg Day Routine" },
  { id: "3", name: "Full Body HIIT" },
];

export default function Workouts() {
  return (
    <View className="flex-1 bg-gray-100 p-4">

      <Text className="text-2xl font-bold mb-4">
        Workouts
      </Text>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl shadow mb-3 flex-row justify-between items-center">
            <Text className="font-semibold">{item.name}</Text>
            <TouchableOpacity className="bg-green-600 px-3 py-1 rounded-lg">
              <Text className="text-white text-sm">View</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}