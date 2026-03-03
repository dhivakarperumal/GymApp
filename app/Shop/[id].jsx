import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getAllProducts } from "../../services/api";
import { useRef } from "react";

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await getAllProducts();
      const list = data.products || data;
      const found = list.find((item) => String(item.id) === String(id));
      setProduct(found || null);
    } catch (err) {
      console.log("Product detail error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!product) return;

    // FOOD
    if (product.category === "Food" && product.weight?.length) {
      setSelectedWeight(product.weight[0]);
    }

    // DRESS / ACCESSORIES
    if (product.size?.length) {
      setSelectedSize(product.size[0]);
    }

    if (product.gender?.length) {
      setSelectedGender(product.gender[0]);
    }
  }, [product]);

  // ---------- CURRENT VARIANT ----------
  const variantKey =
    product?.category === "Food"
      ? selectedWeight
      : selectedSize && selectedGender
        ? `${selectedSize}-${selectedGender}`
        : null;

  const currentVariant = variantKey ? product?.stock?.[variantKey] : null;

  // ---------- PRICING ----------
  const pricing = (() => {
    if (!currentVariant) return null;

    if (product.category === "Food") {
      return {
        mrp: currentVariant.mrp,
        offerPrice: currentVariant.offerPrice,
        offer: currentVariant.offer || 0,
      };
    }

    if (product.mrp && product.offer_price) {
      return {
        mrp: product.mrp,
        offerPrice: product.offer_price,
        offer: product.offer || 0,
      };
    }

    return null;
  })();

  if (loading) {
    return (
      <View className="flex-1 bg-darkBg justify-center items-center">
        <ActivityIndicator size="large" color="#e11d1d" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-darkBg justify-center items-center">
        <Text className="text-white">Product not found</Text>
      </View>
    );
  }

  const availableStock = currentVariant?.qty ?? 0;
  const remainingStock = availableStock;

  const price = pricing ? Number(pricing.offerPrice) : 0;
  const oldPrice = pricing ? Number(pricing.mrp) : 0;

  return (
    <ScrollView className="flex-1 bg-darkBg">
      <View className="px-5 mt-20">
        <View
          className="rounded-3xl overflow-hidden border border-[#1f1f1f]"
          style={{
            backgroundColor: "#111111",
            shadowColor: "#e11d1d",
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (width - 40),
              );
              setActiveIndex(index);
            }}
          >
            {product.images?.map((img, index) => (
              <View key={index} style={{ width: width - 40 }}>
                <Image
                  source={{ uri: img }}
                  style={{ width: width - 40, height: 360 }}
                  resizeMode="cover"
                />

                {product.offer > 0 && (
                  <View className="absolute top-5 right-5 bg-primary px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">
                      {product.offer}% OFF
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 🔥 THUMBNAILS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
        >
          {product.images?.map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setActiveIndex(index);
                scrollRef.current?.scrollTo({
                  x: (width - 40) * index,
                  animated: true,
                });
              }}
              className={`mr-3 rounded-xl overflow-hidden border-2 ${
                activeIndex === index ? "border-primary" : "border-transparent"
              }`}
            >
              <Image
                source={{ uri: img }}
                style={{ width: 65, height: 65 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="px-5 py-6">
        {/* CATEGORY */}
        <Text className="text-primary text-xl font-semibold mb-2">
          {product.category} • {product.subcategory}
        </Text>

        {/* NAME */}
        <Text className="text-white text-2xl font-bold mb-3">
          {product.name}
        </Text>

        {/* ⭐ RATING */}
        <View
          className="flex-row items-center justify-between mb-5 p-3 rounded-2xl border border-[#1f1f1f]"
          style={{
            backgroundColor: "#111111",
          }}
        >
          {/* LEFT SIDE - STARS */}
          <View className="flex-row items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= product.ratings ? "star" : "star-outline"}
                size={18}
                color="#e11d1d"
                style={{ marginRight: 3 }}
              />
            ))}

            {/* Rating Number */}
            <View className="ml-3 bg-primary px-2 py-1 rounded-lg">
              <Text className="text-white text-xs font-bold">
                {product.ratings}.0
              </Text>
            </View>
          </View>

          {/* RIGHT SIDE - REVIEW TEXT */}
          <Text className="text-gray-400 text-sm">
            {product.ratings} Ratings
          </Text>
        </View>

        {/* 💰 PRICE */}
        <View className="flex-row items-center mb-6">
          <Text className="text-primary text-3xl font-bold">
            ₹ {price.toLocaleString()}
          </Text>

          {oldPrice > price && (
            <Text className="text-gray-400 line-through ml-4 text-lg">
              ₹ {oldPrice.toLocaleString()}
            </Text>
          )}
        </View>

        {/* DESCRIPTION */}
        <Text className="text-gray-300 leading-6 mb-6">
          {product.description}
        </Text>

        {/* SIZE SELECTION */}
        {product.size?.length > 0 && (
          <View className="mb-8">
            <Text className="text-white font-semibold mb-3">Select Size</Text>

            <View className="flex-row flex-wrap">
              {product.size.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  className={`px-5 py-3 rounded-xl mr-3 mb-3 border ${
                    selectedSize === size
                      ? "bg-primary border-primary"
                      : "border-gray-700"
                  }`}
                >
                  <Text
                    className={`${
                      selectedSize === size ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {product.gender?.length > 0 && (
          <View className="mb-6">
            <Text className="text-white font-semibold mb-3">Select Gender</Text>

            <View className="flex-row flex-wrap">
              {product.gender.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  onPress={() => setSelectedGender(gender)}
                  className={`px-5 py-3 rounded-xl mr-3 mb-3 border ${
                    selectedGender === gender
                      ? "bg-primary border-primary"
                      : "border-gray-700"
                  }`}
                >
                  <Text
                    className={
                      selectedGender === gender ? "text-white" : "text-gray-300"
                    }
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white font-semibold">Quantity</Text>

          <View className="flex-row items-center border border-primary rounded-full">
            <TouchableOpacity
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-2"
            >
              <Text className="text-white text-lg">−</Text>
            </TouchableOpacity>

            <Text className="px-6 text-white">{quantity}</Text>

            <TouchableOpacity
              onPress={() =>
                setQuantity((q) => Math.min(q + 1, remainingStock))
              }
              className="px-4 py-2"
            >
              <Text className="text-white text-lg">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-gray-400 mb-4">
          Stock Available: {availableStock}
        </Text>

        {/* 🔥 BUTTONS ROW */}
        <View className="flex-row justify-between mt-4">
          {/* ADD TO CART */}
          <TouchableOpacity
            disabled={remainingStock === 0 || quantity > remainingStock}
            className={`w-[48%] py-4 rounded-2xl items-center ${
              remainingStock === 0
                ? "bg-gray-600"
                : "bg-[#1f1f1f] border border-primary"
            }`}
          >
            <Text className="text-primary font-bold text-lg">ADD TO CART</Text>
          </TouchableOpacity>

          {/* BUY NOW */}
          <TouchableOpacity
            disabled={remainingStock === 0 || quantity > remainingStock}
            className={`w-[48%] py-4 rounded-2xl items-center ${
              remainingStock === 0
                ? "bg-gray-600"
                : "bg-[#1f1f1f] border border-primary"
            }`}
          >
            <Text className="text-white font-bold text-lg">BUY NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
