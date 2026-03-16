import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAllReviews,
  getUserAssignment,
  getDietPlans,
  getTrainerWorkouts,
  getAllProducts,
  getUserMemberships
} from "../../services/api";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ProductCard from "../ProductCard";

const { width } = Dimensions.get("window");

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const { user } = useAuth();
  const router = useRouter();
  const { planDetails } = useLocalSearchParams();
  const [assignment, setAssignment] = useState(null);
  const scrollRef = useRef(null);
  const scrollX = useRef(0);

  const [todayDiet, setTodayDiet] = useState(null);
  const [dietTitle, setDietTitle] = useState("");
  const [todayDay, setTodayDay] = useState("");

  const [todayWorkout, setTodayWorkout] = useState(null);
  const [todayWorkoutDay, setTodayWorkoutDay] = useState("");

  const [products, setProducts] = useState([]);
  const productScrollRef = useRef(null);
  const productScrollX = useRef(0);

  const [userPlan, setUserPlan] = useState(null);

  const fetchUserPlan = async () => {
    try {
      if (!user?.id) return;

      const plans = await getUserMemberships(user.id);

      console.log("ALL MEMBERSHIPS:", plans);

      if (!Array.isArray(plans)) return;

      // FILTER BY USER ID
      const myPlans = plans.filter(
        (p) => Number(p.userId || p.user_id) === Number(user.id)
      );

      if (myPlans.length === 0) {
        setUserPlan(null);
        return;
      }

      const activePlan =
        myPlans.find((p) => new Date(p.endDate) > new Date()) || myPlans[0];

      setUserPlan(activePlan);
    } catch (err) {
      console.log("Plan fetch error:", err);
    }
  };

  // Parse planDetails if present
  const purchasedPlan = planDetails ? JSON.parse(planDetails) : null;

  useEffect(() => {
    fetchReviews();
    fetchProducts();

    if (user?.id) {
      fetchAssignment();
      fetchTodayDiet();
      fetchTodayWorkout();
      fetchUserPlan();
    }
  }, [user]);

  const fetchTodayDiet = async () => {
    try {
      const data = await getDietPlans();


      if (!Array.isArray(data) || !user?.email) return;

      const myDiet = data.find((item) => item.member_email === user.email);

      if (!myDiet || !myDiet.days) return;

      const createdDate = new Date(myDiet.created_at);
      const today = new Date();

      const diffDays =
        Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)) + 1;

      const totalDays = Object.keys(myDiet.days).length;

      // Diet plan finished
      if (diffDays > totalDays) {
        setTodayDiet(null);
        setTodayDay("");
        return;
      }

      const todayKey = `Day${diffDays}`;
      const todayMeals = myDiet.days[todayKey];

      if (todayMeals) {
        setTodayDiet(todayMeals);
        setTodayDay(todayKey);
        setDietTitle(myDiet.title);
      } else {
        setTodayDiet(null);
      }
    } catch (err) {
      console.log("Today diet error:", err);
    }
  };

  const fetchTodayWorkout = async () => {
    try {
      const data = await getTrainerWorkouts();

      if (!Array.isArray(data) || !user?.email) return;

      const myWorkout = data.find((item) => item.member_email === user.email);

      if (!myWorkout || !myWorkout.days) return;

      const createdDate = new Date(myWorkout.created_at);
      const today = new Date();

      const diffDays =
        Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)) + 1;

      const totalDays = Object.keys(myWorkout.days).length;

      const todayIndex = diffDays > totalDays ? totalDays : diffDays;

      const todayKey = `Day${todayIndex}`;

      const todayExercises = myWorkout.days[todayKey];

      if (todayExercises) {
        setTodayWorkout(todayExercises);
        setTodayWorkoutDay(todayKey);
      }
    } catch (err) {
      console.log("Workout fetch error:", err);
    }
  };

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
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (productScrollRef.current && products.length > 0) {
        const cardWidth = 201; // card width + margin

        productScrollX.current += cardWidth;

        if (productScrollX.current >= products.length * cardWidth) {
          productScrollX.current = 0;
        }

        productScrollRef.current.scrollTo({
          x: productScrollX.current,
          animated: true,
        });
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [products]);

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

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();

      const productList = data.products || data;

      if (Array.isArray(productList)) {
        setProducts(productList.slice(0, 10)); // limit for swiper
      }
    } catch (err) {
      console.log("Products fetch error:", err);
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

        {/* PREMIUM PLAN HERO CARD */}
        <View className="relative rounded-3xl overflow-hidden mb-6">

          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c",
            }}
            className="w-full h-80"
          />

          {/* Gradient Overlay */}
          <View className="absolute inset-0 bg-black/60 p-6 justify-between">

            {userPlan ? (
              <>
                {/* Badge */}
                <View className="bg-primary self-start px-4 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    YOUR ACTIVE PLAN
                  </Text>
                </View>

                {/* Plan Info */}
                <View>
                  <Text className="text-white text-3xl font-extrabold mb-2">
                    {userPlan.planName}
                  </Text>

                  <View className="flex-row items-center mb-3">
                    <Text className="text-primary text-2xl font-bold mr-3">
                      ₹{Number(userPlan.pricePaid || 0).toLocaleString()}
                    </Text>

                    <View className="bg-white/10 px-3 py-1 rounded-full">
                      <Text className="text-gray-200 text-xs">
                        {userPlan.duration}
                      </Text>
                    </View>
                  </View>

                  {/* Dates */}
                  <View className="flex-row justify-between mt-3">

                    <View>
                      <Text className="text-gray-400 text-[11px] uppercase">
                        Start Date
                      </Text>

                      <Text className="text-white text-sm font-semibold">
                        {userPlan.startDate
                          ? new Date(userPlan.startDate).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-gray-400 text-[11px] uppercase">
                        End Date
                      </Text>

                      <Text className="text-white text-sm font-semibold">
                        {userPlan.endDate
                          ? new Date(userPlan.endDate).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </View>

                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Motivation Text */}
                <View>
                  <Text className="text-white text-3xl font-bold mb-2">
                    Transform Your Body
                  </Text>

                  <Text className="text-gray-300 text-sm">
                    Join a personalized fitness program with workouts,
                    trainers and diet plans designed for you.
                  </Text>
                </View>

                {/* CTA */}
                <TouchableOpacity
                  onPress={() => router.push("/pricing")}
                  className="bg-primary py-4 rounded-2xl items-center mt-6"
                >
                  <Text className="text-white font-bold text-lg">
                    Explore Plans
                  </Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>

        {todayWorkout && (
          <View
            className="bg-[#141414] rounded-3xl p-5 mb-6 border border-[#262626]"
            style={{
              shadowColor: "#ff3c00",
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white text-lg font-bold">
                  TODAY'S WORKOUT
                </Text>

                <Text className="text-gray-400 text-xs mt-1">
                  {todayWorkoutDay} Plan
                </Text>
              </View>

              <TouchableOpacity onPress={() => router.push("/workouts")}>
                <Text className="text-primary text-sm font-semibold">
                  VIEW FULL
                </Text>
              </TouchableOpacity>
            </View>

            {todayWorkout.map((ex, index) => (
              <View
                key={index}
                className="bg-black rounded-xl p-4 mb-3 border border-[#2a2a2a]"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="barbell-outline"
                      size={18}
                      color="#ff3c00"
                    />
                    <Text className="text-white ml-2">{ex.name}</Text>
                  </View>

                  <Text className="text-gray-400 text-xs">{ex.time}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {!todayWorkout && (
          <View
            className="bg-[#141414] rounded-3xl p-5 mb-6 border border-[#262626]"
            style={{
              shadowColor: "#ff3c00",
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#ff3c00"
              />
              <Text className="text-white text-lg font-bold ml-2">
                TODAY'S WORKOUT
              </Text>
            </View>

            <Text className="text-gray-400 text-sm">
              No assigned exercise for today.
            </Text>

            <Text className="text-gray-500 text-xs mt-2">
              Your trainer has not scheduled a workout for today. Check back
              later or contact your trainer for the next session.
            </Text>
          </View>
        )}

        {todayDiet && (
          <View
            className="bg-[#141414] rounded-3xl p-5 mb-6 border border-[#262626]"
            style={{
              shadowColor: "#ff3c00",
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white text-lg font-bold">
                  TODAY'S DIET
                </Text>

                {todayDay && (
                  <Text className="text-gray-400 text-xs mt-1">
                    {todayDay} Meals
                  </Text>
                )}
              </View>

              <TouchableOpacity onPress={() => router.push("/diet")}>
                <Text className="text-primary text-sm font-semibold">
                  VIEW FULL
                </Text>
              </TouchableOpacity>
            </View>

            {Object.entries(todayDiet).map(([meal, value]) => (
              <View
                key={meal}
                className="bg-black rounded-xl p-4 mb-3 border border-[#2a2a2a]"
              >
                <Text className="text-primary text-xs font-semibold mb-1">
                  {meal}
                </Text>

                <Text className="text-gray-300 text-sm">
                  {value.food} ({value.quantity})
                </Text>

                <Text className="text-gray-500 text-xs mt-1">
                  {value.calories} calories
                </Text>
              </View>
            ))}
          </View>
        )}

        {!todayDiet && (
          <View
            className="bg-[#141414] rounded-3xl p-5 mb-6 border border-[#262626]"
            style={{
              shadowColor: "#ff3c00",
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="restaurant-outline" size={20} color="#ff3c00" />
              <Text className="text-white text-lg font-bold ml-2">
                TODAY'S DIET
              </Text>
            </View>

            <Text className="text-gray-400 text-sm">
              No assigned diet for today.
            </Text>

            <Text className="text-gray-500 text-xs mt-2">
              Your trainer has not scheduled a meal plan for today. Please check
              again later or contact your trainer for guidance.
            </Text>
          </View>
        )}

        {/* 🛒 PRODUCTS */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-bold">
              SUPPLEMENTS & GEAR
            </Text>

            <TouchableOpacity onPress={() => router.push("shop")}>
              <Text className="text-primary text-sm font-semibold">
                VIEW ALL
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={productScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={101}
            decelerationRate="fast"
            snapToAlignment="start"
          >
            {products.map((item) => (
              <View key={item.id} style={{ width: 190, marginRight: 11 }}>
                <ProductCard item={item} />
              </View>
            ))}
          </ScrollView>
        </View>

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

        {/* 👨‍🏫 Trainer Section */}
        {assignment && (
          <View
            className="bg-[#141414] rounded-3xl p-5 mb-6 border border-[#262626]"
            style={{
              shadowColor: "#ff3c00",
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View className="flex-row items-center mb-4">
              {/* Trainer Image */}
              {/* <Image
                source={{
                  uri:
                    assignment.trainerImage ||
                    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b",
                }}
                className="w-16 h-16 rounded-full mr-4 border-2 border-primary"
              /> */}

              {/* Trainer Info */}
              <View>
                <Text className="text-gray-400 text-xs">YOUR TRAINER</Text>

                <Text className="text-white text-lg font-bold">
                  {assignment.trainerName}
                </Text>

                <Text className="text-gray-400 text-sm mt-1">
                  {assignment.planName}
                </Text>
              </View>
            </View>

            {/* Plan Info */}
            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-gray-500 text-xs">PLAN</Text>
                <Text className="text-white font-semibold">
                  {assignment.planName}
                </Text>
              </View>

              <View>
                <Text className="text-gray-500 text-xs">DURATION</Text>
                <Text className="text-white font-semibold">
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
                <Text className="text-white text-sm font-bold ml-2">
                  VIEW WORKOUT
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/diet")}
                className="flex-1 bg-[#262626] py-3 rounded-xl items-center flex-row justify-center"
              >
                <Ionicons name="restaurant" size={16} color="white" />
                <Text className="text-white text-sm font-bold ml-2">
                  VIEW DIET
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
