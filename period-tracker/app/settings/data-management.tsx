import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  View,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { deleteAllData, restoreFromExport } from '@/src/services/data-export';
import { encryptExport, shareEncryptedExport, decryptImport } from '@/src/crypto/encrypted-export';
import { PDFExportSheet } from '@/src/components/settings/PDFExportSheet';
import { useSubscriptionStore, selectIsPremiumPlus } from '@/src/stores/subscription-store';
import { useTheme } from '@/src/theme';

type PasswordMode = 'export' | 'import';

export default function DataManagementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const isPremium = useSubscriptionStore(selectIsPremiumPlus);
  const [pdfSheetVisible, setPdfSheetVisible] = useState(false);
  // Password modal state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('export');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [importUri, setImportUri] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetModal = () => {
    setPassword('');
    setConfirmPassword('');
    setImportUri('');
    setProcessing(false);
    setShowPassword(false);
    setPasswordModalVisible(false);
  };

  // ── Encrypted export ─────────────────────────────────
  const handleEncryptedExport = () => {
    setPasswordMode('export');
    setPasswordModalVisible(true);
  };

  const doEncryptedExport = async () => {
    if (password.length < 6) {
      Alert.alert('Password too short', 'Please use at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords don\'t match', 'Please make sure both passwords are the same.');
      return;
    }
    setProcessing(true);
    try {
      const uri = await encryptExport(password);
      resetModal();
      await shareEncryptedExport(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Export failed', 'Something went wrong while creating the encrypted backup.');
      setProcessing(false);
    }
  };

  // ── Encrypted import ─────────────────────────────────
  const handleImportBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset.name?.endsWith('.ptbackup')) {
        Alert.alert('Wrong file type', 'Please select a .ptbackup file created by this app.');
        return;
      }

      setImportUri(asset.uri);
      setPasswordMode('import');
      setPasswordModalVisible(true);
    } catch {
      Alert.alert('Import failed', 'Could not open file picker.');
    }
  };

  const doImport = async () => {
    if (!password) {
      Alert.alert('Password required', 'Enter the password you used when creating this backup.');
      return;
    }
    setProcessing(true);
    try {
      const data = await decryptImport(importUri, password);
      resetModal();

      // Confirm before overwriting
      Alert.alert(
        'Restore backup?',
        'This will replace all your current data with the backup data. Your purchase status will be preserved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            onPress: () => {
              restoreFromExport(data);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Backup restored', 'All your data has been restored successfully.');
            },
          },
        ],
      );
    } catch (error) {
      setProcessing(false);
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Incorrect password') {
        Alert.alert('Incorrect password', 'The password you entered is wrong. Please try again.');
      } else {
        Alert.alert('Import failed', message);
      }
    }
  };

  // ── Delete all ───────────────────────────────────────
  const handleDeleteAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete all data',
      'This will permanently delete all your data from this device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All cycle data, symptoms, moods, settings, and preferences will be permanently deleted. Your purchase status will be preserved so you don\'t need to restore it.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, delete all',
                  style: 'destructive',
                  onPress: () => {
                    deleteAllData();
                    router.replace('/(onboarding)/welcome');
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const isSubmitDisabled =
    processing ||
    !password ||
    password.length < 6 ||
    (passwordMode === 'export' && password !== confirmPassword);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      {/* Info card */}
      <View
        style={{ backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primaryMuted }}
        className="p-4 rounded-[14px] mb-5"
      >
        <View className="flex-row items-center mb-2">
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary }} className="text-[15px] font-semibold ml-2">
            About backups
          </Text>
        </View>
        <Text style={{ color: colors.textSecondary }} className="text-[13px] leading-5">
          Encrypted backups protect your data with a password you choose. Save the .ptbackup file
          to your Files, iCloud, or any storage you trust. To restore, import the file and enter
          the same password. Without the password, the data cannot be read.
        </Text>
      </View>

      {/* BACKUP section */}
      <Text style={{ color: colors.textTertiary }} className="text-[13px] font-semibold uppercase tracking-widest mt-2 mb-2">
        Backup
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: colors.surface }}
        className="p-5 rounded-[14px] mb-3"
        onPress={handleEncryptedExport}
      >
        <Ionicons name="lock-closed-outline" size={28} color={colors.primary} style={{ marginBottom: 8 }} />
        <Text style={{ color: colors.text }} className="text-[17px] font-semibold mb-1">
          Export Encrypted Backup
        </Text>
        <Text style={{ color: colors.textTertiary }} className="text-sm leading-5">
          Create a password-protected backup of all your data. The file is encrypted
          with AES-256 and cannot be read without your password.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: colors.surface }}
        className="p-5 rounded-[14px] mb-3"
        onPress={handleImportBackup}
      >
        <Ionicons name="download-outline" size={28} color={colors.primary} style={{ marginBottom: 8 }} />
        <Text style={{ color: colors.text }} className="text-[17px] font-semibold mb-1">
          Import Backup
        </Text>
        <Text style={{ color: colors.textTertiary }} className="text-sm leading-5">
          Restore your data from a .ptbackup file. You'll need the password used
          when the backup was created.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: colors.surface }}
        className="p-5 rounded-[14px] mb-3"
        onPress={() => isPremium ? setPdfSheetVisible(true) : router.push('/subscription/paywall')}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Ionicons name="document-text-outline" size={28} color={colors.primary} />
          {!isPremium && (
            <View style={{ backgroundColor: colors.primaryLight }} className="flex-row items-center px-2.5 py-1 rounded-full">
              <Ionicons name="lock-closed" size={13} color={colors.primary} />
              <Text style={{ color: colors.primary }} className="text-[12px] font-semibold ml-1">Premium</Text>
            </View>
          )}
        </View>
        <Text style={{ color: colors.text }} className="text-[17px] font-semibold mb-1">Export as PDF</Text>
        <Text style={{ color: colors.textTertiary }} className="text-sm leading-5">
          Generate a formatted PDF report with cycle history, statistics, and
          patterns. Perfect for sharing with your healthcare provider.
        </Text>
      </TouchableOpacity>

      {/* DELETE section */}
      <Text style={{ color: colors.textTertiary }} className="text-[13px] font-semibold uppercase tracking-widest mt-4 mb-2">
        Delete
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.destructiveLight }}
        className="p-5 rounded-[14px] mb-3"
        onPress={handleDeleteAll}
      >
        <Ionicons name="trash-outline" size={28} color={colors.destructive} style={{ marginBottom: 8 }} />
        <Text style={{ color: colors.destructive }} className="text-[17px] font-semibold mb-1">Delete all data</Text>
        <Text style={{ color: colors.textTertiary }} className="text-sm leading-5">
          Permanently remove all your data from this device. This includes all
          cycle data, symptoms, moods, settings, and preferences.
        </Text>
      </TouchableOpacity>

      <PDFExportSheet visible={pdfSheetVisible} onClose={() => setPdfSheetVisible(false)} />

      {/* Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: colors.background }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-row items-center justify-between p-4 pb-2">
            <TouchableOpacity onPress={resetModal} disabled={processing}>
              <Text style={{ color: processing ? colors.textDisabled : colors.primary }} className="text-[17px]">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={{ color: colors.text }} className="text-[17px] font-semibold">
              {passwordMode === 'export' ? 'Create Backup' : 'Restore Backup'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 12 }}>
            <Text style={{ color: colors.textSecondary }} className="text-[15px] leading-[22px] mb-5">
              {passwordMode === 'export'
                ? 'Choose a password to protect your backup. You will need this password to restore the backup later.'
                : 'Enter the password you used when creating this backup.'}
            </Text>

            {/* Password field */}
            <Text style={{ color: colors.textSecondary }} className="text-[13px] font-medium mb-1.5 ml-1">
              Password
            </Text>
            <View className="flex-row items-center mb-4">
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                className="p-4 rounded-xl text-[16px]"
                placeholder="Enter password"
                placeholderTextColor={colors.textDisabled}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                editable={!processing}
              />
              <TouchableOpacity
                className="absolute right-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm password (export only) */}
            {passwordMode === 'export' && (
              <>
                <Text style={{ color: colors.textSecondary }} className="text-[13px] font-medium mb-1.5 ml-1">
                  Confirm password
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: password && confirmPassword && password !== confirmPassword
                      ? colors.destructive
                      : colors.border,
                  }}
                  className="p-4 rounded-xl text-[16px] mb-4"
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textDisabled}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!processing}
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <Text style={{ color: colors.destructive }} className="text-[13px] -mt-2 mb-3 ml-1">
                    Passwords don't match
                  </Text>
                )}
              </>
            )}

            {password.length > 0 && password.length < 6 && (
              <Text style={{ color: colors.textTertiary }} className="text-[13px] mb-3 ml-1">
                Minimum 6 characters
              </Text>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={{
                backgroundColor: isSubmitDisabled ? colors.primaryMuted : colors.primary,
              }}
              className="p-4 rounded-xl items-center mt-2"
              onPress={passwordMode === 'export' ? doEncryptedExport : doImport}
              disabled={isSubmitDisabled}
            >
              {processing ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={{ color: colors.onPrimary }} className="text-[17px] font-semibold">
                  {passwordMode === 'export' ? 'Create Backup' : 'Restore'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
