import { Tabs } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

function TrainerHeader() {
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: "#0f0f0f",
        paddingTop: 50,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left Logo */}
      <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
        TRAINER PANEL
      </Text>

      {/* Right Icons */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => router.push("/(trainers)/clients")}
          style={{ marginRight: 18 }}
        >
          <Ionicons name="people-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(trainers)/earnings")}
          style={{ marginRight: 18 }}
        >
          <Ionicons name="wallet-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(trainers)/profile")}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#e11d1d",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>T</Text>
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
        header: () => <TrainerHeader />,
        tabBarActiveTintColor: "#e11d1d",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#0f0f0f",
          borderTopColor: "#222",
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fitness-center" size={22} color={color} />
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
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}