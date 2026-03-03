import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (!storedUser) {
        router.replace("/login");
      } else {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    setMenuVisible(false);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerStyle: { backgroundColor: "#0f0f0f", paddingTop: insets.top },
        tabBarActiveTintColor: "#e11d1d",
        tabBarStyle: {
          backgroundColor: "#0f0f0f",
          borderTopColor: "#222",
        },

        headerLeft: () => (
          <View className="pl-4">
            <Image
              source={require("../../assets/images/logo_dark.png")}
              className="w-20 h-11"
              resizeMode="contain"
            />
          </View>
        ),

        headerRight: () => (
          <View className="flex-row items-center pr-4">
            {/* CART */}
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              className="mr-4"
            >
              <Ionicons name="cart-outline" size={22} color="white" />
            </TouchableOpacity>

            {/* NOTIFICATION */}
            <TouchableOpacity className="mr-4">
              <Ionicons
                name="notifications-outline"
                size={22}
                color="white"
              />
            </TouchableOpacity>

            {/* AVATAR */}
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              className="w-9 h-9 rounded-full bg-primary items-center justify-center"
            >
              <Text className="text-white font-bold">
                {initial}
              </Text>
            </TouchableOpacity>

            {/* DROPDOWN */}
            <Modal
              transparent
              visible={menuVisible}
              animationType="fade"
              onRequestClose={() => setMenuVisible(false)}
            >
              <Pressable
                className="flex-1"
                onPress={() => setMenuVisible(false)}
              >
                <View className="absolute top-20 right-5 bg-[#1a1a1a] rounded-2xl p-4 w-52 border border-gray-800">

                  {/* USER INFO */}
                  <View className="mb-3">
                    <Text className="text-white font-bold text-base">
                      {user?.username || "User"}
                    </Text>
                    <Text className="text-gray-400 text-sm capitalize">
                      {user?.role || "member"}
                    </Text>
                  </View>

                  <View className="h-px bg-gray-700 my-2" />

                  {/* PROFILE */}
                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(false);
                      router.push("/profile");
                    }}
                    className="py-2"
                  >
                    <Text className="text-white">My Profile</Text>
                  </TouchableOpacity>

                  {/* ROLE BASED PANEL */}
                  {user?.role === "admin" && (
                    <TouchableOpacity
                      onPress={() => {
                        setMenuVisible(false);
                        router.push("/(admin)");
                      }}
                      className="py-2"
                    >
                      <Text className="text-red-500 font-semibold">Admin Panel</Text>
                    </TouchableOpacity>
                  )}

                  {user?.role === "trainer" && (
                    <TouchableOpacity
                      onPress={() => {
                        setMenuVisible(false);
                        router.push("/trainer");
                      }}
                      className="py-2"
                    >
                      <Text className="text-yellow-400 font-semibold">
                        Trainer Panel
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View className="h-px bg-gray-700 my-2" />

                  {/* LOGOUT */}
                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(false);
                      setLogoutVisible(true);
                    }}
                    className="py-2"
                  >
                    <Text className="text-red-600 font-bold">
                      Logout
                    </Text>
                  </TouchableOpacity>

                </View>
              </Pressable>
            </Modal>

            {/* Login Confirmation Modal */}
            <Modal
              transparent
              visible={logoutVisible}
              animationType="fade"
              onRequestClose={() => setLogoutVisible(false)}
            >
              <View className="flex-1 bg-black/70 justify-center items-center px-6">

                {/* POPUP CARD */}
                <View className="w-full bg-darkcard rounded-3xl p-6 border border-border">

                  {/* TITLE */}
                  <Text className="text-white text-xl font-bold text-center">
                    Confirm Logout
                  </Text>

                  {/* MESSAGE */}
                  <Text className="text-gray-400 text-center mt-3 leading-5">
                    Are you sure you want to logout from your account?
                  </Text>

                  {/* BUTTONS */}
                  <View className="flex-row mt-6">

                    {/* CANCEL */}
                    <TouchableOpacity
                      onPress={() => setLogoutVisible(false)}
                      className="flex-1 bg-border1 py-3 rounded-full mr-3 items-center border border-textSecondary"
                    >
                      <Text className="text-white font-semibold">
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    {/* LOGOUT */}
                    <TouchableOpacity
                      onPress={async () => {
                        setLogoutVisible(false);
                        await handleLogout();
                      }}
                      className="flex-1 bg-primary py-3 rounded-full items-center"
                    >
                      <Text className="text-white font-bold">
                        Logout
                      </Text>
                    </TouchableOpacity>

                  </View>
                </View>

              </View>
            </Modal>

          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="diet"
        options={{
          title: "Diet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}