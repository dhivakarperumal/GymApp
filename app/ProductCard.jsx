import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  const imageUrl = item.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image";
  const hasDiscount = oldPrice > price;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/Shop/${item.id}`)}
      style={{ 
        width: grid ? (SCREEN_WIDTH - 48) / 2 : "100%", 
        marginBottom: 24,
      }}
    >
      <View
        style={{
          borderRadius: 28,
          overflow: "hidden",
          backgroundColor: "#111",
          borderWidth: 1.5,
          borderColor: "#222",
          shadowColor: "#e11d1d",
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {/* IMAGE AREA */}
        <View style={{ position: "relative", height: grid ? 160 : 200 }}>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {/* Subtle overlay for text readability */}
          <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.1)" }} />
          
          {/* CATEGORY TAG */}
          <View style={{ 
            position: "absolute", 
            top: 12, 
            left: 12, 
            backgroundColor: "rgba(15, 15, 15, 0.8)", 
            paddingHorizontal: 10, 
            paddingVertical: 4, 
            borderRadius: 12, 
            borderWidth: 1, 
            borderColor: "rgba(225, 29, 29, 0.4)" 
          }}>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {item.category}
            </Text>
          </View>

          {/* DISCOUNT PERCENTAGE */}
          {hasDiscount && (
            <View style={{ 
              position: "absolute", 
              top: 12, 
              right: 12, 
              backgroundColor: "#e11d1d", 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 8,
            }}>
              <Text style={{ color: "white", fontSize: 10, fontWeight: "900" }}>
                {Math.round(((oldPrice - price) / oldPrice) * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* CONTENT AREA */}
        <View style={{ padding: 16, backgroundColor: "#141414" }}>
          <Text
            numberOfLines={1}
            style={{ color: "white", fontSize: 15, fontWeight: "bold", marginBottom: 6, letterSpacing: 0.2 }}
          >
            {item.name}
          </Text>

          {/* RATING */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", marginRight: 6 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= (item.rating || item.ratings || 0) ? "star" : "star-outline"}
                  size={12}
                  color="#e11d1d"
                  style={{ marginRight: 1 }}
                />
              ))}
            </View>
            <Text style={{ color: "#6b7280", fontSize: 11, fontWeight: "600" }}>
              {(item.rating || item.ratings || 0).toFixed ? (item.rating || item.ratings || 0).toFixed(1) : item.rating || item.ratings || 0}
            </Text>
          </View>

          {/* PRICE & ACTION */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
            <View>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>
                ₹ {price}
              </Text>
              {hasDiscount && (
                <Text style={{ color: "#4b5563", fontSize: 12, marginTop: 2, textDecorationLine: "line-through" }}>
                  ₹ {oldPrice}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => router.push(`/Shop/${item.id}`)}
              style={{
                backgroundColor: "#e11d1d",
                width: 40,
                height: 40,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#e11d1d",
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name="cart" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}