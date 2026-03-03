import { View, Text, ScrollView } from "react-native";

export default function Clients() {
  const clients = ["Rahul", "Arun", "Karthik", "Siva"];

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">My Clients</Text>

      {clients.map((client, index) => (
        <View
          key={index}
          className="bg-white p-4 rounded-xl shadow mb-3"
        >
          <Text className="text-lg font-semibold">{client}</Text>
          <Text className="text-gray-500">Active Plan</Text>
        </View>
      ))}
    </ScrollView>
  );
}