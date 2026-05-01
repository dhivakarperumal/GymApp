import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

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
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: "#111",
          borderWidth: 1.2,
          borderColor: "#222",
          shadowColor: "#e11d1d",
          shadowOpacity: 0.1,
          shadowRadius: 15,
          elevation: 8,
        }}
      >
        {/* IMAGE AREA */}
        <View style={{ position: "relative", height: grid ? 150 : 180 }}>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.05)" }} />
          
          {/* CATEGORY TAG */}
          <View style={{ 
            position: "absolute", 
            top: 10, 
            left: 10, 
            backgroundColor: "rgba(10, 10, 10, 0.8)", 
            paddingHorizontal: 8, 
            paddingVertical: 3, 
            borderRadius: 8, 
            borderWidth: 0.5, 
            borderColor: "rgba(225, 29, 29, 0.3)" 
          }}>
            <Text style={{ color: "#fff", fontSize: 8, fontWeight: "900", textTransform: "uppercase" }}>
              {item.category}
            </Text>
          </View>

          {/* DISCOUNT BADGE */}
          {hasDiscount && (
            <View style={{ 
              position: "absolute", 
              top: 10, 
              right: 10, 
              backgroundColor: "#e11d1d", 
              paddingHorizontal: 6, 
              paddingVertical: 3, 
              borderRadius: 6,
            }}>
              <Text style={{ color: "white", fontSize: 9, fontWeight: "900" }}>
                {Math.round(((oldPrice - price) / oldPrice) * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* CONTENT AREA */}
        <View style={{ padding: 12, backgroundColor: "#141414" }}>
          <Text
            numberOfLines={1}
            style={{ color: "white", fontSize: 14, fontWeight: "bold", marginBottom: 4 }}
          >
            {item.name}
          </Text>

          {/* RATING */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Ionicons name="star" size={10} color="#e11d1d" />
            <Text style={{ color: "#6b7280", fontSize: 10, fontWeight: "700", marginLeft: 4 }}>
              {(item.rating || item.ratings || 0).toFixed(1)}
            </Text>
          </View>

          {/* PRICE */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>
              ₹ {price}
            </Text>
            {hasDiscount && (
              <Text style={{ color: "#4b5563", fontSize: 11, textDecorationLine: "line-through" }}>
                ₹ {oldPrice}
              </Text>
            )}
          </View>

          {/* PREMIUM GRADIENT BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/Shop/${item.id}`)}
          >
            <LinearGradient
              colors={["#e11d1d", "#ff4d4d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 10,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#e11d1d",
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <Ionicons name="cart-outline" size={16} color="white" style={{ marginRight: 6 }} />
              <Text style={{ color: "white", fontSize: 11, fontWeight: "900", letterSpacing: 0.5 }}>
                BUY NOW
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}