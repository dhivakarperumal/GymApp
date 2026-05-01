import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  {
    id: "attendance",
    title: "Attendance",
    subtitle: "Track daily member check-ins",
    icon: "calendar",
    route: "/(trainers)/Attendance",
    iconBg: "#3b82f6",
    glowBg: "#3b82f618",
    arrowBg: "#3b82f620",
    arrowColor: "#60a5fa",
    borderAccent: "#3b82f630",
  },
  {
    id: "followup",
    title: "Follow-up Enquiry",
    subtitle: "Manage leads & interactions",
    icon: "chatbubble-ellipses",
    route: "/(trainers)/follow-up-enquiry",
    iconBg: "#f59e0b",
    glowBg: "#f59e0b18",
    arrowBg: "#f59e0b20",
    arrowColor: "#fbbf24",
    borderAccent: "#f59e0b30",
  },
  {
    id: "ptform",
    title: "PT Form",
    subtitle: "Create & manage personal training requests",
    icon: "create-outline",
    iconType: "Ionicons",
    route: "/(trainers)/pt-form",
    iconBg: "#ef4444",
    glowBg: "#ef444418",
    arrowBg: "#ef444420",
    arrowColor: "#f87171",
    borderAccent: "#ef444430",
  },
  {
    id: "pricing",
    title: "Pricing Plans",
    subtitle: "View all membership plan prices",
    icon: "pricetag",
    route: "/(trainers)/pricing",
    iconBg: "#10b981",
    glowBg: "#10b98118",
    arrowBg: "#10b98120",
    arrowColor: "#34d399",
    borderAccent: "#10b98130",
  },
  {
    id: "logout",
    title: "Logout",
    subtitle: "Sign out of your account",
    icon: "log-out",
    route: "/logout",
    iconBg: "#ef4444",
    glowBg: "#ef444418",
    arrowBg: "#ef444420",
    arrowColor: "#f87171",
    borderAccent: "#ef444430",
  },
];

export default function MoreOptions() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Here you would typically call your delete API
            await logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >


        {/* CARDS */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => {
              if (item.id === "delete") {
                handleDeleteAccount();
              } else if (item.id === "logout") {
                handleLogout();
              } else {
                router.push(item.route);
              }
            }}
            style={[
              styles.card,
              {
                shadowColor: item.iconBg,
                borderColor: item.borderAccent,
              },
            ]}
          >
            {/* Glow blob top-right */}
            <View
              style={[styles.glowBlob, { backgroundColor: item.glowBg }]}
            />

            {/* Icon Box */}
            <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={26} color="#fff" />
            </View>

            {/* Text */}
            <View style={styles.textBlock}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>

            {/* Arrow */}
            <View style={[styles.arrowBox, { backgroundColor: item.arrowBg }]}>
              <Ionicons
                name="chevron-forward"
                size={15}
                color={item.arrowColor}
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>GymApp Trainer  •  v1.0.0</Text>
          <View style={styles.footerLine} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 110,
  },

  /* ── Header ── */
  header: {
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerEyebrow: {
    color: "#ff3c00",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 6,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: "#4b5563",
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.2,
  },

  /* ── Card ── */
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  glowBlob: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 90,
    height: 90,
    borderRadius: 50,
  },

  /* ── Icon ── */
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },

  /* ── Text ── */
  textBlock: {
    flex: 1,
  },
  cardTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#6b7280",
    fontSize: 12,
    letterSpacing: 0.1,
  },

  /* ── Arrow ── */
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  /* ── Footer ── */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 36,
    gap: 10,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1a1a1a",
  },
  footerText: {
    color: "#2d2d2d",
    fontSize: 11,
    letterSpacing: 0.8,
  },
});
