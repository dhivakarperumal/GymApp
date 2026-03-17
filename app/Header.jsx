import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function Header() {
  const router = useRouter();
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

  const handleLogout = async () => {
    setMenuVisible(false);
    setLogoutVisible(false);
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-2.5 bg-[#0f0f0f]">

      {/* LOGO */}
      <Image
        source={require("../assets/images/logo_dark.png")}
        className="w-20 h-11"
        resizeMode="contain"
      />

      <View className="flex-row items-center">

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
          className={`w-9 h-9 rounded-full items-center justify-center ${
            user ? "bg-red-600" : "bg-gray-700"
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
      </View>

      {/* USER MENU */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable className="flex-1" onPress={() => setMenuVisible(false)}>
          <View className="absolute top-20 right-5 bg-[#1a1a1a] rounded-2xl p-4 w-[210px] border border-[#333]">

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
              <Text className="text-red-600 font-bold">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* LOGOUT CONFIRM MODAL */}
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
                <Text className="text-white font-bold">
                  Logout
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}