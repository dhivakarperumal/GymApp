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

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const price = product.offer_price || product.mrp;
  const oldPrice = product.mrp;

  return (
    <ScrollView className="flex-1 bg-darkBg">

      {/* IMAGE SLIDER */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {product.images?.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img }}
            style={{ width: width, height: 350 }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View className="px-5 py-6">

        {/* CATEGORY */}
        <Text className="text-primary text-sm font-semibold mb-2">
          {product.category} • {product.subcategory}
        </Text>

        {/* NAME */}
        <Text className="text-white text-2xl font-bold mb-3">
          {product.name}
        </Text>

        {/* RATING */}
        <View className="flex-row items-center mb-4">
          {[1,2,3,4,5].map((star) => (
            <Ionicons
              key={star}
              name={star <= product.ratings ? "star" : "star-outline"}
              size={16}
              color="#e11d1d"
            />
          ))}
          <Text className="text-gray-400 ml-2">
            ({product.ratings})
          </Text>
        </View>

        {/* PRICE */}
        <View className="flex-row items-center mb-6">
          <Text className="text-primary text-2xl font-bold">
            ₹ {price}
          </Text>

          {oldPrice > price && (
            <Text className="text-gray-400 line-through ml-3 text-lg">
              ₹ {oldPrice}
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
            <Text className="text-white font-semibold mb-3">
              Select Size
            </Text>

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
                      selectedSize === size
                        ? "text-white"
                        : "text-gray-300"
                    }`}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ADD TO CART BUTTON */}
        <TouchableOpacity
          className="bg-primary py-4 rounded-2xl items-center"
          style={{
            shadowColor: "#e11d1d",
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 10,
          }}
        >
          <Text className="text-white font-bold text-lg">
            ADD TO CART
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}