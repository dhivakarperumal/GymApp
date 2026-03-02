import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const delivery = 99;
  const total = subtotal + delivery;

  return (
    <SafeAreaView className="flex-1 bg-black">

      {/* HEADER */}
      <View className="px-6 pt-4 pb-6">
        <Text className="text-white text-3xl font-bold">
          My Cart
        </Text>
        <Text className="text-gray-400 mt-1">
          {cartItems.length} Items
        </Text>
      </View>

      {/* CART ITEMS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
        {cartItems.map((item) => (
          <View
            key={item.id}
            className="bg-[#111] rounded-3xl p-4 mb-5 border border-[#1f1f1f]"
          >
            <View className="flex-row">
              
              {/* PRODUCT IMAGE */}
              <Image
                source={{ uri: item.image }}
                className="w-24 h-24 rounded-2xl"
                resizeMode="cover"
              />

              {/* DETAILS */}
              <View className="flex-1 ml-4 justify-between">

                <View>
                  <Text className="text-white text-lg font-semibold">
                    {item.title}
                  </Text>

                  <Text className="text-red-500 text-lg font-bold mt-1">
                    ₹ {item.price}
                  </Text>
                </View>

                {/* QUANTITY + DELETE */}
                <View className="flex-row items-center justify-between mt-4">

                  <View className="flex-row items-center bg-[#1a1a1a] rounded-full px-4 py-2">
                    <TouchableOpacity>
                      <Ionicons name="remove" size={18} color="white" />
                    </TouchableOpacity>

                    <Text className="text-white mx-4 font-semibold">
                      {item.qty}
                    </Text>

                    <TouchableOpacity>
                      <Ionicons name="add" size={18} color="white" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#ff4d4d"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* BILL SECTION */}
      <View className="bg-[#111] px-6 py-6 rounded-t-3xl border-t border-[#1f1f1f]">

        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-400">Subtotal</Text>
          <Text className="text-white">₹ {subtotal}</Text>
        </View>

        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-400">Delivery</Text>
          <Text className="text-white">₹ {delivery}</Text>
        </View>

        <View className="h-[1px] bg-[#222] my-3" />

        <View className="flex-row justify-between mb-6">
          <Text className="text-white text-lg font-bold">
            Total
          </Text>
          <Text className="text-red-500 text-xl font-bold">
            ₹ {total}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/checkout")}
          className="bg-red-600 py-4 rounded-2xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            Checkout Now
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}