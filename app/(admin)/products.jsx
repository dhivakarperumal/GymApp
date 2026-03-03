import { View, Text, FlatList, TouchableOpacity } from "react-native";

const products = [
  { id: "1", name: "Protein Powder" },
  { id: "2", name: "Gym T-Shirt" },
  { id: "3", name: "Yoga Mat" },
];

export default function Products() {
  return (
    <View className="flex-1 bg-gray-100 p-4">

      <Text className="text-2xl font-bold mb-4">
        Products
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl shadow mb-3 flex-row justify-between items-center">
            <Text className="font-semibold">{item.name}</Text>
            <TouchableOpacity className="bg-blue-600 px-3 py-1 rounded-lg">
              <Text className="text-white text-sm">Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}