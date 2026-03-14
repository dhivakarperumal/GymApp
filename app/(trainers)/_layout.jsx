import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function TrainerHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [newMembers, setNewMembers] = useState([]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchMembers = async () => {
      try {
        const res = await fetch("https://mygym.qtechx.com/api/assignments");
        const data = await res.json();

        const now = new Date();

        const last24HoursMembers = data.filter((m) => {
          const created = new Date(m.created_at);
          const diff = (now - created) / (1000 * 60 * 60);

          return (
            diff <= 24 &&
            String(m.trainer_id) === String(user.id)
          );
        });

        setNewMembers(last24HoursMembers);
      } catch (err) {
        console.log("Notification error", err);
      }
    };

    fetchMembers();

    // auto refresh every 10 seconds
    const interval = setInterval(fetchMembers, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const profilePhoto = user?.photo
    ? `${BASE_URL}/staff/${user.photo}`
    : null;

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-[#0f0f0f] px-4 pb-3 flex-row items-center justify-between"
    >
      <TouchableOpacity onPress={() => router.push("/(trainers)/dashboard")}>
        <Image
          source={require("../../assets/images/logo_dark.png")}
          className="w-20 h-11"
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* HEADER ICONS */}
      <View className="flex-row items-center">
        {/* NOTIFICATION */}
        <TouchableOpacity
          className="mr-5"
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <View>
            <Ionicons name="notifications-outline" size={22} color="white" />

            {newMembers.length > 0 && (
              <View className="absolute top-20 right-4 bg-red-600 w-4 h-4 rounded-full items-center justify-center">
                <Text className="text-[10px] text-white font-bold">
                  {newMembers.length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* PROFILE */}
        <TouchableOpacity onPress={() => setShowProfileMenu(!showProfileMenu)}>
          {user?.photo ? (
            <Image
              source={{ uri: `${BASE_URL}/staff/${user.photo}` }}
              className="w-9 h-9 rounded-full"
            />
          ) : (
            <View className="w-9 h-9 rounded-full bg-red-600 items-center justify-center">
              <Text className="text-white font-bold">
                {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
            zIndex: 999,
            elevation: 999,
          }}
        />
      )}

      {/* DROPDOWN */}

      {showDropdown && (
        <View
          style={{ zIndex: 1000, elevation: 1000 }}
          className="absolute top-20 right-4 w-64 bg-[#141414] border border-[#262626] rounded-xl p-3"
        >
          <Text className="text-white font-bold mb-2">New Members</Text>

          {newMembers.length === 0 ? (
            <Text className="text-gray-400 text-sm">No new members</Text>
          ) : (
            newMembers.map((m, i) => (
              <View key={i} className="border-b border-[#262626] py-2">
                <Text className="text-white text-sm font-semibold">
                  {m.username || m.user_name}
                </Text>

                <Text className="text-gray-400 text-xs">{m.user_email}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* PROFILE POPUP */}

      {showProfileMenu && (
        <>

          {/* POPUP MENU */}
          <View
            style={{ zIndex: 1000, elevation: 1000 }}
            className="absolute top-20 right-2 w-80 bg-[#141414] border border-[#262626] rounded-xl p-2"
          >
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
        </>
      )}
    </View>
  );
}

export default function TrainersLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: () => <TrainerHeader />,

        tabBarActiveTintColor: "#e11d1d", // 🔴 RED
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
        name="diet-plans"
        options={{
          title: "Diet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition-outline" size={size} color={color} />
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
