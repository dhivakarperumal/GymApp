import { View, Text, ScrollView, Image, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const trainers = [
  {
    id: 1,
    name: "Alex Ramirez",
    role: "Nutritionist",
    experience: "8+ Years Experience",
    image:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800",
  },
  {
    id: 2,
    name: "Michael Stone",
    role: "Strength Coach",
    experience: "10+ Years Experience",
    image:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800",
  },
  {
    id: 3,
    name: "Emily Thompson",
    role: "Personal Trainer",
    experience: "6+ Years Experience",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800",
  },
];

export default function Trainers() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#0a0a0a] px-5 pt-12"
    >
      {/* Header */}
      <Text className="text-white text-3xl font-extrabold mb-2">
        Elite Trainers
      </Text>
      <Text className="text-gray-500 mb-10 text-sm tracking-wide">
        Train with certified professionals
      </Text>

      {trainers.map((trainer) => (
        <View
          key={trainer.id}
          className="mb-10 rounded-3xl overflow-hidden"
          style={{
            shadowColor: "#ff3c00",
            shadowOpacity: 0.6,
            shadowRadius: 30,
            elevation: 20,
          }}
        >
          <Image
            source={{ uri: trainer.image }}
            style={{
              width: width - 40,
              height: 460,
            }}
            resizeMode="cover"
          />

          {/* Gradient Dark Overlay */}
          <View className="absolute inset-0 bg-black/30" />

          {/* Bottom Premium Info Card */}
          <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/80 border-t border-[#ff3c00]">

            {/* Name */}
            <Text className="text-white text-2xl font-bold tracking-wide">
              {trainer.name}
            </Text>

            {/* Role */}
            <Text className="text-[#ff3c00] text-sm tracking-[2px] mt-1">
              {trainer.role.toUpperCase()}
            </Text>

            {/* Experience Badge */}
            <View className="mt-3 self-start bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-[#2a2a2a]">
              <Text className="text-gray-400 text-xs">
                {trainer.experience}
              </Text>
            </View>
          </View>
        </View>
      ))}

      <View className="h-10" />
    </ScrollView>
  );
}