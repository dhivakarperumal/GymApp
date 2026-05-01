import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { getAllPlans, getAllProducts, getOffers } from "../../services/api";

const OFFERS_IMAGE_BASE = "https://mygym.qtechx.com"; // Assuming images are hosted here like staff photos

export default function OffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all | plan | product

  const fetchData = async () => {
    try {
      const [offersRes, plansRes, productsRes] = await Promise.all([
        getOffers(),
        getAllPlans(),
        getAllProducts(),
      ]);
      
      // Handle different response shapes if necessary
      const offersData = Array.isArray(offersRes) ? offersRes : offersRes.data || [];
      const plansData = Array.isArray(plansRes) ? plansRes : plansRes.data || [];
      const productsData = Array.isArray(productsRes) ? productsRes : productsRes.data || [];

      setOffers(offersData);
      setPlans(plansData);
      setProducts(productsData);
    } catch (err) {
      console.error("Failed to load offers:", err);
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

  const getTarget = (o) => {
    const list = o.offer_type === "plan" ? plans : products;
    return list.find((t) => t.id == o.target_id);
  };

  const filteredOffers = offers.filter((o) => {
    if (!o.active) return false;
    if (activeTab === "all") return true;
    return o.offer_type === activeTab;
  });

  const renderOfferItem = ({ item, index }) => {
    const target = getTarget(item);
    const daysLeft = item.end_date ? dayjs(item.end_date).diff(dayjs(), "day") : null;
    const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
    const isExpired = item.end_date && dayjs(item.end_date).isBefore(dayjs(), "day");

    return (
      <View 
        className="bg-[#141414] border border-[#262626] rounded-3xl mb-5 overflow-hidden shadow-lg shadow-black/40"
      >
        {/* IMAGE SECTION */}
        <View className="relative h-44">
          {item.offer_image ? (
            <Image
              source={{ uri: item.offer_image.startsWith('http') ? item.offer_image : `${OFFERS_IMAGE_BASE}${item.offer_image}` }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-red-900/10 items-center justify-center">
              <Ionicons name="pricetag" size={60} color="#333" />
            </View>
          )}
          
          {/* OVERLAY GRADIENT EFFECT */}
          <View className="absolute inset-0 bg-black/30" />

          {/* DISCOUNT BADGE */}
          <View className="absolute bottom-3 left-3 bg-red-600 px-3 py-1.5 rounded-xl shadow-lg shadow-red-600/50">
            <Text className="text-white font-black text-lg">
              {item.discount_percentage}% OFF
            </Text>
          </View>

          {/* EXPIRY TAG */}
          {isExpiringSoon && !isExpired && (
            <View className="absolute top-3 right-3 bg-orange-500 px-3 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                ⏰ {daysLeft}d left
              </Text>
            </View>
          )}
          
          {/* TYPE TAG */}
          <View className="absolute top-3 left-3 bg-black/60 border border-white/10 px-3 py-1 rounded-full">
            <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
              {item.offer_type}
            </Text>
          </View>
        </View>

        {/* CONTENT SECTION */}
        <View className="p-5">
          <Text className="text-white text-xl font-bold mb-1">{item.offer_name}</Text>
          
          {target && (
            <View className="flex-row items-center mb-3">
              <Ionicons 
                name={item.offer_type === "plan" ? "list" : "cube"} 
                size={14} 
                color="#666" 
              />
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest ml-2">
                {target.name}
              </Text>
            </View>
          )}

          {item.description && (
            <Text className="text-gray-400 text-sm mb-4 leading-5" numberOfLines={3}>
              {item.description}
            </Text>
          )}

          {/* DATE & CONTACT */}
          <View className="border-t border-[#262626] pt-4 mt-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Validity</Text>
                <Text className="text-white text-xs font-medium">
                  {dayjs(item.start_date).format("MMM DD")} - {dayjs(item.end_date).format("MMM DD, YYYY")}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (item.offer_type === "plan") router.push("/pricing");
                  else router.push("/(tabs)/shop");
                }}
                className="bg-red-600 px-5 py-2 rounded-full"
              >
                <Text className="text-white text-xs font-bold uppercase tracking-widest">
                  View
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black pt-12">
      <View className="flex-1 px-4">
        
        {/* HEADER */}
        <View className="py-6">
          <Text className="text-white text-3xl font-black tracking-tight">Special Offers</Text>
          <Text className="text-gray-500 text-xs uppercase tracking-[3px] mt-1">Exclusive Promotions</Text>
        </View>

        {/* TABS */}
        <View className="flex-row mb-6 bg-[#141414] p-1.5 rounded-2xl border border-[#262626]">
          {["all", "plan", "product"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl items-center ${
                activeTab === tab ? "bg-red-600 shadow-md shadow-red-600/30" : ""
              }`}
            >
              <Text 
                className={`text-[10px] font-black uppercase tracking-widest ${
                  activeTab === tab ? "text-white" : "text-gray-500"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LIST */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#ef4444" />
          </View>
        ) : (
          <FlatList
            data={filteredOffers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOfferItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="pricetag-outline" size={64} color="#222" />
                <Text className="text-gray-500 mt-4 font-bold text-lg">No active offers found</Text>
                <Text className="text-gray-600 text-center mt-2 px-10">Check back later for new seasonal promotions and handpicked deals.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
