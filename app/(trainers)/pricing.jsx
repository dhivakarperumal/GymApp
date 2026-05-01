import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getPlans } from "../../services/api";

/* ─── Price helpers (mirrored from web) ─── */
const parseDecimal = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getFinalPrice = (plan) => {
  const finalPrice = parseDecimal(plan.finalPrice ?? plan.final_price);
  const price = parseDecimal(plan.price);
  const discount = parseDecimal(plan.discount);
  if (finalPrice > 0) return finalPrice;
  if (price > 0 && discount > 0 && discount < 100)
    return Math.round(price * (1 - discount / 100));
  return price;
};

const getOriginalPrice = (plan) => {
  const price = parseDecimal(plan.price);
  const finalPrice = parseDecimal(plan.finalPrice ?? plan.final_price);
  return price > 0 ? price : finalPrice;
};

const getDurationMonths = (plan) => {
  const d = parseDecimal(plan.duration ?? plan.duration_months);
  return d > 0 ? d : 1;
};

/* ─── Filter options ─── */
const FILTERS = [
  { label: "All",      value: "all" },
  { label: "Active",   value: "active" },
  { label: "Inactive", value: "inactive" },
];

/* ════════════════════════════════════════
   MAIN SCREEN
════════════════════════════════════════ */
export default function TrainerPricing() {
  const router = useRouter();

  const [plans, setPlans]       = useState([]);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState(null);

  /* ── Load plans ── */
  const loadPlans = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await getPlans();
      const arr = Array.isArray(data) ? data : data?.data || [];
      setPlans(arr);
    } catch (err) {
      console.log("Pricing load error:", err);
      setError("Failed to load plans. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const onRefresh = () => { setRefreshing(true); loadPlans(true); };

  /* ── Filtered plans ── */
  const filtered = plans.filter((p) => {
    const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && p.active) ||
      (filter === "inactive" && !p.active);
    return matchSearch && matchFilter;
  });

  /* ── Stats ── */
  const stats = {
    total:           plans.length,
    active:          plans.filter((p) => p.active).length,
    trainerIncluded: plans.filter((p) => p.trainerIncluded).length,
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={s.loadingText}>Loading pricing data…</Text>
      </View>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <View style={s.center}>
        <Ionicons name="cloud-offline-outline" size={52} color="#f97316" />
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => loadPlans()}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
            colors={["#f97316"]}
          />
        }
      >
        {/* ── HEADER ── */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <View style={s.headerTextBlock}>
            <Text style={s.headerTitle}>Pricing Plans</Text>
          </View>
        </View>

        {/* ── STAT CARDS ── */}
        <View style={s.statsRow}>
          <StatPill
            label="Total"
            value={stats.total}
            icon="layers-outline"
            color="#f97316"
          />
          <StatPill
            label="Active"
            value={stats.active}
            icon="checkmark-circle-outline"
            color="#10b981"
          />
          
        </View>

        {/* ── SEARCH ── */}
        <View style={s.searchRow}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#6b7280"
            style={s.searchIcon}
          />
          <TextInput
            placeholder="Search plans…"
            placeholderTextColor="#4b5563"
            value={search}
            onChangeText={setSearch}
            style={s.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── FILTER CHIPS ── */}
        <View style={s.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[
                s.filterChip,
                filter === f.value && s.filterChipActive,
              ]}
            >
              <Text
                style={[
                  s.filterChipText,
                  filter === f.value && s.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={s.filterCount}>
            {filtered.length}/{plans.length}
          </Text>
        </View>

        {/* ── PLAN CARDS ── */}
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="pricetag-outline" size={48} color="#374151" />
            <Text style={s.emptyText}>No plans found</Text>
            <Text style={s.emptySubText}>Try adjusting your search filters</Text>
          </View>
        ) : (
          filtered.map((plan, idx) => (
            <PricingCard key={plan.id ?? idx} plan={plan} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ════════════════════════════════════════
   STAT PILL
════════════════════════════════════════ */
function StatPill({ label, value, icon, color }) {
  return (
    <View style={[s.statPill, { borderColor: `${color}30` }]}>
      <View style={[s.statIconBox, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

/* ════════════════════════════════════════
   PRICING CARD
════════════════════════════════════════ */
function PricingCard({ plan }) {
  const price         = getFinalPrice(plan);
  const originalPrice = getOriginalPrice(plan);
  const discount      = parseDecimal(plan.discount);
  const months        = getDurationMonths(plan);
  const perMonth      = Math.round(price / months);
  const isActive      = !!plan.active;

  return (
    <View style={s.card}>
      {/* Glow */}
      <View style={s.cardGlow} />

      {/* Top row: name + badge */}
      <View style={s.cardTop}>
        <View style={s.cardNameBlock}>
          <Ionicons name="pricetag" size={16} color="#f97316" style={{ marginRight: 6 }} />
          <Text style={s.cardName}>{plan.name}</Text>
        </View>
        <View style={[s.statusBadge, isActive ? s.badgeActive : s.badgeInactive]}>
          <Text style={[s.statusText, isActive ? s.statusActive : s.statusInactive]}>
            {isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      {/* Description */}
      {!!plan.description && (
        <Text style={s.cardDesc}>{plan.description}</Text>
      )}

      {/* Divider */}
      <View style={s.divider} />

      {/* Price block */}
      <View style={s.priceRow}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={s.priceMain}>₹{price}</Text>
            {discount > 0 && (
              <View style={s.discountBadge}>
                <Text style={s.discountText}>{discount}% OFF</Text>
              </View>
            )}
          </View>
          {originalPrice > 0 && originalPrice !== price && (
            <Text style={s.priceStrike}>₹{originalPrice}</Text>
          )}
        </View>
        <View style={s.durationBox}>
          <Text style={s.durationNum}>{plan.duration ?? plan.duration_months ?? 1}</Text>
          <Text style={s.durationLabel}>Months</Text>
        </View>
      </View>

      {/* Per month */}
      <View style={s.perMonthRow}>
        <Ionicons name="trending-up-outline" size={13} color="#6b7280" />
        <Text style={s.perMonthText}>
          ₹{perMonth} / month
        </Text>
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Trainer included */}
      <View style={s.featureRow}>
        <Ionicons
          name={plan.trainerIncluded ? "checkmark-circle" : "close-circle"}
          size={18}
          color={plan.trainerIncluded ? "#10b981" : "#6b7280"}
        />
        <Text
          style={[
            s.featureText,
            { color: plan.trainerIncluded ? "#10b981" : "#6b7280" },
          ]}
        >
          {plan.trainerIncluded ? "Trainer Included" : "Trainer Not Included"}
        </Text>
      </View>

      {/* Facilities */}
      {Array.isArray(plan.facilities) && plan.facilities.length > 0 && (
        <View style={s.listBlock}>
          <Text style={s.listTitle}>FACILITIES</Text>
          {plan.facilities.slice(0, 4).map((f, i) => (
            <View key={i} style={s.listItem}>
              <Ionicons name="checkmark" size={13} color="#f97316" />
              <Text style={s.listItemText}>{f}</Text>
            </View>
          ))}
          {plan.facilities.length > 4 && (
            <Text style={s.listMore}>+{plan.facilities.length - 4} more</Text>
          )}
        </View>
      )}

      {/* Features */}
      {Array.isArray(plan.features) && plan.features.length > 0 && (
        <View style={s.listBlock}>
          <Text style={s.listTitle}>FEATURES</Text>
          {plan.features.slice(0, 3).map((f, i) => (
            <View key={i} style={s.listItem}>
              <Ionicons name="flash" size={13} color="#06b6d4" />
              <Text style={s.listItemText}>{f}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Bottom stats */}
      <View style={s.cardFooter}>
        <View style={s.footerStat}>
          <Text style={s.footerStatLabel}>Duration</Text>
          <Text style={s.footerStatValue}>
            {plan.duration ?? plan.duration_months ?? 1}M
          </Text>
        </View>
        <View style={s.footerDivider} />
        <View style={s.footerStat}>
          <Text style={s.footerStatLabel}>Per Month</Text>
          <Text style={[s.footerStatValue, { color: "#f97316" }]}>
            ₹{perMonth}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ════════════════════════════════════════
   STYLES
════════════════════════════════════════ */
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: "#0a0a0a" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 120 },

  center: { flex: 1, backgroundColor: "#0a0a0a", alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { color: "#6b7280", marginTop: 12, fontSize: 13 },
  errorText:   { color: "#ffffff", fontSize: 15, fontWeight: "700", marginTop: 12, textAlign: "center" },
  retryBtn:    { marginTop: 20, backgroundColor: "#f97316", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  retryText:   { color: "#fff", fontWeight: "700" },

  /* Header */
  header:          { paddingTop: 28, paddingBottom: 20, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  backBtn:         { marginTop: 6, width: 40, height: 40, borderRadius: 20, backgroundColor: "#1a1a1a", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTextBlock: { flex: 1 },
  eyebrow:         { color: "#f97316", fontSize: 10, fontWeight: "700", letterSpacing: 3, marginBottom: 4 },
  headerTitle:     { color: "#ffffff", fontSize: 28, fontWeight: "800" },
  headerSub:       { color: "#4b5563", fontSize: 12, marginTop: 4 },

  /* Stats */
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statPill: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statIconBox: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statValue:   { fontSize: 20, fontWeight: "800" },
  statLabel:   { color: "#6b7280", fontSize: 10, letterSpacing: 0.3 },

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon:  {},
  searchInput: { flex: 1, color: "#fff", fontSize: 14 },

  /* Filter chips */
  filterRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  filterChipActive:     { backgroundColor: "#f97316", borderColor: "#f97316" },
  filterChipText:       { color: "#6b7280", fontSize: 12, fontWeight: "600" },
  filterChipTextActive: { color: "#fff" },
  filterCount:          { marginLeft: "auto", color: "#374151", fontSize: 11 },

  /* Empty */
  empty:       { alignItems: "center", paddingVertical: 60 },
  emptyText:   { color: "#6b7280", fontSize: 16, marginTop: 14, fontWeight: "600" },
  emptySubText:{ color: "#374151", fontSize: 12, marginTop: 4 },

  /* Card */
  card: {
    backgroundColor: "#111",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#f97316",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#f9731612",
  },

  /* Card top */
  cardTop:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  cardNameBlock: { flexDirection: "row", alignItems: "center", flex: 1, flexWrap: "wrap" },
  cardName:      { color: "#fff", fontSize: 18, fontWeight: "800", flexShrink: 1 },
  cardDesc:      { color: "#4b5563", fontSize: 12, marginBottom: 10, lineHeight: 18 },

  /* Status */
  statusBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeActive:    { backgroundColor: "#10b98120" },
  badgeInactive:  { backgroundColor: "#37415120" },
  statusText:     { fontSize: 11, fontWeight: "700" },
  statusActive:   { color: "#10b981" },
  statusInactive: { color: "#6b7280" },

  /* Divider */
  divider: { height: 1, backgroundColor: "#1f1f1f", marginVertical: 14 },

  /* Price */
  priceRow:     { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  priceMain:    { color: "#f97316", fontSize: 32, fontWeight: "800" },
  priceStrike:  { color: "#374151", fontSize: 12, textDecorationLine: "line-through", marginTop: 2 },
  discountBadge:{ backgroundColor: "#f9731620", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  discountText: { color: "#fb923c", fontSize: 11, fontWeight: "700" },

  durationBox:   { alignItems: "center", backgroundColor: "#1a1a1a", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  durationNum:   { color: "#fff", fontSize: 22, fontWeight: "800" },
  durationLabel: { color: "#6b7280", fontSize: 10, letterSpacing: 0.5 },

  perMonthRow:  { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  perMonthText: { color: "#6b7280", fontSize: 12 },

  /* Feature row */
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  featureText:{ fontSize: 13, fontWeight: "600" },

  /* Lists */
  listBlock:    { marginTop: 12 },
  listTitle:    { color: "#374151", fontSize: 9, fontWeight: "700", letterSpacing: 1.5, marginBottom: 8 },
  listItem:     { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 },
  listItemText: { color: "#9ca3af", fontSize: 13, flex: 1 },
  listMore:     { color: "#4b5563", fontSize: 11, fontStyle: "italic", marginTop: 4, paddingLeft: 20 },

  /* Card footer */
  cardFooter:      { flexDirection: "row", backgroundColor: "#0d0d0d", borderRadius: 14, marginTop: 14, padding: 14, alignItems: "center" },
  footerStat:      { flex: 1, alignItems: "center" },
  footerStatLabel: { color: "#4b5563", fontSize: 10, letterSpacing: 0.5, marginBottom: 4 },
  footerStatValue: { color: "#fff", fontSize: 18, fontWeight: "800" },
  footerDivider:   { width: 1, height: 36, backgroundColor: "#1f1f1f" },
});
