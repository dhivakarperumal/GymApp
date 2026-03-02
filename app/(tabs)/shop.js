import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function Shop() {
  const [search, setSearch] = useState("");

  const mockProducts = [
    {
      id: 1,
      title: "Whey Protein",
      price: 1999,
      oldPrice: 2499,
      image:
        "https://images.unsplash.com/photo-1605296867424-35fc25c9212a",
      category: "PERFORMANCE",
    },
    {
      id: 2,
      title: "Pro Lifting Straps",
      price: 999,
      oldPrice: 1099,
      image:
        "https://images.unsplash.com/photo-1599058917765-a780eda07a3e",
      category: "GEAR",
    },
    {
      id: 3,
      title: "Pre Workout",
      price: 1499,
      oldPrice: 1999,
      image:
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
      category: "PERFORMANCE",
    },
    {
      id: 4,
      title: "Mass Gainer",
      price: 2999,
      oldPrice: 3499,
      image: "https://images.unsplash.com/photo-1622484212850-eb596d769edc",
      category: "PERFORMANCE",
    },
    {
      id: 5,
      title: "Creatine Monohydrate",
      price: 1199,
      oldPrice: 1599,
      image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d",
      category: "PERFORMANCE",
    },
    {
      id: 6,
      title: "Shaker Bottle",
      price: 399,
      oldPrice: 599,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32f9c5e",
      category: "GEAR",
    },
    {
      id: 7,
      title: "Gym Gloves",
      price: 699,
      oldPrice: 999,
      image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6",
      category: "GEAR",
    },
    {
      id: 8,
      title: "Resistance Bands Set",
      price: 899,
      oldPrice: 1299,
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
      category: "GEAR",
    },
    {
      id: 9,
      title: "BCAA Energy",
      price: 1799,
      oldPrice: 2199,
      image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6",
      category: "PERFORMANCE",
    },
    {
      id: 10,
      title: "Fish Oil Capsules",
      price: 799,
      oldPrice: 1099,
      image: "https://images.unsplash.com/photo-1580281658629-7e8c6e7e9f06",
      category: "HEALTH",
    },
    {
      id: 11,
      title: "Gym Duffle Bag",
      price: 1499,
      oldPrice: 1999,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
      category: "GEAR",
    },
    {
      id: 12,
      title: "Protein Bar Pack",
      price: 599,
      oldPrice: 899,
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
      category: "PERFORMANCE",
    },
    {
      id: 13,
      title: "Workout T-Shirt",
      price: 999,
      oldPrice: 1499,
      image: "https://images.unsplash.com/photo-1520975922284-9e0ce82759a6",
      category: "APPAREL",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-[#0f0f0f] px-4 pt-12">
      {/* HEADER */}
      {/* <View className="flex-row items-center justify-between mb-6">
        <Ionicons name="menu" size={26} color="white" />
        <Text className="text-white text-lg font-bold tracking-wider">
          PRODUCTS
        </Text>
        <Ionicons name="notifications-outline" size={22} color="white" />
      </View> */}

      {/* SEARCH */}
      <View className="flex-row items-center bg-[#1c1c1c] rounded-xl px-4 py-3 mb-5">
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          placeholder="Search supplements & gear..."
          placeholderTextColor="#777"
          value={search}
          onChangeText={setSearch}
          className="ml-2 text-white flex-1"
        />
      </View>

      {/* PRODUCT LIST */}
      {mockProducts.map((item) => (
        <View
          key={item.id}
          className="bg-[#1c1c1c] rounded-2xl p-4 mb-4 flex-row items-center"
        >
          {/* IMAGE */}
          <View className="relative">
            <Image
              source={{ uri: item.image }}
              className="w-20 h-20 rounded-xl"
              resizeMode="cover"
            />

            {/* CATEGORY BADGE */}
            <View className="absolute top-1 left-1 bg-black/80 px-2 py-1 rounded-md">
              <Text className="text-red-500 text-[7px] font-bold">
                {item.category}
              </Text>
            </View>
          </View>

          {/* DETAILS */}
          <View className="flex-1 ml-4">
            <Text className="text-white font-semibold text-base">
              {item.title}
            </Text>

            <View className="flex-row items-center mt-2">
              <Text className="text-red-500 text-lg font-bold">
                ₹ {item.price}
              </Text>
              <Text className="text-gray-500 line-through ml-3">
                ₹ {item.oldPrice}
              </Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          {/* CART BUTTON */}
          <TouchableOpacity className="bg-red-600 p-3 rounded-full">
            <Ionicons name="cart-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}