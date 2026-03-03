import { View, Text, ScrollView } from "react-native";

export default function Workouts() {
  const workouts = ["Chest Workout", "Leg Day", "Cardio Blast", "Abs Training"];

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">Workout Plans</Text>

      {workouts.map((workout, index) => (
        <View
          key={index}
          className="bg-white p-4 rounded-xl shadow mb-3"
        >
          <Text className="text-lg font-semibold">{workout}</Text>
          <Text className="text-gray-500">Assigned to 5 clients</Text>
        </View>
      ))}
    </ScrollView>
  );
}