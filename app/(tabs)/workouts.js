import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";
import { useAuth } from "../../context/AuthContext";
import { getTrainerWorkouts } from "../../services/api";

function WorkoutVideo({ uri }) {
  const player = useVideoPlayer(uri);

  return (
    <VideoView
      player={player}
      style={{
        width: "100%",
        height: 220,
        borderRadius: 12,
        marginTop: 10,
        backgroundColor: "black",
      }}
      nativeControls
      contentFit="contain"
    />
  );
}

export default function Workouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [filter, setFilter] = useState("TODAY");
  const [refreshing, setRefreshing] = useState(false);

  const workoutData = workouts[0];

  const normalizeMediaUrl = (media) => {
    if (!media) return "";

    const uri = String(media).trim();
    if (uri.startsWith("data:")) return uri;
    if (uri.startsWith("//")) return `https:${uri}`;
    if (uri.startsWith("/")) return `https://dapfitt.com${uri}`;
    if (!uri.match(/^https?:\/\//i)) return `https://${uri}`;
    return encodeURI(uri);
  };

  const getYoutubeId = (media) => {
    if (!media) return null;
    const uri = String(media).trim();

    const match = uri.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?(?:.*&)?v=|shorts\/|v\/)|youtube-nocookie\.com\/(?:embed\/))([A-Za-z0-9_-]{11})/);
    if (match?.[1]) return match[1];

    const queryMatch = uri.match(/[?&]v=([^&]+)/);
    return queryMatch?.[1] || null;
  };

  const getFilteredDays = () => {
    let days = workoutData?.days;
    if (typeof days === "string") {
      try {
        days = JSON.parse(days);
      } catch (error) {
        console.error("Invalid workout schedule:", error);
        return [];
      }
    }

    if (!days || typeof days !== "object" || Array.isArray(days)) return [];

    const schedule = Object.entries(days);
    if (filter === "ALL") return schedule;

    const startDateValue = workoutData.created_at || workoutData.createdAt;
    const startDate = dayjs(startDateValue);
    if (!startDateValue || !startDate.isValid()) return [];

    const numberedSchedule = schedule.flatMap(([day, exercises]) => {
      const match = String(day).match(/\d+/);
      const dayNumber = match ? Number(match[0]) : NaN;
      return Number.isInteger(dayNumber) && dayNumber > 0
        ? [{ dayNumber, entry: [day, exercises] }]
        : [];
    });
    if (!numberedSchedule.length) return [];

    const lastDayNumber = Math.max(
      ...numberedSchedule.map(({ dayNumber }) => dayNumber),
    );
    const durationWeeks = Number(
      workoutData.duration_weeks || workoutData.durationWeeks,
    );
    const totalWeeks =
      Number.isFinite(durationWeeks) && durationWeeks > 0
        ? durationWeeks
        : Math.ceil(lastDayNumber / 7);
    const start = startDate.startOf("day");
    const durationDays = totalWeeks * 7;
    const repeatsWeekly = lastDayNumber <= 7 && totalWeeks > 1;
    const today = dayjs().startOf("day");
    const weekStart = today.startOf("week");
    const dates =
      filter === "TODAY"
        ? [today]
        : Array.from({ length: 7 }, (_, index) => weekStart.add(index, "day"));

    const filteredSchedule = dates.flatMap((date) => {
      const elapsedDays = date.diff(start, "day");
      if (elapsedDays < 0 || elapsedDays >= durationDays) return [];

      const scheduledDayNumber = repeatsWeekly
        ? (elapsedDays % 7) + 1
        : elapsedDays + 1;
      const day = numberedSchedule.find(
        ({ dayNumber }) => dayNumber === scheduledDayNumber,
      );

      return day ? [day.entry] : [];
    });

    if (filteredSchedule.length > 0) {
      return filteredSchedule;
    }

    const elapsedDays = today.diff(start, "day");
    if (elapsedDays < 0) return [];

    const latestCompletedDay = numberedSchedule
      .filter(({ dayNumber }) => dayNumber <= elapsedDays + 1)
      .sort((a, b) => b.dayNumber - a.dayNumber)[0];

    return latestCompletedDay ? [latestCompletedDay.entry] : [];
  };

  const filteredDays = getFilteredDays();

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      const identifier = user?.user_id || user?.id;
      const params = {};
      if (identifier) params.memberId = identifier;
      if (user?.email) params.email = user.email;
      if (user?.mobile) params.mobile = user.mobile;

      const data = await getTrainerWorkouts(params);

      if (!Array.isArray(data)) return;

      const userEmail = user?.email?.toLowerCase() || "";
      const userMobile = user?.mobile || "";
      const userId = String(user?.id || "");
      const userUuid = user?.user_id || "";

      const myWorkouts = data
        .filter(
          (item) =>
            ((item.member_email || item.memberEmail || "").toLowerCase() === userEmail ||
              (item.member_mobile || item.memberMobile) === userMobile ||
              String(item.user_id || item.userId) === userId ||
              (item.user_id_uuid || item.userIdUuid) === userUuid) &&
            item.status === "active",
        )
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); // latest first

      setWorkouts(myWorkouts);
    } catch (err) {
      console.log("Workout fetch error:", err.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkouts();
    setRefreshing(false);
  };

  if (workouts.length === 0) {
    return (
      <ScrollView
        className="flex-1 bg-card px-5 pt-12"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e11d1d"
          />
        }
      >
        <Text className="text-background text-3xl font-extrabold mb-8">
          Workouts
        </Text>

        <View className="items-center mt-20 px-6">
          <View className="bg-darkcard w-28 h-28 rounded-full items-center justify-center border border-border mb-6">
            <Ionicons name="barbell-outline" size={50} color="#e11d1d" />
          </View>

          <Text className="text-background text-xl font-bold text-center">
            No Workouts Assigned
          </Text>

          <Text className="text-textSecondary text-center mt-2 leading-5">
            You don't have any workout plans yet. Subscribe to a plan to unlock
            workouts.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={["left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e11d1d"
          />
        }
      >
        {/* HERO IMAGE */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e",
          }}
          className="h-[380px] justify-end"
        >
          <View className="absolute inset-0 bg-black/50" />

          <View className="px-5 pb-10">
            <View className="bg-primary px-4 py-1 rounded-full self-start mb-3">
              <Text className="text-white text-xs font-bold">
                {workoutData.level} · {workoutData.duration_weeks} Weeks
              </Text>
            </View>

            <Text className="text-white text-3xl font-extrabold leading-tight">
              {workoutData.member_name}'s Workout
            </Text>

            <View className="flex-row items-center mt-3 mb-12">
              <Ionicons name="barbell-outline" size={16} color="#ff3c00" />
              <Text className="text-gray-300 text-md ml-2">
                {workoutData.level}
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* CONTENT */}
        <View className="bg-[#0f0f0f] rounded-t-3xl -mt-6 p-5">
          {/* STATS */}
          <View className="flex-row justify-between mb-6">
            <View className="bg-[#141414] border border-border rounded-2xl px-5 py-4 items-center w-[48%]">
              <Ionicons name="person-outline" size={20} color="#ff3c00" />
              <Text className="text-gray-400 text-xs mt-2">Trainer</Text>
              <Text className="text-white font-bold text-base mt-1">
                {workoutData.trainer_name}
              </Text>
            </View>

            <View className="bg-[#141414] border border-border rounded-2xl px-5 py-4 items-center w-[48%]">
              <Ionicons name="fitness-outline" size={20} color="#ff3c00" />
              <Text className="text-gray-400 text-xs mt-2">Level</Text>
              <Text className="text-white font-bold text-base mt-1">
                {workoutData.level}
              </Text>
            </View>
          </View>

          {/* WEEKLY SCHEDULE */}
          <Text className="text-white text-xl font-bold mb-4">
            Weekly Schedule
          </Text>

          <View className="flex-row mb-4">
            {["ALL", "TODAY", "WEEK"].map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full mr-2 ${filter === f ? "bg-primary" : "bg-[#222]"
                  }`}
              >
                <Text
                  className={`text-sm font-semibold ${filter === f ? "text-white" : "text-gray-400"
                    }`}
                >
                  {f === "ALL" ? "All" : f === "TODAY" ? "Today" : "This Week"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredDays.length === 0 && filter !== "ALL" && (
            <Text className="text-gray-400 text-center py-6">
              No workouts scheduled for {filter === "TODAY" ? "today" : "this week"}.
            </Text>
          )}

          {filteredDays.map(([day, exercises], index) => {
            const dayNumber = String(day).match(/\d+/)?.[0];
            const dayLabel = dayNumber ? `Day ${dayNumber}` : day;

            return (
              <View
                key={index}
                className="bg-[#141414] rounded-2xl p-4 mb-4 border border-border"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-primary font-bold text-lg">
                    {dayLabel}
                  </Text>

                  <View className="bg-card px-3 py-1 rounded-full border border-border">
                    <Text className="text-gray-400 text-sm">
                      {exercises.length} Exercise
                    </Text>
                  </View>
                </View>

                {exercises.map((ex, i) => (
                  <View
                    key={i}
                    className="bg-[#1a1a1a] rounded-xl p-3 mb-2 border border-[#222]"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 ml-3">
                        <Text className="text-white text-lg font-bold tracking-wide">
                          {ex.name}
                        </Text>

                        <Text className="text-gray-400 text-sm mt-1">
                          {ex.type}
                        </Text>

                        <View className="flex-row mt-3">
                          <View className="bg-[#1a1a1a] px-3 py-2 rounded-xl mr-2">
                            <Text className="text-gray-500 text-xs">SETS</Text>
                            <Text className="text-white font-bold">{ex.sets}</Text>
                          </View>

                          <View className="bg-[#1a1a1a] px-3 py-2 rounded-xl mr-2">
                            <Text className="text-gray-500 text-xs">REPS</Text>
                            <Text className="text-white font-bold">{ex.count}</Text>
                          </View>

                          <View className="bg-[#ff3c00]/10 px-3 py-2 rounded-xl border border-[#ff3c00]/20">
                            <Text className="text-[#ff3c00] text-xs">Muscle Type</Text>
                            <Text className="text-white font-bold">{ex.massGain}</Text>
                          </View>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color="#888" />
                        <Text className="text-gray-400 text-sm ml-1">
                          {ex.time}
                        </Text>
                      </View>
                    </View>

                    {ex.media ? (
                      (() => {
                        const mediaString = String(ex.media).trim();
                        const mediaUri = normalizeMediaUrl(mediaString);
                        const youtubeId = getYoutubeId(mediaString);
                        const isVideoFile = /\.(mp4|webm|ogg)(?:\?.*|$)/i.test(mediaString);
                        const isYoutube = Boolean(youtubeId);
                        const isDataVideo = mediaString.startsWith("data:video");

                        if (isYoutube && youtubeId) {
                          return (
                            <YoutubePlayer
                              height={220}
                              play={false}
                              videoId={youtubeId}
                            />
                          );
                        }

                        if (isDataVideo || isVideoFile) {
                          return (
                            <WorkoutVideo uri={mediaUri} />
                          );
                        }

                        if (mediaUri) {
                          return (
                            <Image
                              source={{ uri: mediaUri }}
                              style={{
                                width: "100%",
                                height: 150,
                                borderRadius: 12,
                                marginTop: 10,
                              }}
                              resizeMode="cover"
                            />
                          );
                        }

                        return null;
                      })()
                    ) : null}
                  </View>
                ))}
              </View>
            );
          })}

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
