import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function More() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: () => {
          Toast.show({
            type: "success",
            text1: "Logged Out",
            text2: "You have been logged out successfully",
          });

          setTimeout(() => {
            router.replace("/");
          }, 800);
        },
      },
    ]);
  };

  const MenuItem = ({ icon, title, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-3 shadow"
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="ml-3 text-base font-semibold text-gray-800">
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 pt-6">

      {/* Profile Card */}
      <View className="bg-white rounded-2xl p-5 mb-6 shadow items-center">
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          className="w-20 h-20 rounded-full mb-3"
        />
        <Text className="text-lg font-bold text-gray-800">
          Admin User
        </Text>
        <Text className="text-gray-500">
          admin@gmail.com
        </Text>
      </View>

      {/* Menu Items */}
      <MenuItem
        icon={<MaterialIcons name="shopping-bag" size={22} color="#2563EB" />}
        title="Orders"
        onPress={() => router.push("/orders")}
      />

      <MenuItem
        icon={<Ionicons name="notifications-outline" size={22} color="#F59E0B" />}
        title="Notifications"
        onPress={() => router.push("/notifications")}
      />

      <MenuItem
        icon={<Feather name="settings" size={22} color="#10B981" />}
        title="Settings"
        onPress={() => router.push("/settings")}
      />

      <MenuItem
        icon={<Feather name="help-circle" size={22} color="#6366F1" />}
        title="Help & Support"
        onPress={() => router.push("/support")}
      />

      <MenuItem
        icon={<Ionicons name="information-circle-outline" size={22} color="#EC4899" />}
        title="About App"
        onPress={() => router.push("/about")}
      />

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 p-4 rounded-xl mt-6 shadow"
      >
        <Text className="text-center text-white font-semibold text-base">
          Logout
        </Text>
      </TouchableOpacity>

      <View className="h-10" />
    </ScrollView>
  );
}