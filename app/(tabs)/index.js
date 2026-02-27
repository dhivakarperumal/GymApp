import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { getAllProducts } from "../../services/api";

/* ✅ IMAGE HELPER (supports admin + mobile API) */
const getImage = (p) => {
  if (p?.image_url) return p.image_url;

  if (Array.isArray(p?.images) && p.images.length > 0) {
    return p.images[0];
  }

  return "https://via.placeholder.com/150x150?text=No+Image";
};

/* ✅ PRICE HELPER (supports admin + mobile API) */
const getPrice = (p) => {
  return p?.price || p?.offer_price || p?.mrp || 0;
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();

      if (Array.isArray(data)) {
        setProducts(data.slice(0, 6)); // show featured
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.log("HOME API ERROR:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity className="mr-4 w-40">
      <View className="bg-[#1c1c1c] p-3 rounded-xl">
        <Image
          source={{ uri: getImage(item) }}
          style={{ width: "100%", height: 100, borderRadius: 10 }}
        />

        <Text className="text-white mt-2 font-semibold" numberOfLines={1}>
          {item?.name || "No Name"}
        </Text>

        <Text className="text-[#ff3c00] font-bold">
          ₹{getPrice(item)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      className="flex-1 bg-[#0f0f0f] p-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 👋 Welcome */}
      <Text className="text-white text-2xl mb-5 font-bold">
        Welcome 💪
      </Text>

      {/* 🏋️ Today Workout */}
      <View className="bg-[#1c1c1c] p-4 rounded-xl mb-4">
        <Text className="text-[#ff3c00] text-lg mb-1 font-semibold">
          Today Workout
        </Text>
        <Text className="text-gray-300">Chest & Triceps</Text>
      </View>

      {/* 🛒 Featured Products */}
      <View className="mb-4">
        <Text className="text-[#ff3c00] text-lg mb-3 font-semibold">
          Featured Products
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#ff3c00" />
        ) : products.length === 0 ? (
          <Text className="text-gray-400">No products available</Text>
        ) : (
          <FlatList
            data={products}
            horizontal
            keyExtractor={(item, index) =>
              item?.id ? item.id.toString() : index.toString()
            }
            renderItem={renderProduct}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>
  );
}