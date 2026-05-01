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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllProducts, getOffers, getPlans } from "../../services/api";
import ProductCard from "../ProductCard";

const OFFERS_IMAGE_BASE = "https://dap.qtechx.com";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0].split(" ")[0];
};

export default function OffersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState("offers"); 
  const [offers, setOffers] = useState([]);
  const [plansMap, setPlansMap] = useState({});
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [offersRes, productsRes, plansRes] = await Promise.all([
        getOffers(),
        getAllProducts(),
        getPlans(),
      ]);

      // Create plans map for ID to Name resolution
      const pMap = {};
      if (Array.isArray(plansRes)) {
        plansRes.forEach(p => {
          pMap[p.id] = p.plan_name || p.name;
        });
      } else if (plansRes?.data && Array.isArray(plansRes.data)) {
        plansRes.data.forEach(p => {
          pMap[p.id] = p.plan_name || p.name;
        });
      }
      setPlansMap(pMap);

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
    const isPlan = item.offer_type === "plan";
    const discount = item.discount_percentage || item.offer_percentage || 0;
    const startDate = formatDate(item.start_date);
    const expiryDate = formatDate(item.expiry_date);
    
    // Resolve plan name from target_id if needed
    const resolvedPlanName = item.plan_name || (item.target_id ? plansMap[item.target_id] : null);
    
    return (
      <View
        style={{
          marginBottom: 28,
          borderRadius: 28,
          overflow: "hidden",
          backgroundColor: "#000",
          borderWidth: 1.5,
          borderColor: "#222",
          shadowColor: "#e11d1d",
          shadowOpacity: 0.15,
          shadowRadius: 20,
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
          <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)" }} />
          
          {/* DISCOUNT BADGE */}
          <View style={{ 
            position: "absolute", 
            bottom: 20, 
            left: 20, 
            backgroundColor: "#e11d1d", 
            paddingHorizontal: 16, 
            paddingVertical: 10, 
            borderRadius: 16,
            shadowColor: "#e11d1d",
            shadowOpacity: 0.6,
            shadowRadius: 10,
          }}>
            <Text style={{ color: "white", fontSize: 22, fontWeight: "900" }}>
              {Math.round(discount)}% OFF
            </Text>
          </View>
        </View>

        {/* CONTENT SECTION */}
        <View style={{ padding: 24, backgroundColor: "#000" }}>
          <Text style={{ color: "#e11d1d", fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
            {item.offer_name}
          </Text>

          {/* PLAN NAME DISPLAY */}
          {resolvedPlanName && (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 18, height: 22, alignItems: "center", justifyContent: "center" }}>
                 <FontAwesome5 name="clipboard-list" size={18} color="#666" />
              </View>
              <Text style={{ 
                color: "#888", 
                fontSize: 16, 
                fontWeight: "900", 
                marginLeft: 12, 
                textTransform: "uppercase", 
                letterSpacing: 0.5 
              }}>
                 {resolvedPlanName}
              </Text>
            </View>
          )}

          <Text style={{ color: "#9ca3af", fontSize: 16, lineHeight: 22, marginBottom: 20 }}>
            {item.offer_description}
          </Text>

          {/* DYNAMIC DETAILS: PRICE FOR PRODUCTS, INFO BOX FOR PLANS */}
          {!isPlan && (item.offer_price || item.mrp) ? (
            <View style={{ marginBottom: 24 }}>
               {item.mrp > 0 && (
                 <Text style={{ color: "#4b5563", fontSize: 18, textDecorationLine: "line-through", marginBottom: 4 }}>
                   ₹{item.mrp}
                 </Text>
               )}
               <Text style={{ color: "#e11d1d", fontSize: 32, fontWeight: "bold" }}>
                 ₹{item.offer_price || item.mrp}
               </Text>
            </View>
          ) : (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#e11d1d", marginRight: 12 }} />
                <Text style={{ color: "#9ca3af", fontSize: 15 }}>
                  Valid: <Text style={{ color: "#fff" }}>{startDate || "May 01"} – {expiryDate || "Jun 01, 2026"}</Text>
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#e11d1d", marginRight: 12 }} />
                <Text style={{ color: "#9ca3af", fontSize: 15 }}>
                  Contact: <Text style={{ color: "#e11d1d" }}>{item.contact || "8056870767"}</Text>
                </Text>
              </View>
            </View>
          )}

          {/* BUTTON */}
          <Pressable
            onPress={() => {
              if (item.offer_type === "plan") router.push("/Pages/Pricing");
              else router.push("/shop");
            }}
            style={({ pressed }) => ({
              backgroundColor: "#e11d1d",
              paddingVertical: 16,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#e11d1d",
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 8,
              transform: [{ scale: pressed ? 0.98 : 1 }]
            })}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "900", letterSpacing: 1 }}>
              {isPlan ? "CHOOSE PLAN" : "BUY NOW"}
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

        <View style={{ flexDirection: "row", marginBottom: 24, backgroundColor: "#111", padding: 6, borderRadius: 20, borderWidth: 1, borderColor: "#222" }}>
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
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: activeTab === tab.id ? "#e11d1d" : "transparent",
              }}
            >
              <Ionicons 
                name={tab.icon} 
                size={18} 
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
            key={activeTab}
            data={activeTab === "offers" ? offers : offerProducts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={activeTab === "offers" ? 1 : 2}
            columnWrapperStyle={activeTab === "products" ? { justifyContent: "space-between" } : null}
            renderItem={activeTab === "offers" 
              ? renderOfferItem 
              : ({ item }) => <ProductCard item={item} grid={true} />
            }
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
