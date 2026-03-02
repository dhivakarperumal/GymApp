import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function Checkout() {
  return (
    <ScrollView className="flex-1 bg-[#0f0f0f] px-4 pt-12">
      <Text className="text-white text-2xl font-bold mb-6">
        Checkout
      </Text>

      {/* SHIPPING DETAILS */}
      <View className="bg-[#1c1c1c] p-5 rounded-2xl mb-5">
        <Text className="text-white font-semibold mb-4">
          Shipping Details
        </Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#777"
          className="bg-[#2a2a2a] text-white p-4 rounded-xl mb-3"
        />

        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#777"
          className="bg-[#2a2a2a] text-white p-4 rounded-xl mb-3"
        />

        <TextInput
          placeholder="Address"
          placeholderTextColor="#777"
          multiline
          className="bg-[#2a2a2a] text-white p-4 rounded-xl"
        />
      </View>

      {/* PAYMENT METHOD */}
      <View className="bg-[#1c1c1c] p-5 rounded-2xl mb-5">
        <Text className="text-white font-semibold mb-4">
          Payment Method
        </Text>

        <View className="bg-[#2a2a2a] p-4 rounded-xl mb-3">
          <Text className="text-white">Cash on Delivery</Text>
        </View>

        <View className="bg-[#2a2a2a] p-4 rounded-xl">
          <Text className="text-white">UPI / Card Payment</Text>
        </View>
      </View>

      {/* PLACE ORDER */}
      <TouchableOpacity className="bg-red-600 py-4 rounded-xl items-center mb-10">
        <Text className="text-white font-bold text-lg">
          Place Order
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}