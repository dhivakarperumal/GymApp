import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function Checkout() {
  const [focused, setFocused] = useState("");

  const cartItems = [
    {
      id: 1,
      title: "Whey Protein",
      price: 1999,
      qty: 1,
      image:
        "https://images.unsplash.com/photo-1605296867424-35fc25c9212a",
    },
    {
      id: 2,
      title: "Gym Gloves",
      price: 699,
      qty: 2,
      image:
        "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6",
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* HEADER */}
        <Text className="text-white text-3xl font-bold mb-8">
          Checkout
        </Text>

        {/* SHIPPING DETAILS */}
        <View className="mb-10">
          <Text className="text-white text-lg font-semibold mb-6">
            Shipping Details
          </Text>

          {[
            { label: "Full Name", value: "Thenuga R", key: "name" },
            { label: "Email", value: "thenugatest@gmail.com", key: "email" },
            { label: "Phone", value: "6383493433", key: "phone" },
            { label: "City", value: "Tirupattur", key: "city" },
            { label: "State", value: "Tamil Nadu", key: "state" },
            { label: "ZIP", value: "635653", key: "zip" },
            { label: "Country", value: "India", key: "country" },
          ].map((field) => (
            <View key={field.key} className="mb-4">
              <Text className="text-gray-400 mb-2">
                {field.label}
              </Text>
              <TextInput
                defaultValue={field.value}
                onFocus={() => setFocused(field.key)}
                onBlur={() => setFocused("")}
                className={`bg-[#111] text-white p-4 rounded-xl border ${
                  focused === field.key
                    ? "border-gray-500"
                    : "border-[#111]"
                }`}
              />
            </View>
          ))}

          {/* ADDRESS */}
          <View className="mb-4">
            <Text className="text-gray-400 mb-2">
              Address
            </Text>
            <TextInput
              defaultValue="Chinna Kadai Theru"
              multiline
              numberOfLines={3}
              onFocus={() => setFocused("address")}
              onBlur={() => setFocused("")}
              className={`bg-[#111] text-white p-4 rounded-xl border ${
                focused === "address"
                  ? "border-gray-500"
                  : "border-[#111]"
              }`}
              style={{ textAlignVertical: "top" }}
            />
          </View>
        </View>

        {/* ORDER SUMMARY */}
        <View className="mb-10">
          <Text className="text-white text-lg font-semibold mb-6">
            Order Summary
          </Text>

          {cartItems.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center mb-4 bg-[#111] p-4 rounded-2xl"
            >
              <Image
                source={{ uri: item.image }}
                className="w-16 h-16 rounded-xl"
              />

              <View className="flex-1 ml-4">
                <Text className="text-white font-semibold">
                  {item.title}
                </Text>
                <Text className="text-gray-400 mt-1">
                  Qty: {item.qty}
                </Text>
              </View>

              <Text className="text-white font-bold">
                ₹ {item.price * item.qty}
              </Text>
            </View>
          ))}

          {/* BILL DETAILS */}
          <View className="bg-[#111] p-5 rounded-2xl mt-4">
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-400">Subtotal</Text>
              <Text className="text-white">₹ {subtotal}</Text>
            </View>

            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-400">Delivery</Text>
              <Text className="text-white">₹ {delivery}</Text>
            </View>

            <View className="h-[1px] bg-[#222] my-3" />

            <View className="flex-row justify-between">
              <Text className="text-white text-lg font-bold">
                Total
              </Text>
              <Text className="text-red-500 text-xl font-bold">
                ₹ {total}
              </Text>
            </View>
          </View>
        </View>

        {/* PLACE ORDER BUTTON */}
        <TouchableOpacity className="bg-red-600 py-5 rounded-2xl items-center">
          <Text className="text-white font-bold text-lg">
            Place Order
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}