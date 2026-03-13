import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getAllProducts } from "../../services/api";

export default function Shop() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  const isFilterActive =
    selectedCategory !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    minRating !== "";

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
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (!item?.name) return false;

      const nameMatch = item.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const categoryMatch = selectedCategory
        ? item.category === selectedCategory
        : true;

      let price = Number(item.offer_price || item.mrp || 0);

      const priceMatch =
        (!minPrice || price >= Number(minPrice)) &&
        (!maxPrice || price <= Number(maxPrice));

      const ratingValue = Number(item.rating ?? item.ratings ?? 0);

      const ratingMatch = minRating ? ratingValue >= Number(minRating) : true;

      return nameMatch && categoryMatch && priceMatch && ratingMatch;
    });
  }, [search, products, selectedCategory, minPrice, maxPrice, minRating]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-darkBg px-4 pt-12"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH */}
        <View className="flex-row items-center bg-darkcard rounded-xl px-4 py-3 mb-5">
          {/* FILTER BUTTON */}
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            className="mr-3"
            style={{ position: "relative" }}
          >
            <Ionicons
              name={isFilterActive ? "options" : "options-outline"}
              size={20}
              color={isFilterActive ? "#ff3c00" : "#e11d1d"}
            />

            {isFilterActive && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  backgroundColor: "#fff",
                  borderRadius: 10,
                }}
              />
            )}
          </TouchableOpacity>

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
              let price = 0;
              let oldPrice = 0;

              // 🥤 FOOD → price inside stock (use first weight)
              if (item.category === "Food" && item.weight?.length) {
                const firstWeight = item.weight[0];
                const variant = item.stock?.[firstWeight];

                price = Number(variant?.offerPrice || variant?.mrp || 0);
                oldPrice = Number(variant?.mrp || 0);
              } else {
                price = Number(item.offer_price || item.mrp || 0);
                oldPrice = Number(item.mrp || 0);
              }

              const imageUrl =
                item.images?.[0] || "https://via.placeholder.com/150";

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.92}
                  onPress={() => router.push(`/Shop/${item.id}`)}
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
                        ellipsizeMode="tail"
                        className="text-white text-md font-bold leading-5 mb-3"
                      >
                        {item.name}
                      </Text>

                      {/* ⭐ RATING */}
                      <View className="flex-row items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={
                              star <= (item.rating || item.ratings || 0)
                                ? "star"
                                : "star-outline"
                            }
                            size={14}
                            color="#e11d1d"
                            style={{ marginRight: 2 }}
                          />
                        ))}

                        <Text className="text-gray-400 text-xs ml-2">
                          {(item.rating || item.ratings || 0).toFixed
                            ? (item.rating || item.ratings || 0).toFixed(1)
                            : item.rating || item.ratings || 0}
                        </Text>
                      </View>

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
                          onPress={() => router.push(`/Shop/${item.id}`)}
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

        <Modal
          visible={filterVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setFilterVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setFilterVisible(false)}
            className="flex-1 bg-black/80 justify-end"
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              className="bg-[#141414] rounded-t-3xl p-6"
            >
              <Text className="text-white text-xl font-bold mb-5">Filters</Text>

              {/* CATEGORY */}
              <Text className="text-gray-400 mb-2">Category</Text>

              <View className="flex-row flex-wrap mb-4">
                {["All", "Food", "Accessories", "Dress"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      if (cat === "All") {
                        setSelectedCategory("");
                      } else {
                        setSelectedCategory(
                          selectedCategory === cat ? "" : cat,
                        );
                      }
                    }}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                      (cat === "All" && selectedCategory === "") ||
                      selectedCategory === cat
                        ? "bg-primary"
                        : "bg-[#1f1f1f]"
                    }`}
                  >
                    <Text className="text-white text-sm">{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* PRICE */}
              <Text className="text-gray-400 mb-2">Price Range</Text>

              <View className="flex-row mb-4">
                <TextInput
                  placeholder="Min"
                  placeholderTextColor="#777"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  className="flex-1 bg-[#1f1f1f] text-white p-3 rounded-xl mr-2"
                />

                <TextInput
                  placeholder="Max"
                  placeholderTextColor="#777"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  className="flex-1 bg-[#1f1f1f] text-white p-3 rounded-xl"
                />
              </View>

              {/* RATING */}
              <Text className="text-gray-400 mb-2">Minimum Rating</Text>

              <TextInput
                placeholder="Example: 4"
                placeholderTextColor="#777"
                keyboardType="numeric"
                value={minRating}
                onChangeText={setMinRating}
                className="bg-[#1f1f1f] text-white p-3 rounded-xl mb-5"
              />

              {/* BUTTONS */}
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory("");
                    setMinPrice("");
                    setMaxPrice("");
                    setMinRating("");
                  }}
                  className="flex-1 bg-gray-700 p-4 rounded-xl mr-2"
                >
                  <Text className="text-white text-center">Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFilterVisible(false)}
                  className="flex-1 bg-primary p-4 rounded-xl"
                >
                  <Text className="text-white text-center font-bold">
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
