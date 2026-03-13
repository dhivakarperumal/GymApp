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
import { useState, useEffect } from "react";
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
    }, [user]),
  );

  const handleLogout = async () => {
    setMenuVisible(false);
    setLogoutVisible(false);
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#0f0f0f",
      }}
    >
      {/* LOGO */}
      <Image
        source={require("../assets/images/logo_dark.png")}
        style={{ width: 80, height: 44 }}
        resizeMode="contain"
      />

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* CART */}
        <TouchableOpacity
          onPress={() => router.push("/cart")}
          style={{ marginRight: 16 }}
        >
          <View>
            <Ionicons name="cart-outline" size={22} color="white" />

            {cartCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -6,
                  right: -8,
                  backgroundColor: "#e11d1d",
                  borderRadius: 10,
                  minWidth: 16,
                  height: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                >
                  {cartCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/Orders")}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="cube-outline" size={22} color="white" />
        </TouchableOpacity>

        {/* NOTIFICATION */}
        <TouchableOpacity style={{ marginRight: 16 }}>
          <Ionicons name="notifications-outline" size={22} color="white" />
        </TouchableOpacity>

        {/* AVATAR */}
        <TouchableOpacity
          onPress={() => {
            if (!user) {
              router.push("/(auth)/login");
            } else {
              setMenuVisible(true);
            }
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: user ? "#e11d1d" : "#333",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {user ? (
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {user.username?.charAt(0)?.toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person-outline" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* USER MENU */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
          <View
            style={{
              position: "absolute",
              top: 80,
              right: 20,
              backgroundColor: "#1a1a1a",
              borderRadius: 20,
              padding: 16,
              width: 210,
              borderWidth: 1,
              borderColor: "#333",
            }}
          >
            <View style={{ marginBottom: 12 }}>
              {user && (
                <>
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {user.username}
                  </Text>
                  <Text style={{ color: "#aaa", fontSize: 13 }}>
                    {user.role}
                  </Text>
                </>
              )}
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "#333",
                marginVertical: 8,
              }}
            />

            {/* PROFILE */}
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                router.push("/profile");
              }}
              style={{ paddingVertical: 8 }}
            >
              <Text style={{ color: "white" }}>My Profile</Text>
            </TouchableOpacity>

            {/* ROLE BASED */}
            {user?.role === "admin" && (
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  router.push("/(admin)");
                }}
                style={{ paddingVertical: 8 }}
              >
                <Text style={{ color: "#ef4444", fontWeight: "600" }}>
                  Admin Panel
                </Text>
              </TouchableOpacity>
            )}

            {user?.role === "trainer" && (
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  router.push("/(trainers)/dashboard");
                }}
                style={{ paddingVertical: 8 }}
              >
                <Text style={{ color: "#facc15", fontWeight: "600" }}>
                  Trainer Panel
                </Text>
              </TouchableOpacity>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: "#333",
                marginVertical: 8,
              }}
            />

            {/* LOGOUT */}
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                setLogoutVisible(true);
              }}
              style={{ paddingVertical: 8 }}
            >
              <Text style={{ color: "#dc2626", fontWeight: "bold" }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* CONFIRM LOGOUT MODAL */}
      <Modal
        transparent
        visible={logoutVisible}
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: "#1a1a1a",
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: "#333",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Confirm Logout
            </Text>

            <Text
              style={{
                color: "#aaa",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Are you sure you want to logout?
            </Text>

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              {/* CANCEL */}
              <TouchableOpacity
                onPress={() => setLogoutVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#333",
                  padding: 12,
                  borderRadius: 20,
                  marginRight: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </TouchableOpacity>

              {/* LOGOUT */}
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  flex: 1,
                  backgroundColor: "#e11d1d",
                  padding: 12,
                  borderRadius: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
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
