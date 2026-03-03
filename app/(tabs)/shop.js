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

import { getAllProducts } from "../../services/api";

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
    item.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScrollView className="flex-1 bg-darkBg px-4 pt-12">

      {/* SEARCH */}
      <View className="flex-row items-center bg-darkcard rounded-xl px-4 py-3 mb-5">
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
        <ActivityIndicator
          size="large"
          color="#e11d1d"
          style={{ marginTop: 20 }}
        />
      )}

      {/* PRODUCT GRID */}
      <View className="flex-row flex-wrap justify-between">
        {!loading &&
          filteredProducts.map((item) => {
            const weightKey = item.weight?.[0];
            const stockData = weightKey ? item.stock?.[weightKey] : null;

            const price = stockData?.offerPrice || stockData?.mrp || 0;
            const oldPrice = stockData?.mrp || 0;

            const imageUrl =
              item.images?.[0] || "https://via.placeholder.com/150";

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.92}
                onPress={() => router.push(`/shop/${item.id}`)}
                className="w-[48%] mb-6"
              >
                <View
                  className="rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: "#111111",
                    borderWidth: 1,
                    borderColor: "#e11d1d",
                    shadowColor: "#e11d1d",
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    elevation: 10,
                  }}
                >
                  {/* IMAGE SECTION */}
                  <View className="relative">
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-40"
                      resizeMode="cover"
                    />

                    {/* DARK OVERLAY */}
                    <View className="absolute inset-0 bg-black/20" />

                    {/* CATEGORY BADGE */}
                    <View className="absolute top-3 left-3 bg-[#0f0f0f] px-3 py-1 rounded-full border border-primary">
                      <Text className="text-primary text-[10px] font-semibold">
                        {item.category}
                      </Text>
                    </View>
                  </View>

                  {/* CONTENT PANEL */}
                  <View className="p-4 bg-[#141414] rounded-b-3xl">
                    {/* PRODUCT NAME */}
                    <Text
                      numberOfLines={2}
                      className="text-white text-md font-bold leading-5 mb-3"
                    >
                      {item.name}
                    </Text>

                    {/* PRICE SECTION */}
                    <View className="flex-row items-end justify-between">
                      <View>
                        <Text className="text-primary text-lg font-bold">
                          ₹ {price}
                        </Text>

                        {oldPrice > price && (
                          <Text className="text-gray-400 text-sm mt-1 line-through">
                            ₹ {oldPrice}
                          </Text>
                        )}
                      </View>

                      {/* CART BUTTON */}
                      <TouchableOpacity
                        onPress={() => router.push("/cart")}
                        className="bg-primary p-3 rounded-2xl"
                        style={{
                          shadowColor: "#ff3c00",
                          shadowOpacity: 0.4,
                          shadowRadius: 10,
                          elevation: 6,
                        }}
                      >
                        <Ionicons name="eye" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </View>
    </ScrollView>
  );
}
