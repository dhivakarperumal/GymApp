import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Cart() {
  const router = useRouter();

  const cartItems = [
    {
      id: 1,
      title: "Whey Protein",
      price: 1999,
      image:
        "https://images.unsplash.com/photo-1605296867424-35fc25c9212a",
      qty: 1,
    },
    {
      id: 2,
      title: "Gym Gloves",
      price: 699,
      image:
        "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6",
      qty: 2,
    },
  ];

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <View className="flex-1 bg-[#0f0f0f] px-4 pt-12">
      <Text className="text-white text-2xl font-bold mb-6">Your Cart</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => (
          <View
            key={item.id}
            className="bg-[#1c1c1c] rounded-2xl p-4 mb-4 flex-row items-center"
          >
            <Image
              source={{ uri: item.image }}
              className="w-16 h-16 rounded-xl"
              resizeMode="cover"
            />

            <View className="flex-1 ml-4">
              <Text className="text-white font-semibold">
                {item.title}
              </Text>

              <Text className="text-red-500 font-bold mt-1">
                ₹ {item.price}
              </Text>

              <View className="flex-row items-center mt-2">
                <TouchableOpacity className="bg-[#2a2a2a] px-3 py-1 rounded-lg">
                  <Text className="text-white">-</Text>
                </TouchableOpacity>

                <Text className="text-white mx-3">{item.qty}</Text>

                <TouchableOpacity className="bg-[#2a2a2a] px-3 py-1 rounded-lg">
                  <Text className="text-white">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Ionicons name="trash-outline" size={20} color="#888" />
          </View>
        ))}
      </ScrollView>

      {/* TOTAL SECTION */}
      <View className="bg-[#1c1c1c] p-5 rounded-2xl mt-4">
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-400">Total</Text>
          <Text className="text-white text-lg font-bold">
            ₹ {total}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/checkout")}
          className="bg-red-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}