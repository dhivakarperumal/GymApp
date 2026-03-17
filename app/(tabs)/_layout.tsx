import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Tabs, useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { getCart } from "../../services/api";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchCart = async () => {
        try {
          if (!user?.id) return;

          const data = await getCart(user.id);
          setCartCount(data?.length || 0);
        } catch (err) {
          console.log("Cart fetch error", err);
        }
      };

      fetchCart();
    }, [user])
  );

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
    }
  }, [user]);

  useEffect(() => {
    const backAction = () => {
      if (!user) return true;
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [user]);

  const handleLogout = async () => {
    setMenuVisible(false);
    setLogoutVisible(false);
    await logout();
  };

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
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image
              source={require("../../assets/images/logo_dark.png")}
              className="w-20 h-11"
              resizeMode="contain"
            />
          </TouchableOpacity>
        ),

        headerRight: () => (
          <View className="flex-row items-center pr-4">

            {/* CART */}
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              className="mr-4"
            >
              <View>
                <Ionicons name="cart-outline" size={22} color="white" />

                {cartCount > 0 && (
                  <View className="absolute -top-1.5 -right-2 bg-red-600 rounded-full min-w-[16px] h-4 items-center justify-center px-1">
                    <Text className="text-white text-[10px] font-bold">
                      {cartCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* ORDERS */}
            <TouchableOpacity
              onPress={() => router.push("/Orders")}
              className="mr-4"
            >
              <Ionicons name="cube-outline" size={22} color="white" />
            </TouchableOpacity>

            {/* NOTIFICATION */}
            {/* <TouchableOpacity className="mr-4">
              <Ionicons name="notifications-outline" size={22} color="white" />
            </TouchableOpacity> */}

            {/* AVATAR */}
            <TouchableOpacity
              onPress={() => {
                if (!user) router.push("/(auth)/login");
                else setMenuVisible(true);
              }}
              className={`w-9 h-9 rounded-full items-center justify-center ${user ? "bg-red-600" : "bg-gray-700"
                }`}
            >
              {user ? (
                <Text className="text-white font-bold">
                  {user.username?.charAt(0)?.toUpperCase()}
                </Text>
              ) : (
                <Ionicons name="person-outline" size={20} color="white" />
              )}
            </TouchableOpacity>

            {/* DROPDOWN MENU */}
            <Modal
              transparent
              visible={user && menuVisible}
              animationType="fade"
              onRequestClose={() => setMenuVisible(false)}
            >
              <Pressable
                className="flex-1"
                onPress={() => setMenuVisible(false)}
              >
                <View className="absolute top-20 right-5 bg-[#1a1a1a] rounded-2xl p-4 w-[210px] border border-[#333]">

                  {/* USER INFO */}
                  <View className="mb-3">
                    {user && (
                      <>
                        <Text className="text-white font-bold text-base">
                          {user.username}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {user.role}
                        </Text>
                      </>
                    )}
                  </View>

                  <View className="h-[1px] bg-[#333] my-2" />

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

                  {/* ADMIN */}
                  {user?.role === "admin" && (
                    <TouchableOpacity
                      onPress={() => {
                        setMenuVisible(false);
                        router.push("/(admin)");
                      }}
                      className="py-2"
                    >
                      <Text className="text-red-500 font-semibold">
                        Admin Panel
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* TRAINER */}
                  {user?.role === "trainer" && (
                    <TouchableOpacity
                      onPress={() => {
                        setMenuVisible(false);
                        router.push("/(trainers)/dashboard");
                      }}
                      className="py-2"
                    >
                      <Text className="text-yellow-400 font-semibold">
                        Trainer Panel
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View className="h-[1px] bg-[#333] my-2" />

                  {/* LOGOUT */}
                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(false);
                      setLogoutVisible(true);
                    }}
                    className="py-2"
                  >
                    <Text className="text-red-600 font-bold">Logout</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>

            {/* LOGOUT CONFIRM */}
            <Modal
              transparent
              visible={logoutVisible}
              animationType="fade"
              onRequestClose={() => setLogoutVisible(false)}
            >
              <View className="flex-1 bg-black/70 justify-center items-center px-5">
                <View className="w-full bg-[#1a1a1a] rounded-3xl p-6 border border-[#333]">

                  <Text className="text-white text-lg font-bold text-center">
                    Confirm Logout
                  </Text>

                  <Text className="text-gray-400 text-center mt-2">
                    Are you sure you want to logout?
                  </Text>

                  <View className="flex-row mt-5">
                    <TouchableOpacity
                      onPress={() => setLogoutVisible(false)}
                      className="flex-1 bg-[#333] p-3 rounded-2xl mr-2.5 items-center"
                    >
                      <Text className="text-white">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleLogout}
                      className="flex-1 bg-red-600 p-3 rounded-2xl items-center"
                    >
                      <Text className="text-white font-bold">Logout</Text>
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