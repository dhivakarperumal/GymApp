import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCart,
  updateCartApi,
  deleteCartApi,
  getAllProducts,
} from "../services/api";
import { useEffect, useState } from "react";
import Header from "./Header";

export default function Cart() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const userId = 5; // later from auth

  const fetchProducts = async () => {
    const data = await getAllProducts();
    const list = data.products || data;
    setProducts(list);
  };

  const fetchCart = async () => {
    try {
      const data = await getCart(userId);
      setCartItems(data);
    } catch (err) {
      console.log("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchProducts();
  }, []);

  const increaseQty = async (item) => {
    try {
      await updateCartApi(item.id, item.quantity + 1);
      fetchCart();
    } catch (err) {
      console.log("Increase qty error:", err);
    }
  };

  const decreaseQty = async (item) => {
    try {
      if (item.quantity === 1) return;

      await updateCartApi(item.id, item.quantity - 1);
      fetchCart();
    } catch (err) {
      console.log("Decrease qty error:", err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteCartApi(id);
      fetchCart();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const delivery = cartItems.length > 0 ? 99 : 0;
  const total = subtotal + delivery;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Loading Cart...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Header />
      {/* HEADER */}
      <View className="px-6 pt-12 pb-6">
        <Text className="text-white text-3xl font-bold">My Cart</Text>
        <Text className="text-gray-400 mt-1">{cartItems.length} Items</Text>
      </View>

      {/* CART ITEMS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
        {cartItems.length === 0 && (
          <View className="items-center mt-24">
            {/* BIG ICON */}
            <View className="bg-[#111] p-8 rounded-full border border-[#222] mb-6">
              <Ionicons name="cart-outline" size={70} color="#ff3c00" />
            </View>

            <Text className="text-white text-xl font-bold mb-2">
              Your Cart is Empty
            </Text>

            <Text className="text-gray-400 text-center mb-6 px-10">
              Looks like you haven't added anything to your cart yet.
            </Text>

            {/* SHOP BUTTON */}
            <TouchableOpacity
              onPress={() => router.push("/shop")}
              className="bg-primary px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
        {cartItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);

          let stock = 0;

          if (product) {
            if (product.category === "Food") {
              stock = product.stock?.[item.weight]?.qty || 0;
            } else {
              const key = `${item.size}-${item.gender}`;
              stock = product.stock?.[key]?.qty || 0;
            }
          }

          return (
            <View
              key={item.id}
              className="bg-[#111] rounded-3xl p-4 mb-5 border border-[#1f1f1f]"
            >
              <View className="flex-row">
                {/* PRODUCT IMAGE */}
                <Image
                  source={{ uri: item.images?.[0] }}
                  className="w-24 h-24 rounded-2xl"
                  resizeMode="cover"
                />
                {/* DETAILS */}
                <View className="flex-1 ml-4 justify-between">
                  <View>
                    <Text className="text-white text-lg font-semibold">
                      {item.name}
                    </Text>
                    {item.size && (
                      <Text className="text-gray-400 text-sm">
                        Size: {item.size}
                      </Text>
                    )}

                    {item.gender && (
                      <Text className="text-gray-400 text-sm">
                        Gender: {item.gender}
                      </Text>
                    )}

                    {item.weight && (
                      <Text className="text-gray-400 text-sm">
                        Weight: {item.weight}
                      </Text>
                    )}

                    <Text className="text-red-500 text-lg font-bold mt-1">
                      ₹ {item.price}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Stock Available: {stock}
                    </Text>
                  </View>

                  {/* QUANTITY + DELETE */}
                  <View className="flex-row items-center justify-between mt-4">
                    <View className="flex-row items-center bg-[#1a1a1a] rounded-full px-4 py-2">
                      <TouchableOpacity onPress={() => decreaseQty(item)}>
                        <Ionicons name="remove" size={18} color="white" />
                      </TouchableOpacity>

                      <Text className="text-white mx-4 font-semibold">
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          if (item.quantity < stock) {
                            increaseQty(item);
                          }
                        }}
                      >
                        <Ionicons name="add" size={18} color="white" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => deleteItem(item.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ff4d4d"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* BILL SECTION */}
      <View className="bg-[#111] px-6 py-6 rounded-t-3xl border-t border-[#1f1f1f]">
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-400">Subtotal</Text>
          <Text className="text-white">₹ {subtotal}</Text>
        </View>

        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-400">Delivery</Text>
          <Text className="text-white">₹ {delivery}</Text>
        </View>

        <View className="h-[1px] bg-[#222] my-3" />

        <View className="flex-row justify-between mb-6">
          <Text className="text-white text-lg font-bold">Total</Text>
          <Text className="text-red-500 text-xl font-bold">₹ {total}</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/checkout")}
          className="bg-red-600 py-4 rounded-2xl items-center"
        >
          <Text className="text-white font-bold text-lg">Checkout Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
