import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const facilities = [
  {
    id: 1,
    title: "Power & Compound Training",
    description: "Heavy compound lifting zone",
    image: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e",
  },
  {
    id: 2,
    title: "Functional Training Zone",
    description: "Athletic performance and functional fitness",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
  },
  {
    id: 3,
    title: "Strength Machines",
    description: "Selectorized machines for controlled workouts",
    image: "https://images.unsplash.com/photo-1584466977773-e625c37cdd50",
  },
];

export default function Facilities() {
  return (
    <View className="flex-1 bg-black pt-12">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* 🔥 HEADER */}
        <Text className="text-white text-3xl font-extrabold mb-2">
          Our Facilities
        </Text>
        <Text className="text-gray-400 mb-8">
          Train in world-class premium workout zones
        </Text>

        {facilities.map((item) => (
          <View
            key={item.id}
            className="mb-10 rounded-3xl overflow-hidden border border-[#2a2a2a]"
            style={{
              shadowColor: "#ff3c00",
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <ImageBackground
              source={{ uri: item.image }}
              className="h-72 justify-end"
            >
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.85)"]}
                locations={[0, 0.5, 1]}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "70%",
                }}
              />

              {/* Dark Premium Overlay */}
              <View className="absolute inset-0 bg-black/70" />

              <View className="p-6">
                <Text className="text-white text-2xl font-extrabold mb-3">
                  {item.title}
                </Text>

                <Text className="text-gray-300 text-base mb-6">
                  {item.description}
                </Text>

                {/* VIEW DETAILS */}
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-[#ff3c00] font-semibold mr-2 tracking-wide">
                    VIEW DETAILS
                  </Text>
                  <View className="border border-[#ff3c00] p-2 ml-3 rounded-full">
                    <Ionicons name="arrow-forward" size={18} color="#ff3c00" />
                  </View>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
