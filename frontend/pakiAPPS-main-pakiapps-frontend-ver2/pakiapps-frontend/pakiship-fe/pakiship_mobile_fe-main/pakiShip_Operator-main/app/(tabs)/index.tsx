import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Animated,
  Image,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Header } from "@/components/Header";
import { TourOverlay, shouldShowTour } from "@/components/TourOverlay";
import { COLORS } from "@/constants/colors";

const MOCK_TRACKING = "PKS-2026-001241";

function ScanModal({ visible, onCancel, onScanned }: { visible: boolean; onCancel: () => void; onScanned: () => void }) {
  React.useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onScanned, 1500);
    return () => clearTimeout(t);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onCancel} />
        <View style={styles.modalSheet}>
          <View style={styles.dragHandle} />
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.qrIconWrap}>
              <Feather name="maximize" size={26} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.scanTitle}>Scanning QR Code...</Text>
          <Text style={styles.scanSubtitle}>{"Hold the customer's QR code to the camera"}</Text>
          <TouchableOpacity onPress={onCancel} style={styles.cancelTextBtn}>
            <Text style={styles.cancelTextBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ScanSuccessModal({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDone}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onDone} />
        <View style={styles.modalSheet}>
          <View style={styles.dragHandle} />
          <View style={styles.successIconWrap}>
            <Feather name="check-circle" size={36} color={COLORS.green} />
          </View>
          <View style={styles.scannedBox}>
            <Text style={styles.scannedLabel}>SCANNED TRACKING NUMBER</Text>
            <Text style={styles.scannedTracking}>{MOCK_TRACKING}</Text>
          </View>
          <Text style={styles.successTitle}>QR Scanned Successfully!</Text>
          <Text style={styles.successSubtitle}>Parcel has been received and logged into the system.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function BlinkingDot() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.15, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={[styles.dot, { opacity }]} />;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;
  const [showScan, setShowScan] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourInitialStep, setTourInitialStep] = useState(0);
  const [actionsSpotlight, setActionsSpotlight] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [statsSpotlight, setStatsSpotlight] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [helpSpotlight, setHelpSpotlight] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const actionsRef = useRef<View>(null);
  const statsRef = useRef<View>(null);

  const { tour: tourParam, resume } = useLocalSearchParams<{ tour?: string; resume?: string }>();

  useEffect(() => {
    if (tourParam === "1") {
      const startIdx = resume ? parseInt(resume, 10) : 0;
      setTimeout(() => {
        measureAll();
        setShowTour(true);
        setTourInitialStep(startIdx);
      }, 300);
      return;
    }
    shouldShowTour().then((show) => {
      if (show) setTimeout(() => { measureAll(); setTourInitialStep(0); setShowTour(true); }, 600);
    });
  }, [tourParam, resume]); // eslint-disable-line react-hooks/exhaustive-deps

  function measureActions() {
    actionsRef.current?.measureInWindow((x, y, width, height) => {
      setActionsSpotlight({ x, y, width, height });
    });
  }

  function measureStats() {
    statsRef.current?.measureInWindow((x, y, width, height) => {
      setStatsSpotlight({ x, y, width, height });
    });
  }

  function measureAll() {
    measureActions();
    measureStats();
  }

  const tourSteps = [
    { step: 1, title: "Welcome to PakiSHIP!", body: "Hi there! I'm your guide. Let's get you familiar with your workspace.", mascot: require("@/assets/images/mascot-parcel.png"), spotlight: null, totalSteps: 5 },
    { step: 2, title: "Quick Actions", body: "Scan parcels, do manual entry, or update statuses right from here!", mascot: require("@/assets/images/no 2.png"), spotlight: actionsSpotlight, totalSteps: 5 },
    { step: 3, title: "Statistics Overview", body: "Track incoming, stored, and picked-up parcels in real time.", mascot: require("@/assets/images/mascot-tracking.png"), spotlight: statsSpotlight, cardPosition: "top" as const, totalSteps: 5, onNext: () => { setShowTour(false); router.push("/(tabs)/inventory?tour=1"); } },
    { step: 5, title: "Need Help Again?", body: "You can restart this guide anytime by clicking the Guide button.", mascot: require("@/assets/images/mascot-shield.png"), spotlight: helpSpotlight, cardPosition: "bottom" as const, totalSteps: 5, onBack: () => { setShowTour(false); router.push("/(tabs)/inventory?tour=1"); } },
  ];

  return (
    <View style={styles.container}>
      <Header
        onHelpPress={() => { measureActions(); measureStats(); setTourInitialStep(0); setShowTour(true); }}
        onHelpMeasure={(rect) => setHelpSpotlight(rect)}
      />
      <TourOverlay visible={showTour} steps={tourSteps} initialStep={tourInitialStep} key={tourInitialStep} onClose={() => setShowTour(false)} />
      <ScanModal
        visible={showScan}
        onCancel={() => setShowScan(false)}
        onScanned={() => { setShowScan(false); setShowSuccess(true); }}
      />
      <ScanSuccessModal
        visible={showSuccess}
        onDone={() => { setShowSuccess(false); setTimeout(() => router.push("/receive-parcel"), 100); }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
      >
        <View style={styles.greetingCard}>
          <View style={styles.greetingRow}>
            <BlinkingDot />
            <Text style={styles.greeting}>
              Kumusta, <Text style={styles.greetingAccent}>Operator!</Text>
            </Text>
          </View>

          {/* Drop-off card with inverted-U dashed border */}
          <View style={styles.dropOffOuter}>
            <View style={styles.dropOffCard}>
              <View style={[styles.dropOffIconWrap, { marginLeft: -24 }]}>
                <Feather name="map-pin" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.dropOffText}>
                <Text style={styles.dropOffLabel}>DROP OFF POINT</Text>
                <Text style={styles.dropOffName}>BGC Central Hub</Text>
                <Text style={styles.dropOffSub}>Taguig City, Metro Manila</Text>
              </View>
            </View>
          </View>
        </View>

        <View
          ref={actionsRef}
          style={styles.actionsRow}
          onLayout={measureActions}
        >
          {/* SCAN PARCEL — large teal */}
          <TouchableOpacity
            style={styles.scanParcelBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowScan(true); }}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={48} color={COLORS.white} />
            <Text style={styles.scanParcelLabel}>SCAN PARCEL</Text>
            <Text style={styles.scanParcelSub}>Register via QR code</Text>
          </TouchableOpacity>

          {/* MANUAL ENTRY */}
          <TouchableOpacity
            style={styles.manualEntryBtn}
            onPress={() => router.push("/manual-entry")}
            activeOpacity={0.85}
          >
            <Feather name="smartphone" size={44} color={COLORS.primary} />
            <Text style={styles.manualEntryLabel}>MANUAL ENTRY</Text>
            <Text style={styles.manualEntrySub}>Type tracking number</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Bin Capacity */}
        {(() => {
          const pct = 72;
          const fillColor = pct >= 90 ? COLORS.red : pct >= 70 ? COLORS.orange : COLORS.primary;
          const pctColor = pct >= 90 ? COLORS.red : pct >= 70 ? COLORS.orange : COLORS.primary;
          const warningIcon = pct >= 90 ? "alert-triangle" : "alert-circle";
          const warningLabel = pct >= 90 ? "Almost Full!" : pct >= 70 ? "Getting Full" : "Good Capacity";
          return (
            <View style={styles.capacityCard}>
              <View style={styles.capacityTopRow}>
                <View style={styles.capacityLeft}>
                  <View style={styles.capacityIconWrap}>
                    <Feather name="package" size={16} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.capacityTitle}>Delivery Bin Capacity</Text>
                    <Text style={styles.capacitySubtitle}>BGC Central Hub — Bin A</Text>
                  </View>
                </View>
                <Text style={[styles.capacityPct, { color: pctColor }]}>{pct}%</Text>
              </View>
              <View style={styles.progressWrapper}>
                <Image
                  source={require("@/assets/images/mascot-analytics.png")}
                  style={[styles.mascotImg, { left: `${pct}%` as any, transform: [{ translateX: -52 }] }]}
                  resizeMode="contain"
                />
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: fillColor }]} />
                </View>
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressEdge}>0%</Text>
                <View style={styles.warningRow}>
                  <Feather name={warningIcon as any} size={11} color={pctColor} />
                  <Text style={[styles.warningText, { color: pctColor }]}>{warningLabel}</Text>
                </View>
                <Text style={styles.progressEdge}>100%</Text>
              </View>
            </View>
          );
        })()}

        {/* Ready for Operations */}
        <View style={styles.readyRow}>
          <Feather name="package" size={52} color="rgba(43,169,155,0.18)" />
          <Text style={styles.readyText}>READY FOR OPERATIONS</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },

  greetingCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(43,169,155,0.4)",
    padding: 16,
    paddingBottom: 0,
    gap: 14,
  },
  greetingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: COLORS.primary },
  greeting: { fontSize: 28, fontFamily: "Poppins_700Bold", color: COLORS.text, fontStyle: "italic" },
  greetingAccent: { color: COLORS.primary, fontFamily: "Poppins_700Bold", fontStyle: "italic" },

  dropOffOuter: {
    marginTop: 4,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderStyle: "dashed",
    borderColor: "rgba(43,169,155,0.45)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 16,
  },
  dashedFrame: {},
  dropOffCard: { backgroundColor: "transparent", paddingVertical: 20, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  dropOffIconWrap: { width: 64, height: 64, borderRadius: 18, backgroundColor: COLORS.cardBg, alignItems: "center", justifyContent: "center" },
  dropOffText: { alignItems: "flex-start" },
  dropOffLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: COLORS.textMuted, letterSpacing: 1, marginBottom: 4 },
  dropOffName: { fontSize: 20, fontFamily: "Poppins_700Bold", color: COLORS.text, lineHeight: 24 },
  dropOffSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: COLORS.textSecondary, marginTop: 3 },

  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: 16, paddingVertical: 18, alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: COLORS.border },
  actionBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  actionBtnLabel: { fontSize: 11, fontFamily: "Poppins_700Bold", color: COLORS.text, letterSpacing: 0.5 },
  actionBtnLabelActive: { color: COLORS.white },

  /* Scan Parcel + Manual Entry */
  scanParcelBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 32, paddingVertical: 40, alignItems: "center", justifyContent: "center", gap: 10 },
  scanParcelLabel: { fontSize: 13, fontFamily: "Poppins_700Bold", color: COLORS.white, letterSpacing: 0.5 },
  scanParcelSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)" },
  manualEntryBtn: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: 32, paddingVertical: 40, alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: COLORS.border },
  manualEntryLabel: { fontSize: 13, fontFamily: "Poppins_700Bold", color: COLORS.text, letterSpacing: 0.5 },
  manualEntrySub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: COLORS.textSecondary },

  /* Delivery Bin Capacity */
  capacityCard: { backgroundColor: COLORS.cardBg, borderRadius: 18, padding: 16, gap: 12, borderWidth: 1, borderColor: COLORS.border },
  capacityTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  capacityLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  capacityIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  capacityTitle: { fontSize: 14, fontFamily: "Poppins_700Bold", color: COLORS.text },
  capacitySubtitle: { fontSize: 11, fontFamily: "Poppins_400Regular", color: COLORS.textSecondary },
  capacityPct: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  progressWrapper: { position: "relative", paddingTop: 36 },
  progressTrack: { height: 14, backgroundColor: COLORS.background, borderRadius: 7, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 7, backgroundColor: COLORS.orange },
  progressLabels: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressEdge: { fontSize: 11, fontFamily: "Poppins_400Regular", color: COLORS.textMuted },
  warningRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  warningText: { fontSize: 11, fontFamily: "Poppins_500Medium", color: COLORS.orange },
  readyRow: { alignItems: "center", justifyContent: "center", gap: 14, paddingVertical: 16, marginTop: -8 },
  readyText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "rgba(43,169,155,0.22)", letterSpacing: 3 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "48%", flexShrink: 1, backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 8, alignItems: "center" },
  statIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  statIconRow: { marginBottom: 6 },
  statValue: { fontSize: 32, fontFamily: "Poppins_700Bold", color: COLORS.text, lineHeight: 36, textAlign: "center" },
  statLabel: { fontSize: 10, fontFamily: "Poppins_500Medium", color: COLORS.textMuted, letterSpacing: 0.6, textAlign: "center" },
  mascotImg: { position: "absolute", top: 0, width: 52, height: 52, zIndex: 1 },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet: { backgroundColor: COLORS.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12, gap: 16, alignItems: "center" },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 4 },
  scannerFrame: { width: 210, height: 210, backgroundColor: COLORS.primaryLight, borderRadius: 20, alignItems: "center", justifyContent: "center", marginVertical: 8 },
  corner: { position: "absolute", width: 28, height: 28, borderColor: COLORS.primary, borderWidth: 3 },
  cornerTL: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  qrIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  scanTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: COLORS.text, textAlign: "center" },
  scanSubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: COLORS.textSecondary, textAlign: "center" },
  cancelTextBtn: { paddingVertical: 8 },
  cancelTextBtnText: { fontSize: 15, fontFamily: "Poppins_500Medium", color: COLORS.textSecondary },
  successIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.greenLight, alignItems: "center", justifyContent: "center", marginVertical: 8 },
  scannedBox: { width: "100%", backgroundColor: COLORS.primaryLight, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: "center", gap: 4 },
  scannedLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: COLORS.primary, letterSpacing: 0.5 },
  scannedTracking: { fontSize: 16, fontFamily: "Poppins_700Bold", color: COLORS.text },
  successTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: COLORS.green, textAlign: "center" },
  successSubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: COLORS.textSecondary, textAlign: "center" },
  doneBtn: { width: "100%", backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  doneBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: COLORS.white },
});

