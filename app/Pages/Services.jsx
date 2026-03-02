import { View, Text, ScrollView, Image, Dimensions, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

const services = [
  {
    id: 1,
    title: "Functional Training Zone",
    subtitle: "Athletic performance & mobility",
    image:
      "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=1000",
  },
  {
    id: 2,
    title: "Cardio Equipment",
    subtitle: "Endurance & fat burning",
    image:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1000",
  },
  {
    id: 3,
    title: "Free Weights Area",
    subtitle: "Strength & muscle building",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000",
  },
  {
    id: 4,
    title: "Personal Training Zone",
    subtitle: "1-on-1 elite coaching",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000",
  },
];

export default function Services() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#0a0a0a] px-5 pt-12"
    >
      {/* Header */}
      <Text className="text-white text-3xl font-extrabold mb-2">
        Premium Services
      </Text>
      <Text className="text-gray-500 mb-10 tracking-wide text-sm">
        Train smarter. Train stronger.
      </Text>

      {services.map((service) => (
        <TouchableOpacity
          key={service.id}
          activeOpacity={0.9}
          className="mb-10 rounded-3xl overflow-hidden"
          style={{
            shadowColor: "#ff3c00",
            shadowOpacity: 0.6,
            shadowRadius: 25,
            elevation: 20,
          }}
        >
          {/* Image */}
          <Image
            source={{ uri: service.image }}
            style={{
              width: width - 40,
              height: 300,
            }}
            resizeMode="cover"
          />

          {/* Dark overlay */}
          <View className="absolute inset-0 bg-black/40" />

          {/* Bottom glass info section */}
          <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/80 border-t border-[#ff3c00]">
            
            <Text className="text-white text-xl font-bold leading-6">
              {service.title}
            </Text>

            <Text className="text-gray-400 text-sm mt-2">
              {service.subtitle}
            </Text>

            <View className="mt-4 self-start bg-[#ff3c00] px-5 py-2 rounded-full">
              <Text className="text-black font-semibold text-xs tracking-wider">
                EXPLORE
              </Text>
            </View>

          </View>
        </TouchableOpacity>
      ))}

      <View className="h-10" />
    </ScrollView>
  );
}