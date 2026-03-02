import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { getAllProducts } from "../../services/api"; // ✅ adjust path if needed

export default function Shop() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();

        // ✅ If API returns { products: [...] }
        const productList = data.products || data;

        setProducts(productList);
      } catch (error) {
        console.log("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Search Filter
  const filteredProducts = products.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-[#0f0f0f] px-4 pt-12">
      
      {/* SEARCH */}
      <View className="flex-row items-center bg-[#1c1c1c] rounded-xl px-4 py-3 mb-5">
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          placeholder="Search supplements & gear..."
          placeholderTextColor="#777"
          value={search}
          onChangeText={setSearch}
          className="ml-2 text-white flex-1"
        />
      </View>

      {/* LOADING */}
      {loading && (
        <ActivityIndicator size="large" color="red" style={{ marginTop: 20 }} />
      )}

      {/* PRODUCT LIST */}
      {!loading &&
        filteredProducts.map((item) => {
          const weightKey = item.weight?.[0];
          const stockData = weightKey ? item.stock?.[weightKey] : null;

          const price = stockData?.offerPrice || stockData?.mrp || 0;
          const oldPrice = stockData?.mrp || 0;

          // ✅ Fix image (API has images array)
          const imageUrl =
            item.images?.[0] ||
            "https://via.placeholder.com/150";

          return (
            <View
              key={item.id}
              className="bg-[#1c1c1c] rounded-2xl p-4 mb-4 flex-row items-center"
            >
              {/* IMAGE */}
              <View className="relative">
                <Image
                  source={{ uri: imageUrl }}
                  className="w-20 h-20 rounded-xl"
                  resizeMode="cover"
                />

                {/* CATEGORY BADGE */}
                <View className="absolute top-1 left-1 bg-black/80 px-2 py-1 rounded-md">
                  <Text className="text-red-500 text-[8px] font-bold">
                    {item.category}
                  </Text>
                </View>
              </View>

              {/* DETAILS */}
              <View className="flex-1 ml-4">
                <Text className="text-white font-semibold text-base">
                  {item.name}
                </Text>

                <View className="flex-row items-center mt-2">
                  <Text className="text-red-500 text-lg font-bold">
                    ₹ {price}
                  </Text>

                  {oldPrice > price && (
                    <Text className="text-gray-500 line-through ml-3">
                      ₹ {oldPrice}
                    </Text>
                  )}
                </View>
              </View>

              {/* CART BUTTON */}
              <TouchableOpacity
                onPress={() => router.push("/cart")}
                className="bg-red-600 p-3 rounded-full"
              >
                <Ionicons name="cart-outline" size={18} color="white" />
              </TouchableOpacity>
            </View>
          );
        })}
    </ScrollView>
  );
}