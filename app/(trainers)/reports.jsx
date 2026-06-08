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
            (x) =>
                x.pt_planName ||
                x.pt_plan_id ||
                x.has_pt_plan ||
                String(
                    x.planName || ""
                )
                    .toLowerCase()
                    .includes("pt")
        );
    }, [memberships]);

    const expiringMembers = useMemo(() => {

        return members.filter((member) => {

            if (!member.expiry_date)
                return false;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const expiry = new Date(member.expiry_date);
            expiry.setHours(0, 0, 0, 0);

            const diffDays = Math.floor(
                (expiry - today) /
                (1000 * 60 * 60 * 24)
            );

            console.log(
                member.name,
                diffDays
            );

            return diffDays >= 0 && diffDays <= 5;
        });

    }, [members]);

    const filteredFollowups = useMemo(() => {

        return followups.filter((enquiry) => {

            const isUpdatedByMe =
                String(
                    enquiry.updated_by || ""
                ).toLowerCase() ===
                String(
                    user?.username || ""
                ).toLowerCase();

            const isAssignedByName =
                enquiry.trainer_name &&
                (
                    String(
                        enquiry.trainer_name
                    ).toLowerCase() ===
                    String(
                        user?.username
                    ).toLowerCase()
                );

            const isAssignedById =
                enquiry.trainer_id &&
                Number(
                    enquiry.trainer_id
                ) === Number(user?.id);

            return (
                isUpdatedByMe ||
                isAssignedByName ||
                isAssignedById
            );

        });

    }, [followups, user]);

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
                return ptPlans;

            case "followups":
                return followups;

            case "expiry":
                return expiringMembers;

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
                        <View style={styles.statsGrid}>

                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{members.length}</Text>
                                <Text style={styles.statLabel}>Members</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{memberships.length}</Text>
                                <Text style={styles.statLabel}>Plans</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{emiRecords.length}</Text>
                                <Text style={styles.statLabel}>EMI</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{ptPlans.length}</Text>
                                <Text style={styles.statLabel}>PT Plans</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{filteredFollowups.length}</Text>
                                <Text style={styles.statLabel}>Followups</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{expiringMembers.length}</Text>
                                <Text style={styles.statLabel}>Expiry</Text>
                            </View>

                        </View>

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

                    if (activeTab === "emi") {

                        const total =
                            Number(item.price || 0);

                        const paid =
                            Number(item.pricePaid || 0) +
                            Number(item.secondPaymentPaid || 0);

                        const remaining =
                            Math.max(0, total - paid);

                        return (
                            <View style={styles.card}>
                                <Text style={styles.title}>
                                    {item.userName || item.username}
                                </Text>

                                <Text style={styles.text}>
                                    Plan : {item.planName}
                                </Text>

                                <Text style={styles.text}>
                                    Total : ₹{total}
                                </Text>

                                <Text style={styles.text}>
                                    Paid : ₹{paid}
                                </Text>

                                <Text
                                    style={[
                                        styles.text,
                                        {
                                            color:
                                                remaining > 0
                                                    ? "#ef4444"
                                                    : "#22c55e",
                                        },
                                    ]}
                                >
                                    Remaining : ₹{remaining}
                                </Text>
                            </View>
                        );
                    }

                    if (activeTab === "pt") {

                        return (
                            <View style={styles.card}>
                                <Text style={styles.title}>
                                    {item.userName || item.username}
                                </Text>

                                <Text style={styles.text}>
                                    PT Plan :
                                    {" "}
                                    {item.pt_planName ||
                                        item.planName}
                                </Text>

                                <Text style={styles.text}>
                                    Amount :
                                    ₹
                                    {
                                        item.pt_pricePaid ||
                                        item.pricePaid
                                    }
                                </Text>

                                <Text
                                    style={{
                                        color: "#22c55e",
                                        marginTop: 6,
                                    }}
                                >
                                    {item.status || "Active"}
                                </Text>
                            </View>
                        );
                    }

                    if (activeTab === "expiry") {

                        const daysLeft =
                            Math.ceil(
                                (
                                    new Date(item.expiry_date) -
                                    new Date()
                                ) /
                                (1000 * 60 * 60 * 24)
                            );

                        return (
                            <View style={styles.card}>
                                <Text style={styles.title}>
                                    {item.name}
                                </Text>

                                <Text style={styles.text}>
                                    {item.plan}
                                </Text>

                                <Text style={styles.text}>
                                    Expiry :
                                    {" "}
                                    {item.expiry_date}
                                </Text>

                                <Text
                                    style={{
                                        color:
                                            daysLeft > 0
                                                ? "#f59e0b"
                                                : "#ef4444",
                                        marginTop: 6,
                                        fontWeight: "700",
                                    }}
                                >
                                    {daysLeft > 0
                                        ? `${daysLeft} Days Left`
                                        : "Expired"}
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
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 20,
    },

    statCard: {
        width: "31%",
        backgroundColor: "#111",
        paddingVertical: 18,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#222",
        marginBottom: 12,
        alignItems: "center",
    },
});