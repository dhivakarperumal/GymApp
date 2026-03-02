import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

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
        headerStyle: { backgroundColor: "#0f0f0f" },
        headerTitle: "",
        tabBarActiveTintColor: "#ff3c00",
        tabBarStyle: {
          backgroundColor: "#0f0f0f",
          borderTopColor: "#222",
        },

        headerLeft: () => (
          <View style={{ paddingLeft: 16 }}>
            <Image
              source={require("../../assets/images/logo_dark.png")}
              style={{ width: 45, height: 45 }}
              resizeMode="contain"
            />
          </View>
        ),

        headerRight: () => (
          <View style={{ flexDirection: "row", paddingRight: 16 }}>
            {/* CART */}
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="cart-outline" size={22} color="#fff" />
            </TouchableOpacity>

            {/* NOTIFICATION */}
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>

            {/* AVATAR */}
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#ff3c00",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
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
                style={{ flex: 1 }}
                onPress={() => setMenuVisible(false)}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 70,
                    right: 20,
                    backgroundColor: "#111",
                    borderRadius: 16,
                    padding: 12,
                    width: 160,
                    borderWidth: 1,
                    borderColor: "#222",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(false);
                      router.push("/profile");
                    }}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text style={{ color: "white" }}>
                      My Profile
                    </Text>
                  </TouchableOpacity>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#222",
                      marginVertical: 8,
                    }}
                  />

                  <TouchableOpacity
                    onPress={handleLogout}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text
                      style={{
                        color: "#ff3c00",
                        fontWeight: "bold",
                      }}
                    >
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
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