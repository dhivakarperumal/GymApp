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
import { Ionicons } from "@expo/vector-icons";
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

  const renderOfferItem = ({ item }) => (
    <Pressable
      onPress={() => {
        if (item.offer_type === "plan") router.push("/Pages/Pricing");
        else router.push("/shop");
      }}
      style={{
        marginBottom: 24,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "#111",
        borderWidth: 1,
        borderColor: "#222",
      }}
    >
      <View style={{ height: 192, position: "relative" }}>
        <Image
          source={{
            uri: (item.offer_image?.startsWith("http") || item.offer_image?.startsWith("data:"))
              ? item.offer_image
              : `${OFFERS_IMAGE_BASE}${item.offer_image?.startsWith("/") ? "" : "/"}${item.offer_image}`,
          }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)" }} />
        <View style={{ position: "absolute", top: 16, right: 16, backgroundColor: "#e11d1d", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
          <Text style={{ color: "white", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 }}>
            {item.offer_percentage}% OFF
          </Text>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>{item.offer_name}</Text>
            <Text style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }} numberOfLines={2}>
              {item.offer_description}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={{ color: "#6b7280", fontSize: 10, marginLeft: 4, fontWeight: "bold", textTransform: "uppercase" }}>
              Expires: {item.expiry_date || "Limited Time"}
            </Text>
          </View>
          <View style={{ backgroundColor: "rgba(225, 29, 29, 0.1)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "rgba(225, 29, 29, 0.2)" }}>
            <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "900", textTransform: "uppercase" }}>View Deal</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "black", paddingTop: Math.max(insets.top, 20) }}>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        
        <View style={{ paddingVertical: 24 }}>
          <Text style={{ color: "white", fontSize: 30, fontWeight: "900", letterSpacing: -0.5 }}>Promotions</Text>
          <Text style={{ color: "#6b7280", fontSize: 12, textTransform: "uppercase", letterSpacing: 3, marginTop: 4 }}>Handpicked Deals For You</Text>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 24, backgroundColor: "#141414", padding: 6, borderRadius: 16, borderWidth: 1, borderColor: "#262626" }}>
          {[
            { id: "offers", label: "Special Offers", icon: "gift-outline" },
            { id: "products", label: "Offer Products", icon: "cart-outline" }
          ].map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                flexDirection: "row",
                paddingVertical: 12,
                borderRadius: 12,
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
            <ActivityIndicator size="large" color="#ef4444" />
          </View>
        ) : (
          <FlatList
            data={activeTab === "offers" ? offers : offerProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={activeTab === "offers" ? renderOfferItem : ({ item }) => <ProductCard item={item} grid={false} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
            }
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
                <Ionicons name={activeTab === "offers" ? "gift-outline" : "pricetags-outline"} size={64} color="#222" />
                <Text style={{ color: "#6b7280", marginTop: 16, fontWeight: "bold", fontSize: 18 }}>No active {activeTab} found</Text>
                <Text style={{ color: "#4b5563", textAlign: "center", marginTop: 8, paddingHorizontal: 40 }}>Check back later for new seasonal promotions and handpicked deals.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
