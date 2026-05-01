import React, { useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  iconBg: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New Parcel Arrived",
    body: "PKS-2026-001240 has arrived at your hub.",
    time: "2 mins ago",
    icon: "package",
    iconColor: COLORS.primary,
    iconBg: COLORS.primaryLight,
    read: false,
  },
  {
    id: "2",
    title: "Pickup Completed",
    body: "Maria Santos picked up PKS-2026-001189.",
    time: "15 mins ago",
    icon: "check-circle",
    iconColor: COLORS.green,
    iconBg: COLORS.greenLight,
    read: false,
  },
  {
    id: "3",
    title: "Storage Alert",
    body: "Storage section B is at 90% capacity.",
    time: "1 hour ago",
    icon: "alert-triangle",
    iconColor: COLORS.orange,
    iconBg: COLORS.orangeLight,
    read: true,
  },
];

interface HeaderProps {
  showBack?: boolean;
  onBackPress?: () => void;
  onHelpPress?: () => void;
  onHelpMeasure?: (rect: { x: number; y: number; width: number; height: number }) => void;
}

const TOUR_STEPS = [
  { step: 1, title: "Welcome to PakiSHIP!", body: "Hi there! I'm your guide. Let's get you familiar with your workspace.", mascot: require("@/assets/images/mascot-parcel.png") },
  { step: 2, title: "Quick Actions", body: "Scan parcels, do manual entry, or update statuses right from here!", mascot: require("@/assets/images/mascot-parcel.png") },
  { step: 3, title: "Statistics Overview", body: "Track incoming, stored, and picked-up parcels in real time.", mascot: require("@/assets/images/mascot-tracking.png") },
  { step: 4, title: "Parcel Management", body: "Manage all parcels. Use 'Scan & Receive' to receive incoming ones!", mascot: require("@/assets/images/mascot-star.png") },
  { step: 5, title: "Need Help Again?", body: "You can restart this guide anytime by clicking the Guide button.", mascot: require("@/assets/images/mascot-shield.png") },
];

export function Header({ showBack, onBackPress, onHelpPress, onHelpMeasure }: HeaderProps) {
  const helpBtnRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleMarkAllRead() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleBellPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifOpen(true);
  }

  return (
    <View style={[styles.container, { paddingTop: topPad + 10 }]}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBackPress || (() => router.back())}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <Image
            source={require("@/assets/images/pakiship-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>
      {showBack && (
        <Text style={styles.headerTitle}>Profile Settings</Text>
      )}

      <View style={styles.right}>
        {/* Bell with notification dot */}
        {!showBack && <TouchableOpacity style={styles.circleBtn} onPress={handleBellPress}>
          <Feather name="bell" size={17} color={COLORS.primary} />
          {unreadCount > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>}

        {/* Help */}
        {!showBack && <TouchableOpacity
          ref={helpBtnRef}
          style={styles.circleBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onHelpMeasure) {
              helpBtnRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
                onHelpMeasure({ x, y, width, height });
              });
            }
            if (onHelpPress) {
              onHelpPress();
            } else {
              router.navigate({ pathname: "/(tabs)", params: { tour: "1", resume: "0" } });
            }
          }}
        >
          <Feather name="help-circle" size={17} color={COLORS.primary} />
        </TouchableOpacity>}

        {/* Profile */}
        {!showBack && <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push("/profile")}
        >
          <Feather name="user" size={17} color={COLORS.primary} />
        </TouchableOpacity>}

        {/* Logout */}
        {!showBack && <TouchableOpacity style={styles.logoutBtn}>
          <Feather name="log-out" size={19} color={COLORS.red} />
        </TouchableOpacity>}
      </View>

      {/* Notification Dropdown */}
      <Modal
        visible={notifOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNotifOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setNotifOpen(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.dropdown}>
          {/* Dropdown header */}
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>
              NOTIFICATIONS {unreadCount > 0 ? `(${unreadCount})` : ""}
            </Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notification items */}
          {notifications.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={[styles.notifItem, n.read && styles.notifItemRead]}
              onPress={() => {
                if (!n.read) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, read: true } : item));
                }
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.notifIconWrap, { backgroundColor: n.iconBg }]}>
                <Feather name={n.icon} size={16} color={n.iconColor} />
              </View>
              <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, n.read && styles.notifTitleRead]}>
                  {n.title}
                </Text>
                <Text style={styles.notifBody}>{n.body}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
      {/* Tour Modal */}
      <Modal visible={tourOpen} transparent animationType="fade" onRequestClose={() => setTourOpen(false)}>
        <View style={styles.tourOverlay}>
          <Image source={TOUR_STEPS[tourStep].mascot} style={styles.tourMascot} resizeMode="contain" />
          <View style={styles.tourCard}>
            <View style={styles.tourCardTop}>
              <View style={styles.tourStepBadge}>
                <Text style={styles.tourStepText}>STEP {TOUR_STEPS[tourStep].step}/{TOUR_STEPS.length}</Text>
              </View>
              <TouchableOpacity onPress={() => setTourOpen(false)} style={styles.tourCloseBtn}>
                <Feather name="x" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.tourTitle}>{TOUR_STEPS[tourStep].title}</Text>
            <Text style={styles.tourBody}>{TOUR_STEPS[tourStep].body}</Text>
            <View style={styles.tourActions}>
              {tourStep > 0
                ? <TouchableOpacity style={styles.tourBackBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTourStep(s => s - 1); }} activeOpacity={0.75}>
                    <Feather name="arrow-left" size={14} color={COLORS.primary} />
                    <Text style={styles.tourBackText}>BACK</Text>
                  </TouchableOpacity>
                : <View style={{ flex: 1 }} />
              }
              <TouchableOpacity
                style={styles.tourNextBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tourStep < TOUR_STEPS.length - 1) setTourStep(s => s + 1);
                  else { setTourStep(0); setTourOpen(false); }
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.tourNextText}>{tourStep === TOUR_STEPS.length - 1 ? "FINISH" : "NEXT"}</Text>
                <Feather name="arrow-right" size={14} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 36,
    marginLeft: 0,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    bottom: 10,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.red,
    borderWidth: 1,
    borderColor: COLORS.white,
  },

  /* Modal overlay */
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  /* Dropdown panel */
  dropdown: {
    position: "absolute",
    top: Platform.OS === "web" ? 77 : 100,
    right: 14,
    left: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dropdownTitle: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  markAllText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: COLORS.primary,
  },

  /* Notification item */
  notifItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  notifItemRead: {
    opacity: 0.5,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 2,
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
  },
  notifTitleRead: {
    fontFamily: "Poppins_500Medium",
  },
  notifBody: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
  },
  notifTime: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textMuted,
    marginTop: 2,
  },

  /* Tour */
  tourOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  tourMascot: {
    width: 110,
    height: 110,
    marginBottom: -20,
    zIndex: 10,
  },
  tourCard: {
    width: "100%",
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 20,
    gap: 12,
  },
  tourCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tourStepBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tourStepText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  tourCloseBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  tourTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
  },
  tourBody: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tourActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  tourBackBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tourBackText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary,
  },
  tourNextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tourNextText: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});
