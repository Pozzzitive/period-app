import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/src/theme';

export default function PrivacyScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ color: colors.text }} className="text-2xl font-bold mb-1">Privacy Policy</Text>
      <Text style={{ color: colors.textTertiary }} className="text-[13px] mb-6">Last updated: February 2026</Text>

      <Section title="Your data, your control">
        All your health data is stored locally on your device. Nothing is uploaded
        to any server unless you explicitly enable cloud backup. We never sell your
        data, and we never will.
      </Section>

      <Section title="What we store">
        Your cycle dates, symptoms, moods, and notes are stored on your device
        using encrypted local storage. If you enable cloud backup (optional), your
        data is encrypted on your device before being uploaded. No one — including
        us — can read your encrypted data.
      </Section>

      <Section title="What we never do">
        {`• We never sell or share your health data
• We never send health data to analytics services
• We never use third-party SDKs that access your health data
• We never infer pregnancy from missing data
• We never collect your location, contacts, or device fingerprint`}
      </Section>

      <Section title="Your rights (GDPR)">
        {`• Access: View all your data anytime in the app
• Export: Download all your data as JSON
• Delete: Remove all your data from the app and (if enabled) from cloud backup
• Rectify: Edit any logged data at any time
• Withdraw consent: Disable data categories or delete your data at any time`}
      </Section>

      <Section title="Data categories">
        You choose which types of data to track during onboarding. You can change
        these choices at any time in Settings. Categories include: cycle tracking
        data, symptoms and moods, and intercourse logs.
      </Section>

      <Section title="Cloud backup (optional)">
        If you enable cloud backup, your data is encrypted on your device using
        AES-256-GCM before upload. The encryption key is stored in your device's
        secure keychain. We cannot read your encrypted data.
      </Section>

      <Section title="Children's privacy">
        Users under 16 who enable cloud backup will need parental consent as
        required by GDPR Article 8. Teenager mode provides age-appropriate content
        without requiring any account or data sharing.
      </Section>

      <Section title="Contact">
        If you have questions about this privacy policy or want to exercise your
        data rights, please contact us through the App Store listing.
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <View className="mb-5">
      <Text style={{ color: colors.text }} className="text-[17px] font-semibold mb-2">{title}</Text>
      <Text style={{ color: colors.textSecondary }} className="text-[15px] leading-[22px]">{children}</Text>
    </View>
  );
}
