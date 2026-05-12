import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { getAllProducts } from "../../services/api";
import ProductCard from "../ProductCard";

export default function Shop() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  const [activeTab, setActiveTab] = useState("All Products");

  const isFilterActive =
    selectedCategory !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    minRating !== "";

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
  };

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

      const tabMatch = activeTab === "All Products" || item.category === "Food";

      let price = Number(item.offer_price || item.mrp || 0);

      const priceMatch =
        (!minPrice || price >= Number(minPrice)) &&
        (!maxPrice || price <= Number(maxPrice));

      const ratingValue = Number(item.rating ?? item.ratings ?? 0);

      const ratingMatch = minRating ? ratingValue >= Number(minRating) : true;

      return nameMatch && categoryMatch && tabMatch && priceMatch && ratingMatch;
    });
  }, [search, products, selectedCategory, minPrice, maxPrice, minRating, activeTab]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e11d1d"
          />
        }
      >
        {/* TABS */}
        <View className="flex-row bg-darkcard rounded-xl p-1 mb-5">
          {["All Products", "Meal Plan"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg ${
                activeTab === tab ? "bg-primary" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === tab ? "text-white" : "text-gray-400"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
            placeholder={
              activeTab === "Meal Plan"
                ? "Search meal plans..."
                : "Search supplements & gear..."
            }
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
            filteredProducts.map((item) => (
              <ProductCard key={item.id} item={item} grid />
            ))}
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
