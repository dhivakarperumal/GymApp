import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Header";
import BackButton from "../BackButton";

export default function Contact() {
  return (
    <SafeAreaView className="flex-1 bg-card">
      {/* HEADER */}
      <Header />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <BackButton style={{ marginTop: 20, marginBottom: 20 }} />

        {/* TITLE */}
        <Text className="text-primary text-sm font-semibold mb-2 mt-4">
          CONTACT US
        </Text>

        <Text className="text-background text-3xl font-extrabold leading-tight mb-4">
          Let’s talk about your{"\n"}fitness goals
        </Text>

        <Text className="text-textSecondary text-sm mb-8 leading-6">
          Reach out anytime. Our team is here to help you transform your body
          with personalized training programs.
        </Text>

        {/* CONTACT INFO */}

        <View className="mb-8">
          <View className="flex-row items-center bg-darkcard p-4 rounded-2xl border border-border mb-4">
            <View className="bg-card p-3 rounded-xl mr-4 border border-border">
              <Ionicons name="location-outline" size={20} color="#e11d1d" />
            </View>
            <Text className="text-background flex-1">
              785 15th Street, Office 478 Berlin
            </Text>
          </View>

          <View className="flex-row items-center bg-darkcard p-4 rounded-2xl border border-border mb-4">
            <View className="bg-card p-3 rounded-xl mr-4 border border-border">
              <Ionicons name="call-outline" size={20} color="#e11d1d" />
            </View>
            <Text className="text-background flex-1">+1 800 555 25 69</Text>
          </View>

          <View className="flex-row items-center bg-darkcard p-4 rounded-2xl border border-border">
            <View className="bg-card p-3 rounded-xl mr-4 border border-border">
              <Ionicons name="mail-outline" size={20} color="#e11d1d" />
            </View>
            <Text className="text-background flex-1">info@example.com</Text>
          </View>
        </View>

        {/* PREMIUM CONTACT FORM */}

        <View className="bg-darkcard p-6 rounded-3xl border border-border">
          <Text className="text-background text-lg font-bold mb-6">
            Send Message
          </Text>

          {/* NAME */}
          <View className="flex-row items-center bg-card rounded-xl border border-border px-4 mb-4">
            <Ionicons name="person-outline" size={18} color="#e11d1d" />
            <TextInput
              placeholder="Your Name"
              placeholderTextColor="#777"
              className="flex-1 text-background ml-3 py-4"
            />
          </View>

          {/* EMAIL */}
          <View className="flex-row items-center bg-card rounded-xl border border-border px-4 mb-4">
            <Ionicons name="mail-outline" size={18} color="#e11d1d" />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#777"
              className="flex-1 text-background ml-3 py-4"
            />
          </View>

          {/* PHONE */}
          <View className="flex-row items-center bg-card rounded-xl border border-border px-4 mb-4">
            <Ionicons name="call-outline" size={18} color="#e11d1d" />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#777"
              className="flex-1 text-background ml-3 py-4"
            />
          </View>

          {/* SUBJECT */}
          <View className="flex-row items-center bg-card rounded-xl border border-border px-4 mb-4">
            <Ionicons name="chatbubble-outline" size={18} color="#e11d1d" />
            <TextInput
              placeholder="Subject"
              placeholderTextColor="#777"
              className="flex-1 text-background ml-3 py-4"
            />
          </View>

          {/* MESSAGE */}
          <View className="bg-card rounded-xl border border-border px-4 py-5 mb-6">
            <TextInput
              placeholder="Your Message"
              placeholderTextColor="#777"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="text-background py-4"
            />
          </View>

          {/* BUTTON */}
          <TouchableOpacity className="bg-primary py-4 rounded-xl items-center">
            <Text className="text-white font-bold text-base">Send Message</Text>
          </TouchableOpacity>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
