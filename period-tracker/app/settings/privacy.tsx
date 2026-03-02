import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.lastUpdated}>Last updated: February 2026</Text>

      <Section title="Your data, your control" styles={styles}>
        All your health data is stored locally on your device. Nothing is uploaded
        to any server unless you explicitly enable cloud backup. We never sell your
        data, and we never will.
      </Section>

      <Section title="What we store" styles={styles}>
        Your cycle dates, symptoms, moods, and notes are stored on your device
        using encrypted local storage. If you enable cloud backup (optional), your
        data is encrypted on your device before being uploaded. No one — including
        us — can read your encrypted data.
      </Section>

      <Section title="What we never do" styles={styles}>
        {`• We never sell or share your health data
• We never send health data to analytics services
• We never use third-party SDKs that access your health data
• We never infer pregnancy from missing data
• We never collect your location, contacts, or device fingerprint`}
      </Section>

      <Section title="Your rights (GDPR)" styles={styles}>
        {`• Access: View all your data anytime in the app
• Export: Download all your data as JSON
• Delete: Remove all your data from the app and (if enabled) from cloud backup
• Rectify: Edit any logged data at any time
• Withdraw consent: Disable data categories or delete your data at any time`}
      </Section>

      <Section title="Data categories" styles={styles}>
        You choose which types of data to track during onboarding. You can change
        these choices at any time in Settings. Categories include: cycle tracking
        data, symptoms and moods, and intercourse logs.
      </Section>

      <Section title="Cloud backup (optional)" styles={styles}>
        If you enable cloud backup, your data is encrypted on your device using
        AES-256-GCM before upload. The encryption key is stored in your device's
        secure keychain. We cannot read your encrypted data.
      </Section>

      <Section title="Children's privacy" styles={styles}>
        Users under 16 who enable cloud backup will need parental consent as
        required by GDPR Article 8. Teenager mode provides age-appropriate content
        without requiring any account or data sharing.
      </Section>

      <Section title="Contact" styles={styles}>
        If you have questions about this privacy policy or want to exercise your
        data rights, please contact us through the App Store listing.
      </Section>
    </ScrollView>
  );
}

function Section({ title, children, styles }: { title: string; children: string; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: s(16),
    paddingBottom: s(32),
  },
  title: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: s(4),
  },
  lastUpdated: {
    fontSize: fs(13),
    color: colors.textTertiary,
    marginBottom: s(24),
  },
  section: {
    marginBottom: s(20),
  },
  sectionTitle: {
    fontSize: fs(17),
    fontWeight: '600',
    color: colors.text,
    marginBottom: s(8),
  },
  sectionText: {
    fontSize: fs(15),
    color: colors.textSecondary,
    lineHeight: fs(22),
  },
});
