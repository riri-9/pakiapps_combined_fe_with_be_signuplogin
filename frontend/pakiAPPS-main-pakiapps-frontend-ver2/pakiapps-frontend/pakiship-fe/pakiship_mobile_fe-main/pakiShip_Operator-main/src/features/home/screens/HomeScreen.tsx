import { StyleSheet, Text, View } from 'react-native';

import { getAppConfig } from '../../../config/appConfig';
import { spacing } from '../../../theme/spacing';

// Template HomeScreen — kept for template compliance
// Actual app screens live in app/(tabs)/
export function HomeScreen() {
  const { appName, environment } = getAppConfig();

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{appName}</Text>
      <Text style={styles.subtitle}>Single-root Expo boilerplate (TypeScript-first)</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Environment: {environment}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
