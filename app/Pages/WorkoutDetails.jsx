import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WorkoutDetails() {
  return (
    <View className="flex-1 bg-black">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* 🔥 HERO IMAGE */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e",
          }}
          className="h-[380px] justify-between p-5"
        >
          {/* Top Buttons */}
          <View className="flex-row justify-between mt-8">
            <TouchableOpacity className="bg-black/60 p-3 rounded-full">
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-black/60 p-3 rounded-full">
              <Ionicons name="ellipsis-vertical" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Bottom Hero Content */}
          <View>
            <View className="bg-[#ff3c00] px-4 py-1 rounded-full self-start mb-3">
              <Text className="text-white text-xs font-bold">
                CHEST · STRENGTH
              </Text>
            </View>

            <Text className="text-white text-3xl font-extrabold leading-tight">
              BARBELL BENCH{"\n"}PRESS
            </Text>

            <View className="flex-row items-center mt-2 mb-10">
              <Ionicons name="barbell-outline" size={16} color="#ff3c00" />
              <Text className="text-gray-300 text-md ml-2">
                3 Sets · 8-12 Reps
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* 🔥 Bottom Section */}
        <View className="bg-[#0f0f0f] rounded-t-3xl -mt-6 p-5">
          {/* STATS */}
          <View className="flex-row justify-between mb-6">
            {[
              { label: "MAX WEIGHT", value: "225", unit: "lbs" },
              { label: "VOL (LAST)", value: "4,200", unit: "lbs" },
              { label: "TIME", value: "2", unit: "HRS" },
            ].map((item, index) => (
              <View
                key={index}
                className="border border-[#ff3c00] rounded-full w-28 h-28 justify-center items-center"
              >
                <Text className="text-gray-400 text-[10px]">
                  {item.label}
                </Text>
                <Text className="text-white text-xl font-bold mt-1">
                  {item.value}{" "}
                  <Text className="text-xs text-gray-400">
                    {item.unit}
                  </Text>
                </Text>
              </View>
            ))}
          </View>

          {/* TABLE HEADER */}
          <View className="flex-row justify-between px-2 mb-3">
            <Text className="text-gray-500 text-xs">SET</Text>
            <Text className="text-gray-500 text-xs">PREVIOUS</Text>
            <Text className="text-gray-500 text-xs">LBS</Text>
            <Text className="text-gray-500 text-xs">REPS</Text>
            <Text className="text-gray-500 text-xs"></Text>
          </View>

          {/* SET 1 */}
          <View className="bg-[#1c1c1c] rounded-2xl p-4 mb-4 flex-row items-center justify-between">
            <Text className="text-[#ff3c00] font-bold">1</Text>
            <Text className="text-gray-400">135 x 12</Text>
            <View className="bg-[#2a2a2a] px-5 py-2 rounded-full">
              <Text className="text-white font-bold">135</Text>
            </View>
            <View className="bg-[#2a2a2a] px-5 py-2 rounded-full">
              <Text className="text-white font-bold">12</Text>
            </View>
            <View className="bg-[#ff3c00] p-2 rounded-full">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          </View>

          {/* SET 2 (ACTIVE STYLE) */}
          <View className="bg-black border border-[#ff3c00] rounded-2xl p-4 mb-4 flex-row items-center justify-between">
            <Text className="text-white font-bold">2</Text>
            <Text className="text-gray-400">185 x 10</Text>

            <View className="border border-[#ff3c00] px-5 py-2 rounded-full">
              <Text className="text-white font-bold">185</Text>
            </View>

            <View className="border border-[#ff3c00] px-5 py-2 rounded-full">
              <Text className="text-white font-bold">10</Text>
            </View>

            <View className="border border-gray-600 p-2 rounded-full">
              <Ionicons name="checkmark" size={16} color="#555" />
            </View>
          </View>

          {/* SET 3 */}
          <View className="bg-[#1c1c1c] rounded-2xl p-4 mb-6 flex-row items-center justify-between opacity-40">
            <Text className="text-gray-500 font-bold">3</Text>
            <Text className="text-gray-500">205 x 8</Text>
            <View className="bg-[#2a2a2a] px-5 py-2 rounded-full">
              <Text className="text-gray-500 font-bold">-</Text>
            </View>
            <View className="bg-[#2a2a2a] px-5 py-2 rounded-full">
              <Text className="text-gray-500 font-bold">-</Text>
            </View>
            <Ionicons name="checkmark" size={16} color="#444" />
          </View>

          {/* REST TIMER */}
          <View className="bg-[#1c1c1c] rounded-2xl p-4 flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="bg-[#ff3c00] p-3 rounded-full mr-3">
                <Ionicons name="timer-outline" size={18} color="white" />
              </View>

              <View>
                <Text className="text-[#ff3c00] text-xs font-bold">
                  REST TIMER
                </Text>
                <Text className="text-white text-xl font-bold">
                  01:45
                </Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-3">
              <TouchableOpacity className="bg-[#2a2a2a] px-4 py-2 rounded-full">
                <Text className="text-white text-lg">-</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-[#2a2a2a] px-4 py-2 rounded-full">
                <Text className="text-white text-lg">+</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-[#ff3c00] px-5 py-2 rounded-full">
                <Text className="text-white font-bold">SKIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}