import { Tabs, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TrainerHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-[#0f0f0f] px-4 pb-3 flex-row items-center justify-between"
    >
      <TouchableOpacity
        onPress={() => router.push("/(trainers)/dashboard")}
      >
        <Image
          source={require("../../assets/images/logo_dark.png")}
          className="w-20 h-11"
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* HEADER ICONS */}
      <View className="flex-row items-center">

        <TouchableOpacity
          className="mr-5"
          onPress={() => router.push("/(trainers)/clients")}
        >
          <Ionicons name="people-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          className="mr-5"
          onPress={() => router.push("/(trainers)/earnings")}
        >
          <Ionicons name="wallet-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(trainers)/profile")}
        >
          <View className="w-9 h-9 rounded-full bg-red-600 items-center justify-center">
            <Text className="text-white font-bold">T</Text>
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
}

export default function TrainersLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: () => <TrainerHeader />,

        tabBarActiveTintColor: "#e11d1d",   // 🔴 RED
        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          backgroundColor: "#0f0f0f",
          borderTopColor: "#222",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },

        sceneContainerStyle: {
          backgroundColor: "#0f0f0f",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fitness-center" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}