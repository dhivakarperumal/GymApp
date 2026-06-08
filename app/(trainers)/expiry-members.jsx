import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";

export default function ExpiryMembers() {
    const router = useRouter();
    const { user } = useAuth();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");

    const fetchMembers = async () => {
        try {
            const res = await fetch(
                `https://dapfitt.com/api/members?trainerUserId=${user?.id}`
            );

            const data = await res.json();

            const today = dayjs();
            const next5Days = today.add(5, "day");

            const expiring = (Array.isArray(data) ? data : [])
                .filter((m) => {
                    if (!m.expiry_date) return false;

                    const expiryDate = dayjs(m.expiry_date);

                    return (
                        expiryDate.isAfter(today.subtract(1, "day")) &&
                        expiryDate.isBefore(next5Days.add(1, "day"))
                    );
                })
                .sort(
                    (a, b) =>
                        new Date(a.expiry_date).getTime() -
                        new Date(b.expiry_date).getTime()
                );

            setMembers(expiring);
        } catch (err) {
            console.log("Expiry fetch error", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const filteredMembers = useMemo(() => {
        return members.filter(
            (m) =>
                m?.name?.toLowerCase().includes(search.toLowerCase()) ||
                m?.phone?.includes(search)
        );
    }, [members, search]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMembers();
    };

    const renderItem = ({ item }) => {
        const daysLeft = dayjs(item.expiry_date)
            .startOf("day")
            .diff(dayjs().startOf("day"), "day");

        return (
            <View className="bg-[#141414] border border-[#262626] rounded-2xl p-4 mb-3">

                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <Text className="text-white text-lg font-bold">
                            {item.name}
                        </Text>

                        <Text className="text-gray-400 text-sm mt-1">
                            {item.plan || "No Plan"}
                        </Text>
                    </View>

                    <View
                        className={`px-3 py-1 rounded-full ${daysLeft <= 2
                                ? "bg-red-600"
                                : daysLeft <= 5
                                    ? "bg-orange-600"
                                    : "bg-green-600"
                            }`}
                    >
                        <Text className="text-white text-xs font-bold">
                            {daysLeft <= 0
                                ? "Expired"
                                : `${daysLeft} Day${daysLeft > 1 ? "s" : ""}`}
                        </Text>
                    </View>
                </View>

                <View className="mt-3">

                    <View className="flex-row items-center mb-2">
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#9CA3AF"
                        />
                        <Text className="text-gray-400 ml-2">
                            Expires:
                        </Text>
                        <Text className="text-white ml-2">
                            {dayjs(item.expiry_date).format("DD MMM YYYY")}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons
                            name="call-outline"
                            size={16}
                            color="#9CA3AF"
                        />
                        <Text className="text-white ml-2">
                            {item.phone || "-"}
                        </Text>
                    </View>

                </View>

                <View className="flex-row mt-4">

                    <TouchableOpacity
                        className="flex-1 bg-[#262626] py-3 rounded-xl mr-2"
                        onPress={() => {
                            router.push({
                                pathname: "/(trainers)/members",
                                params: {
                                    memberId: item.id,
                                },
                            });
                        }}
                    >
                        <Text className="text-center text-white font-semibold">
                            Profile
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-red-600 py-3 rounded-xl ml-2"
                        onPress={() => {
                            router.push({
                                pathname: "/(trainers)/buy-plan",
                                params: {
                                    memberId: item.id,
                                },
                            });
                        }}
                    >
                        <Text className="text-center text-white font-semibold">
                            Renew
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#0f0f0f] justify-center items-center">
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0f0f0f] px-4 pt-4">

            {/* Header */}

            <View className="flex-row items-center mb-4">

                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-3"
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>

                <View>
                    <Text className="text-white text-2xl font-bold">
                        Plan Expiry Details
                    </Text>

                    <Text className="text-gray-400 text-sm">
                        Expiring within next 5 days
                    </Text>
                </View>

            </View>

            {/* Search */}

            <View className="bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 mb-4 flex-row items-center">

                <Ionicons
                    name="search"
                    size={18}
                    color="#9CA3AF"
                />

                <TextInput
                    placeholder="Search member..."
                    placeholderTextColor="#6B7280"
                    value={search}
                    onChangeText={setSearch}
                    className="flex-1 text-white ml-2"
                />

            </View>

            {filteredMembers.length === 0 ? (
                <View className="flex-1 justify-center items-center">

                    <Ionicons
                        name="time-outline"
                        size={60}
                        color="#4B5563"
                    />

                    <Text className="text-gray-400 mt-4">
                        No members expiring soon
                    </Text>

                </View>
            ) : (
                <FlatList
                    data={filteredMembers}
                    keyExtractor={(item) => item.id?.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#ef4444"
                        />
                    }
                />
            )}
        </View>
    );
}