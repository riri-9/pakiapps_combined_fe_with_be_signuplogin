import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ReceiveParcelHeader } from "@/components/ReceiveParcelHeader";
import { COLORS } from "@/constants/colors";

type PackageSize = "Small" | "Medium" | "Large";
type ParcelStatus = "pending" | "processing" | "received";

interface PendingParcel {
  id: string;
  trackingNumber: string;
  size: PackageSize;
  to: string;
  from: string;
  expectedTime: string;
  status: ParcelStatus;
}

interface ReceivedParcel {
  id: string;
  trackingNumber: string;
  size: PackageSize;
  to: string;
  from: string;
  receivedTime: string;
}

const PENDING: PendingParcel[] = [
  { id: "1", trackingNumber: "PKS-2026-001241", size: "Medium", to: "Maria Santos", from: "GlobalShop PH · Makati City", expectedTime: "2:30 PM", status: "pending" },
  { id: "2", trackingNumber: "PKS-2026-001242", size: "Small", to: "Pedro Garcia", from: "Juan Dela Cruz · Quezon City", expectedTime: "3:00 PM", status: "pending" },
  { id: "3", trackingNumber: "PKS-2026-001243", size: "Large", to: "Ana Reyes", from: "LazMall · Pasig City", expectedTime: "3:45 PM", status: "processing" },
  { id: "4", trackingNumber: "PKS-2026-001244", size: "Small", to: "Carlo Mendoza", from: "ShopeeExpress · Taguig City", expectedTime: "4:00 PM", status: "pending" },
];

const RECEIVED: ReceivedParcel[] = [
  { id: "r1", trackingNumber: "PKS-2026-001230", size: "Small", to: "Lisa Torres", from: "GlobalShop PH", receivedTime: "9:12 AM" },
  { id: "r2", trackingNumber: "PKS-2026-001225", size: "Medium", to: "Ryan Cruz", from: "Shopee", receivedTime: "10:05 AM" },
  { id: "r3", trackingNumber: "PKS-2026-001218", size: "Large", to: "Diana Lim", from: "Lazada", receivedTime: "11:28 AM" },
  { id: "r4", trackingNumber: "PKS-2026-001210", size: "Small", to: "Ella Reyes", from: "Juan Santos", receivedTime: "12:15 PM" },
  { id: "r5", trackingNumber: "PKS-2026-001205", size: "Medium", to: "Mark Garcia", from: "ZaloraPH", receivedTime: "1:03 PM" },
];

const TIMELINE = [
  { time: "9:12 AM", tracking: "PKS-2026-001230", name: "Lisa" },
  { time: "10:05 AM", tracking: "PKS-2026-001225", name: "Ryan" },
  { time: "11:28 AM", tracking: "PKS-2026-001218", name: "Diana" },
  { time: "12:15 PM", tracking: "PKS-2026-001210", name: "Ella" },
];

const SIZE_COLORS: Record<PackageSize, { text: string; bg: string }> = {
  Small: { text: COLORS.green, bg: COLORS.greenLight },
  Medium: { text: COLORS.blue, bg: COLORS.blueLight },
  Large: { text: COLORS.purple, bg: COLORS.purpleLight },
};

function SizeBadge({ size }: { size: PackageSize }) {
  const cfg = SIZE_COLORS[size];
  return (
    <View style={[styles.sizeBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.sizeBadgeText, { color: cfg.text }]}>{size}</Text>
    </View>
  );
}

