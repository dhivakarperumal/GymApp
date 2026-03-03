import { Tabs } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";


function TrainerHeader() {
  const router = useRouter();

  return (
    <View className="bg-slate-900 pt-12 pb-4 px-4 flex-row justify-between items-center">
      
      {/* Left Logo */}
      <Text className="text-white text-lg font-bold">
        TRAINER PANEL
      </Text>

      {/* Right Icons */}
      <View className="flex-row items-center space-x-4">
        
        <TouchableOpacity onPress={() => router.push("/(trainers)/clients")}>
          <Ionicons name="people-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(trainers)/earnings")}>
          <Ionicons name="wallet-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(trainers)/profile")}>
          <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
            <Text className="text-white font-bold">T</Text>
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
}

export default function TrainersLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <TrainerHeader />,   // 🔥 CUSTOM HEADER
        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60,
          paddingBottom: 8,
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

      {/* <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color, size }) => (
            <Feather name="dollar-sign" size={size} color={color} />
          ),
        }}
      /> */}

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