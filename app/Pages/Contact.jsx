import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../BackButton";

export default function Contact() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>

      {/* HEADER ROW */}
      <View style={{
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
        backgroundColor: "#000", borderBottomWidth: 1, borderBottomColor: "#111",
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <BackButton style={{ marginRight: 12 }} />
          <View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>Contact Us</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>Get In Touch</Text>
          </View>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e11d1d", alignItems: "center", justifyContent: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}>
          <Ionicons name="call-outline" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>

        {/* SUBTITLE */}
        <Text style={{ color: "#e11d1d", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 3, marginBottom: 8, marginTop: 8 }}>
          Let's talk
        </Text>
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900", lineHeight: 34, marginBottom: 8 }}>
          Talk about your{"\n"}fitness goals
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 14, lineHeight: 22, marginBottom: 24 }}>
          Reach out anytime. Our team is here to help you transform your body with personalized training programs.
        </Text>

        {/* CONTACT INFO */}

        <View className="mb-8">
          <View className="flex-row items-center bg-darkcard p-4 rounded-2xl border border-border mb-4">
            <View className="bg-card p-3 rounded-xl mr-4 border border-border">
              <Ionicons name="location-outline" size={20} color="#e11d1d" />
            </View>
            <Text className="text-background flex-1">
              No.58 Vaitheeshwaran Nagar, Tirupattur - 635653
            </Text>
          </View>

          <View className="flex-row items-center bg-darkcard p-4 rounded-2xl border border-border mb-4">
            <View className="bg-card p-3 rounded-xl mr-4 border border-border">
              <Ionicons name="call-outline" size={20} color="#e11d1d" />
            </View>
            <Text className="text-background flex-1">+91 96591 33504</Text>
          </View>

          <View className="flex-row items-center bg-darkcard p-4 rounded-2xl border border-border">
            <View className="bg-card p-3 rounded-xl mr-4 border border-border">
              <Ionicons name="mail-outline" size={20} color="#e11d1d" />
            </View>
            <Text className="text-background flex-1">info@qtechx.com</Text>
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
