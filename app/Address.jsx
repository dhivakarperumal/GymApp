import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";

export default function Address() {
  return (
    <SafeAreaView className="flex-1 bg-card">

      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5"
      >

        {/* SAVED ADDRESS CARD */}

        <View className="bg-darkcard border border-border rounded-3xl p-5 mt-6 mb-6">

          <View className="flex-row justify-between items-start">

            <View className="flex-1">

              <Text className="text-background text-lg font-bold">
                Dhanush
              </Text>

              <Text className="text-textSecondary mt-1">
                Tirupattur, Tirupattur
              </Text>

              <Text className="text-textSecondary">
                Tamil Nadu - 635652
              </Text>

              <Text className="text-textSecondary mt-1">
                9080281344
              </Text>

            </View>

            <View className="flex-row">

              <TouchableOpacity className="bg-card p-3 mb-10 rounded-xl border border-border mr-3">
                <Ionicons name="create-outline" size={18} color="#e11d1d" />
              </TouchableOpacity>

              <TouchableOpacity className="bg-card p-3 mb-10 rounded-xl border border-border">
                <Ionicons name="trash-outline" size={18} color="#e11d1d" />
              </TouchableOpacity>

            </View>

          </View>

        </View>


        {/* ADDRESS FORM */}

        <View className="bg-darkcard border border-border rounded-3xl p-6">

          <Text className="text-background text-lg font-bold mb-6">
            Add New Address
          </Text>


          {/* FULL NAME */}
          <View className="bg-card border border-border rounded-xl px-4 mb-4">
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#777"
              className="text-background py-4"
            />
          </View>


          {/* PHONE */}
          <View className="bg-card border border-border rounded-xl px-4 mb-4">
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#777"
              keyboardType="phone-pad"
              className="text-background py-4"
            />
          </View>


          {/* EMAIL */}
          <View className="bg-card border border-border rounded-xl px-4 mb-4">
            <TextInput
              placeholder="Email"
              placeholderTextColor="#777"
              className="text-background py-4"
            />
          </View>


          {/* STREET */}
          <View className="bg-card border border-border rounded-xl px-4 mb-4">
            <TextInput
              placeholder="Street Address"
              placeholderTextColor="#777"
              className="text-background py-4"
            />
          </View>


          {/* CITY */}
          <View className="bg-card border border-border rounded-xl px-4 mb-4">
            <TextInput
              placeholder="City"
              placeholderTextColor="#777"
              className="text-background py-4"
            />
          </View>


          {/* PIN CODE */}
          <View className="bg-card border border-border rounded-xl px-4 mb-4">
            <TextInput
              placeholder="Pin Code"
              placeholderTextColor="#777"
              keyboardType="numeric"
              className="text-background py-4"
            />
          </View>


          {/* STATE */}
          <View className="bg-card border border-border rounded-xl px-4 mb-6 flex-row justify-between items-center">
            <Text className="text-textSecondary py-4">
              Select State
            </Text>

            <Ionicons name="chevron-down" size={18} color="#888" />
          </View>


          {/* ADD BUTTON */}

          <TouchableOpacity className="bg-primary py-4 rounded-xl items-center">
            <Text className="text-white font-bold text-base">
              Add Address
            </Text>
          </TouchableOpacity>

        </View>


        <View className="h-20" />

      </ScrollView>

    </SafeAreaView>
  );
}