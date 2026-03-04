import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllReviews, getUserAssignment } from "../../services/api";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Dimensions } from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const scrollRef = useRef(null);
  const scrollX = useRef(0);
  const router = useRouter();

  useEffect(() => {
    fetchReviews();

    if (user?.id) {
      fetchAssignment();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && reviews.length > 0) {
        scrollX.current += width - 40;

        if (scrollX.current >= reviews.length * (width - 40)) {
          scrollX.current = 0;
        }

        scrollRef.current.scrollTo({
          x: scrollX.current,
          animated: true,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [reviews]);

  const fetchReviews = async () => {
    try {
      const data = await getAllReviews();

      if (Array.isArray(data)) {
        // show only active reviews
        const approved = data.filter((item) => item.status === 1);
        setReviews(approved);
      }
    } catch (err) {
      console.log("Reviews fetch error:", err.message);
    }
  };

  const fetchAssignment = async () => {
    try {
      const data = await getUserAssignment();

      if (Array.isArray(data) && user) {
        const userAssignment = data.find(
          (item) => item.userEmail === user.email,
        );

        if (userAssignment) {
          setAssignment(userAssignment);
        }
      }
    } catch (err) {
      console.log("Assignment fetch error:", err);
    }
  };
  return (
    <View className="flex-1 bg-card pt-12 px-5">
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">TODAY'S MISSION</Text>
          <Text className="text-primary text-sm font-semibold">VIEW ALL</Text>
        </View>

        {/* 🔥 Featured Workout Card */}
        <View className="relative rounded-3xl overflow-hidden mb-6">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c",
            }}
            className="w-full h-80"
          />

          {/* Dark overlay */}
          <View className="absolute inset-0 bg-card/60 p-5 justify-end">
            <View className="bg-primary px-3 py-1 rounded-full self-start mb-3">
              <Text className="text-white text-xs font-bold">
                HIGH INTENSITY
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <View className="flex-row items-center mr-4">
                <Ionicons name="time-outline" size={14} color="#e11d1d" />
                <Text className="text-gray-300 text-md ml-1">45 MIN</Text>
              </View>

              <View className="flex-row items-center ml-2">
                <Ionicons name="flash-outline" size={14} color="#e11d1d" />
                <Text className="text-gray-300 text-md ml-1">ADVANCED</Text>
              </View>
            </View>

            <Text className="text-white text-2xl font-bold">
              UPPER BODY POWER
            </Text>

            <Text className="text-textSecondary text-sm mt-1">
              Chest, shoulders, triceps...
            </Text>
          </View>

          {/* Play Button */}
          <TouchableOpacity className="absolute bottom-6 right-6 bg-primary p-4 rounded-full">
            <Ionicons name="play" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 👨‍🏫 Trainer Section */}
        {assignment && (
          <View className="bg-[#141414] rounded-3xl p-6 mb-6 border border-[#262626] shadow-lg">

            {/* Trainer Header */}
            <View className="flex-row items-center mb-4">

              <View className="bg-primary/20 p-3 rounded-2xl mr-3">
                <Ionicons name="fitness" size={22} color="#ff3c00" />
              </View>

              <View>
                <Text className="text-gray-400 text-xs">YOUR TRAINER</Text>

                <Text className="text-white text-xl font-bold">
                  {assignment.trainerName}
                </Text>
              </View>

            </View>

            {/* Plan Details */}
            <View className="flex-row mb-4">

              <View className="bg-[#1f1f1f] px-3 py-2 rounded-xl mr-2">
                <Text className="text-gray-300 text-xs">
                  Plan : {assignment.planName}
                </Text>
              </View>

              <View className="bg-[#1f1f1f] px-3 py-2 rounded-xl">
                <Text className="text-gray-300 text-xs">
                  {assignment.planDuration} Months
                </Text>
              </View>

            </View>

            {/* Buttons */}
            <View className="flex-row">

              <TouchableOpacity
                onPress={() => router.push("/workouts")}
                className="flex-1 bg-primary py-3 rounded-xl mr-2 items-center flex-row justify-center"
              >
                <Ionicons name="barbell" size={16} color="white" />
                <Text className="text-white text-xs font-bold ml-2">
                  VIEW WORKOUT
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/diet")}
                className="flex-1 bg-[#262626] py-3 rounded-xl items-center flex-row justify-center"
              >
                <Ionicons name="restaurant" size={16} color="white" />
                <Text className="text-white text-xs font-bold ml-2">
                  VIEW DIET
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        )}

        {/* 🔥 Reviews Section */}
        <View className="mt-6 mb-10">
          <Text className="text-white text-lg font-bold mb-4">
            MEMBER REVIEWS
          </Text>

          {reviews.length === 0 && (
            <Text className="text-gray-400">No reviews available</Text>
          )}

          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {reviews.map((review, index) => (
              <View
                key={review.id || index}
                className="h-44 bg-[#141414] rounded-3xl p-5 mr-4 border border-[#262626]"
                style={{
                  width: width - 40,
                  shadowColor: "#ff3c00",
                  shadowOpacity: 0.25,
                  shadowRadius: 15,
                  elevation: 8,
                }}
              >
                {/* User Info */}
                <View className="flex-row items-center mb-4">
                  <Image
                    source={{ uri: review.image }}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <View>
                    <Text className="text-white font-bold">{review.name}</Text>

                    {/* Rating Stars */}
                    <View className="flex-row mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? "star" : "star-outline"}
                          size={14}
                          color="#ff3c00"
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                  </View>
                </View>

                {/* Message */}
                <Text
                  numberOfLines={3}
                  ellipsizeMode="tail"
                  className="text-gray-300 text-sm leading-5"
                >
                  "{review.message}"
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>


      </ScrollView>
    </View>
  );
}
