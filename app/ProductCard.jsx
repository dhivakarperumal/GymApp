import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProductCard({ item, grid }) {
  const router = useRouter();

  let price = 0;
  let oldPrice = 0;

  if (item.category === "Food" && item.weight?.length) {
    const firstWeight = item.weight[0];
    const variant = item.stock?.[firstWeight];
    price = Number(variant?.offerPrice || variant?.mrp || 0);
    oldPrice = Number(variant?.mrp || 0);
  } else {
    price = Number(item.offer_price || item.mrp || 0);
    oldPrice = Number(item.mrp || 0);
  }

  const imageUrl = item.images?.[0] || "https://via.placeholder.com/150";

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(`/Shop/${item.id}`)}
      style={{ 
        width: grid ? "48%" : "100%", 
        marginBottom: 24 
      }}
    >
      <View
        style={{
          borderRadius: 24,
          overflow: "hidden",
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
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />
          <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)" }} />
          
          {/* CATEGORY */}
          <View style={{ 
            position: "absolute", 
            top: 12, 
            left: 12, 
            backgroundColor: "#0f0f0f", 
            paddingHorizontal: 12, 
            paddingVertical: 4, 
            borderRadius: 999, 
            borderWidth: 1, 
            borderColor: "#e11d1d" 
          }}>
            <Text style={{ color: "#e11d1d", fontSize: 10, fontWeight: "600" }}>
              {item.category}
            </Text>
          </View>
        </View>

        {/* CONTENT */}
        <View style={{ padding: 16, backgroundColor: "#141414" }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}
          >
            {item.name}
          </Text>

          {/* RATING */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= (item.rating || item.ratings || 0) ? "star" : "star-outline"}
                size={14}
                color="#e11d1d"
                style={{ marginRight: 2 }}
              />
            ))}
            <Text style={{ color: "#9ca3af", fontSize: 12, marginLeft: 8 }}>
              {(item.rating || item.ratings || 0).toFixed ? (item.rating || item.ratings || 0).toFixed(1) : item.rating || item.ratings || 0}
            </Text>
          </View>

          {/* PRICE */}
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: "#e11d1d", fontSize: 18, fontWeight: "bold" }}>
                ₹ {price}
              </Text>
              {oldPrice > price && (
                <Text style={{ color: "#9ca3af", fontSize: 14, marginTop: 4, textDecorationLine: "line-through" }}>
                  ₹ {oldPrice}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => router.push(`/Shop/${item.id}`)}
              style={{
                backgroundColor: "#e11d1d",
                padding: 12,
                borderRadius: 16,
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