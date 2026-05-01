import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { JobStatus } from '@features/home/data/jobs';
import { colors } from '@theme/colors';

type DevJobRoute = {
  id: string;
  tag: string;
  status: JobStatus;
};

type DevScreenPickerProps = {
  jobRoutes: DevJobRoute[];
  onSelectHome: () => void;
  onSelectProfile: () => void;
  onSelectJobDetails: (jobId: string) => void;
};

export function DevScreenPicker({
  jobRoutes,
  onSelectHome,
  onSelectProfile,
  onSelectJobDetails,
}: DevScreenPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      {isOpen ? (
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />
      ) : null}

      <View pointerEvents="box-none" style={styles.floatingArea}>
        {isOpen ? (
          <View style={styles.panel}>
            <Text style={styles.title}>Dev Screen Picker</Text>
            <Text style={styles.subtitle}>Temporary shortcuts for Expo Go testing.</Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                onSelectHome();
                setIsOpen(false);
              }}
            >
              <Text style={styles.primaryButtonLabel}>Home</Text>
              <Text style={styles.primaryButtonHint}>Driver dashboard</Text>
            </Pressable>

            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                onSelectProfile();
                setIsOpen(false);
              }}
            >
              <Text style={styles.primaryButtonLabel}>Profile</Text>
              <Text style={styles.primaryButtonHint}>Driver profile settings</Text>
            </Pressable>

            <Text style={styles.sectionLabel}>Job Details</Text>
            {jobRoutes.map((jobRoute) => (
              <Pressable
                key={jobRoute.id}
                style={styles.secondaryButton}
                onPress={() => {
                  onSelectJobDetails(jobRoute.id);
                  setIsOpen(false);
                }}
              >
                <Text style={styles.secondaryButtonLabel}>{jobRoute.tag}</Text>
                <Text style={styles.secondaryButtonHint}>
                  {formatStatus(jobRoute.status)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Pressable
          accessibilityLabel="Open dev screen picker"
          onPress={() => setIsOpen((current) => !current)}
          style={[styles.toggleButton, isOpen ? styles.toggleButtonActive : null]}
        >
          <Text style={styles.toggleButtonText}>{isOpen ? 'Close DEV' : 'DEV'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatStatus(status: JobStatus) {
  if (status === 'in-progress') {
    return 'In Progress';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 22, 20, 0.18)',
  },
  floatingArea: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    alignItems: 'flex-end',
    gap: 12,
  },
  panel: {
    width: 248,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    shadowColor: '#163733',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 4,
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  primaryButtonLabel: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButtonHint: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.92,
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  secondaryButtonLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryButtonHint: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  toggleButton: {
    minWidth: 74,
    borderRadius: 999,
    backgroundColor: '#051614',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#163733',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
});
