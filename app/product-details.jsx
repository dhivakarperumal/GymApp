import { View, Text} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetails() {
  const { product } = useLocalSearchParams();

  const parsedProduct = JSON.parse(product);

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-black"
    >
      <View className="flex-1 p-6">
        <Text className="text-white text-2xl font-bold mb-4">
          Product Details
        </Text>

        <Text className="text-white text-lg">
          {parsedProduct.name}
        </Text>
      </View>
    </SafeAreaView>
  );
}