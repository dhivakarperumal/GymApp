import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { addToCartApi } from "../../services/api";
import Header from "../Header";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../BackButton";
import Toast from "react-native-toast-message";

const BASE_URL = "https://dapfitt.com/api";

const { width } = Dimensions.get("window");

const getQuantityDiscountPercent = (qty) => {
  if (qty >= 20 && qty <= 25) return 10;
  if (qty >= 5 && qty <= 19) return 5;
  return 0;
};


export default function ProductDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      // Fetch only this specific product — much faster than fetching all
      const res = await fetch(`${BASE_URL}/products/${id}`);
      const data = await res.json();
      setProduct(data || null);
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


  const handleBuyNow = () => {
    if (buying) return;

    if (!user || !user.id) {
      Toast.show({
        type: "error",
        text1: "Login Required",
        text2: "Please login first",
      });
      return;
    }

    if (!variantKey) {
      Toast.show({
        type: "error",
        text1: "Variant Missing",
        text2: "Please select size / weight",
      });
      return;
    }

    const currentPrice = discountedPrice;

    const buyNowItem = {
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: quantity,
      size: selectedSize || null,
      gender: selectedGender || null,
      weight: selectedWeight || null,
      variant: variantKey,
      images: product.images,
    };

    setBuying(true);
    router.push({
      pathname: "/checkout",
      params: {
        buyNow: JSON.stringify(buyNowItem),
      },
    });
    // reset after navigation
    setTimeout(() => setBuying(false), 1500);
  };

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

  const basePrice = pricing ? Number(pricing.offerPrice) : 0;

  const discountPercent = getQuantityDiscountPercent(quantity);

  const discountedPrice = Number(
    (basePrice * (1 - discountPercent / 100)).toFixed(2)
  );

  const oldPrice = pricing ? Number(pricing.mrp) : 0;

  const handleAddToCart = async () => {
    if (adding) return;

    if (!user || !user.id) {
      Toast.show({
        type: "error",
        text1: "Login Required",
        text2: "Please login to add items to cart",
      });
      return;
    }

    if (quantity > remainingStock) {
      Toast.show({
        type: "error",
        text1: "Stock Limit",
        text2: `Only ${remainingStock} items available`,
      });
      return;
    }

    setAdding(true);
    try {
      // Add directly — backend handles duplicates/qty merging
      await addToCartApi({
        userId: user.id,
        productId: product.id,
        name: product.name,
        price: discountedPrice,
        quantity: quantity,
        size: selectedSize || null,
        gender: selectedGender || null,
        weight: selectedWeight || null,
        variant: variantKey,
        images: product.images,
      });

      router.push("/cart");
    } catch (err) {
      console.log("Add to cart error:", err);
      Toast.show({ type: "error", text1: "Failed to add to cart" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-darkBg">
      <Header />
      <ScrollView className="flex-1 bg-darkBg">
        <BackButton style={{ marginLeft: 20, marginTop: 20 }} />
        <View className="px-5 mt-9">
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
                className={`mr-3 rounded-xl overflow-hidden border-2 ${activeIndex === index
                  ? "border-primary"
                  : "border-transparent"
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
              ₹ {discountedPrice.toLocaleString()}
            </Text>

            {oldPrice > discountedPrice && (
              <Text className="text-gray-400 line-through ml-4 text-lg">
                ₹ {oldPrice.toLocaleString()}
              </Text>
            )}
          </View>

          <Text className="text-green-400 mb-4">
            {discountPercent > 0
              ? `${discountPercent}% Bulk Discount Applied`
              : "Buy 5-19 units get 5% off, 20-25 units get 10% off"}
          </Text>

          {/* DESCRIPTION */}
          <Text className="text-gray-300 leading-6 mb-6">
            {product.description}
          </Text>

          {product.category === "Food" && product.weight?.length > 0 && (
            <View className="mb-8">
              <Text className="text-white font-semibold mb-3">
                Select Weight
              </Text>

              <View className="flex-row flex-wrap">
                {product.weight.map((w) => (
                  <TouchableOpacity
                    key={w}
                    onPress={() => setSelectedWeight(w)}
                    className={`px-5 py-3 rounded-xl mr-3 mb-3 border ${selectedWeight === w
                      ? "bg-primary border-primary"
                      : "border-gray-700"
                      }`}
                  >
                    <Text
                      className={`${selectedWeight === w ? "text-white" : "text-gray-300"
                        }`}
                    >
                      {w}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* SIZE SELECTION */}
          {product.size?.length > 0 && (
            <View className="mb-8">
              <Text className="text-white font-semibold mb-3">Select Size</Text>

              <View className="flex-row flex-wrap">
                {product.size.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    className={`px-5 py-3 rounded-xl mr-3 mb-3 border ${selectedSize === size
                      ? "bg-primary border-primary"
                      : "border-gray-700"
                      }`}
                  >
                    <Text
                      className={`${selectedSize === size ? "text-white" : "text-gray-300"
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
              <Text className="text-white font-semibold mb-3">
                Select Gender
              </Text>

              <View className="flex-row flex-wrap">
                {product.gender.map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    onPress={() => setSelectedGender(gender)}
                    className={`px-5 py-3 rounded-xl mr-3 mb-3 border ${selectedGender === gender
                      ? "bg-primary border-primary"
                      : "border-gray-700"
                      }`}
                  >
                    <Text
                      className={
                        selectedGender === gender
                          ? "text-white"
                          : "text-gray-300"
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
              disabled={remainingStock === 0 || quantity > remainingStock || adding}
              onPress={handleAddToCart}
              activeOpacity={0.75}
              className={`w-[48%] py-4 rounded-2xl items-center ${remainingStock === 0 || adding
                ? "bg-gray-600"
                : "bg-[#1f1f1f] border border-primary"
                }`}
            >
              {adding ? (
                <ActivityIndicator color="#e11d1d" />
              ) : (
                <Text className="text-primary font-bold text-lg">ADD TO CART</Text>
              )}
            </TouchableOpacity>

            {/* BUY NOW */}
            <TouchableOpacity
              disabled={remainingStock === 0 || quantity > remainingStock || buying}
              onPress={handleBuyNow}
              activeOpacity={0.75}
              className={`w-[48%] py-4 rounded-2xl items-center ${remainingStock === 0 || buying
                ? "bg-gray-600"
                : "bg-primary"
                }`}
            >
              {buying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">BUY NOW</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
