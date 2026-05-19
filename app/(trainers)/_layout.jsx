import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = "https://dapfitt.com";

function TrainerHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [newMembers, setNewMembers] = useState([]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { logout } = useAuth();

  const confirmLogout = async () => {
    try {
      setLogoutModalVisible(false);
      await logout();
      router.replace("/login");
    } catch (error) {
      console.log("Trainer logout error:", error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchMembers = async () => {
      try {
        const res = await fetch("https://dapfitt.com/api/assignments");
        const json = await res.json();
        const data = Array.isArray(json) ? json : (json?.data || json?.assignments || []);

        const now = new Date();
        const last24HoursMembers = data
          .filter((m) => {
            if (!m || !m.updatedAt) return false;

            const diffHours =
              (Date.now() - new Date(m.updatedAt).getTime()) /
              (1000 * 60 * 60);

            return (
              diffHours <= 24 &&
              m.trainerName?.toLowerCase() === user.username?.toLowerCase()
            );
          })
          .map((m) => ({
            name: m.username || "No Name",
            email: m.userEmail || "-",
            phone: m.userMobile || "-",
          }));

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
        {/* MESSAGES */}
        <TouchableOpacity
          className="mr-5"
          onPress={() => router.push("/(trainers)/messages")}
        >
          <Ionicons name="paper-plane-outline" size={22} color="white" />
        </TouchableOpacity>

        {/* NOTIFICATION */}
        <TouchableOpacity
          className="mr-5"
          onPress={() => setShowDropdown(!showDropdown)}
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

      <Modal
        transparent
        visible={showProfileMenu}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <Pressable
          className="flex-1"
          onPress={() => setShowProfileMenu(false)}
        >
          <View className="absolute top-20 right-2 w-60 bg-[#141414] border border-[#262626] rounded-xl p-2">

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
                setLogoutModalVisible(true);
              }}
              className="flex-row items-center p-2"
            >
              <Ionicons name="log-out-outline" size={18} color="red" />
              <Text className="text-red-500 ml-2">Logout</Text>
            </TouchableOpacity>

          </View>
        </Pressable>
      </Modal>


      {/* NOTIFICATION DROPDOWN */}

      <Modal
        transparent
        visible={showDropdown}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable
          className="flex-1"
          onPress={() => setShowDropdown(false)}
        >
          <View className="absolute top-20 right-4 w-64 bg-[#141414] border border-[#262626] rounded-xl p-3">

            <Text className="text-white font-bold mb-2">New Members</Text>

            {newMembers.length === 0 ? (
              <Text className="text-gray-400 text-sm">No new members</Text>
            ) : (
              newMembers.map((m, i) => (
                <View key={i} className="border-b border-[#262626] py-2">
                  <Text className="text-white text-sm font-semibold">
                    {m.name}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    📧 {m.email}
                  </Text>
                </View>
              ))
            )}

          </View>
        </Pressable>
      </Modal>


      {/* LOGOUT CONFIRM MODAL */}

      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setLogoutModalVisible(false)}
          className="flex-1 justify-center items-center bg-black/60"
        >

          <View className="bg-[#141414] w-[85%] rounded-2xl p-6 border border-[#262626]">

            <View className="items-center mb-3">
              <Ionicons name="log-out-outline" size={40} color="#ef4444" />
            </View>

            <Text className="text-white text-lg font-bold text-center mb-2">
              Logout
            </Text>

            <Text className="text-gray-400 text-center mb-6">
              Are you sure you want to logout?
            </Text>

            <View className="flex-row justify-between">

              {/* Cancel */}
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                className="flex-1 bg-[#262626] py-3 rounded-xl mr-2"
              >
                <Text className="text-center text-white font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Logout */}
              <TouchableOpacity
                onPress={confirmLogout}
                className="flex-1 bg-red-600 py-3 rounded-xl ml-2"
              >
                <Text className="text-center text-white font-semibold">
                  Logout
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </TouchableOpacity>
      </Modal>
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
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="update-weight"
        options={{
          title: "Weight",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="diet-plans"
        options={{
          title: "Diet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
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
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden screens — accessible via router but not in tab bar */}
      <Tabs.Screen name="Attendance"       options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="profile"          options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="follow-up-enquiry" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="pricing"          options={{ href: null, headerShown: false }} />
      
      <Tabs.Screen 
        name="messages"         
        options={{ 
          href: null, 
          headerShown: false,
          tabBarStyle: { display: "none" }
        }} 
      />

      <Tabs.Screen 
        name="buy-plan"         
        options={{ 
          href: null, 
          headerShown: false,
          tabBarStyle: { display: "none" }
        }} 
      />

      <Tabs.Screen 
        name="payments"         
        options={{ 
          href: null, 
          headerShown: false,
          tabBarStyle: { display: "none" }
        }} 
      />

      {/* Hide all PTForm components */}
      <Tabs.Screen
        name="PTForm/FitnessScreening"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PTForm/FlexibilityAndMeasurements"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PTForm/HealthHistory2"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PTForm/HealthHistoy"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PTForm/InformedConsent"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PTForm/PTForm"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PTForm/PTFormEnquiry"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PTForm/PTFormPreviewContent"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PTForm/PTFormPrint"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="PTForm/SessionTracker"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="pt-form"
        options={{
          href: null,
          headerShown: false
        }}
      />

      <Tabs.Screen
        name="session-tracking"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
          headerShown: false
        }}
      />
    </Tabs>
  );
}
