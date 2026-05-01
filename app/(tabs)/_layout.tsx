import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Tabs, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Image,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { getCart } from "../../services/api";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user, logout, loading } = useAuth();
  const router = useRouter();

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
    const backAction = () => {};
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [user]);

  const handleLogout = async () => {
    setMenuVisible(false);
    setLogoutVisible(false);
    await logout();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f0f" }}>
        <ActivityIndicator size="large" color="#e11d1d" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerStyle: { backgroundColor: "#0f0f0f", borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
        tabBarActiveTintColor: "#e11d1d",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#0f0f0f",
          borderTopColor: "#222",
          height: 60,
          paddingBottom: 10,
        },

        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.push("/")}
            style={{ marginLeft: 16 }}
          >
            <Image
              source={require("../../assets/images/logo_dark.png")}
              style={{ width: 80, height: 44 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ),

        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 16 }}>
            {/* CART */}
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={{ marginRight: 16 }}
            >
              <View style={{ position: "relative" }}>
                <Ionicons name="cart-outline" size={24} color="white" />
                {cartCount > 0 && (
                  <View style={{ 
                    position: "absolute", 
                    top: -6, 
                    right: -8, 
                    backgroundColor: "#e11d1d", 
                    borderRadius: 10, 
                    minWidth: 18, 
                    height: 18, 
                    alignItems: "center", 
                    justifyContent: "center",
                    paddingHorizontal: 2
                  }}>
                    <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
                      {cartCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* ORDERS */}
            <TouchableOpacity
              onPress={() => router.push("/Orders")}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="cube-outline" size={24} color="white" />
            </TouchableOpacity>

            {/* AVATAR */}
            <TouchableOpacity
              onPress={() => {
                if (!user) router.push("/(auth)/login");
                else setMenuVisible(true);
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: user ? "#e11d1d" : "#374151"
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

            {/* MODALS */}
            <Modal transparent visible={user && menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
              <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
                <View style={{ 
                  position: "absolute", 
                  top: 60 + insets.top, 
                  right: 16, 
                  backgroundColor: "#1a1a1a", 
                  borderRadius: 16, 
                  padding: 16, 
                  width: 200, 
                  borderWidth: 1, 
                  borderColor: "#333",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 10
                }}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>{user?.username}</Text>
                    <Text style={{ color: "#9ca3af", fontSize: 12, textTransform: "capitalize" }}>{user?.role}</Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: "#333", marginVertical: 8 }} />
                  
                  <TouchableOpacity onPress={() => { setMenuVisible(false); router.push("/profile"); }} style={{ paddingVertical: 10 }}>
                    <Text style={{ color: "white" }}>My Profile</Text>
                  </TouchableOpacity>

                  {user?.role === "admin" && (
                    <TouchableOpacity onPress={() => { setMenuVisible(false); router.push("/(admin)"); }} style={{ paddingVertical: 10 }}>
                      <Text style={{ color: "#ef4444", fontWeight: "600" }}>Admin Panel</Text>
                    </TouchableOpacity>
                  )}

                  {user?.role === "trainer" && (
                    <TouchableOpacity onPress={() => { setMenuVisible(false); router.push("/(trainers)/dashboard"); }} style={{ paddingVertical: 10 }}>
                      <Text style={{ color: "#fbbf24", fontWeight: "600" }}>Trainer Panel</Text>
                    </TouchableOpacity>
                  )}

                  <View style={{ height: 1, backgroundColor: "#333", marginVertical: 8 }} />
                  <TouchableOpacity onPress={() => { setMenuVisible(false); setLogoutVisible(true); }} style={{ paddingVertical: 10 }}>
                    <Text style={{ color: "#ef4444", fontWeight: "bold" }}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>

            <Modal transparent visible={logoutVisible} animationType="fade" onRequestClose={() => setLogoutVisible(false)}>
              <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
                <View style={{ width: "100%", backgroundColor: "#1a1a1a", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#333" }}>
                  <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", textAlign: "center" }}>Confirm Logout</Text>
                  <Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 8 }}>Are you sure you want to logout?</Text>
                  <View style={{ flexDirection: "row", marginTop: 24 }}>
                    <TouchableOpacity onPress={() => setLogoutVisible(false)} style={{ flex: 1, backgroundColor: "#333", padding: 14, borderRadius: 16, marginRight: 10, alignItems: "center" }}>
                      <Text style={{ color: "white" }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={{ flex: 1, backgroundColor: "#e11d1d", padding: 14, borderRadius: 16, alignItems: "center" }}>
                      <Text style={{ color: "white", fontWeight: "bold" }}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="workouts" options={{ title: "Workouts", tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} /> }} />
      <Tabs.Screen name="diet" options={{ title: "Diet", tabBarIcon: ({ color, size }) => <Ionicons name="nutrition" size={size} color={color} /> }} />
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} /> }} />
      <Tabs.Screen name="products" options={{ title: "Products", tabBarIcon: ({ color, size }) => <Ionicons name="pricetag" size={size} color={color} /> }} />
      <Tabs.Screen name="offers" options={{ title: "Offers", tabBarIcon: ({ color, size }) => <Ionicons name="gift" size={size} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} /> }} />
    </Tabs>
  );
}