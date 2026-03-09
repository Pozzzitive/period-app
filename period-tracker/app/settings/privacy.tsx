import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/src/theme';

export default function PrivacyScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ color: colors.text }} className="text-2xl font-bold mb-1">Privacy Policy</Text>
      <Text style={{ color: colors.textTertiary }} className="text-[13px] mb-6">Last updated: March 2026</Text>

      <Section title="Your data, your control">
        All your health data is stored locally on your device. Nothing is uploaded
        to any server unless you explicitly enable cloud backup. We never sell your
        data, and we never will.
      </Section>

      <Section title="Lawful basis for processing">
        {`We process your data under the following legal bases:

\u2022 Health data: Your explicit consent (GDPR Article 9(2)(a)), given during onboarding. You choose which data categories to track.
\u2022 Purchase data: Necessary for contract performance (Article 6(1)(b)).
\u2022 Advertising: Your consent via the tracking prompt (Article 6(1)(a)).`}
      </Section>

      <Section title="What we store">
        Your cycle dates, symptoms, moods, photos, and notes are stored on your
        device using local storage. If you enable cloud backup (optional), your
        data is encrypted on your device before being uploaded. No one — including
        us — can read your encrypted data.
      </Section>

      <Section title="What we never do">
        {`\u2022 We never sell or share your health data
\u2022 We never send health data to analytics services
\u2022 We never use third-party SDKs that access your health data
\u2022 We never infer pregnancy from missing data
\u2022 We never collect your location, contacts, or device fingerprint
\u2022 We never show personalized ads to users under 18`}
      </Section>

      <Section title="Your rights (GDPR)">
        {`\u2022 Access (Art. 15): View all your data anytime in the app
\u2022 Export / Portability (Art. 20): Download your data as JSON or PDF
\u2022 Rectification (Art. 16): Edit any logged data at any time
\u2022 Erasure (Art. 17): Delete all data from Settings > Data Management
\u2022 Restriction (Art. 18): Disable data categories in Settings > Data Consent
\u2022 Withdraw consent (Art. 7(3)): Withdraw at any time in Settings > Data Consent`}
      </Section>

      <Section title="Data retention">
        You control retention entirely. Data remains on your device until you
        delete it or uninstall the app. We do not set automatic deletion
        schedules because we have no access to your data.
      </Section>

      <Section title="Data categories & consent withdrawal">
        You choose which types of data to track during onboarding. You can
        withdraw consent for any category at any time in Settings {'>'} Data Consent.
        Withdrawing consent hides the logging UI but does not delete existing
        data. To delete data, use Settings {'>'} Data Management.
      </Section>

      <Section title="Children's privacy">
        Users under 16 should have parental consent as required by GDPR Article 8.
        Teenager mode provides age-appropriate content without requiring any
        account or data sharing. Users in teenager mode receive only
        non-personalized, G-rated ads with no tracking.
      </Section>

      <Section title="Right to complain">
        You have the right to lodge a complaint with a supervisory authority in
        your EU member state. A list of authorities is available at edpb.europa.eu.
      </Section>

      <Section title="Contact">
        If you have questions about this privacy policy or want to exercise your
        data rights, please contact us through the App Store listing or at the
        email address listed in our full privacy policy.
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
