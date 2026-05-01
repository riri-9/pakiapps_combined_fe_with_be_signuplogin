import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Header } from "@/components/Header";
import { TourOverlay } from "@/components/TourOverlay";
import { COLORS } from "@/constants/colors";

type ParcelStatus = "incoming" | "stored" | "picked_up";

interface Parcel {
  id: string;
  trackingNumber: string;
  shelf: string;
  from: string;
  to: string;
  arrivedAt: string;
  status: ParcelStatus;
}

const MOCK_PARCELS: Parcel[] = [
  {
    id: "1",
    trackingNumber: "PKS-2026-001234",
    shelf: "A-23",
    from: "Juan Dela Cruz",
    to: "Maria Santos",
    arrivedAt: "14:30",
    status: "incoming",
  },
  {
    id: "2",
    trackingNumber: "PKS-2026-001189",
    shelf: "B-12",
    from: "Anna Reyes",
    to: "Pedro Garcia",
    arrivedAt: "12:15",
    status: "stored",
  },
  {
    id: "3",
    trackingNumber: "PKS-2026-001156",
    shelf: "C-05",
    from: "Carlos Santos",
    to: "Lisa Mendoza",
    arrivedAt: "11:45",
    status: "picked_up",
  },
];

type FilterType = "all" | "incoming" | "stored";

const STATUS_CONFIG: Record<ParcelStatus, { label: string; color: string; bg: string; icon: string }> = {
  incoming: { label: "Incoming", color: COLORS.blue, bg: COLORS.blueLight, icon: "arrow-down-left" },
  stored: { label: "Stored", color: COLORS.primary, bg: COLORS.primaryLight, icon: "package" },
  picked_up: { label: "Picked Up", color: COLORS.green, bg: COLORS.greenLight, icon: "check-circle" },
};