function StatBox({ iconBg, icon, value, label, valueColor }: { iconBg: string; icon: React.ReactNode; value: string; label: string; valueColor?: string }) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statBoxIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={[styles.statBoxValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

export default function ReceiveParcelScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;
  const [search, setSearch] = useState("");
  const [scanParcel, setScanParcel] = useState<PendingParcel | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const q = search.toLowerCase();
  const filteredPending = PENDING.filter(
    (p) => q === "" || p.trackingNumber.toLowerCase().includes(q) || p.to.toLowerCase().includes(q) || p.from.toLowerCase().includes(q)
  );
  const filteredReceived = RECEIVED.filter(
    (p) => q === "" || p.trackingNumber.toLowerCase().includes(q) || p.to.toLowerCase().includes(q) || p.from.toLowerCase().includes(q)
  );

  return (
    <View style={styles.container}>
      <ReceiveParcelHeader title="Receive Parcel" subtitle="BGC Central Hub" />

      {/* QR Scan Modal */}
      <Modal visible={!!scanParcel && !showSuccess} transparent animationType="slide" onRequestClose={() => setScanParcel(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setScanParcel(null)} />
          <ScanSheet parcel={scanParcel} onCancel={() => setScanParcel(null)} onScanned={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setShowSuccess(true); }} />
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="slide" onRequestClose={() => { setShowSuccess(false); setScanParcel(null); }}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => { setShowSuccess(false); setScanParcel(null); }} />
          <View style={styles.modalSheet}>
            <View style={styles.dragHandle} />
            <View style={styles.successIconWrap}>
              <Feather name="check-circle" size={36} color={COLORS.green} />
            </View>
            <View style={styles.scannedBox}>
              <Text style={styles.scannedLabel}>SCANNED TRACKING NUMBER</Text>
              <Text style={styles.scannedTracking}>{scanParcel?.trackingNumber}</Text>
            </View>
            <Text style={styles.successTitle}>QR Scanned Successfully!</Text>
            <Text style={styles.successSubtitle}>Parcel has been received and logged into the system.</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={() => { setShowSuccess(false); setScanParcel(null); }} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatBox iconBg="#EFF6FF" icon={<Feather name="clock" size={20} color={COLORS.blue} />} value="4" label="PENDING DROP-OFFS" valueColor={COLORS.blue} />
          <StatBox iconBg={COLORS.primaryLight} icon={<MaterialCommunityIcons name="qrcode-scan" size={20} color={COLORS.primary} />} value="1" label="PROCESSING" valueColor={COLORS.primary} />
          <StatBox iconBg={COLORS.greenLight} icon={<Feather name="check-circle" size={20} color={COLORS.green} />} value="5" label="RECEIVED TODAY" valueColor={COLORS.green} />
          <StatBox iconBg={COLORS.primaryLight} icon={<Feather name="package" size={20} color={COLORS.primary} />} value="9" label="TOTAL PARCELS" valueColor={COLORS.text} />
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by tracking number, sender, or recipient"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Pending Drop-offs */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Feather name="clock" size={18} color={COLORS.blue} />
            <View>
              <Text style={styles.sectionTitle}>Pending Drop-offs</Text>
              <Text style={styles.sectionSubtitle}>{filteredPending.length} parcels awaiting</Text>
            </View>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{filteredPending.length} pending</Text>
          </View>
        </View>

        {filteredPending.map((parcel) => {
          const isProcessing = parcel.status === "processing";
          return (
            <View key={parcel.id} style={[styles.parcelCard, isProcessing && styles.parcelCardProcessing]}>
              <View style={styles.parcelCardHeader}>
                <View style={styles.trackingPill}>
                  <Text style={styles.parcelTrack}>{parcel.trackingNumber}</Text>
                </View>
                <SizeBadge size={parcel.size} />
                {isProcessing && (
                  <View style={styles.processingBadge}>
                    <Text style={styles.processingText}>Processing...</Text>
                  </View>
                )}
              </View>
              <View style={styles.parcelDetailRow}>
                <Feather name="user" size={13} color={COLORS.textMuted} />
                <Text style={styles.parcelDetailText}>To: <Text style={styles.parcelDetailBold}>{parcel.to}</Text></Text>
              </View>
              <View style={styles.parcelDetailRow}>
                <Feather name="map-pin" size={13} color={COLORS.textMuted} />
                <Text style={styles.parcelDetailText}>From:  {parcel.from}</Text>
              </View>
              <View style={styles.parcelDetailRow}>
                <Feather name="clock" size={13} color={COLORS.primary} />
                <Text style={[styles.parcelDetailText, { color: COLORS.primary, fontFamily: "Poppins_600SemiBold" }]}>
                  Expected: {parcel.expectedTime}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setScanParcel(parcel); }}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="qrcode-scan" size={16} color={COLORS.white} />
                <Text style={styles.scanBtnText}>Scan & Receive</Text>
                <Feather name="chevron-right" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Received Today */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Feather name="check-circle" size={18} color={COLORS.green} />
            <View>
              <Text style={styles.sectionTitle}>Received Today</Text>
              <Text style={styles.sectionSubtitle}>{filteredReceived.length} parcels processed</Text>
            </View>
          </View>
          <Text style={styles.receivedCount}>{filteredReceived.length} received</Text>
        </View>

        {filteredReceived.map((parcel) => (
          <View key={parcel.id} style={styles.receivedCard}>
            <View style={styles.receivedCardLeft}>
              <View style={styles.receivedCardHeader}>
                <View style={styles.trackingPill}>
                  <Text style={styles.parcelTrack}>{parcel.trackingNumber}</Text>
                </View>
                <SizeBadge size={parcel.size} />
              </View>
              <View style={styles.parcelDetailRow}>
                <Feather name="user" size={13} color={COLORS.textMuted} />
                <Text style={styles.parcelDetailText}>To: <Text style={styles.parcelDetailBold}>{parcel.to}</Text></Text>
              </View>
              <View style={styles.parcelDetailRow}>
                <Feather name="map-pin" size={13} color={COLORS.textMuted} />
                <Text style={styles.parcelDetailText}>From:  {parcel.from}</Text>
              </View>
            </View>
            <View style={styles.receivedRight}>
              <Feather name="check-circle" size={16} color={COLORS.green} />
              <Text style={styles.receivedStatus}>Received</Text>
              <Text style={styles.receivedTime}>{parcel.receivedTime}</Text>
            </View>
          </View>
        ))}

        {/* Today's Timeline */}
        <View style={styles.timelineSection}>
          <View style={styles.sectionTitleRow}>
            <Feather name="calendar" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{"Today's Timeline"}</Text>
          </View>
          <View style={styles.timeline}>
            {TIMELINE.map((item, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineDotWrap}>
                  <View style={styles.timelineDot} />
                  {idx < TIMELINE.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <Text style={styles.timelineTime}>{item.time}</Text>
                <Text style={styles.timelineTrack}>{item.tracking}</Text>
                <Text style={styles.timelineName}>{item.name}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.moreTimeline}>
              <Text style={styles.moreTimelineText}>+1 more today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ScanSheet({ parcel, onCancel, onScanned }: { parcel: PendingParcel | null; onCancel: () => void; onScanned: () => void }) {
  React.useEffect(() => {
    if (!parcel) return;
    const t = setTimeout(onScanned, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parcel]);

  return (
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, gap: 14 },

  /* Stats */
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: {
    width: "47%",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  statBoxIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statBoxValue: { fontSize: 28, fontFamily: "Poppins_700Bold", color: COLORS.text },
  statBoxLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: COLORS.textMuted, letterSpacing: 0.3 },

  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular", color: COLORS.text },

  /* Section headers */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_700Bold", color: COLORS.text },
  sectionSubtitle: { fontSize: 12, fontFamily: "Poppins_400Regular", color: COLORS.textMuted, marginTop: 1 },
  pendingBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pendingBadgeText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: COLORS.primary },
  receivedCount: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: COLORS.green },

  /* Parcel cards */
  parcelCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  parcelCardProcessing: {
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
  },
  parcelCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  trackingPill: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  parcelTrack: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: COLORS.primary },
  sizeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  sizeBadgeText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  processingBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  processingText: { fontSize: 11, fontFamily: "Poppins_500Medium", color: COLORS.primary },
  parcelDetailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  parcelDetailText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: COLORS.text },
  parcelDetailBold: { fontFamily: "Poppins_700Bold", color: COLORS.text },
  scanBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  scanBtnText: { fontSize: 15, fontFamily: "Poppins_700Bold", color: COLORS.white },

  /* Received cards */
  receivedCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  receivedCardLeft: { flex: 1, gap: 8 },
  receivedCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  receivedRight: { alignItems: "flex-end", gap: 2, marginLeft: 12 },
  receivedStatus: { fontSize: 13, fontFamily: "Poppins_700Bold", color: COLORS.green },
  receivedTime: { fontSize: 12, fontFamily: "Poppins_400Regular", color: COLORS.textMuted },

  /* Timeline */
  timelineSection: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, minHeight: 36 },
  timelineDotWrap: { alignItems: "center", width: 10, paddingTop: 4 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.primaryLight, marginTop: 2, minHeight: 20 },
  timelineTime: { fontSize: 12, fontFamily: "Poppins_500Medium", color: COLORS.textSecondary, width: 68 },
  timelineTrack: { flex: 1, fontSize: 13, fontFamily: "Poppins_700Bold", color: COLORS.text },
  timelineName: { fontSize: 12, fontFamily: "Poppins_400Regular", color: COLORS.textSecondary },
  moreTimeline: { paddingLeft: 20, marginTop: 8 },
  moreTimelineText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: COLORS.primary },

  /* Modals */
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 16,
    alignItems: "center",
  },
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
