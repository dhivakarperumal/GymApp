import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  Pressable,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllProducts, getOffers } from "../../services/api";
import ProductCard from "../ProductCard";

const OFFERS_IMAGE_BASE = "https://dap.qtechx.com";

export default function OffersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState("offers"); 
  const [offers, setOffers] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [offersRes, productsRes] = await Promise.all([
        getOffers(),
        getAllProducts(),
      ]);
      setOffers(offersRes || []);
      const discounted = (productsRes || []).filter(p => {
        const mrp = Number(p.mrp || 0);
        const offerPrice = Number(p.offer_price || p.offerPrice || 0);
        return offerPrice > 0 && offerPrice < mrp;
      });
      setOfferProducts(discounted);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderOfferItem = ({ item }) => {
    // Check for both possible field names from backend
    const discount = item.discount_percentage || item.offer_percentage || 0;
    
    return (
      <View
        style={{
          marginBottom: 28,
          borderRadius: 28,
          overflow: "hidden",
          backgroundColor: "#000",
          borderWidth: 1.5,
          borderColor: "#1a1a1a",
          shadowColor: "#e11d1d",
          shadowOpacity: 0.15,
          shadowRadius: 25,
          elevation: 10,
        }}
      >
        {/* IMAGE SECTION */}
        <View style={{ height: 260, position: "relative" }}>
          <Image
            source={{
              uri: (item.offer_image?.startsWith("http") || item.offer_image?.startsWith("data:"))
                ? item.offer_image
                : `${OFFERS_IMAGE_BASE}${item.offer_image?.startsWith("/") ? "" : "/"}${item.offer_image}`,
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.15)" }} />
          
          {/* TOP LEFT BADGE (TYPE) */}
          <View style={{ 
            position: "absolute", 
            top: 20, 
            left: 20, 
            backgroundColor: "rgba(0,0,0,0.7)", 
            paddingHorizontal: 12, 
            paddingVertical: 4, 
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "rgba(225, 29, 29, 0.4)"
          }}>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 }}>
              {item.offer_type === "plan" ? "EXCLUSIVE PLAN" : "LIMITED DEAL"}
            </Text>
          </View>

          {/* LARGE PERCENTAGE BADGE */}
          <View style={{ 
            position: "absolute", 
            bottom: 20, 
            left: 20, 
            backgroundColor: "#e11d1d", 
            paddingHorizontal: 18, 
            paddingVertical: 8, 
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 10,
          }}>
            <Text style={{ color: "white", fontSize: 24, fontWeight: "900", letterSpacing: -1 }}>
              {parseFloat(discount).toFixed(2)}% OFF
            </Text>
          </View>
        </View>

        {/* CONTENT SECTION */}
        <View style={{ padding: 24, backgroundColor: "#111" }}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 4 }}>
            {item.offer_name}
          </Text>

          {/* PLAN NAME / DETAILS */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#e11d1d" />
            <Text style={{ color: "#e11d1d", fontSize: 11, fontWeight: "900", marginLeft: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>
               {item.plan_name || "MEMBER SPECIAL"}
            </Text>
          </View>

          <Text style={{ color: "#9ca3af", fontSize: 14, lineHeight: 20, marginBottom: 24 }} numberOfLines={3}>
            {item.offer_description}
          </Text>

          {/* VALIDITY & CONTACT CONTAINER */}
          <View style={{ backgroundColor: "#0a0a0a", padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: "#1a1a1a" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Ionicons name="calendar-outline" size={14} color="#e11d1d" />
              <Text style={{ color: "#6b7280", fontSize: 13, marginLeft: 10 }}>
                Expires: <Text style={{ color: "#fff", fontWeight: "600" }}>{item.expiry_date || "Jun 01, 2026"}</Text>
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="call-outline" size={14} color="#e11d1d" />
              <Text style={{ color: "#6b7280", fontSize: 13, marginLeft: 10 }}>
                Contact: <Text style={{ color: "#fff", fontWeight: "600" }}>{item.contact || "8056870767"}</Text>
              </Text>
            </View>
          </View>

          {/* BUTTON */}
          <Pressable
            onPress={() => {
              if (item.offer_type === "plan") router.push("/Pages/Pricing");
              else router.push("/shop");
            }}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#991b1b" : "#e11d1d",
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#e11d1d",
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 8,
              transform: [{ scale: pressed ? 0.98 : 1 }]
            })}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "900", letterSpacing: 2 }}>
              {item.offer_type === "plan" ? "ACTIVATE NOW" : "CLAIM DEAL"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black", paddingTop: Math.max(insets.top, 20) }}>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        
        <View style={{ paddingVertical: 24 }}>
          <Text style={{ color: "white", fontSize: 32, fontWeight: "900", letterSpacing: -0.5 }}>Promotions</Text>
          <Text style={{ color: "#6b7280", fontSize: 12, textTransform: "uppercase", letterSpacing: 4, marginTop: 4 }}>Exclusive Deals For You</Text>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 24, backgroundColor: "#111", padding: 6, borderRadius: 18, borderWidth: 1, borderColor: "#222" }}>
          {[
            { id: "offers", label: "Special Offers", icon: "flash-outline" },
            { id: "products", label: "Shop Offers", icon: "cart-outline" }
          ].map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                flexDirection: "row",
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: activeTab === tab.id ? "#e11d1d" : "transparent",
              }}
            >
              <Ionicons 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.id ? "white" : "#666"} 
                style={{ marginRight: 8 }}
              />
              <Text 
                style={{
                  fontSize: 10,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: activeTab === tab.id ? "white" : "#6b7280",
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#e11d1d" />
          </View>
        ) : (
          <FlatList
            data={activeTab === "offers" ? offers : offerProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={activeTab === "offers" ? renderOfferItem : ({ item }) => <ProductCard item={item} grid={false} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e11d1d" />
            }
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 120 }}>
                <Ionicons name="ticket-outline" size={80} color="#111" />
                <Text style={{ color: "#333", marginTop: 24, fontWeight: "900", fontSize: 20 }}>NO ACTIVE DEALS</Text>
                <Text style={{ color: "#222", textAlign: "center", marginTop: 8, paddingHorizontal: 40 }}>We're brewing some hot new offers. Check back in a few!</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
