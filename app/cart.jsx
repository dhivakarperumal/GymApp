import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import {
  deleteCartApi,
  getAllProducts,
  getCart,
  updateCartApi,
} from "../services/api";
import BackButton from "./BackButton";
import Header from "./Header";

const getQuantityDiscountPercent = (qty) => {
  if (qty >= 20 && qty <= 25) return 10;
  if (qty >= 5 && qty <= 19) return 5;
  return 0;
};

export default function Cart() {

  const { user } = useAuth();
  const userId = user?.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);

    await fetchProducts();
    await fetchCart();

    setRefreshing(false);
  };

  const fetchProducts = async () => {
    const data = await getAllProducts();
    const list = data.products || data;
    setProducts(list);
  };

  const fetchCart = async () => {
    if (!userId) return;

    try {
      const data = await getCart(userId);

      // console.log("CART API RESPONSE 👉", data);

      const correctedCart = await Promise.all(
        data.map(async (item) => {
          const product = products.find(p => p.id === item.productId);

          if (!product) return item;

          const variantKey =
            item.variant ||
            item.weight ||
            `${item.size}-${item.gender}`;

          const stock = product.stock?.[variantKey]?.qty || 0;

          if (item.quantity > stock && stock > 0) {
            await updateCartApi(item.id, stock);
            return { ...item, quantity: stock };
          }

          return item;
        })
      );

      setCartItems(correctedCart);
    } catch (err) {
      // console.log("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchCart();
      }
      fetchProducts();
    }, [userId])
  );

  const increaseQty = async (item) => {
    try {

      const product = products.find(
        p => p.id === item.productId
      );

      if (!product) return;

      const variantKey =
        item.variant ||
        item.weight ||
        `${item.size}-${item.gender}`;

      const variant = product.stock?.[variantKey];

      const basePrice =
        Number(
          variant?.offerPrice ||
          product.offer_price ||
          item.price
        );

      const newQty = item.quantity + 1;

      const discount =
        getQuantityDiscountPercent(newQty);

      const newPrice = Number(
        (
          basePrice *
          (1 - discount / 100)
        ).toFixed(2)
      );

      await updateCartApi(
        item.id,
        newQty,
        newPrice
      );

      fetchCart();

    } catch (err) {
      console.log(err);
    }
  };

  const decreaseQty = async (item) => {

    if (item.quantity === 1) return;

    const product = products.find(
      p => p.id === item.productId
    );

    if (!product) return;

    const variantKey =
      item.variant ||
      item.weight ||
      `${item.size}-${item.gender}`;

    const variant = product.stock?.[variantKey];

    const basePrice =
      Number(
        variant?.offerPrice ||
        product.offer_price ||
        item.price
      );

    const newQty = item.quantity - 1;

    const discount =
      getQuantityDiscountPercent(newQty);

    const newPrice = Number(
      (
        basePrice *
        (1 - discount / 100)
      ).toFixed(2)
    );

    await updateCartApi(
      item.id,
      newQty,
      newPrice
    );

    fetchCart();
  };

  const deleteItem = async (id) => {
    try {
      await deleteCartApi(id);
      fetchCart();
    } catch (err) {
      // console.log("Delete error:", err);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const delivery = cartItems.length > 0 ? 0 : 0;
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
      <BackButton style={{ marginLeft: 20, marginTop: 20 }} />
      <View className="px-6 pt-6 pb-6">
        <Text className="text-white text-3xl font-bold">My Cart</Text>
        <Text className="text-gray-400 mt-1">{cartItems.length} Items</Text>
      </View>

      {/* CART ITEMS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff3c00"
          />
        }
      >
        {cartItems.length === 0 && (
          <View className="items-center mt-24">
            {/* BIG ICON */}
            <View className="bg-[#111] p-8 rounded-full border border-[#222] mb-6">
              <Ionicons name="cart-outline" size={70} color="#e11d1d" />
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
        {cartItems.map((item, index) => {

          const product = products.find(p => p.id === item.productId);

          let stock = 0;


          if (product) {
            const variantKey =
              item.variant ||
              item.weight ||
              `${item.size}-${item.gender}`;

            stock = product.stock?.[variantKey]?.qty || 0;
          }


          return (
            <View
              key={item.id || item.productId || index}
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
                      <Text className="text-gray-400 text-sm">Size: {item.size}</Text>
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

                  </View>
                  <Text className="text-red-500 text-lg font-bold mt-1">
                    ₹ {item.price}
                    <Text className="text-green-400 text-xs">
                      {getQuantityDiscountPercent(item.quantity) > 0
                        ? `${getQuantityDiscountPercent(item.quantity)}% bulk discount applied`
                        : "Buy 5-19 get 5%, 20-25 get 10%"}
                    </Text>
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
                        if (item.quantity >= stock) {
                          Toast.show({
                            type: "error",
                            text1: "Stock Limit",
                            text2: `Only ${stock} available`,
                          });
                          return;
                        }
                        increaseQty(item);
                      }}
                    >
                      <Ionicons name="add" size={18} color="white" />
                    </TouchableOpacity>
                  </View>

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
          <Text className="text-primary text-xl font-bold">₹ {total}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (!cartItems.length) {
              Toast.show({
                type: "error",
                text1: "Cart Empty",
                text2: "Add items before checkout",
              });
              return;
            }
            router.push("/checkout");
          }}
          className="bg-red-600 py-4 rounded-2xl items-center"
        >
          <Text className="text-white font-bold text-lg">Checkout Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
