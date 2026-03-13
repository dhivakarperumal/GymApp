import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProductCard({ item }) {
  const router = useRouter();

  let price = 0;
  let oldPrice = 0;

  // FOOD → price inside stock
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
        {/* IMAGE */}
        <View className="relative">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-40"
            resizeMode="cover"
          />

          <View className="absolute inset-0 bg-black/20" />

          {/* CATEGORY */}
          <View className="absolute top-3 left-3 bg-[#0f0f0f] px-3 py-1 rounded-full border border-primary">
            <Text className="text-primary text-[10px] font-semibold">
              {item.category}
            </Text>
          </View>
        </View>

        {/* CONTENT */}
        <View className="p-4 bg-[#141414] rounded-b-3xl">
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-white text-md font-bold leading-5 mb-3"
          >
            {item.name}
          </Text>

          {/* RATING */}
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

          {/* PRICE */}
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
}