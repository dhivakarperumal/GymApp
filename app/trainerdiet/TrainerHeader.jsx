import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

export default function TrainerHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [newMembers, setNewMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("https://mygym.qtechx.com/api/assignments");
        const data = await res.json();

        const now = new Date();

        const last24HoursMembers = data.filter((m) => {
          const created = new Date(m.created_at);
          const diff = (now - created) / (1000 * 60 * 60);
          return diff <= 24;
        });

        setNewMembers(last24HoursMembers);
      } catch (err) {
        console.log("Notification error", err);
      }
    };

    fetchMembers();
  }, []);

  return (
    <View style={{ zIndex: 100 }}>
      {/* HEADER */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-[#0f0f0f] px-4 pb-3 flex-row items-center justify-between"
      >
        {/* LOGO */}
        <TouchableOpacity onPress={() => router.push("/(trainers)/dashboard")}>
          <Image
            source={require("../../assets/images/logo_dark.png")}
            className="w-20 h-11"
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* ICONS */}
        <View className="flex-row items-center">
          
          {/* NOTIFICATION */}
          <TouchableOpacity
            className="mr-5"
            onPress={() => {
              setShowDropdown(!showDropdown);
              setShowProfileMenu(false);
            }}
          >
            <View>
              <Ionicons name="notifications-outline" size={22} color="white" />

              {newMembers.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-600 w-4 h-4 rounded-full items-center justify-center">
                  <Text className="text-[10px] text-white font-bold">
                    {newMembers.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* PROFILE */}
          <TouchableOpacity
            onPress={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowDropdown(false);
            }}
          >
            <View className="w-9 h-9 rounded-full bg-red-600 items-center justify-center">
              <Text className="text-white font-bold">T</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* OUTSIDE CLICK */}
      {(showDropdown || showProfileMenu) && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setShowDropdown(false);
            setShowProfileMenu(false);
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}

      {/* NOTIFICATION DROPDOWN */}
      {showDropdown && (
        <View className="absolute top-20 right-4 w-64 bg-[#141414] border border-[#262626] rounded-xl p-3">
          <Text className="text-white font-bold mb-2">New Members</Text>

          {newMembers.length === 0 ? (
            <Text className="text-gray-400 text-sm">No new members</Text>
          ) : (
            newMembers.map((m, i) => (
              <View key={i} className="border-b border-[#262626] py-2">
                <Text className="text-white text-sm font-semibold">
                  {m.username || m.user_name}
                </Text>

                <Text className="text-gray-400 text-xs">
                  {m.user_email}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* PROFILE MENU */}
      {showProfileMenu && (
        <View className="absolute top-20 right-2 w-72 bg-[#141414] border border-[#262626] rounded-xl p-2">
          <TouchableOpacity
            onPress={() => {
              setShowProfileMenu(false);
              router.push("/(trainers)/profile");
            }}
            className="flex-row items-center p-2"
          >
            <Ionicons name="person-outline" size={18} color="white" />
            <Text className="text-white ml-2">Profile</Text>
          </TouchableOpacity>

          <View className="h-[1px] bg-[#262626] my-1" />

          <TouchableOpacity
            onPress={() => {
              setShowProfileMenu(false);
              router.replace("/login");
            }}
            className="flex-row items-center p-2"
          >
            <Ionicons name="log-out-outline" size={18} color="red" />
            <Text className="text-red-500 ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}