function StatusBadge({ status }: { status: ParcelStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Feather name={cfg.icon as any} size={12} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

/* ── Customer QR Scan Modal (Process Pickup step 1) ── */
function PickupScanModal({
  visible,
  parcel,
  onCancel,
  onScanned,
}: {
  visible: boolean;
  parcel: Parcel | null;
  onCancel: () => void;
  onScanned: () => void;
}) {
  React.useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScanned();
    }, 1500);
    return () => clearTimeout(t);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onCancel} />
        <View style={styles.modalSheet}>
          <View style={styles.dragHandle} />

          {/* Scanner frame with QR-like blocks */}
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.qrIconWrap}>
              <Feather name="user" size={26} color={COLORS.white} />
            </View>
            {/* decorative QR blocks */}
            {[...Array(12)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.qrBlock,
                  {
                    width: 18 + (i % 3) * 6,
                    height: 18 + (i % 2) * 6,
                    top: 20 + Math.floor(i / 4) * 44,
                    left: i % 2 === 0 ? 20 + (i % 4) * 28 : undefined,
                    right: i % 2 !== 0 ? 20 + (i % 3) * 22 : undefined,
                    opacity: 0.25,
                  },
                ]}
              />
            ))}
          </View>

          {/* Parcel details box */}
          <View style={styles.scannedBox}>
            <Text style={styles.scannedLabel}>PARCEL DETAILS</Text>
            <Text style={styles.scannedTracking}>{parcel?.trackingNumber}</Text>
            <Text style={styles.pickupRecipient}>Recipient: {parcel?.to}</Text>
          </View>

          <Text style={styles.scanTitle}>Scanning Customer QR..</Text>
          <Text style={styles.scanSubtitle}>Ask the customer to show their pickup QR code</Text>

          <TouchableOpacity onPress={onCancel} style={styles.cancelTextBtn}>
            <Text style={styles.cancelTextBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ── Verify Pickup Modal (Process Pickup step 2) ── */
function VerifyPickupModal({
  visible,
  parcel,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  parcel: Parcel | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [code, setCode] = useState("");
  const initial = parcel?.to?.[0]?.toUpperCase() ?? "?";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onCancel} />
        <View style={styles.reportModalSheet}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.verifyHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyTitle}>Verify Pickup</Text>
              <Text style={styles.verifySubtitle}>Enter the 4-digit verification code</Text>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.modalCloseBtn}>
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Recipient card */}
          <View style={styles.recipientCard}>
            <View style={styles.recipientTopRow}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientAvatarText}>{initial}</Text>
              </View>
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{parcel?.to}</Text>
                <Text style={styles.recipientTracking}>{parcel?.trackingNumber}</Text>
              </View>
            </View>
            <View style={styles.recipientShelfBox}>
              <Feather name="package" size={13} color={COLORS.primary} />
              <Text style={styles.recipientShelf}>Located at Shelf: {parcel?.shelf}</Text>
            </View>
          </View>

          {/* Code input */}
          <Text style={styles.fieldLabel}>VERIFICATION CODE</Text>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(v) => setCode(v.replace(/[^0-9]/g, "").slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="• • • •"
            placeholderTextColor={COLORS.textMuted}
            textAlign="center"
          />

          <TouchableOpacity
            style={[styles.confirmPickupBtn, code.length < 4 && styles.submitBtnDisabled]}
            onPress={() => {
              if (code.length < 4) return;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setCode("");
              onConfirm();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Confirm Pickup</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} style={styles.cancelTextBtn}>
            <Text style={styles.cancelTextBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ── QR Scanner Modal ── */
function ScanModal({
  visible,
  trackingNumber,
  onCancel,
  onScanned,
}: {
  visible: boolean;
  trackingNumber: string;
  onCancel: () => void;
  onScanned: () => void;
}) {
  // Simulate auto-scan after 1.5s when modal opens
  React.useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScanned();
    }, 1500);
    return () => clearTimeout(t);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onCancel} />
        <View style={styles.modalSheet}>
          <View style={styles.dragHandle} />

          {/* Scanner frame */}
          <View style={styles.scannerFrame}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {/* QR icon in center */}
            <View style={styles.qrIconWrap}>
              <Feather name="maximize" size={28} color={COLORS.white} />
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

/* ── Success Modal ── */
function ScanSuccessModal({
  visible,
  trackingNumber,
  onDone,
}: {
  visible: boolean;
  trackingNumber: string;
  onDone: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDone}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onDone} />
        <View style={styles.modalSheet}>
          <View style={styles.dragHandle} />

          {/* Check icon */}
          <View style={styles.successIconWrap}>
            <Feather name="check-circle" size={36} color={COLORS.green} />
          </View>

          {/* Tracking number box */}
          <View style={styles.scannedBox}>
            <Text style={styles.scannedLabel}>SCANNED TRACKING NUMBER</Text>
            <Text style={styles.scannedTracking}>{trackingNumber}</Text>
          </View>

          <Text style={styles.successTitle}>QR Scanned Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Parcel has been received and logged into the system.
          </Text>

          <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ParcelCard({ parcel, onScanPress, onPickupPress }: { parcel: Parcel; onScanPress: (p: Parcel) => void; onPickupPress: (p: Parcel) => void }) {
  const isIncoming = parcel.status === "incoming";
  const isStored = parcel.status === "stored";

  return (
    <View style={styles.parcelCard}>
      <View style={styles.parcelHeader}>
        <Text style={styles.trackingNumber}>{parcel.trackingNumber}</Text>
        {parcel.shelf && (
          <View style={styles.shelfBadge}>
            <Text style={styles.shelfText}>SHELF: {parcel.shelf}</Text>
          </View>
        )}
      </View>
      <View style={styles.parcelDetail}>
        <Text style={styles.parcelLabel}>FROM:  </Text>
        <Text style={styles.parcelName}>{parcel.from}</Text>
      </View>
      <View style={styles.parcelDetail}>
        <Text style={styles.parcelLabel}>TO:  </Text>
        <Text style={styles.parcelName}>{parcel.to}</Text>
      </View>
      <View style={styles.parcelTimeRow}>
        <Feather name="clock" size={12} color={COLORS.textMuted} />
        <Text style={styles.parcelTime}>
          {isIncoming ? "Arrived" : isStored ? "Arrived" : "Picked up"}: {parcel.arrivedAt}
        </Text>
      </View>

      <View style={styles.parcelFooter}>
        <StatusBadge status={parcel.status} />
        {isIncoming && (
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onScanPress(parcel);
            }}
            activeOpacity={0.85}
          >
            <Feather name="maximize" size={14} color={COLORS.white} />
            <Text style={styles.scanBtnText}>Scan & Receive</Text>
            <Feather name="chevron-right" size={14} color={COLORS.white} />
          </TouchableOpacity>
        )}
        {isStored && (
          <TouchableOpacity
            style={styles.processBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPickupPress(parcel);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.processBtnText}>Process Pickup</Text>
            <Feather name="chevron-right" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function ReportLostModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [tracking, setTracking] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedTracking, setSubmittedTracking] = useState("");

  function handleSubmit() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmittedTracking(tracking);
    setTracking("");
    setDetails("");
    setSubmitted(true);
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTracking("");
    setDetails("");
    setSubmitted(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleClose} />

        {/* Success sheet */}
        {submitted ? (
          <View style={styles.reportSuccessSheet}>
            <View style={styles.dragHandle} />
            <View style={styles.reportSuccessIconWrap}>
              <Feather name="alert-triangle" size={32} color={COLORS.orange} />
            </View>
            <Text style={styles.reportSuccessTitle}>Report Submitted</Text>
            <Text style={styles.reportSuccessTracking}>
              Tracking: <Text style={{ fontFamily: "Poppins_700Bold" }}>{submittedTracking}</Text>
            </Text>
            <Text style={styles.reportSuccessBody}>
              Our team has been notified and will investigate shortly.
            </Text>
            <TouchableOpacity style={[styles.doneBtn, { width: "100%" }]} onPress={handleClose} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <View style={styles.reportModalSheet}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalIconWrap}>
              <Feather name="alert-triangle" size={20} color={COLORS.orange} />
            </View>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>Report Lost Parcel</Text>
              <Text style={styles.modalSubtitle}>Fill in the details below</Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={handleClose} activeOpacity={0.7}>
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tracking Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>TRACKING NUMBER</Text>
            <View style={styles.inputRow}>
              <Feather name="search" size={16} color={COLORS.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="PKS-2026-XXXXXX"
                placeholderTextColor={COLORS.textMuted}
                value={tracking}
                onChangeText={setTracking}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Additional Details */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>ADDITIONAL DETAILS</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe when and where the parcel was last seen..."
              placeholderTextColor={COLORS.textMuted}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.75}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !tracking.trim() && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!tracking.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ── Pickup Success Modal ── */
function PickupSuccessModal({
  visible,
  parcel,
  onDone,
}: {
  visible: boolean;
  parcel: Parcel | null;
  onDone: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDone}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onDone} />
        <View style={styles.modalSheet}>
          <View style={styles.dragHandle} />

          <View style={styles.successIconWrap}>
            <Feather name="check-circle" size={36} color={COLORS.green} />
          </View>

          <Text style={styles.successTitle}>Pickup Successful!</Text>

          <View style={styles.scannedBox}>
            <Text style={styles.scannedLabel}>TRACKING NUMBER</Text>
            <Text style={styles.scannedTracking}>{parcel?.trackingNumber}</Text>
          </View>

          <Text style={styles.handedToText}>
            Handed to: <Text style={styles.handedToName}>{parcel?.to}</Text>
          </Text>
          <Text style={styles.scanSubtitle}>
            The parcel has been successfully picked up and logged.
          </Text>

          <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function InventoryScreen() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [scanParcel, setScanParcel] = useState<Parcel | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pickupParcel, setPickupParcel] = useState<Parcel | null>(null);
  const [showVerify, setShowVerify] = useState(false);
  const [showPickupSuccess, setShowPickupSuccess] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [parcelSpotlight, setParcelSpotlight] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const firstCardRef = useRef<View>(null);
  const titleSectionRef = useRef<View>(null);
  const { tour } = useLocalSearchParams<{ tour?: string }>();

  useEffect(() => {
    if (tour === "1") {
      setTimeout(() => {
        // Measure from title section top to first card bottom
        let titleY = 0, titleX = 0, titleW = 0;
        let cardBottom = 0, cardX = 0, cardW = 0;
        let measured = 0;
        function trySet() {
          measured++;
          if (measured === 2) {
            setParcelSpotlight({
              x: Math.min(titleX, cardX),
              y: titleY,
              width: Math.max(titleW, cardW),
              height: cardBottom - titleY,
            });
            setShowTour(true);
          }
        }
        titleSectionRef.current?.measureInWindow((x, y, w) => {
          titleX = x; titleY = y; titleW = w;
          trySet();
        });
        firstCardRef.current?.measureInWindow((x, y, w, h) => {
          cardX = x; cardBottom = y + h; cardW = w;
          trySet();
        });
      }, 500);
    }
  }, [tour]);
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;

  const filteredParcels = MOCK_PARCELS.filter((p) => {
    if (filter === "all") return true;
    if (filter === "incoming") return p.status === "incoming";
    if (filter === "stored") return p.status === "stored";
    return true;
  });

  const incomingCount = MOCK_PARCELS.filter((p) => p.status === "incoming").length;
  const storedCount = MOCK_PARCELS.filter((p) => p.status === "stored").length;

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: "all", label: "ALL", count: MOCK_PARCELS.length },
    { key: "incoming", label: "INCOMING", count: incomingCount },
    { key: "stored", label: "STORED", count: storedCount },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <TourOverlay
        visible={showTour}
        steps={[{
          step: 4,
          totalSteps: 5,
          title: "Parcel Management",
          body: "Manage all parcels. Use 'Scan & Receive' to receive incoming ones!",
          mascot: require("@/assets/images/mascot-star.png"),
          spotlight: parcelSpotlight,
          cardPosition: "bottom",
          isLast: false,
          onNext: () => { setShowTour(false); router.navigate({ pathname: "/(tabs)", params: { tour: "1", resume: "3" } }); },
          onBack: () => { setShowTour(false); router.navigate({ pathname: "/(tabs)", params: { tour: "1", resume: "2" } }); },
        }]}
        onClose={() => setShowTour(false)}
      />
      <ReportLostModal visible={reportModalVisible} onClose={() => setReportModalVisible(false)} />
      <ScanModal
        visible={!!scanParcel && !showSuccess}
        trackingNumber={scanParcel?.trackingNumber ?? ""}
        onCancel={() => setScanParcel(null)}
        onScanned={() => setShowSuccess(true)}
      />
      <ScanSuccessModal
        visible={showSuccess}
        trackingNumber={scanParcel?.trackingNumber ?? ""}
        onDone={() => { setShowSuccess(false); setScanParcel(null); setTimeout(() => router.push("/receive-parcel"), 100); }}
      />
      <PickupScanModal
        visible={!!pickupParcel && !showVerify && !showPickupSuccess}
        parcel={pickupParcel}
        onCancel={() => setPickupParcel(null)}
        onScanned={() => setShowVerify(true)}
      />
      <VerifyPickupModal
        visible={showVerify}
        parcel={pickupParcel}
        onCancel={() => { setShowVerify(false); setPickupParcel(null); }}
        onConfirm={() => { setShowVerify(false); setShowPickupSuccess(true); }}
      />
      <PickupSuccessModal
        visible={showPickupSuccess}
        parcel={pickupParcel}
        onDone={() => { setShowPickupSuccess(false); setPickupParcel(null); }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
      >
        <View ref={titleSectionRef} style={styles.titleSection}>
          <Text style={styles.pageTitle}>Parcel Management</Text>
          <Text style={styles.pageSubtitle}>Track and organize current inventory</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f.key);
              }}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  filter === f.key && styles.filterBtnTextActive,
                ]}
              >
                {f.label} {f.count !== undefined ? `(${f.count})` : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Parcel Cards */}
        {filteredParcels.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="package" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No parcels found</Text>
          </View>
        ) : (
          filteredParcels.map((p, idx) => (
            <View key={p.id} ref={idx === 0 ? firstCardRef : undefined}>
              <ParcelCard parcel={p} onScanPress={(p) => setScanParcel(p)} onPickupPress={(p) => setPickupParcel(p)} />
            </View>
          ))
        )}

        {/* Report Lost Parcel */}
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setReportModalVisible(true);
          }}
        >
          <Feather name="alert-triangle" size={14} color={COLORS.orange} />
          <Text style={styles.reportBtnText}>REPORT LOST PARCEL</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  titleSection: {
    marginBottom: 4,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBg,
    borderRadius: 30,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 24,
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  filterBtnTextActive: {
    color: COLORS.white,
  },
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
  parcelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trackingNumber: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  shelfBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shelfText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.textSecondary,
  },
  parcelDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  parcelLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
  },
  parcelName: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.text,
  },
  parcelTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  parcelTime: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textMuted,
  },
  parcelFooter: {
    marginTop: 4,
    gap: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
  scanBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  scanBtnText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.white,
  },
  processBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  processBtnText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: COLORS.textMuted,
  },
  reportBtn: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.orange,
  },
  reportBtnText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.orange,
    letterSpacing: 0.3,
  },

  /* Report Lost Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
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
  reportModalSheet: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 16,
  },
  reportSuccessSheet: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 12,
    alignItems: "center",
    width: "100%",
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 4,
  },

  /* Scanner */
  scannerFrame: {
    width: 220,
    height: 220,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  cornerTL: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  qrIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scanTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
    textAlign: "center",
  },
  scanSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  cancelTextBtn: {
    paddingVertical: 8,
    marginTop: 4,
  },
  cancelTextBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: COLORS.textSecondary,
  },

  /* Success */
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  scannedBox: {
    width: "100%",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 4,
  },
  scannedLabel: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  scannedTracking: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
  },
  successTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: COLORS.green,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  handedToText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  handedToName: {
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
  },
  doneBtn: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.orangeLight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderText: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: COLORS.text,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: COLORS.text,
    minHeight: 90,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: COLORS.textSecondary,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: COLORS.orange,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.white,
  },

  /* Verify Pickup */
  verifyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  verifyTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
  },
  verifySubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recipientCard: {
    width: "100%",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  recipientTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recipientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  recipientAvatarText: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: COLORS.white,
  },
  recipientInfo: {
    flex: 1,
    gap: 2,
  },
  recipientName: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
  },
  recipientTracking: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
  },
  recipientShelfBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  recipientShelf: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: COLORS.primary,
  },
  codeInput: {
    width: "100%",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.text,
    letterSpacing: 12,
  },
  reportSuccessTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
    textAlign: "center",
  },
  reportSuccessTracking: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  reportSuccessBody: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  reportSuccessIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0E6",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 8,
  },
  confirmPickupBtn: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  qrBlock: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    opacity: 0.25,
  },
  pickupRecipient: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
