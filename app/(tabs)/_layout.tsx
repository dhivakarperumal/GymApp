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
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleLogout = async () => {
    setMenuVisible(false);
    setLogoutVisible(false);
    await logout(); // RootNavigator will handle redirect
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
          <View style={{ paddingLeft: 16 }}>
            <Image
              source={require("../../assets/images/logo_dark.png")}
              style={{ width: 80, height: 44 }}
              resizeMode="contain"
            />
          </View>
        ),

        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 16 }}>
            
            {/* CART */}
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="cart-outline" size={22} color="white" />
            </TouchableOpacity>

            {/* NOTIFICATION */}
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="notifications-outline" size={22} color="white" />
            </TouchableOpacity>

            {/* AVATAR */}
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#e11d1d",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {initial}
              </Text>
            </TouchableOpacity>

            {/* DROPDOWN MENU */}
            <Modal
              transparent
              visible={menuVisible}
              animationType="fade"
              onRequestClose={() => setMenuVisible(false)}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setMenuVisible(false)}
              >
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
                  {/* USER INFO */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                      {user?.username || "User"}
                    </Text>
                    <Text style={{ color: "#aaa", fontSize: 13 }}>
                      {user?.role || "member"}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#333", marginVertical: 8 }} />

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

                  <View style={{ height: 1, backgroundColor: "#333", marginVertical: 8 }} />

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