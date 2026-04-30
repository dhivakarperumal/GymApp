import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MoreOptions() {
  const router = useRouter();

  const menuItems = [
    {
      id: "attendance",
      title: "Attendance",
      icon: "calendar-outline",
      iconType: "Ionicons",
      route: "/(trainers)/Attendance",
      color: "#3b82f6", // Blue
    },
    {
      id: "followup",
      title: "Follow-up Enquiry",
      icon: "chatbubble-ellipses-outline",
      iconType: "Ionicons",
      route: "/(trainers)/follow-up-enquiry",
      color: "#f59e0b", // Orange
    },
    {
      id: "profile",
      title: "My Profile",
      icon: "person-outline",
      iconType: "Ionicons",
      route: "/(trainers)/profile",
      color: "#ef4444", // Red
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]" edges={["left", "right"]}>
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-white text-2xl font-bold mb-6">More Options</Text>

        <View className="bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route)}
              className={`flex-row items-center p-4 ${
                index !== menuItems.length - 1 ? "border-b border-[#262626]" : ""
              }`}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${item.color}20` }}
              >
                {item.iconType === "Ionicons" ? (
                  <Ionicons name={item.icon} size={20} color={item.color} />
                ) : (
                  <MaterialIcons name={item.icon} size={20} color={item.color} />
                )}
              </View>

              <View className="flex-1">
                <Text className="text-white text-lg font-medium">{item.title}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#4b5563" />
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-8 px-2">
            <Text className="text-gray-500 text-xs text-center">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
