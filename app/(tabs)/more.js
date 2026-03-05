import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const menuItems = [
  { title: "Profile", icon: "person-outline" },
  { title: "Pricing", icon: "card-outline" },
  { title: "Services", icon: "briefcase-outline" },
  { title: "Facilities", icon: "business-outline" },
  { title: "Trainers", icon: "people-outline" },
  { title: "Contact", icon: "people-outline" },
];

export default function More() {
  const router = useRouter();

  const handleNavigation = (title) => {
    if (title === "Profile") {
      router.push("/profile");
    }
    if (title === "Pricing") {
      router.push("/Pages/Pricing");
    }
    if (title === "Services") {
      router.push("/Pages/Services");
    }
    if (title === "Facilities") {
      router.push("/Pages/Facilities");
    }
    if (title === "Trainers") {
      router.push("/Pages/Trainers");
    }
    if (title === "Contact") {
      router.push("/Pages/Contact");
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#0f0f0f] px-5 pt-12"
    >
      {/* Header */}
      <Text className="text-white text-3xl font-extrabold mb-2">More</Text>
      <Text className="text-gray-400 mb-8">
        Manage your account & preferences
      </Text>

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.85}
          className="mb-5"
          onPress={() => handleNavigation(item.title)}
        >
          <View className="bg-[#1c1c1c] rounded-2xl p-5 flex-row items-center justify-between border border-[#262626]">
            {/* Left Section */}
            <View className="flex-row items-center">
              <View className="bg-black p-4 rounded-2xl mr-4 border border-primary">
                <Ionicons name={item.icon} size={20} color="#ff3c00" />
              </View>

              <Text className="text-white text-base font-medium">
                {item.title}
              </Text>
            </View>

            {/* Right Arrow */}
            <View className="bg-black p-3 rounded-full border border-[#2a2a2a]">
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View className="h-10" />
    </ScrollView>
  );
}
