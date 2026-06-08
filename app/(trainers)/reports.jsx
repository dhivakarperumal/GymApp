import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Reports() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [members, setMembers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [followups, setFollowups] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [activeTab, setActiveTab] = useState("members");
    const [search, setSearch] = useState("");

    const fetchReports = async () => {
        try {
            const query = `?trainerUserId=${user?.id}`;

            const [
                membersRes,
                ordersRes,
                membershipsRes,
                followupsRes,
                assignmentsRes,
            ] = await Promise.all([
                api.get(`/members${query}`),
                api.get(`/orders${query}`),
                api.get(`/memberships${query}`),
                api.get(`/followups${query}`),
                api.get(`/assignments${query}`),
            ]);

            setMembers(membersRes?.data || []);
            setOrders(ordersRes?.data || []);
            setMemberships(membershipsRes?.data || []);
            setFollowups(followupsRes?.data || []);
            setAssignments(assignmentsRes?.data || []);
        } catch (error) {
            console.log("Reports Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReports();
    };

    const emiRecords = useMemo(() => {
        return memberships.filter(
            (x) =>
                String(x.paymentMode || "")
                    .toLowerCase()
                    .includes("emi")
        );
    }, [memberships]);

    const ptPlans = useMemo(() => {
        return memberships.filter(
            (x) => x.has_pt_plan || x.pt_planName
        );
    }, [memberships]);

    const expiringMembers = useMemo(() => {
        return members.filter((m) => m.expiry_date);
    }, [members]);

    console.log("USER =>", user);
    console.log("MEMBERS =>", members.length);
    console.log("MEMBERSHIPS =>", memberships.length);
    console.log("FOLLOWUPS =>", followups.length);
    console.log("ASSIGNMENTS =>", assignments.length);

    const tabs = [
        { key: "members", label: "Members" },
        { key: "plans", label: "Plans" },
        { key: "emi", label: "EMI" },
        { key: "pt", label: "PT Plans" },
        { key: "followups", label: "Followups" },
        { key: "expiry", label: "Expiry" },
    ];

    const currentData = useMemo(() => {
        switch (activeTab) {
            case "members":
                return members;

            case "plans":
                return memberships;

            case "emi":
                return memberships.filter(
                    x =>
                        String(x.paymentMode || "")
                            .toLowerCase() === "emi"
                );

            case "pt":
                return memberships.filter(
                    x => x.has_pt_plan || x.pt_planName
                );

            case "followups":
                return followups;

            case "expiry":
                return members.filter(x => x.expiry_date);

            default:
                return [];
        }
    }, [
        activeTab,
        members,
        memberships,
        followups
    ]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListHeaderComponent={
                    <>
                        <Text style={styles.heading}>
                            Reports & Analytics
                        </Text>

                        {/* Summary Cards */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        >
                            <View style={styles.statsRow}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>
                                        {members.length}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        Members
                                    </Text>
                                </View>

                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>
                                        {memberships.length}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        Plans
                                    </Text>
                                </View>

                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>
                                        {emiRecords.length}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        EMI
                                    </Text>
                                </View>

                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>
                                        {ptPlans.length}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        PT Plans
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        <TextInput
                            placeholder="Search..."
                            placeholderTextColor="#777"
                            value={search}
                            onChangeText={setSearch}
                            style={styles.search}
                        />

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        >
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={[
                                        styles.tab,
                                        activeTab === tab.key &&
                                        styles.activeTab,
                                    ]}
                                    onPress={() =>
                                        setActiveTab(tab.key)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            activeTab === tab.key && {
                                                color: "#fff",
                                            },
                                        ]}
                                    >
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                }
                data={currentData}
                keyExtractor={(item, index) =>
                    String(item.id || index)
                }
                renderItem={({ item }) => {
                    if (activeTab === "members") {
                        return (
                            <View style={styles.card}>
                                <Text style={styles.title}>{item.name}</Text>
                                <Text style={styles.text}>{item.phone}</Text>
                                <Text style={styles.text}>{item.plan}</Text>
                            </View>
                        );
                    }

                    if (activeTab === "plans") {
                        return (
                            <View style={styles.card}>
                                <Text style={styles.title}>
                                    {item.userName}
                                </Text>
                                <Text style={styles.text}>
                                    {item.planName}
                                </Text>
                                <Text style={styles.text}>
                                    ₹{item.pricePaid}
                                </Text>
                            </View>
                        );
                    }

                    if (activeTab === "followups") {
                        return (
                            <View style={styles.card}>
                                <Text style={styles.title}>
                                    {item.name}
                                </Text>
                                <Text style={styles.text}>
                                    {item.phone}
                                </Text>
                                <Text style={styles.text}>
                                    {item.message}
                                </Text>
                            </View>
                        );
                    }

                    return null;
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
    },

    heading: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "700",
        margin: 20,
    },

    statsRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
    },

    statCard: {
        width: 120,
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 16,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#222",
    },

    statValue: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
    },

    statLabel: {
        color: "#888",
        marginTop: 4,
    },

    search: {
        margin: 20,
        backgroundColor: "#111",
        color: "#fff",
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: "#222",
    },

    tab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#111",
        borderRadius: 12,
        marginLeft: 12,
        marginBottom: 20,
    },

    activeTab: {
        backgroundColor: "#ef4444",
    },

    tabText: {
        color: "#aaa",
        fontWeight: "600",
    },
    card: {
        backgroundColor: "#111",
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#222",
    },

    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    text: {
        color: "#aaa",
        marginTop: 4,
    },
});