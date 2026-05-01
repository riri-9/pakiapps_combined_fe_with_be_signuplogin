import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";

const STATUS_OPTIONS = [
  { id: "incoming", label: "Incoming" },
  { id: "stored", label: "Stored" },
  { id: "picked_up", label: "Picked Up" },
  { id: "dispatched", label: "Dispatched" },
];

export default function UpdateStatusSheet() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleSelect(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  }

  function handleConfirm() {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }

  const selectedLabel = STATUS_OPTIONS.find((o) => o.id === selected)?.label ?? "";
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Pressable style={styles.overlay} onPress={handleClose} />
      <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Update Status</Text>
          <Text style={styles.subtitle}>Select new parcel status</Text>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Options */}
      <View style={styles.optionsList}>
        {STATUS_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              {isSelected && (
                <Feather name="check" size={16} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Confirm button */}
      <TouchableOpacity
        style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
        onPress={handleConfirm}
        activeOpacity={0.85}
      >
        <Text style={styles.confirmText}>Confirm Update</Text>
      </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={() => { setShowSuccess(false); router.back(); }}>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.dragHandle} />
            <View style={styles.successIconWrap}>
              <Feather name="check-circle" size={36} color={COLORS.green} />
            </View>
            <Text style={styles.successTitle}>Status Updated!</Text>
            <Text style={styles.successBody}>
              Parcel marked as <Text style={styles.successBold}>{selectedLabel}</Text>.
            </Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => { setShowSuccess(false); router.back(); }}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 8,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  /* Options */
  optionsList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBg,
  },
  optionRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionLabel: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: COLORS.textSecondary,
  },
  optionLabelSelected: {
    color: COLORS.primary,
    fontFamily: "Poppins_600SemiBold",
  },

  /* Confirm */
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.55,
  },
  confirmText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.white,
  },

  /* Success */
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  successCard: {
    width: "100%",
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: "center",
    gap: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: COLORS.green,
    textAlign: "center",
  },
  successBody: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  successBold: {
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
});
