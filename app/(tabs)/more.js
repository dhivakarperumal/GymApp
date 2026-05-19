import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

const menuItems = [
  { title: "Profile", icon: "person-outline", subtitle: "Manage your account" },
  { title: "Pricing", icon: "pricetag-outline", subtitle: "View membership plans" },
  { title: "Services", icon: "flash-outline", subtitle: "Premium training services" },
  { title: "Facilities", icon: "barbell-outline", subtitle: "Gym equipment & zones" },
  { title: "Trainers", icon: "people-outline", subtitle: "Our certified coaches" },
  { title: "Contact", icon: "call-outline", subtitle: "Get in touch with us" },
];

export default function More() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 300);
  };

  const handleNavigation = (title) => {
    const routes = {
      Profile: "/profile",
      Pricing: "/Pages/Pricing",
      Services: "/Pages/Services",
      Facilities: "/Pages/Facilities",
      Trainers: "/Pages/Trainers",
      Contact: "/Pages/Contact",
    };
    if (routes[title]) router.push(routes[title]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      {/* HEADER ROW */}
      <View style={{
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
        backgroundColor: "#000", borderBottomWidth: 1, borderBottomColor: "#111",
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      }}>
        <View>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: -0.5 }}>Menu</Text>
          <Text style={{ color: "#4b5563", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>Explore More</Text>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#e11d1d", alignItems: "center", justifyContent: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}>
          <Ionicons name="grid-outline" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e11d1d"
          />
        }
      >
        <Text style={{ color: "#e11d1d", fontSize: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, marginTop: 4 }}>
          Quick Access
        </Text>

        <View style={{
          backgroundColor: "#0d0d0d",
          borderRadius: 24,
          paddingHorizontal: 20,
          borderWidth: 1,
          borderColor: "#1a1a1a",
          marginBottom: 20
        }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => handleNavigation(item.title)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 20,
                borderBottomWidth: index === menuItems.length - 1 ? 0 : 1,
                borderBottomColor: "#1a1a1a",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: "#111",
                  borderWidth: 1,
                  borderColor: "#222",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16
                }}>
                  <Ionicons name={item.icon} size={22} color="#e11d1d" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 2 }}>{item.title}</Text>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>{item.subtitle}</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#444" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
