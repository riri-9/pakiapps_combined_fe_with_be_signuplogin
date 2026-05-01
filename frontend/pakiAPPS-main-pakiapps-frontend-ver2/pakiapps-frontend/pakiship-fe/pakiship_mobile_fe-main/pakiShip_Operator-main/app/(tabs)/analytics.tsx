import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { COLORS } from "@/constants/colors";

type StatCardProps = { icon: React.ReactNode; value: string; label: string; iconBg: string };
function StatCard({ icon, value, label, iconBg }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconCircle, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Hub Analytics</Text>
          <Text style={styles.pageSubtitle}>Real-time performance and hub insights</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon={<Feather name="arrow-down-left" size={20} color={COLORS.blue} />} value="24" label="INCOMING TODAY" iconBg={COLORS.blueLight} />
          <StatCard icon={<Feather name="package" size={20} color={COLORS.primary} />} value="18" label="CURRENTLY STORED" iconBg={COLORS.primaryLight} />
          <StatCard icon={<Feather name="arrow-up-right" size={20} color={COLORS.green} />} value="31" label="PICKED UP TODAY" iconBg={COLORS.greenLight} />
          <StatCard icon={<Feather name="users" size={20} color={COLORS.orange} />} value="82%" label="CUSTOMER SERVED" iconBg={COLORS.orangeLight} />
        </View>

        {/* Earnings & Incentives */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <View style={styles.earningsIconCircle}>
              <Text style={styles.pesoSymbol}>₱</Text>
            </View>
            <View>
              <Text style={styles.earningsTitle}>Earnings & Incentives</Text>
              <Text style={styles.earningsSub}>This month</Text>
            </View>
          </View>
          <View style={styles.earningsRow}>
            <View style={styles.earningsCell}>
              <Text style={styles.cellLabel}>TOTAL EARNED</Text>
              <Text style={styles.cellValue}>₱3,240</Text>
              <Text style={styles.cellGrowth}>+₱340 this week</Text>
            </View>
            <View style={[styles.earningsCell, styles.incentivesCell]}>
              <Text style={styles.cellLabel}>INCENTIVES</Text>
              <Text style={[styles.cellValue, { color: COLORS.orange }]}>₱480</Text>
              <View style={styles.bonusRow}>
                <Feather name="gift" size={12} color={COLORS.orange} />
                <Text style={styles.bonusText}>3 bonuses earned</Text>
              </View>
            </View>
          </View>
        </View>

        {/* This Week + Performance */}
        <View style={styles.bottomRow}>
          <View style={styles.weekCard}>
            <View style={styles.weekTitleRow}>
              <Feather name="calendar" size={14} color={COLORS.textSecondary} />
              <Text style={styles.weekTitle}>This Week</Text>
            </View>
            <View style={styles.weekStats}>
              <View style={styles.weekStat}>
                <Text style={styles.weekStatLabel}>TOTAL PARCELS</Text>
                <Text style={styles.weekStatValue}>156</Text>
              </View>
              <View style={styles.weekStat}>
                <Text style={styles.weekStatLabel}>AVG. WAIT TIME</Text>
                <Text style={styles.weekStatValue}>3.2 min</Text>
              </View>
              <View style={styles.weekStat}>
                <Text style={styles.weekStatLabel}>HUB VISITS</Text>
                <Text style={styles.weekStatValue}>203</Text>
              </View>
              <View style={styles.weekStat}>
                <Text style={styles.weekStatLabel}>REVENUE SHARE</Text>
                <Text style={[styles.weekStatValue, { color: COLORS.primary }]}>₱12.4k</Text>
              </View>
            </View>
          </View>

          <View style={styles.performanceCard}>
            <View style={styles.performanceTop}>
              <Feather name="star" size={16} color="rgba(255,255,255,0.75)" />
              <Text style={styles.ratingNumber}>4.9</Text>
              <Text style={styles.ratingLabel}>AVG RATING</Text>
            </View>
            <Text style={styles.performanceTitle}>{"Top\nPerformer"}</Text>
            <Text style={styles.performanceSub}>
              Your hub is in the top 5% of service providers this month!
            </Text>
            <View style={styles.growthRow}>
              <Feather name="trending-up" size={12} color="rgba(255,255,255,0.85)" />
              <Text style={styles.growthText}>+0.3 FROM LAST MONTH</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },

  titleSection: { alignItems: "center", marginBottom: 10, marginTop: 8 },
  pageTitle: { fontSize: 22, fontFamily: "Poppins_700Bold", color: COLORS.text, textAlign: "center" },
  pageSubtitle: { fontSize: 12, fontFamily: "Poppins_400Regular", color: COLORS.textSecondary, textAlign: "center", marginTop: 2 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "48%", flexShrink: 1, backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 8, alignItems: "center" },
  statIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 30, fontFamily: "Poppins_700Bold", color: COLORS.text, lineHeight: 34, textAlign: "center" },
  statLabel: { fontSize: 10, fontFamily: "Poppins_500Medium", color: COLORS.textMuted, letterSpacing: 0.6, textAlign: "center" },

  earningsCard: { backgroundColor: COLORS.cardBg, borderRadius: 18, padding: 16, gap: 14, borderWidth: 1, borderColor: COLORS.border },
  earningsHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  earningsIconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  pesoSymbol: { fontSize: 17, fontFamily: "Poppins_700Bold", color: COLORS.primary },
  earningsTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", color: COLORS.text },
  earningsSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: COLORS.textSecondary, marginTop: 1 },
  earningsRow: { flexDirection: "row", gap: 10 },
  earningsCell: { flex: 1, backgroundColor: COLORS.background, borderRadius: 12, padding: 12, gap: 5 },
  incentivesCell: { backgroundColor: "#FFF3E8" },
  cellLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: COLORS.textMuted, letterSpacing: 0.4 },
  cellValue: { fontSize: 24, fontFamily: "Poppins_700Bold", color: COLORS.text, lineHeight: 28 },
  cellGrowth: { fontSize: 11, fontFamily: "Poppins_400Regular", color: COLORS.green },
  bonusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  bonusText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: COLORS.orange },

  bottomRow: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  weekCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: 18, padding: 14, gap: 14, borderWidth: 1, borderColor: COLORS.border },
  weekTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  weekTitle: { fontSize: 13, fontFamily: "Poppins_700Bold", color: COLORS.text },
  weekStats: { gap: 12 },
  weekStat: { gap: 2 },
  weekStatLabel: { fontSize: 9, fontFamily: "Poppins_500Medium", color: COLORS.textMuted, letterSpacing: 0.4 },
  weekStatValue: { fontSize: 20, fontFamily: "Poppins_700Bold", color: COLORS.text, lineHeight: 24 },

  performanceCard: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 18, padding: 14, justifyContent: "space-between", gap: 8 },
  performanceTop: { alignItems: "flex-end", gap: 1 },
  ratingNumber: { fontSize: 26, fontFamily: "Poppins_700Bold", color: COLORS.white, lineHeight: 30 },
  ratingLabel: { fontSize: 9, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.7)", letterSpacing: 0.8 },
  performanceTitle: { fontSize: 21, fontFamily: "Poppins_700Bold", color: COLORS.white, lineHeight: 26 },
  performanceSub: { fontSize: 10, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.82)", lineHeight: 15 },
  growthRow: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8, marginTop: 4 },
  growthText: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.9)" },
});
